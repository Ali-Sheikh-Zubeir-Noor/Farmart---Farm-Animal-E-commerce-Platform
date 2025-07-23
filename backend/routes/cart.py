from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Cart, CartItem, Animal, User, UserRole
from datetime import datetime

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/', methods=['GET'])
@jwt_required()
def get_cart():
    """
    Get user's cart
    ---
    security:
      - Bearer: []
    responses:
      200:
        description: User's cart
      403:
        description: Only customers can access cart
      404:
        description: Cart not found
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != UserRole.CUSTOMER:
            return jsonify({'error': 'Only customers can access cart'}), 403
        
        cart = Cart.query.filter_by(user_id=user_id).first()
        
        if not cart:
            # Create cart if it doesn't exist
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()
        
        return jsonify({'cart': cart.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    """
    Add item to cart
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
            animal_id:
              type: integer
            quantity:
              type: integer
              default: 1
    responses:
      200:
        description: Item added to cart
      400:
        description: Invalid request
      403:
        description: Only customers can add to cart
      404:
        description: Animal not found
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != UserRole.CUSTOMER:
            return jsonify({'error': 'Only customers can add items to cart'}), 403
        
        data = request.get_json()
        
        if not data.get('animal_id'):
            return jsonify({'error': 'Animal ID is required'}), 400
        
        animal_id = data['animal_id']
        quantity = data.get('quantity', 1)
        
        if quantity < 1:
            return jsonify({'error': 'Quantity must be at least 1'}), 400
        
        # Check if animal exists and is available
        animal = Animal.query.get(animal_id)
        if not animal:
            return jsonify({'error': 'Animal not found'}), 404
        
        if not animal.is_available:
            return jsonify({'error': 'Animal is not available'}), 400
        
        # Check if user is trying to buy their own animal
        if animal.farmer_id == user_id:
            return jsonify({'error': 'You cannot buy your own animal'}), 400
        
        # Get or create cart
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.flush()
        
        # Check if item already exists in cart
        existing_item = CartItem.query.filter_by(
            cart_id=cart.id,
            animal_id=animal_id
        ).first()
        
        if existing_item:
            existing_item.quantity += quantity
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                animal_id=animal_id,
                quantity=quantity
            )
            db.session.add(cart_item)
        
        cart.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Item added to cart successfully',
            'cart': cart.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/items/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    """
    Update cart item quantity
    ---
    security:
      - Bearer: []
    parameters:
      - name: item_id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            quantity:
              type: integer
    responses:
      200:
        description: Cart item updated
      400:
        description: Invalid quantity
      403:
        description: Not authorized
      404:
        description: Cart item not found
    """
    try:
        user_id = get_jwt_identity()
        
        cart_item = CartItem.query.get(item_id)
        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404
        
        # Check if user owns this cart item
        if cart_item.cart.user_id != user_id:
            return jsonify({'error': 'Not authorized to update this item'}), 403
        
        data = request.get_json()
        quantity = data.get('quantity')
        
        if not quantity or quantity < 1:
            return jsonify({'error': 'Quantity must be at least 1'}), 400
        
        cart_item.quantity = quantity
        cart_item.cart.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Cart item updated successfully',
            'cart': cart_item.cart.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_cart_item(item_id):
    """
    Remove item from cart
    ---
    security:
      - Bearer: []
    parameters:
      - name: item_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Item removed from cart
      403:
        description: Not authorized
      404:
        description: Cart item not found
    """
    try:
        user_id = get_jwt_identity()
        
        cart_item = CartItem.query.get(item_id)
        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404
        
        # Check if user owns this cart item
        if cart_item.cart.user_id != user_id:
            return jsonify({'error': 'Not authorized to remove this item'}), 403
        
        cart = cart_item.cart
        db.session.delete(cart_item)
        cart.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Item removed from cart successfully',
            'cart': cart.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """
    Clear all items from cart
    ---
    security:
      - Bearer: []
    responses:
      200:
        description: Cart cleared
      404:
        description: Cart not found
    """
    try:
        user_id = get_jwt_identity()
        
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            return jsonify({'error': 'Cart not found'}), 404
        
        # Delete all cart items
        CartItem.query.filter_by(cart_id=cart.id).delete()
        cart.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Cart cleared successfully',
            'cart': cart.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500