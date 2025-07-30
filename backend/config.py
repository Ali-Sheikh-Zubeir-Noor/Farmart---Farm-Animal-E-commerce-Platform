import os
from datetime import timedelta


class Config:
   SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://username:password@localhost/farmart')
   SQLALCHEMY_TRACK_MODIFICATIONS = False
   JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
   JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
   SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
  
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
   CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
   CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
  
   # SendGrid Configuration
   SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
   FROM_EMAIL = os.getenv('FROM_EMAIL', 'noreply@farmart.com')


class DevelopmentConfig(Config):
   DEBUG = True


class ProductionConfig(Config):
   DEBUG = False


config = {
   'development': DevelopmentConfig,
   'production': ProductionConfig,
   'default': DevelopmentConfig
}
