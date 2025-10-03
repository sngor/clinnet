# Clinnet-EMR Documentation

Welcome to the comprehensive documentation for Clinnet-EMR, a modern Electronic Medical Records system built with serverless architecture.

## 📚 Documentation Structure

| Document                                        | Purpose                                | Audience                      |
| ----------------------------------------------- | -------------------------------------- | ----------------------------- |
| **[Development Guide](./DEVELOPMENT_GUIDE.md)** | **Complete development documentation** | **All developers**            |
| [Project Refactoring](./PROJECT_REFACTORING.md) | Refactoring history and patterns       | Developers, Architects        |
| [Architecture](./architecture.md)               | System design and architecture         | Architects, Senior Developers |
| [Deployment](./deployment.md)                   | Deployment procedures                  | DevOps, Developers            |
| [Troubleshooting](./troubleshooting.md)         | Common issues and solutions            | All team members              |

## 🚀 Quick Navigation

### For New Developers

1. Start with the **[Development Guide](./DEVELOPMENT_GUIDE.md)** - your complete resource
2. Review [Architecture](./architecture.md) for system understanding
3. Follow [Local Development](./local-development.md) for setup

### For Existing Developers

1. Check [Project Refactoring](./PROJECT_REFACTORING.md) for recent changes
2. Use [Troubleshooting](./troubleshooting.md) for issue resolution
3. Reference [Deployment](./deployment.md) for deployment procedures

### For Architects & Leads

1. Review [Architecture](./architecture.md) for system design
2. Study [Project Refactoring](./PROJECT_REFACTORING.md) for code patterns
3. Check [Deployment](./deployment.md) for infrastructure details

## 🎯 Project Overview

Clinnet-EMR is a comprehensive Electronic Medical Records system featuring:

- **Modern Architecture**: Serverless AWS infrastructure with React frontend
- **Role-based Access**: Admin, Doctor, and Front Desk interfaces
- **Complete EMR Features**: Patient management, appointments, billing, reports
- **Scalable Design**: Built for healthcare providers of all sizes
- **Security First**: AWS Cognito authentication with proper access controls

## 🛠️ Tech Stack Summary

- **Frontend**: React 19, Material UI v7, Vite
- **Backend**: AWS Lambda (Python 3.12, Node.js 20.x)
- **Database**: DynamoDB with optimized GSI design
- **Storage**: S3 for documents and images
- **Authentication**: AWS Cognito with custom attributes
- **Infrastructure**: AWS SAM (Infrastructure as Code)

## 📖 Documentation Philosophy

This documentation follows these principles:

1. **Comprehensive Coverage** - All aspects covered in detail
2. **Single Source of Truth** - Avoid duplication across documents
3. **Practical Focus** - Emphasis on actionable information
4. **Maintainable Structure** - Easy to update and navigate
5. **Developer-Centric** - Written for the development team

## 🔄 Recent Improvements

The project has been refactored for better maintainability:

- **Standardized handler patterns** - Base classes eliminate code duplication
- **Consolidated deployment** - Single script replaces multiple tools
- **Enhanced utilities** - Centralized validation and database operations
- **Cleaner codebase** - Removed deprecated files and dead code

See [Project Refactoring](./PROJECT_REFACTORING.md) for technical details.

## 🤝 Contributing to Documentation

When updating documentation:

1. **Use the Development Guide** as the primary comprehensive resource
2. **Keep specialized docs focused** on their specific topics
3. **Cross-reference appropriately** to avoid duplication
4. **Update this index** when adding new documents
5. **Follow the established structure** and formatting

---

**Start here**: [Development Guide](./DEVELOPMENT_GUIDE.md) - Your complete resource for Clinnet-EMR development.
