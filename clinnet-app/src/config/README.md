# Configuration

This directory contains configuration files for the application.

## Files

- `aws-config.js` - AWS configuration for Amplify
- `constants.js` - Application constants
- `amplify-config.js` - Legacy Amplify configuration (deprecated)

## Usage

Import configuration from the config directory:

```jsx
import awsConfig from '@config/aws-config';
import { ROLES, STATUS_TYPES } from '@config/constants';
```

## Guidelines

- Keep configuration values centralized in this directory
- Use environment variables for sensitive or environment-specific values
- Document all exports with JSDoc comments
- Avoid hardcoding values in components or services