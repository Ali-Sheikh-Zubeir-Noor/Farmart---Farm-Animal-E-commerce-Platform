from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from enum import Enum

db = SQLAlchemy()

class UserRole(Enum):
    FARMER = "farmer"
    CUSTOMER = "customer"
    ADMIN = "admin"

class AnimalType(Enum):
    CATTLE = "cattle"
    SHEEP = "sheep"
    GOAT = "goat"
    PIG = "pig"
    CHICKEN = "chicken"
    DUCK = "duck"
    TURKEY = "turkey"

class OrderStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.Enum(UserRole), nullable=False, default=UserRole.CUSTOMER)
    is_active = db.Column(db.Boolean, default=True)
    is_email_verified = db.Column(db.Boolean, default=False)
    farm_name = db.Column(db.String(100))  # For farmers
    farm_location = db.Column(db.String(200))  # For farmers
    profile_image = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    animals = db.relationship('Animal', backref='farmer', lazy=True)
    orders = db.relationship('Order', backref='customer', lazy=True)
    cart = db.relationship('Cart', backref='user', uselist=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'role': self.role.value,
            'is_active': self.is_active,
            'is_email_verified': self.is_email_verified,
            'farm_name': self.farm_name,
            'farm_location': self.farm_location,
            'profile_image': self.profile_image,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Animal(db.Model):
    __tablename__ = 'animals'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    animal_type = db.Column(db.Enum(AnimalType), nullable=False)
    breed = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)  # in months
    weight = db.Column(db.Float, nullable=False)  # in kg
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    images = db.Column(db.JSON)  # Array of image URLs
    is_available = db.Column(db.Boolean, default=True)
    health_status = db.Column(db.String(50), default='healthy')
    vaccination_status = db.Column(db.String(50), default='up_to_date')
    farmer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cart_items = db.relationship('CartItem', backref='animal', lazy=True)
    order_items = db.relationship('OrderItem', backref='animal', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'animal_type': self.animal_type.value,
            'breed': self.breed,
            'age': self.age,
            'weight': self.weight,
            'price': self.price,
            'description': self.description,
            'images': self.images or [],
            'is_available': self.is_available,
            'health_status': self.health_status,
            'vaccination_status': self.vaccination_status,
            'farmer_id': self.farmer_id,
            'farmer': self.farmer.to_dict() if self.farmer else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Cart(db.Model):
    __tablename__ = 'carts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('CartItem', backref='cart', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'items': [item.to_dict() for item in self.items],
            'total_amount': sum(item.quantity * item.animal.price for item in self.items),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    
    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False)
    animal_id = db.Column(db.Integer, db.ForeignKey('animals.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'cart_id': self.cart_id,
            'animal_id': self.animal_id,
            'animal': self.animal.to_dict() if self.animal else None,
            'quantity': self.quantity,
            'subtotal': self.quantity * self.animal.price if self.animal else 0,
            'created_at': self.created_at.isoformat()
        }

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(20), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.Enum(OrderStatus), nullable=False, default=OrderStatus.PENDING)
    total_amount = db.Column(db.Float, nullable=False)
    shipping_address = db.Column(db.JSON)
    payment_method = db.Column(db.String(50))
    payment_status = db.Column(db.String(20), default='pending')
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'customer_id': self.customer_id,
            'customer': self.customer.to_dict() if self.customer else None,
            'status': self.status.value,
            'total_amount': self.total_amount,
            'shipping_address': self.shipping_address,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'notes': self.notes,
            'items': [item.to_dict() for item in self.items],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    animal_id = db.Column(db.Integer, db.ForeignKey('animals.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)  # Price at time of order
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'animal_id': self.animal_id,
            'animal': self.animal.to_dict() if self.animal else None,
            'quantity': self.quantity,
            'price': self.price,
            'subtotal': self.quantity * self.price,
            'created_at': self.created_at.isoformat()
        }