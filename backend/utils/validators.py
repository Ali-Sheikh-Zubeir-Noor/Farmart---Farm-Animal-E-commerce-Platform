import re
from typing import Optional

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password: str) -> bool:
    """
    Validate password strength
    Requirements:
    - At least 8 characters long
    - Contains uppercase letter
    - Contains lowercase letter
    - Contains number
    """
    if len(password) < 8:
        return False
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    
    return has_upper and has_lower and has_digit

def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    if not phone:
        return True  # Phone is optional
    
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    
    # Check if it's between 10-15 digits
    return 10 <= len(digits_only) <= 15

def validate_animal_data(data: dict) -> Optional[str]:
    """
    Validate animal creation/update data
    Returns error message if validation fails, None if valid
    """
    required_fields = ['name', 'animal_type', 'breed', 'age', 'weight', 'price']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return f'{field} is required'
    
    # Validate age
    try:
        age = int(data['age'])
        if age < 1 or age > 300:  # 300 months = 25 years
            return 'Age must be between 1 and 300 months'
    except (ValueError, TypeError):
        return 'Age must be a valid number'
    
    # Validate weight
    try:
        weight = float(data['weight'])
        if weight <= 0 or weight > 10000:  # 10 tons max
            return 'Weight must be between 0.1 and 10000 kg'
    except (ValueError, TypeError):
        return 'Weight must be a valid number'
    
    # Validate price
    try:
        price = float(data['price'])
        if price <= 0 or price > 1000000:  # $1M max
            return 'Price must be between $0.01 and $1,000,000'
    except (ValueError, TypeError):
        return 'Price must be a valid number'
    
    # Validate name length
    if len(data['name']) > 100:
        return 'Animal name must be less than 100 characters'
    
    # Validate breed length
    if len(data['breed']) > 100:
        return 'Breed must be less than 100 characters'
    
    # Validate description length if provided
    if 'description' in data and data['description'] and len(data['description']) > 1000:
        return 'Description must be less than 1000 characters'
    
    return None

def validate_order_data(data: dict) -> Optional[str]:
    """
    Validate order creation data
    Returns error message if validation fails, None if valid
    """
    required_fields = ['shipping_address']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return f'{field} is required'
    
    # Validate shipping address
    shipping_address = data['shipping_address']
    required_address_fields = ['first_name', 'last_name', 'email', 'phone', 'street', 'city', 'state', 'postal_code', 'country']
    
    for field in required_address_fields:
        if field not in shipping_address or not shipping_address[field]:
            return f'Shipping address {field} is required'
    
    # Validate email in shipping address
    if not validate_email(shipping_address['email']):
        return 'Invalid email address in shipping address'
    
    # Validate phone in shipping address
    if not validate_phone(shipping_address['phone']):
        return 'Invalid phone number in shipping address'
    
    return None