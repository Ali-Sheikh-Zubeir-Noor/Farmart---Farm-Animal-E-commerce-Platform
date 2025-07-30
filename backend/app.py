from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import uuid
import cloudinary
import cloudinary.uploader
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv


load_dotenv()


app = Flask(__name__)


# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://username:password@localhost/farmart')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)


# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app)


# Configure Cloudinary
cloudinary.config(
   cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
   api_key=os.getenv('CLOUDINARY_API_KEY'),
   api_secret=os.getenv('CLOUDINARY_API_SECRET')
)


# SendGrid configuration
sg = SendGridAPIClient(api_key=os.getenv('SENDGRID_API_KEY'))


# Models
class User(db.Model):
   __tablename__ = 'users'
  
   id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
   email = db.Column(db.String(120), unique=True, nullable=False)
   password_hash = db.Column(db.String(255), nullable=False)
   name = db.Column(db.String(100), nullable=False)
   user_type = db.Column(db.String(20), nullable=False)  # 'farmer' or 'buyer'
   phone = db.Column(db.String(20), nullable=False)
   location = db.Column(db.String(200), nullable=False)
   profile_image = db.Column(db.String(500), nullable=True)
   is_verified = db.Column(db.Boolean, default=False)
   created_at = db.Column(db.DateTime, default=datetime.utcnow)
  
   # Relationships
   animals = db.relationship('Animal', backref='farmer', lazy=True, cascade='all, delete-orphan')
   orders = db.relationship('Order', backref='buyer', lazy=True, cascade='all, delete-orphan')
   cart_items = db.relationship('CartItem', backref='user', lazy=True, cascade='all, delete-orphan')


class Animal(db.Model):
   __tablename__ = 'animals'
  
   id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
   name = db.Column(db.String(100), nullable=False)
   type = db.Column(db.String(50), nullable=False)
   breed = db.Column(db.String(100), nullable=False)
   age = db.Column(db.Float, nullable=False)
   weight = db.Column(db.Float, nullable=False)
   price = db.Column(db.Float, nullable=False)
   description = db.Column(db.Text, nullable=False)
   images = db.Column(db.JSON, nullable=False)  # Array of Cloudinary URLs
   health_status = db.Column(db.String(50), default='healthy')
   vaccination_status = db.Column(db.String(50), default='up_to_date')
   status = db.Column(db.String(20), default='available')
   farmer_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
   created_at = db.Column(db.DateTime, default=datetime.utcnow)
   updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CartItem(db.Model):
   __tablename__ = 'cart_items'
  
   id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
   user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
   animal_id = db.Column(db.String(36), db.ForeignKey('animals.id'), nullable=False)
   quantity = db.Column(db.Integer, default=1)
   added_at = db.Column(db.DateTime, default=datetime.utcnow)
  
   # Relationships
   animal = db.relationship('Animal', backref='cart_items')


class Order(db.Model):
   __tablename__ = 'orders'
  
   id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
   user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
   total_amount = db.Column(db.Float, nullable=False)
   status = db.Column(db.String(20), default='pending')
   shipping_address = db.Column(db.JSON, nullable=False)
   payment_method = db.Column(db.String(50), default='card')
   payment_status = db.Column(db.String(20), default='pending')
   notes = db.Column(db.Text, nullable=True)
   created_at = db.Column(db.DateTime, default=datetime.utcnow)
   updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
  
   # Relationships
   items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')


class OrderItem(db.Model):
   __tablename__ = 'order_items'
  
   id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
   order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=False)
   animal_id = db.Column(db.String(36), db.ForeignKey('animals.id'), nullable=False)
   animal_name = db.Column(db.String(100), nullable=False)
   quantity = db.Column(db.Integer, nullable=False)
   price = db.Column(db.Float, nullable=False)
   farmer_id = db.Column(db.String(36), nullable=False)
   farmer_name = db.Column(db.String(100), nullable=False)
  
   # Relationships
   animal = db.relationship('Animal', backref='order_items')


# Helper functions
def send_email(to_email, subject, html_content):
   """Send email using SendGrid"""
   try:
       message = Mail(
           from_email=os.getenv('FROM_EMAIL', 'noreply@farmart.com'),
           to_emails=to_email,
           subject=subject,
           html_content=html_content
       )
       response = sg.send(message)
       return True
   except Exception as e:
       print(f"Email sending failed: {e}")
       return False


def serialize_user(user):
   return {
       'id': user.id,
       'email': user.email,
       'name': user.name,
       'userType': user.user_type,
       'phone': user.phone,
       'location': user.location,
       'profileImage': user.profile_image,
       'isVerified': user.is_verified,
       'createdAt': user.created_at.isoformat()
   }


def serialize_animal(animal):
   return {
       'id': animal.id,
       'name': animal.name,
       'type': animal.type,
       'breed': animal.breed,
       'age': animal.age,
       'weight': animal.weight,
       'price': animal.price,
       'description': animal.description,
       'images': animal.images,
       'healthStatus': animal.health_status,
       'vaccinationStatus': animal.vaccination_status,
       'status': animal.status,
       'farmerId': animal.farmer_id,
       'farmerName': animal.farmer.name,
       'farmerLocation': animal.farmer.location,
       'farmerPhone': animal.farmer.phone,
       'createdAt': animal.created_at.isoformat(),
       'updatedAt': animal.updated_at.isoformat()
   }


def serialize_cart_item(cart_item):
   return {
       'id': cart_item.id,
       'userId': cart_item.user_id,
       'animalId': cart_item.animal_id,
       'quantity': cart_item.quantity,
       'addedAt': cart_item.added_at.isoformat(),
       'animal': serialize_animal(cart_item.animal)
   }


def serialize_order(order):
   return {
       'id': order.id,
       'userId': order.user_id,
       'totalAmount': order.total_amount,
       'status': order.status,
       'shippingAddress': order.shipping_address,
       'paymentMethod': order.payment_method,
       'paymentStatus': order.payment_status,
       'notes': order.notes,
       'createdAt': order.created_at.isoformat(),
       'updatedAt': order.updated_at.isoformat(),
       'items': [serialize_order_item(item) for item in order.items]
   }


def serialize_order_item(order_item):
   return {
       'id': order_item.id,
       'animalId': order_item.animal_id,
       'animalName': order_item.animal_name,
       'quantity': order_item.quantity,
       'price': order_item.price,
       'farmerId': order_item.farmer_id,
       'farmerName': order_item.farmer_name
   }


# Routes
@app.route('/')
def index():
   return 'Farmart API is running'


# Auth Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
   try:
       data = request.get_json()
      
       # Check if user exists
       existing_user = User.query.filter_by(email=data['email']).first()
       if existing_user:
           return jsonify({'message': 'User already exists'}), 400
      
       # Create new user
       user = User(
           id=str(uuid.uuid4()),
           email=data['email'],
           password_hash=generate_password_hash(data['password']),
           name=data['name'],
           user_type=data['userType'],
           phone=data['phone'],
           location=data['location']
       )
      
       db.session.add(user)
       db.session.commit()
      
       # Send welcome email
       welcome_html = f"""
       <h2>Welcome to Farmart, {user.name}!</h2>
       <p>Thank you for joining our agricultural marketplace.</p>
       <p>You have registered as a <strong>{user.user_type}</strong>.</p>
       <p>Start exploring quality livestock and connect directly with {'buyers' if user.user_type == 'farmer' else 'farmers'}!</p>
       """
       send_email(user.email, "Welcome to Farmart!", welcome_html)
      
       # Create access token
       access_token = create_access_token(identity=user.id)
      
       return jsonify({
           'message': 'User created successfully',
           'token': access_token,
           'user': serialize_user(user)
       }), 201
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
   try:
       data = request.get_json()
      
       # Find user
       user = User.query.filter_by(email=data['email']).first()
       if not user or not check_password_hash(user.password_hash, data['password']):
           return jsonify({'message': 'Invalid credentials'}), 400
      
       # Create access token
       access_token = create_access_token(identity=user.id)
      
       return jsonify({
           'message': 'Login successful',
           'token': access_token,
           'user': serialize_user(user)
       })
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


# Image upload route
@app.route('/api/upload-image', methods=['POST'])
@jwt_required()
def upload_image():
   try:
       if 'image' not in request.files:
           return jsonify({'message': 'No image file provided'}), 400
      
       file = request.files['image']
       if file.filename == '':
           return jsonify({'message': 'No image file selected'}), 400
      
       # Upload to Cloudinary
       result = cloudinary.uploader.upload(
           file,
           folder="farmart/animals",
           transformation=[
               {'width': 800, 'height': 600, 'crop': 'fill'},
               {'quality': 'auto'},
               {'fetch_format': 'auto'}
           ]
       )
      
       return jsonify({
           'message': 'Image uploaded successfully',
           'imageUrl': result['secure_url'],
           'publicId': result['public_id']
       })
      
   except Exception as e:
       return jsonify({'message': 'Image upload failed'}), 500


# Animal Routes
@app.route('/api/animals', methods=['GET'])
def get_animals():
   try:
       # Get query parameters for filtering
       animal_type = request.args.get('type', '')
       breed = request.args.get('breed', '')
       min_age = request.args.get('minAge', type=float)
       max_age = request.args.get('maxAge', type=float)
       min_price = request.args.get('minPrice', type=float)
       max_price = request.args.get('maxPrice', type=float)
       search = request.args.get('search', '')
       location = request.args.get('location', '')
      
       # Build query
       query = Animal.query.filter_by(status='available')
      
       if animal_type:
           query = query.filter(Animal.type.ilike(f'%{animal_type}%'))
       if breed:
           query = query.filter(Animal.breed.ilike(f'%{breed}%'))
       if min_age:
           query = query.filter(Animal.age >= min_age)
       if max_age:
           query = query.filter(Animal.age <= max_age)
       if min_price:
           query = query.filter(Animal.price >= min_price)
       if max_price:
           query = query.filter(Animal.price <= max_price)
       if search:
           query = query.filter(
               db.or_(
                   Animal.name.ilike(f'%{search}%'),
                   Animal.type.ilike(f'%{search}%'),
                   Animal.breed.ilike(f'%{search}%'),
                   Animal.description.ilike(f'%{search}%')
               )
           )
       if location:
           query = query.join(User).filter(User.location.ilike(f'%{location}%'))
      
       animals = query.order_by(Animal.created_at.desc()).all()
       return jsonify([serialize_animal(animal) for animal in animals])
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


@app.route('/api/animals', methods=['POST'])
@jwt_required()
def add_animal():
   try:
       user_id = get_jwt_identity()
       user = User.query.get(user_id)
      
       if user.user_type != 'farmer':
           return jsonify({'message': 'Only farmers can add animals'}), 403
      
       data = request.get_json()
      
       animal = Animal(
           id=str(uuid.uuid4()),
           name=data['name'],
           type=data['type'],
           breed=data['breed'],
           age=data['age'],
           weight=data['weight'],
           price=data['price'],
           description=data['description'],
           images=data.get('images', []),
           health_status=data.get('healthStatus', 'healthy'),
           vaccination_status=data.get('vaccinationStatus', 'up_to_date'),
           farmer_id=user_id
       )
      
       db.session.add(animal)
       db.session.commit()
      
       # Send notification email to admin (optional)
       admin_html = f"""
       <h3>New Animal Listed on Farmart</h3>
       <p><strong>Farmer:</strong> {user.name}</p>
       <p><strong>Animal:</strong> {animal.name} ({animal.type})</p>
       <p><strong>Price:</strong> ${animal.price}</p>
       """
       # send_email('admin@farmart.com', 'New Animal Listed', admin_html)
      
       return jsonify(serialize_animal(animal)), 201
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


@app.route('/api/animals/<animal_id>', methods=['GET'])
def get_animal(animal_id):
   try:
       animal = Animal.query.get(animal_id)
       if not animal:
           return jsonify({'message': 'Animal not found'}), 404
      
       return jsonify(serialize_animal(animal))
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


@app.route('/api/animals/<animal_id>', methods=['PUT'])
@jwt_required()
def update_animal(animal_id):
   try:
       user_id = get_jwt_identity()
       animal = Animal.query.filter_by(id=animal_id, farmer_id=user_id).first()
      
       if not animal:
           return jsonify({'message': 'Animal not found or unauthorized'}), 404
      
       data = request.get_json()
      
       animal.name = data.get('name', animal.name)
       animal.type = data.get('type', animal.type)
       animal.breed = data.get('breed', animal.breed)
       animal.age = data.get('age', animal.age)
       animal.weight = data.get('weight', animal.weight)
       animal.price = data.get('price', animal.price)
       animal.description = data.get('description', animal.description)
       animal.images = data.get('images', animal.images)
       animal.health_status = data.get('healthStatus', animal.health_status)
       animal.vaccination_status = data.get('vaccinationStatus', animal.vaccination_status)
       animal.updated_at = datetime.utcnow()
      
       db.session.commit()
      
       return jsonify(serialize_animal(animal))
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


@app.route('/api/animals/<animal_id>', methods=['DELETE'])
@jwt_required()
def delete_animal(animal_id):
   try:
       user_id = get_jwt_identity()
       animal = Animal.query.filter_by(id=animal_id, farmer_id=user_id).first()
      
       if not animal:
           return jsonify({'message': 'Animal not found or unauthorized'}), 404
      
       # Delete images from Cloudinary
       for image_url in animal.images:
           try:
               # Extract public_id from URL and delete
               public_id = image_url.split('/')[-1].split('.')[0]
               cloudinary.uploader.destroy(f"farmart/animals/{public_id}")
           except:
               pass
      
       db.session.delete(animal)
       db.session.commit()
      
       return jsonify({'message': 'Animal deleted successfully'})
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


# Cart Routes
@app.route('/api/cart', methods=['GET'])
@jwt_required()
def get_cart():
   try:
       user_id = get_jwt_identity()
       cart_items = CartItem.query.filter_by(user_id=user_id).all()
      
       return jsonify([serialize_cart_item(item) for item in cart_items])
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


@app.route('/api/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
   try:
       user_id = get_jwt_identity()
       data = request.get_json()
      
       animal = Animal.query.get(data['animalId'])
       if not animal:
           return jsonify({'message': 'Animal not found'}), 404
      
       if animal.status != 'available':
           return jsonify({'message': 'Animal is not available'}), 400
      
       # Check if item already exists in cart
       existing_item = CartItem.query.filter_by(
           user_id=user_id,
           animal_id=data['animalId']
       ).first()
      
       if existing_item:
           existing_item.quantity += data.get('quantity', 1)
       else:
           cart_item = CartItem(
               id=str(uuid.uuid4()),
               user_id=user_id,
               animal_id=data['animalId'],
               quantity=data.get('quantity', 1)
           )
           db.session.add(cart_item)
      
       db.session.commit()
      
       return jsonify({'message': 'Item added to cart'})
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


@app.route('/api/cart/<item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
   try:
       user_id = get_jwt_identity()
       cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
      
       if not cart_item:
           return jsonify({'message': 'Cart item not found'}), 404
      
       data = request.get_json()
       cart_item.quantity = data.get('quantity', cart_item.quantity)
      
       db.session.commit()
      
       return jsonify({'message': 'Cart item updated'})
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


@app.route('/api/cart/<item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
   try:
       user_id = get_jwt_identity()
       cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
      
       if not cart_item:
           return jsonify({'message': 'Cart item not found'}), 404
      
       db.session.delete(cart_item)
       db.session.commit()
      
       return jsonify({'message': 'Item removed from cart'})
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


# Order Routes
@app.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
   try:
       user_id = get_jwt_identity()
       user = User.query.get(user_id)
       data = request.get_json()
      
       order = Order(
           id=str(uuid.uuid4()),
           user_id=user_id,
           total_amount=data['totalAmount'],
           shipping_address=data['shippingAddress'],
           payment_method=data.get('paymentMethod', 'card'),
           notes=data.get('notes', '')
       )
      
       db.session.add(order)
       db.session.flush()  # Get the order ID
      
       # Add order items and notify farmers
       farmers_to_notify = set()
       for item_data in data['items']:
           order_item = OrderItem(
               id=str(uuid.uuid4()),
               order_id=order.id,
               animal_id=item_data['animalId'],
               animal_name=item_data['animalName'],
               quantity=item_data['quantity'],
               price=item_data['price'],
               farmer_id=item_data['farmerId'],
               farmer_name=item_data['farmerName']
           )
           db.session.add(order_item)
           farmers_to_notify.add(item_data['farmerId'])
      
       # Clear cart items
       CartItem.query.filter(
           CartItem.user_id == user_id,
           CartItem.animal_id.in_([item['animalId'] for item in data['items']])
       ).delete(synchronize_session=False)
      
       db.session.commit()
      
       # Send confirmation email to buyer
       buyer_html = f"""
       <h2>Order Confirmation - Farmart</h2>
       <p>Dear {user.name},</p>
       <p>Thank you for your order! Your order #{order.id[:8]} has been placed successfully.</p>
       <p><strong>Total Amount:</strong> ${order.total_amount}</p>
       <p>We'll notify you once the farmers confirm your order.</p>
       """
       send_email(user.email, f"Order Confirmation #{order.id[:8]}", buyer_html)
      
       # Send notification emails to farmers
       for farmer_id in farmers_to_notify:
           farmer = User.query.get(farmer_id)
           if farmer:
               farmer_html = f"""
               <h2>New Order Received - Farmart</h2>
               <p>Dear {farmer.name},</p>
               <p>You have received a new order from {user.name}.</p>
               <p><strong>Order ID:</strong> #{order.id[:8]}</p>
               <p>Please log in to your dashboard to review and confirm the order.</p>
               """
               send_email(farmer.email, f"New Order #{order.id[:8]}", farmer_html)
      
       return jsonify(serialize_order(order)), 201
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


@app.route('/api/orders', methods=['GET'])
@jwt_required()
def get_orders():
   try:
       user_id = get_jwt_identity()
       user = User.query.get(user_id)
      
       if user.user_type == 'farmer':
           # Get orders for animals owned by this farmer
           orders = db.session.query(Order).join(OrderItem).filter(
               OrderItem.farmer_id == user_id
           ).distinct().order_by(Order.created_at.desc()).all()
       else:
           # Get orders placed by this user
           orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
      
       return jsonify([serialize_order(order) for order in orders])
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


@app.route('/api/orders/<order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
   try:
       user_id = get_jwt_identity()
       user = User.query.get(user_id)
       data = request.get_json()
      
       if user.user_type != 'farmer':
           return jsonify({'message': 'Only farmers can update order status'}), 403
      
       order = Order.query.get(order_id)
       if not order:
           return jsonify({'message': 'Order not found'}), 404
      
       # Check if user owns any animals in this order
       has_permission = any(item.farmer_id == user_id for item in order.items)
       if not has_permission:
           return jsonify({'message': 'Unauthorized to update this order'}), 403
      
       old_status = order.status
       order.status = data['status']
       order.updated_at = datetime.utcnow()
       db.session.commit()
      
       # Send status update email to buyer
       buyer = User.query.get(order.user_id)
       if buyer:
           status_html = f"""
           <h2>Order Status Update - Farmart</h2>
           <p>Dear {buyer.name},</p>
           <p>Your order #{order.id[:8]} status has been updated.</p>
           <p><strong>Previous Status:</strong> {old_status.title()}</p>
           <p><strong>New Status:</strong> {order.status.title()}</p>
           <p>Thank you for choosing Farmart!</p>
           """
           send_email(buyer.email, f"Order Status Update #{order.id[:8]}", status_html)
      
       return jsonify(serialize_order(order))
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


# User Profile Routes
@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
   try:
       user_id = get_jwt_identity()
       user = User.query.get(user_id)
      
       if not user:
           return jsonify({'message': 'User not found'}), 404
      
       return jsonify(serialize_user(user))
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
   try:
       user_id = get_jwt_identity()
       user = User.query.get(user_id)
      
       if not user:
           return jsonify({'message': 'User not found'}), 404
      
       data = request.get_json()
      
       user.name = data.get('name', user.name)
       user.phone = data.get('phone', user.phone)
       user.location = data.get('location', user.location)
       user.profile_image = data.get('profileImage', user.profile_image)
      
       db.session.commit()
      
       return jsonify(serialize_user(user))
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


# Dashboard Stats Routes
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
   try:
       user_id = get_jwt_identity()
       user = User.query.get(user_id)
      
       if user.user_type == 'farmer':
           total_animals = Animal.query.filter_by(farmer_id=user_id).count()
           available_animals = Animal.query.filter_by(farmer_id=user_id, status='available').count()
           sold_animals = Animal.query.filter_by(farmer_id=user_id, status='sold').count()
          
           # Calculate total revenue from completed orders
           total_revenue = db.session.query(db.func.sum(OrderItem.price * OrderItem.quantity)).filter(
               OrderItem.farmer_id == user_id
           ).join(Order).filter(Order.status == 'completed').scalar() or 0
          
           pending_orders = db.session.query(Order).join(OrderItem).filter(
               OrderItem.farmer_id == user_id,
               Order.status == 'pending'
           ).distinct().count()
          
           stats = {
               'totalAnimals': total_animals,
               'availableAnimals': available_animals,
               'soldAnimals': sold_animals,
               'totalRevenue': total_revenue,
               'pendingOrders': pending_orders
           }
       else:
           cart_items = CartItem.query.filter_by(user_id=user_id).count()
           total_orders = Order.query.filter_by(user_id=user_id).count()
           total_spent = db.session.query(db.func.sum(Order.total_amount)).filter(
               Order.user_id == user_id,
               Order.status == 'completed'
           ).scalar() or 0
          
           stats = {
               'cartItems': cart_items,
               'totalOrders': total_orders,
               'totalSpent': total_spent,
               'favoriteAnimals': 0  # Placeholder for future feature
           }
      
       return jsonify(stats)
      
   except Exception as e:
       return jsonify({'message': 'Server error'}), 500


# Initialize database
def create_tables():
   db.create_all()
  
   # Seed sample data
   if not User.query.first():
       # Create sample farmer
       farmer = User(
           id='farmer1',
           email='farmer@example.com',
           password_hash=generate_password_hash('password123'),
           name='John Smith',
           user_type='farmer',
           phone='+1234567890',
           location='Texas, USA',
           is_verified=True
       )
      
       # Create sample buyer
       buyer = User(
           id='buyer1',
           email='buyer@example.com',
           password_hash=generate_password_hash('password123'),
           name='Jane Doe',
           user_type='buyer',
           phone='+1234567891',
           location='California, USA',
           is_verified=True
       )
      
       db.session.add(farmer)
       db.session.add(buyer)
       db.session.commit()
      
       # Create sample animals
       animals = [
           Animal(
               id=str(uuid.uuid4()),
               name='Bessie',
               type='Cattle',
               breed='Holstein',
               age=3,
               weight=1200,
               price=2500,
               description='Healthy dairy cow with excellent milk production. Well-maintained and vaccinated.',
               images=['https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg'],
               health_status='excellent',
               vaccination_status='up_to_date',
               farmer_id='farmer1'
           ),
           Animal(
               id=str(uuid.uuid4()),
               name='Wilbur',
               type='Pig',
               breed='Yorkshire',
               age=1,
               weight=250,
               price=800,
               description='Young pig perfect for breeding or meat production. Healthy and active.',
               images=['https://images.pexels.com/photos/1300355/pexels-photo-1300355.jpeg'],
               health_status='excellent',
               vaccination_status='up_to_date',
               farmer_id='farmer1'
           ),
           Animal(
               id=str(uuid.uuid4()),
               name='Clucky',
               type='Chicken',
               breed='Rhode Island Red',
               age=0.5,
               weight=5,
               price=25,
               description='Excellent egg layer, healthy and active. Great for backyard farming.',
               images=['https://images.pexels.com/photos/1300361/pexels-photo-1300361.jpeg'],
               health_status='excellent',
               vaccination_status='up_to_date',
               farmer_id='farmer1'
           )
       ]
      
       for animal in animals:
           db.session.add(animal)
      
       db.session.commit()






if __name__ == '__main__':
   with app.app_context():
       create_tables()
   app.run(debug=True, port=5000)
