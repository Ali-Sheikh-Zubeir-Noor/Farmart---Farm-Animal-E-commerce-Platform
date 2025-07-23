from flask_mail import Message
from flask import current_app
import sendgrid
from sendgrid.helpers.mail import Mail
import os

def send_email(to_email, subject, html_content):
    """Send email using SendGrid"""
    try:
        sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
        
        message = Mail(
            from_email='noreply@farmart.com',
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        
        response = sg.send(message)
        return response.status_code == 202
        
    except Exception as e:
        current_app.logger.error(f'Failed to send email: {str(e)}')
        return False

def send_verification_email(email, first_name):
    """Send email verification"""
    subject = 'Welcome to Farmart - Verify Your Email'
    html_content = f'''
    <html>
        <body>
            <h2>Welcome to Farmart, {first_name}!</h2>
            <p>Thank you for joining our platform that connects farmers directly with buyers.</p>
            <p>Your account has been created successfully. You can now start using Farmart to:</p>
            <ul>
                <li>Buy farm animals directly from farmers</li>
                <li>Sell your farm animals (if you're a farmer)</li>
                <li>Build trust and eliminate middlemen</li>
            </ul>
            <p>Happy farming!</p>
            <p>Best regards,<br>The Farmart Team</p>
        </body>
    </html>
    '''
    
    return send_email(email, subject, html_content)

def send_order_confirmation(email, order_number, items):
    """Send order confirmation email"""
    subject = f'Order Confirmation - {order_number}'
    
    items_html = ''
    total_amount = 0
    
    for item in items:
        items_html += f'''
        <tr>
            <td>{item['animal']['name']}</td>
            <td>{item['quantity']}</td>
            <td>${item['price']:.2f}</td>
            <td>${item['subtotal']:.2f}</td>
        </tr>
        '''
        total_amount += item['subtotal']
    
    html_content = f'''
    <html>
        <body>
            <h2>Order Confirmation</h2>
            <p>Thank you for your order! Here are the details:</p>
            <p><strong>Order Number:</strong> {order_number}</p>
            
            <h3>Items Ordered:</h3>
            <table border="1" style="border-collapse: collapse;">
                <thead>
                    <tr>
                        <th>Animal</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
            </table>
            
            <h3>Total Amount: ${total_amount:.2f}</h3>
            
            <p>We will process your order and contact you soon.</p>
            <p>Best regards,<br>The Farmart Team</p>
        </body>
    </html>
    '''
    
    return send_email(email, subject, html_content)

def send_order_notification_to_farmer(email, farmer_name, order_number, items):
    """Send new order notification to farmer"""
    subject = f'New Order Received - {order_number}'
    
    items_html = ''
    for item in items:
        if item['animal']['farmer_id'] == farmer_name:  # This should be farmer_id check
            items_html += f'''
            <tr>
                <td>{item['animal']['name']}</td>
                <td>{item['quantity']}</td>
                <td>${item['price']:.2f}</td>
            </tr>
            '''
    
    html_content = f'''
    <html>
        <body>
            <h2>New Order Received</h2>
            <p>Hello {farmer_name},</p>
            <p>You have received a new order for your animals:</p>
            <p><strong>Order Number:</strong> {order_number}</p>
            
            <h3>Items Ordered:</h3>
            <table border="1" style="border-collapse: collapse;">
                <thead>
                    <tr>
                        <th>Animal</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
            </table>
            
            <p>Please log in to your account to confirm or reject this order.</p>
            <p>Best regards,<br>The Farmart Team</p>
        </body>
    </html>
    '''
    
    return send_email(email, subject, html_content)