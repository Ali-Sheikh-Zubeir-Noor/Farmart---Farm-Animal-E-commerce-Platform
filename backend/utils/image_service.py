import cloudinary
import cloudinary.uploader
import cloudinary.api
from flask import current_app
import os
from urllib.parse import urlparse

def upload_image(file, folder="farmart"):
    """
    Upload image to Cloudinary
    
    Args:
        file: File object to upload
        folder: Cloudinary folder name
    
    Returns:
        dict: Upload result with secure_url
    """
    try:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="image",
            quality="auto",
            fetch_format="auto"
        )
        return result
    except Exception as e:
        current_app.logger.error(f'Failed to upload image: {str(e)}')
        raise e

def delete_image(image_url):
    """
    Delete image from Cloudinary using URL
    
    Args:
        image_url: Full Cloudinary URL
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Extract public_id from URL
        parsed_url = urlparse(image_url)
        path_parts = parsed_url.path.split('/')
        
        # Find the version and public_id parts
        if 'upload' in path_parts:
            upload_index = path_parts.index('upload')
            # Skip version if present (starts with 'v' followed by numbers)
            start_index = upload_index + 1
            if (start_index < len(path_parts) and 
                path_parts[start_index].startswith('v') and 
                path_parts[start_index][1:].isdigit()):
                start_index += 1
            
            # Join remaining parts and remove file extension
            public_id = '/'.join(path_parts[start_index:])
            public_id = os.path.splitext(public_id)[0]
            
            # Delete from Cloudinary
            result = cloudinary.uploader.destroy(public_id)
            return result.get('result') == 'ok'
        
        return False
    except Exception as e:
        current_app.logger.error(f'Failed to delete image: {str(e)}')
        return False

def get_image_info(public_id):
    """
    Get image information from Cloudinary
    
    Args:
        public_id: Cloudinary public ID
    
    Returns:
        dict: Image information
    """
    try:
        result = cloudinary.api.resource(public_id)
        return result
    except Exception as e:
        current_app.logger.error(f'Failed to get image info: {str(e)}')
        return None

def generate_thumbnail(image_url, width=300, height=300):
    """
    Generate thumbnail URL from original image URL
    
    Args:
        image_url: Original Cloudinary URL
        width: Thumbnail width
        height: Thumbnail height
    
    Returns:
        str: Thumbnail URL
    """
    try:
        # Extract public_id from URL
        parsed_url = urlparse(image_url)
        path_parts = parsed_url.path.split('/')
        
        if 'upload' in path_parts:
            upload_index = path_parts.index('upload')
            # Insert transformation parameters
            path_parts.insert(upload_index + 1, f'w_{width},h_{height},c_fill')
            
            # Reconstruct URL
            new_path = '/'.join(path_parts)
            thumbnail_url = f"{parsed_url.scheme}://{parsed_url.netloc}{new_path}"
            return thumbnail_url
        
        return image_url
    except Exception as e:
        current_app.logger.error(f'Failed to generate thumbnail: {str(e)}')
        return image_url