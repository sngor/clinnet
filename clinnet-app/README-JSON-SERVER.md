# JSON Server for Clinnet

This project uses JSON Server to create a mock REST API for local development and testing. The database is defined in `db.json` and can be easily replaced with AWS DynamoDB or another database service in production.

## Getting Started

### Installation

JSON Server is already installed as a development dependency. You can see it in the `package.json` file.

### Starting the Server

To start the JSON Server, run:

```bash
npm run server
```

This will start the server at http://localhost:3001.

## Available Endpoints

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get a specific user
- `POST /users` - Create a new user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

### Patients

- `GET /patients` - Get all patients
- `GET /patients/:id` - Get a specific patient
- `POST /patients` - Create a new patient
- `PUT /patients/:id` - Update a patient
- `DELETE /patients/:id` - Delete a patient

### Appointments

- `GET /appointments` - Get all appointments
- `GET /appointments/:id` - Get a specific appointment
- `POST /appointments` - Create a new appointment
- `PUT /appointments/:id` - Update an appointment
- `PATCH /appointments/:id` - Partially update an appointment (e.g., status)
- `DELETE /appointments/:id` - Delete an appointment

### Medical Records

- `GET /medicalRecords` - Get all medical records
- `GET /medicalRecords/:id` - Get a specific medical record
- `POST /medicalRecords` - Create a new medical record
- `PUT /medicalRecords/:id` - Update a medical record
- `DELETE /medicalRecords/:id` - Delete a medical record

## Filtering

JSON Server supports filtering by query parameters:

```
GET /appointments?doctorId=2
GET /patients?lastName=Brown
GET /medicalRecords?patientId=101
```

## Pagination

JSON Server supports pagination:

```
GET /patients?_page=1&_limit=10
```

## Sorting

JSON Server supports sorting:

```
GET /appointments?_sort=date&_order=desc
```

## Full-text Search

JSON Server supports full-text search:

```
GET /patients?q=diabetes
```

## Relationships

You can include related resources:

```
GET /patients?_embed=appointments
GET /appointments?_expand=patient
```

## Custom Routes

If needed, you can define custom routes in a `routes.json` file.

## Migrating to AWS DynamoDB

When ready to migrate to AWS DynamoDB:

1. Create appropriate DynamoDB tables for users, patients, appointments, and medical records
2. Update the API services to use AWS SDK instead of axios with JSON Server
3. Implement proper authentication and authorization using AWS Cognito or another service
4. Ensure proper error handling and validation

For more information on JSON Server, visit: https://github.com/typicode/json-server