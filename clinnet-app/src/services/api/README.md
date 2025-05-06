# API Services

This directory contains API service implementations for communicating with the backend.

## Structure

- `index.js` - Exports the appropriate API implementation based on the environment
- `api-amplify.js` - AWS Amplify implementation of the API service
- `api-axios.js` - Fetch/Axios implementation of the API service

## Usage

Import the API service from the services index:

```jsx
import { api } from '@services';

// Example usage
const fetchUsers = async () => {
  try {
    const users = await api.users.getAll();
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
```

## API Structure

Each API implementation provides the following endpoints:

### Users

- `getAll()` - Get all users
- `getById(id)` - Get a user by ID
- `create(data)` - Create a new user
- `update(id, data)` - Update a user
- `delete(id)` - Delete a user

### Patients

- `getAll()` - Get all patients
- `getById(id)` - Get a patient by ID
- `create(data)` - Create a new patient
- `update(id, data)` - Update a patient
- `delete(id)` - Delete a patient

### Services

- `getAll()` - Get all services
- `getById(id)` - Get a service by ID
- `create(data)` - Create a new service
- `update(id, data)` - Update a service
- `delete(id)` - Delete a service

### Authentication

- `signIn(username, password)` - Sign in a user
- `signOut()` - Sign out the current user
- `getCurrentUser()` - Get the current authenticated user
- `getCurrentSession()` - Get the current authentication session