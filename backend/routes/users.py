from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, UserRole
from utils.pagination import paginate_query
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    """
    Get all users (admin only)
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
      - name: role
        in: query
        type: string
        enum: [farmer, customer, admin]
      - name: search
        in: query
        type: string
    responses:
      200:
        description: List of users
      403:
        description: Admin access required
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        role_filter = request.args.get('role')
        search = request.args.get('search', '')
        
        query = User.query
        
        # Apply role filter
        if role_filter:
            try:
                role_enum = UserRole(role_filter)
                query = query.filter_by(role=role_enum)
            except ValueError:
                return jsonify({'error': 'Invalid role'}), 400
        
        # Apply search filter
        if search:
            query = query.filter(
                db.or_(
                    User.first_name.ilike(f'%{search}%'),
                    User.last_name.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%'),
                    User.farm_name.ilike(f'%{search}%')
                )
            )
        
        query = query.order_by(User.created_at.desc())
        result = paginate_query(query, page, per_page)
        
        return jsonify({
            'users': [user.to_dict() for user in result['items']],
            'pagination': result['pagination']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """
    Get user by ID
    ---
    security:
      - Bearer: []
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: User details
      403:
        description: Not authorized
      404:
        description: User not found
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Users can only view their own profile or admin can view any
        if current_user_id != user_id and current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Not authorized to view this user'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>/status', methods=['PUT'])
@jwt_required()
def update_user_status(user_id):
    """
    Update user status (admin only)
    ---
    security:
      - Bearer: []
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            is_active:
              type: boolean
    responses:
      200:
        description: User status updated
      403:
        description: Admin access required
      404:
        description: User not found
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'User status updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/farmers', methods=['GET'])
def get_farmers():
    """
    Get all farmers (public endpoint)
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
      - name: location
        in: query
        type: string
    responses:
      200:
        description: List of farmers
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        location = request.args.get('location', '')
        
        query = User.query.filter_by(role=UserRole.FARMER, is_active=True)
        
        if location:
            query = query.filter(User.farm_location.ilike(f'%{location}%'))
        
        query = query.order_by(User.created_at.desc())
        result = paginate_query(query, page, per_page)
        
        # Return limited farmer info for public access
        farmers = []
        for farmer in result['items']:
            farmer_data = {
                'id': farmer.id,
                'first_name': farmer.first_name,
                'last_name': farmer.last_name,
                'farm_name': farmer.farm_name,
                'farm_location': farmer.farm_location,
                'profile_image': farmer.profile_image,
                'created_at': farmer.created_at.isoformat()
            }
            farmers.append(farmer_data)
        
        return jsonify({
            'farmers': farmers,
            'pagination': result['pagination']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """
    Get user statistics (admin only)
    ---
    security:
      - Bearer: []
    responses:
      200:
        description: User statistics
      403:
        description: Admin access required
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        total_users = User.query.count()
        total_farmers = User.query.filter_by(role=UserRole.FARMER).count()
        total_customers = User.query.filter_by(role=UserRole.CUSTOMER).count()
        active_users = User.query.filter_by(is_active=True).count()
        inactive_users = User.query.filter_by(is_active=False).count()
        
        # Recent registrations (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_registrations = User.query.filter(User.created_at >= thirty_days_ago).count()
        
        return jsonify({
            'total_users': total_users,
            'total_farmers': total_farmers,
            'total_customers': total_customers,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'recent_registrations': recent_registrations
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500