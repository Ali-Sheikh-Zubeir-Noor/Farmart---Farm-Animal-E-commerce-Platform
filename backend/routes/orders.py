from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, OrderItem, Cart, CartItem, Animal, User, UserRole, OrderStatus
from utils.validators import validate_order_data
from utils.pagination import paginate_query
from utils.email_service import send_order_confirmation, send_order_notification_to_farmer
from datetime import datetime
import uuid

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    """
    Create a new order from cart
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
            shipping_address:
              type: object
            payment_method:
              type: string
            notes:
              type: string
    responses:
      201:
        description: Order created successfully
      400:
        description: Validation error or empty cart
      403:
        description: Only customers can create orders
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != UserRole.CUSTOMER:
            return jsonify({'error': 'Only customers can create orders'}), 403
        
        data = request.get_json()
        
        # Validate order data
        validation_error = validate_order_data(data)
        if validation_error:
            return jsonify({'error': validation_error}), 400
        
        # Get user's cart
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart or not cart.items:
            return jsonify({'error': 'Cart is empty'}), 400
        
        # Check if all items are still available
        for cart_item in cart.items:
            if not cart_item.animal.is_available:
                return jsonify({'error': f'Animal {cart_item.animal.name} is no longer available'}), 400
        
        # Calculate total amount
        total_amount = sum(item.quantity * item.animal.price for item in cart.items)
        
        # Generate order number
        order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Create order
        order = Order(
            order_number=order_number,
            customer_id=user_id,
            total_amount=total_amount,
            shipping_address=data['shipping_address'],
            payment_method=data.get('payment_method', 'credit_card'),
            notes=data.get('notes')
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Create order items and mark animals as unavailable
        farmers_to_notify = set()
        for cart_item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                animal_id=cart_item.animal_id,
                quantity=cart_item.quantity,
                price=cart_item.animal.price
            )
            db.session.add(order_item)
            
            # Mark animal as unavailable
            cart_item.animal.is_available = False
            farmers_to_notify.add(cart_item.animal.farmer)
        
        # Clear cart
        CartItem.query.filter_by(cart_id=cart.id).delete()
        
        db.session.commit()
        
        # Send confirmation email to customer
        try:
            send_order_confirmation(
                user.email,
                order.order_number,
                [item.to_dict() for item in order.items]
            )
        except Exception as e:
            # Log email error but don't fail the order
            print(f"Failed to send order confirmation email: {str(e)}")
        
        # Send notification emails to farmers
        for farmer in farmers_to_notify:
            try:
                farmer_items = [item for item in order.items if item.animal.farmer_id == farmer.id]
                send_order_notification_to_farmer(
                    farmer.email,
                    f"{farmer.first_name} {farmer.last_name}",
                    order.order_number,
                    [item.to_dict() for item in farmer_items]
                )
            except Exception as e:
                # Log email error but don't fail the order
                print(f"Failed to send farmer notification email: {str(e)}")
        
        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    """
    Get user's orders
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
        description: List of user's orders
    """
    try:
        user_id = get_jwt_identity()
        
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        
        query = Order.query.filter_by(customer_id=user_id).order_by(Order.created_at.desc())
        result = paginate_query(query, page, per_page)
        
        return jsonify({
            'orders': [order.to_dict() for order in result['items']],
            'pagination': result['pagination']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """
    Get single order by ID
    ---
    security:
      - Bearer: []
    parameters:
      - name: order_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Order details
      403:
        description: Not authorized to view this order
      404:
        description: Order not found
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Check if user can view this order
        can_view = False
        if user.role == UserRole.CUSTOMER and order.customer_id == user_id:
            can_view = True
        elif user.role == UserRole.FARMER:
            # Farmer can view if they have animals in this order
            farmer_animal_ids = [animal.id for animal in user.animals]
            order_animal_ids = [item.animal_id for item in order.items]
            can_view = any(animal_id in farmer_animal_ids for animal_id in order_animal_ids)
        
        if not can_view:
            return jsonify({'error': 'Not authorized to view this order'}), 403
        
        return jsonify({'order': order.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    """
    Update order status (farmers only)
    ---
    security:
      - Bearer: []
    parameters:
      - name: order_id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            status:
              type: string
              enum: [confirmed, rejected, delivered]
    responses:
      200:
        description: Order status updated
      400:
        description: Invalid status
      403:
        description: Not authorized
      404:
        description: Order not found
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != UserRole.FARMER:
            return jsonify({'error': 'Only farmers can update order status'}), 403
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Check if farmer has animals in this order
        farmer_animal_ids = [animal.id for animal in user.animals]
        order_animal_ids = [item.animal_id for item in order.items]
        has_animals = any(animal_id in farmer_animal_ids for animal_id in order_animal_ids)
        
        if not has_animals:
            return jsonify({'error': 'Not authorized to update this order'}), 403
        
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400
        
        try:
            status_enum = OrderStatus(new_status)
        except ValueError:
            return jsonify({'error': 'Invalid status'}), 400
        
        # Only allow certain status transitions
        if order.status == OrderStatus.PENDING:
            if status_enum not in [OrderStatus.CONFIRMED, OrderStatus.REJECTED]:
                return jsonify({'error': 'Can only confirm or reject pending orders'}), 400
        elif order.status == OrderStatus.CONFIRMED:
            if status_enum != OrderStatus.DELIVERED:
                return jsonify({'error': 'Can only mark confirmed orders as delivered'}), 400
        else:
            return jsonify({'error': 'Cannot update order status'}), 400
        
        order.status = status_enum
        order.updated_at = datetime.utcnow()
        
        # If rejected, make animals available again
        if status_enum == OrderStatus.REJECTED:
            for item in order.items:
                if item.animal.farmer_id == user_id:
                    item.animal.is_available = True
        
        db.session.commit()
        
        return jsonify({
            'message': f'Order {new_status} successfully',
            'order': order.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/farmer-orders', methods=['GET'])
@jwt_required()
def get_farmer_orders():
    """
    Get orders for farmer's animals
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
        description: List of orders for farmer's animals
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
        
        # Get orders that contain farmer's animals
        farmer_animal_ids = [animal.id for animal in user.animals]
        
        query = db.session.query(Order).join(OrderItem).filter(
            OrderItem.animal_id.in_(farmer_animal_ids)
        ).distinct().order_by(Order.created_at.desc())
        
        result = paginate_query(query, page, per_page)
        
        return jsonify({
            'orders': [order.to_dict() for order in result['items']],
            'pagination': result['pagination']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500