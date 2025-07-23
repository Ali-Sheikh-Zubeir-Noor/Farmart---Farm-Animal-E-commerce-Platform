from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Animal, User, AnimalType, UserRole
from utils.validators import validate_animal_data
from utils.pagination import paginate_query
from utils.image_service import upload_image, delete_image
import cloudinary.uploader
from datetime import datetime

animals_bp = Blueprint('animals', __name__)

@animals_bp.route('/', methods=['GET'])
def get_animals():
    """
    Get all animals with pagination and filtering
    ---
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
      - name: per_page
        in: query
        type: integer
        default: 10
      - name: animal_type
        in: query
        type: string
      - name: breed
        in: query
        type: string
      - name: min_age
        in: query
        type: integer
      - name: max_age
        in: query
        type: integer
      - name: min_price
        in: query
        type: number
      - name: max_price
        in: query
        type: number
      - name: search
        in: query
        type: string
    responses:
      200:
        description: List of animals
    """
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        animal_type = request.args.get('animal_type')
        breed = request.args.get('breed')
        min_age = request.args.get('min_age', type=int)
        max_age = request.args.get('max_age', type=int)
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        search = request.args.get('search', '')
        
        # Build query
        query = Animal.query.filter_by(is_available=True)
        
        # Apply filters
        if animal_type:
            try:
                query = query.filter_by(animal_type=AnimalType(animal_type))
            except ValueError:
                return jsonify({'error': 'Invalid animal type'}), 400
        
        if breed:
            query = query.filter(Animal.breed.ilike(f'%{breed}%'))
        
        if min_age is not None:
            query = query.filter(Animal.age >= min_age)
        
        if max_age is not None:
            query = query.filter(Animal.age <= max_age)
        
        if min_price is not None:
            query = query.filter(Animal.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Animal.price <= max_price)
        
        if search:
            query = query.filter(
                db.or_(
                    Animal.name.ilike(f'%{search}%'),
                    Animal.breed.ilike(f'%{search}%'),
                    Animal.description.ilike(f'%{search}%')
                )
            )
        
        # Order by created_at descending
        query = query.order_by(Animal.created_at.desc())
        
        # Paginate results
        result = paginate_query(query, page, per_page)
        
        return jsonify({
            'animals': [animal.to_dict() for animal in result['items']],
            'pagination': result['pagination']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@animals_bp.route('/<int:animal_id>', methods=['GET'])
def get_animal(animal_id):
    """
    Get single animal by ID
    ---
    parameters:
      - name: animal_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Animal details
      404:
        description: Animal not found
    """
    try:
        animal = Animal.query.get(animal_id)
        
        if not animal:
            return jsonify({'error': 'Animal not found'}), 404
        
        return jsonify({'animal': animal.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@animals_bp.route('/', methods=['POST'])
@jwt_required()
def create_animal():
    """
    Create a new animal (farmers only)
    ---
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
            animal_type:
              type: string
            breed:
              type: string
            age:
              type: integer
            weight:
              type: number
            price:
              type: number
            description:
              type: string
            health_status:
              type: string
            vaccination_status:
              type: string
    responses:
      201:
        description: Animal created successfully
      403:
        description: Only farmers can create animals
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != UserRole.FARMER:
            return jsonify({'error': 'Only farmers can create animals'}), 403
        
        data = request.get_json()
        
        # Validate data
        validation_error = validate_animal_data(data)
        if validation_error:
            return jsonify({'error': validation_error}), 400
        
        # Validate animal type
        try:
            animal_type = AnimalType(data['animal_type'])
        except ValueError:
            return jsonify({'error': 'Invalid animal type'}), 400
        
        # Create animal
        animal = Animal(
            name=data['name'],
            animal_type=animal_type,
            breed=data['breed'],
            age=data['age'],
            weight=data['weight'],
            price=data['price'],
            description=data.get('description'),
            health_status=data.get('health_status', 'healthy'),
            vaccination_status=data.get('vaccination_status', 'up_to_date'),
            farmer_id=user_id
        )
        
        db.session.add(animal)
        db.session.commit()
        
        return jsonify({
            'message': 'Animal created successfully',
            'animal': animal.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@animals_bp.route('/<int:animal_id>', methods=['PUT'])
@jwt_required()
def update_animal(animal_id):
    """
    Update animal (owner only)
    ---
    security:
      - Bearer: []
    parameters:
      - name: animal_id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
            breed:
              type: string
            age:
              type: integer
            weight:
              type: number
            price:
              type: number
            description:
              type: string
            health_status:
              type: string
            vaccination_status:
              type: string
            is_available:
              type: boolean
    responses:
      200:
        description: Animal updated successfully
      403:
        description: Not authorized to update this animal
      404:
        description: Animal not found
    """
    try:
        user_id = get_jwt_identity()
        animal = Animal.query.get(animal_id)
        
        if not animal:
            return jsonify({'error': 'Animal not found'}), 404
        
        if animal.farmer_id != user_id:
            return jsonify({'error': 'Not authorized to update this animal'}), 403
        
        data = request.get_json()
        
        # Update allowed fields
        if 'name' in data:
            animal.name = data['name']
        if 'breed' in data:
            animal.breed = data['breed']
        if 'age' in data:
            animal.age = data['age']
        if 'weight' in data:
            animal.weight = data['weight']
        if 'price' in data:
            animal.price = data['price']
        if 'description' in data:
            animal.description = data['description']
        if 'health_status' in data:
            animal.health_status = data['health_status']
        if 'vaccination_status' in data:
            animal.vaccination_status = data['vaccination_status']
        if 'is_available' in data:
            animal.is_available = data['is_available']
        
        animal.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Animal updated successfully',
            'animal': animal.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@animals_bp.route('/<int:animal_id>', methods=['DELETE'])
@jwt_required()
def delete_animal(animal_id):
    """
    Delete animal (owner only)
    ---
    security:
      - Bearer: []
    parameters:
      - name: animal_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Animal deleted successfully
      403:
        description: Not authorized to delete this animal
      404:
        description: Animal not found
    """
    try:
        user_id = get_jwt_identity()
        animal = Animal.query.get(animal_id)
        
        if not animal:
            return jsonify({'error': 'Animal not found'}), 404
        
        if animal.farmer_id != user_id:
            return jsonify({'error': 'Not authorized to delete this animal'}), 403
        
        # Delete associated images from Cloudinary
        if animal.images:
            for image_url in animal.images:
                delete_image(image_url)
        
        db.session.delete(animal)
        db.session.commit()
        
        return jsonify({'message': 'Animal deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@animals_bp.route('/<int:animal_id>/images', methods=['POST'])
@jwt_required()
def upload_animal_images(animal_id):
    """
    Upload images for an animal (owner only)
    ---
    security:
      - Bearer: []
    parameters:
      - name: animal_id
        in: path
        type: integer
        required: true
      - name: images
        in: formData
        type: file
        required: true
    responses:
      200:
        description: Images uploaded successfully
      403:
        description: Not authorized to upload images for this animal
      404:
        description: Animal not found
    """
    try:
        user_id = get_jwt_identity()
        animal = Animal.query.get(animal_id)
        
        if not animal:
            return jsonify({'error': 'Animal not found'}), 404
        
        if animal.farmer_id != user_id:
            return jsonify({'error': 'Not authorized to upload images for this animal'}), 403
        
        if 'images' not in request.files:
            return jsonify({'error': 'No images provided'}), 400
        
        files = request.files.getlist('images')
        if not files:
            return jsonify({'error': 'No images provided'}), 400
        
        uploaded_urls = []
        for file in files:
            if file.filename:
                try:
                    # Upload to Cloudinary
                    result = cloudinary.uploader.upload(
                        file,
                        folder=f"farmart/animals/{animal_id}",
                        resource_type="image"
                    )
                    uploaded_urls.append(result['secure_url'])
                except Exception as e:
                    return jsonify({'error': f'Failed to upload image: {str(e)}'}), 500
        
        # Update animal images
        if animal.images:
            animal.images.extend(uploaded_urls)
        else:
            animal.images = uploaded_urls
        
        animal.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Images uploaded successfully',
            'images': uploaded_urls,
            'animal': animal.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@animals_bp.route('/my-animals', methods=['GET'])
@jwt_required()
def get_my_animals():
    """
    Get farmer's own animals
    ---
    security:
      - Bearer: []
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
      - name: per_page
        in: query
        type: integer
        default: 10
    responses:
      200:
        description: List of farmer's animals
      403:
        description: Only farmers can access this endpoint
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != UserRole.FARMER:
            return jsonify({'error': 'Only farmers can access this endpoint'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        
        query = Animal.query.filter_by(farmer_id=user_id).order_by(Animal.created_at.desc())
        result = paginate_query(query, page, per_page)
        
        return jsonify({
            'animals': [animal.to_dict() for animal in result['items']],
            'pagination': result['pagination']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500