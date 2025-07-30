# Farmart - Complete Setup Guide

## Prerequisites

### System Requirements
- Ubuntu/Linux system
- Python 3.8+ 
- Node.js 16+
- PostgreSQL 12+
- Git

## Step 1: Install System Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip python3-venv python3-dev -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib libpq-dev -y

# Install Node.js and npm (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Git (if not already installed)
sudo apt install git -y

# Verify installations
python3 --version
node --version
npm --version
psql --version
```

## Step 2: Clone and Setup Project

```bash
# Clone the project (replace with your actual repository URL)
git clone <your-repository-url>
cd farmart

# Or if you have the files locally, navigate to the project directory
cd /path/to/your/farmart/project
```

## Step 3: Database Setup

### 3.1 Configure PostgreSQL

```bash
# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, create database and user
CREATE DATABASE farmart;
CREATE USER farmartuser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE farmart TO farmartuser;

# Grant additional permissions for schema creation
ALTER USER farmartuser CREATEDB;
GRANT ALL ON SCHEMA public TO farmartuser;

# Exit PostgreSQL shell
\q
```

### 3.2 Run Database Migrations

```bash
# Navigate to backend directory
cd backend

# Run the database setup script
sudo -u postgres psql -d farmart -f database_setup.sql

# Or run as your user if you have permissions
psql -h localhost -U farmartuser -d farmart -f database_setup.sql
```

## Step 4: Backend Setup (Python Flask)

### 4.1 Create Virtual Environment

```bash
# Make sure you're in the backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### 4.2 Install Python Dependencies

```bash
# Install all required packages
pip install -r requirements.txt
```

### 4.3 Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Configure your `.env` file with these values:**

```env
# Database Configuration
DATABASE_URL=postgresql://farmartuser:your_secure_password@localhost/farmart

# JWT Configuration (generate a strong secret key)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production-make-it-very-long-and-random

# Cloudinary Configuration (Sign up at https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# SendGrid Configuration (Sign up at https://sendgrid.com)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@farmart.com

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

### 4.4 Get Cloudinary Credentials

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to Dashboard
4. Copy your Cloud Name, API Key, and API Secret
5. Add them to your `.env` file

### 4.5 Get SendGrid Credentials

1. Go to [https://sendgrid.com](https://sendgrid.com)
2. Sign up for a free account
3. Go to Settings > API Keys
4. Create a new API key with full access
5. Copy the API key and add it to your `.env` file

### 4.6 Test Backend Setup

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Test the application
python run.py
```

You should see:
```
* Running on http://127.0.0.1:5000
* Debug mode: on
```

## Step 5: Frontend Setup (React)

### 5.1 Install Frontend Dependencies

```bash
# Open a new terminal and navigate to project root
cd /path/to/farmart

# Install Node.js dependencies
npm install
```

### 5.2 Configure Frontend API URL

The frontend is already configured to use `http://localhost:5000/api` for the backend API.

### 5.3 Start Frontend Development Server

```bash
# Start the React development server
npm run dev
```

You should see:
```
  Local:   http://localhost:5173/
  Network: use --host to expose
```

## Step 6: Verify Complete Setup

### 6.1 Check Backend API

Open a new terminal and test the API:

```bash
# Test API health
curl http://localhost:5000/api/animals

# You should get a JSON response with sample animals
```

### 6.2 Check Frontend

1. Open your browser and go to `http://localhost:5173`
2. You should see the Farmart homepage
3. Try logging in with demo accounts:
   - **Farmer**: farmer@example.com / password123
   - **Buyer**: buyer@example.com / password123

## Step 7: Production Deployment (Optional)

### 7.1 Backend Production Setup

```bash
# Install production server
pip install gunicorn

# Create systemd service file
sudo nano /etc/systemd/system/farmart.service
```

**Add this content to the service file:**

```ini
[Unit]
Description=Farmart Flask App
After=network.target

[Service]
User=your-username
Group=www-data
WorkingDirectory=/path/to/farmart/backend
Environment="PATH=/path/to/farmart/backend/venv/bin"
ExecStart=/path/to/farmart/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable farmart
sudo systemctl start farmart
```

### 7.2 Frontend Production Build

```bash
# Build for production
npm run build

# Install nginx
sudo apt install nginx

# Copy build files
sudo cp -r dist/* /var/www/html/

# Configure nginx (optional)
sudo nano /etc/nginx/sites-available/farmart
```

## Step 8: Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if database exists
sudo -u postgres psql -l | grep farmart

# Reset database if needed
sudo -u postgres psql -c "DROP DATABASE IF EXISTS farmart;"
sudo -u postgres psql -c "CREATE DATABASE farmart;"
sudo -u postgres psql -d farmart -f backend/database_setup.sql
```

#### Python Dependencies Issues
```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### Node.js Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use
```bash
# Kill processes on port 5000 (backend)
sudo lsof -t -i:5000 | xargs sudo kill -9

# Kill processes on port 5173 (frontend)
sudo lsof -t -i:5173 | xargs sudo kill -9
```

## Step 9: Development Workflow

### Starting Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python run.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Making Database Changes

1. Modify the database schema in `backend/database_setup.sql`
2. Drop and recreate the database:
```bash
sudo -u postgres psql -c "DROP DATABASE farmart;"
sudo -u postgres psql -c "CREATE DATABASE farmart;"
sudo -u postgres psql -d farmart -f backend/database_setup.sql
```

### Adding New Features

1. Create a new branch: `git checkout -b feature/new-feature`
2. Make your changes
3. Test thoroughly
4. Commit with descriptive messages
5. Create pull request

## Step 10: Testing

### Backend Testing
```bash
cd backend
source venv/bin/activate

# Install testing dependencies
pip install pytest pytest-flask

# Run tests (when test files are created)
pytest
```

### Frontend Testing
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests (when test files are created)
npm test
```

## Congratulations! 🎉

Your Farmart application should now be running with:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: PostgreSQL with all tables created
- **Image Storage**: Cloudinary integration
- **Email Service**: SendGrid integration

### Demo Accounts:
- **Farmer**: farmer@example.com / password123
- **Buyer**: buyer@example.com / password123

### Features Available:
- ✅ User registration and authentication
- ✅ Animal listing and management (farmers)
- ✅ Animal browsing and filtering (buyers)
- ✅ Shopping cart functionality
- ✅ Order processing and management
- ✅ Image upload with Cloudinary
- ✅ Email notifications with SendGrid
- ✅ Responsive design for all devices

The application is now ready for development and testing!