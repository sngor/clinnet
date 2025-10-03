# 📁 Clinnet EMR Project Structure

Clean, organized project structure for the complete healthcare management system.

## 🏗️ **Project Overview**

```
clinnet/
├── 📄 README.md                    # Main project documentation
├── 📄 PROJECT_STATUS.md            # Current project status
├── 📄 STRUCTURE.md                 # This file - project structure
├── 📄 LICENSE                      # MIT License
├── 📄 .gitignore                   # Git ignore rules
│
├── 📁 backend/                     # AWS Serverless Backend
│   ├── 📄 template.yaml            # SAM infrastructure template
│   ├── 📄 samconfig.toml           # SAM configuration
│   ├── 📁 src/                     # Lambda function source code
│   │   ├── 📁 handlers/            # API endpoint handlers
│   │   │   ├── 📁 patients/        # Patient management functions
│   │   │   ├── 📁 appointments/    # Appointment functions
│   │   │   ├── 📁 services/        # Service management functions
│   │   │   ├── 📁 users/           # User management functions
│   │   │   ├── 📁 medical_reports/ # Medical records functions
│   │   │   ├── 📁 ai/              # AI/ML functions
│   │   │   └── 📁 diagnostics/     # System health functions
│   │   └── 📁 utils/               # Shared utilities
│   ├── 📁 lambda_layer/            # Shared Lambda layer
│   ├── 📁 database/                # Database schemas and migrations
│   └── 📁 tests/                   # Backend tests
│
├── 📁 frontend/                    # React Web Application
│   ├── 📄 package.json             # Node.js dependencies
│   ├── 📄 vite.config.js           # Vite build configuration
│   ├── 📄 index.html               # Main HTML template
│   ├── 📄 .env.example             # Environment variables template
│   ├── 📄 .env.development         # Development environment
│   ├── 📁 public/                  # Static assets
│   ├── 📁 src/                     # React source code
│   │   ├── 📄 main.jsx             # Application entry point
│   │   ├── 📁 app/                 # Core application setup
│   │   │   ├── 📄 App.jsx          # Main App component
│   │   │   ├── 📄 router.jsx       # Application routing
│   │   │   ├── 📄 theme.js         # Material-UI theme
│   │   │   └── 📁 providers/       # Context providers
│   │   ├── 📁 components/          # Reusable UI components
│   │   │   ├── 📁 Layout/          # Layout components
│   │   │   ├── 📁 ui/              # UI component library
│   │   │   └── 📁 forms/           # Form components
│   │   ├── 📁 pages/               # Page components
│   │   │   ├── 📄 LoginPage.jsx    # Authentication
│   │   │   ├── 📄 AdminDashboard.jsx
│   │   │   ├── 📄 DoctorDashboard.jsx
│   │   │   └── 📄 FrontdeskDashboard.jsx
│   │   ├── 📁 services/            # API services
│   │   │   ├── 📄 api.js           # Axios configuration
│   │   │   ├── 📄 config.js        # Environment configuration
│   │   │   └── 📄 *Service.js      # Service-specific APIs
│   │   ├── 📁 utils/               # Utility functions
│   │   ├── 📁 hooks/               # Custom React hooks
│   │   ├── 📁 context/             # React contexts
│   │   └── 📁 types/               # TypeScript types (if used)
│   ├── 📁 scripts/                 # Build and utility scripts
│   └── 📁 tests/                   # Frontend tests
│
├── 📁 deployment/                  # Deployment Scripts & Configuration
│   ├── 📁 scripts/                 # Deployment automation
│   │   ├── 📄 deploy-full-stack.sh # Complete system deployment
│   │   ├── 📄 deploy-frontend.sh   # Frontend-only deployment
│   │   └── 📄 deploy.py            # Python deployment script
│   └── 📁 config/                  # Environment configurations
│
├── 📁 docs/                        # Documentation
│   ├── 📄 README.md                # Documentation index
│   ├── 📄 DEPLOYMENT_GUIDE.md      # Complete deployment guide
│   ├── 📄 TECHNICAL_REFERENCE.md   # Technical documentation
│   ├── 📄 api-reference.md         # API documentation (planned)
│   ├── 📄 admin-guide.md           # Admin user guide (planned)
│   ├── 📄 doctor-guide.md          # Doctor user guide (planned)
│   └── 📄 frontdesk-guide.md       # Front desk guide (planned)
│
└── 📁 tests/                       # Integration & E2E Tests
    ├── 📁 integration/             # Integration tests
    ├── 📁 e2e/                     # End-to-end tests
    └── 📁 load/                    # Load testing scripts
```

## 🎯 **Key Components**

### **📱 Frontend Application**

- **Framework**: React 18+ with Material-UI
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: React Context + Custom hooks
- **Routing**: React Router v6 with protected routes
- **Authentication**: AWS Cognito integration
- **Styling**: Material-UI with custom theme

### **⚡ Backend Infrastructure**

- **Framework**: AWS SAM (Serverless Application Model)
- **Runtime**: Python 3.12 Lambda functions
- **API**: AWS API Gateway with CORS
- **Database**: Aurora Serverless v2 + DynamoDB
- **Authentication**: AWS Cognito User Pools
- **Storage**: S3 for documents and static hosting

### **🚀 Deployment System**

- **Infrastructure as Code**: AWS SAM templates
- **Automation**: Bash scripts for complete deployment
- **Multi-Environment**: Support for dev, test, prod
- **Frontend CDN**: CloudFront for global distribution
- **Monitoring**: CloudWatch integration

### **📚 Documentation**

- **User Guides**: Role-specific documentation
- **Technical Docs**: Architecture and API reference
- **Deployment Guides**: Step-by-step instructions
- **Troubleshooting**: Common issues and solutions

## 🔧 **Development Workflow**

### **Local Development**

```bash
# Frontend development
cd frontend
npm install
npm run dev          # Start Vite dev server

# Backend development
cd backend
sam build
sam local start-api  # Start local API Gateway
```

### **Testing**

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
python -m pytest tests/

# Integration tests
cd tests
./run-integration-tests.sh
```

### **Deployment**

```bash
# Complete system deployment
cd deployment/scripts
./deploy-full-stack.sh --environment dev

# Individual components
./deploy-frontend.sh --environment dev
```

## 📊 **File Organization Principles**

### **✅ Clean Architecture**

- **Separation of Concerns**: Frontend, backend, and infrastructure clearly separated
- **Modular Design**: Each component has its own directory structure
- **Reusable Components**: Shared utilities and components properly organized
- **Configuration Management**: Environment-specific configurations isolated

### **✅ Scalable Structure**

- **Feature-Based Organization**: Related functionality grouped together
- **Consistent Naming**: Clear, descriptive file and directory names
- **Documentation Co-location**: Documentation near relevant code
- **Test Organization**: Tests mirror source code structure

### **✅ Developer Experience**

- **Quick Navigation**: Logical directory structure
- **Clear Entry Points**: Main files clearly identified
- **Development Tools**: Scripts and configurations for common tasks
- **Comprehensive Documentation**: Everything needed to understand and contribute

## 🎯 **Getting Started**

### **For New Developers**

1. **Read**: [README.md](README.md) for project overview
2. **Setup**: Follow [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
3. **Explore**: Start with `frontend/src/main.jsx` and `backend/template.yaml`
4. **Develop**: Use the development workflow above

### **For System Administrators**

1. **Deploy**: Use `deployment/scripts/deploy-full-stack.sh`
2. **Monitor**: Check AWS CloudWatch for system health
3. **Configure**: Modify environment variables as needed
4. **Maintain**: Follow operational procedures in documentation

### **For End Users**

1. **Access**: Use the CloudFront URL provided after deployment
2. **Login**: Use AWS Cognito credentials
3. **Navigate**: Role-based interface (Admin, Doctor, Front Desk)
4. **Support**: Reference user guides in `docs/` directory

---

## 🎉 **Clean, Organized, Production-Ready**

This structure provides:

- ✅ **Clear Organization**: Easy to navigate and understand
- ✅ **Scalable Architecture**: Grows with your needs
- ✅ **Developer Friendly**: Quick onboarding and development
- ✅ **Production Ready**: Comprehensive deployment and monitoring
- ✅ **Well Documented**: Everything you need to succeed

**Your complete healthcare management system with clean, maintainable structure!** 🏥✨
