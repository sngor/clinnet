# Core Module

This directory contains core application functionality that is used throughout the application.

## Structure

- `providers/` - React context providers for global state and functionality
- `theme/` - Theme configuration and components
- `utils/` - Utility functions used across the application

## Usage

The core module should be imported using the `@core` alias:

```jsx
import { ThemeProvider } from '@core/providers/ThemeProvider';
import { getEnvVar } from '@core/utils/environment';
import theme from '@core/theme/theme';
```

## Guidelines

- Code in this directory should be application-agnostic and reusable
- Avoid dependencies on specific features or business logic
- Keep components small and focused on a single responsibility
- Document all exports with JSDoc comments