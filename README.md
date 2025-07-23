## Farmart - Farm Animal E-commerce Platform

## Project Overview
Farmart is a full-stack e-commerce platform that connects farmers directly with buyers, eliminating middlemen and ensuring farmers get fair profits from selling their farm animals.

## Tech Stack
- **Frontend**: React.js with Redux Toolkit
- **Backend**: Python Flask
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Image Storage**: Cloudinary
- **Email Service**: SendGrid
- **Testing**: Jest (Frontend), pytest (Backend)
- **CI/CD**: GitHub Actions
- **Deployment**: Frontend (Netlify), Backend (Heroku)

## Project Structure
```
farmart/
├── frontend/                 # React application
├── backend/                  # Flask API
├── .github/workflows/        # CI/CD pipelines
├── docs/                     # Documentation
├── README.md
└── docker-compose.yml        # Development environment
```

## Team Structure (5 Members)
- **SCRUM Master**: Responsible for code reviews and merging PRs
- **Frontend Lead**: React development and UI/UX
- **Backend Lead**: Flask API development and database design
- **DevOps Engineer**: CI/CD setup and deployment
- **QA Engineer**: Testing and quality assurance

## Week-by-Week Timeline

### Week 1: Setup & Design
- [ ] Create Figma designs and wireframes
- [ ] Design database schema and create diagrams
- [ ] Set up project repository with proper structure
- [ ] Deploy initial applications to remote servers
- [ ] Set up CI/CD pipelines

### Week 2: Development
- [ ] Develop core frontend features
- [ ] Develop backend API endpoints
- [ ] Implement authentication system
- [ ] Set up database and migrations

### Week 3: Development Cont'd & Deployment
- [ ] Complete remaining features
- [ ] Implement testing (85% coverage)
- [ ] Prepare presentation materials
- [ ] Final deployment and testing

## Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- PostgreSQL
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-team/farmart.git
   cd farmart
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   flask db upgrade
   flask run
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb farmart_db
   
   # Run migrations
   cd backend
   flask db upgrade
   ```

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Backend (.env)**
```
DATABASE_URL=postgresql://username:password@localhost/farmart_db
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SENDGRID_API_KEY=your-sendgrid-key
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

## Development Workflow

### Git Flow
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -m "feat: add feature description"`
3. Push to remote: `git push origin feature/feature-name`
4. Create Pull Request
5. Code review by 2 members + SCRUM master
6. Merge to develop branch
7. Delete feature branch

### Testing
- Frontend: `npm test` (Jest)
- Backend: `pytest` (pytest)
- Coverage: Minimum 85% for both frontend and backend

### Deployment
- Frontend: Automatically deployed to Netlify on push to main
- Backend: Automatically deployed to Heroku on push to main

## API Documentation
API documentation is available at `/docs` when running the backend server (Swagger UI).

## Contributing
1. Follow the Git Flow workflow
2. Write descriptive commit messages
3. Ensure all tests pass
4. Maintain code coverage above 85%
5. Update documentation as needed

## Support
For questions or issues, please create an issue in the GitHub repository or contact the team leads.