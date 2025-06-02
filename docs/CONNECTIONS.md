# Backend API Connections and Data Flow

This document outlines the connections between the frontend services, the backend API Gateway endpoints, the corresponding AWS Lambda functions, and the AWS services they access.

## API Gateway Endpoint to Lambda Mappings

This section details API calls made from the frontend to AWS API Gateway, which then trigger Lambda functions.

### User Management (`/users`)

| Frontend Service Module             | Function/Action Triggering Call | HTTP Method | API Path                  | Backend Lambda Resource (template.yaml) | AWS Services Accessed by Lambda                                                                  | Data Flow & Notes                                                                                                                                                             |
| :---------------------------------- | :------------------------------ | :---------- | :------------------------ | :-------------------------------------- | :----------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api-amplify.js`, `adminService.js` | `users.getAll`, `listUsers`     | GET         | `/users`                  | `ListUsersFunction`                     | Cognito (`cognito-idp:ListUsers` on `UserPool`)                                                  | Fetches a list of users from Cognito. `adminService` handles pagination.                                                                                                      |
| `api-amplify.js`, `adminService.js` | `users.getById`                 | GET         | `/users/{userId}`         | `UpdateUserFunction` (Tentative)        | Cognito (`cognito-idp:AdminGetUser`), DynamoDB (`UsersTable`)                                    | Fetches a specific user. Path `GET /users/{id}` not explicitly in `template.yaml`. `UpdateUserFunction` (for PUT) has `AdminGetUser` permission. `userId` is typically email. |
| `api-amplify.js`, `adminService.js` | `users.create`, `createUser`    | POST        | `/users`                  | `CreateUserFunction`                    | Cognito (`cognito-idp:AdminCreateUser`, etc.), DynamoDB (`UsersTable`)                           | Creates a new user in Cognito and potentially stores metadata in `UsersTable`.                                                                                                |
| `api-amplify.js`, `adminService.js` | `users.update`, `updateUser`    | PUT         | `/users/{userId}`         | `UpdateUserFunction`                    | Cognito (`cognito-idp:AdminUpdateUserAttributes`, etc.), DynamoDB (`UsersTable`)                 | Updates user attributes in Cognito and metadata in `UsersTable`. `userId` is typically email.                                                                                 |
| `api-amplify.js`, `adminService.js` | `users.delete`, `deleteUser`    | DELETE      | `/users/{userId}`         | `DeleteUserFunction`                    | Cognito (`cognito-idp:AdminDeleteUser`), DynamoDB (`UsersTable`)                                 | Deletes a user from Cognito and `UsersTable`. `userId` is typically email.                                                                                                    |
| `adminService.js`                   | `enableUser`                    | POST        | `/users/{userId}/enable`  | `EnableUserFunction`                    | Cognito (`cognito-idp:AdminEnableUser`), DynamoDB (`UsersTable`)                                 | Enables a user in Cognito. Updates status in `UsersTable`. `userId` is typically email.                                                                                       |
| `adminService.js`                   | `disableUser`                   | POST        | `/users/{userId}/disable` | `DisableUserFunction`                   | Cognito (`cognito-idp:AdminDisableUser`), DynamoDB (`UsersTable`)                                | Disables a user in Cognito. Updates status in `UsersTable`. `userId` is typically email.                                                                                      |
| `userService.js`                    | `uploadProfileImage`            | POST        | `/users/profile-image`    | `UploadProfileImageFunction`            | Cognito (`AdminUpdateUserAttributes`, `AdminGetUser`), S3 (`DocumentsBucket`/`profile-images/*`) | Uploads user profile image to S3, updates Cognito user attribute with image URL.                                                                                              |
| `userService.js`                    | `getProfileImage`               | GET         | `/users/profile-image`    | `GetProfileImageFunction`               | Cognito (`AdminGetUser`), S3 (`DocumentsBucket`/`profile-images/*`)                              | Retrieves user profile image URL, potentially a pre-signed URL from S3.                                                                                                       |
| `userService.js`                    | `removeProfileImage`            | DELETE      | `/users/profile-image`    | `RemoveProfileImageFunction`            | Cognito (`AdminUpdateUserAttributes`, `AdminGetUser`), S3 (`DocumentsBucket`/`profile-images/*`) | Removes user profile image from S3 and clears Cognito attribute.                                                                                                              |

### Patient Management (`/patients`)

| Frontend Service Module               | Function/Action Triggering Call      | HTTP Method | API Path                | Backend Lambda Resource (template.yaml) | AWS Services Accessed by Lambda                                       | Data Flow & Notes                                                                           |
| :------------------------------------ | :----------------------------------- | :---------- | :---------------------- | :-------------------------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `api-amplify.js`, `patientService.js` | `patients.getAll`, `getPatients`     | GET         | `/patients`             | `GetPatientsFunction`                   | DynamoDB (`PatientRecordsTable`)                                      | Fetches list of all patients.                                                               |
| `api-amplify.js`, `patientService.js` | `patients.getById`, `getPatientById` | GET         | `/patients/{patientId}` | `GetPatientByIdFunction`                | DynamoDB (`PatientRecordsTable`)                                      | Fetches a specific patient by ID.                                                           |
| `api-amplify.js`, `patientService.js` | `patients.create`, `createPatient`   | POST        | `/patients`             | `CreatePatientFunction`                 | DynamoDB (`PatientRecordsTable`)                                      | Creates a new patient record. `patientService` includes data transformation before sending. |
| `api-amplify.js`, `patientService.js` | `patients.update`, `updatePatient`   | PUT         | `/patients/{patientId}` | `UpdatePatientFunction`                 | DynamoDB (`PatientRecordsTable`), S3 (`DocumentsBucket`/`patients/*`) | Updates an existing patient record. May include profile image upload to S3.                 |
| `api-amplify.js`, `patientService.js` | `patients.delete`, `deletePatient`   | DELETE      | `/patients/{patientId}` | `DeletePatientFunction`                 | DynamoDB (`PatientRecordsTable`)                                      | Deletes a patient record.                                                                   |

### Service Management (`/services`)

| Frontend Service Module           | Function/Action Triggering Call      | HTTP Method | API Path         | Backend Lambda Resource (template.yaml) | AWS Services Accessed by Lambda | Data Flow & Notes                                                                 |
| :-------------------------------- | :----------------------------------- | :---------- | :--------------- | :-------------------------------------- | :------------------------------ | :-------------------------------------------------------------------------------- |
| `api-amplify.js`, `serviceApi.js` | `services.getAll`, `getAllServices`  | GET         | `/services`      | `GetServicesFunction`                   | DynamoDB (`ServicesTable`)      | Fetches list of all services. `serviceApi` can handle query params for filtering. |
| `api-amplify.js`, `serviceApi.js` | `services.getById`, `getServiceById` | GET         | `/services/{id}` | `GetServiceByIdFunction`                | DynamoDB (`ServicesTable`)      | Fetches a specific service by ID.                                                 |
| `api-amplify.js`, `serviceApi.js` | `services.create`, `createService`   | POST        | `/services`      | `CreateServiceFunction`                 | DynamoDB (`ServicesTable`)      | Creates a new service. `serviceApi` includes data sanitization.                   |
| `api-amplify.js`, `serviceApi.js` | `services.update`, `updateService`   | PUT         | `/services/{id}` | `UpdateServiceFunction`                 | DynamoDB (`ServicesTable`)      | Updates an existing service. `serviceApi` includes data sanitization.             |
| `api-amplify.js`, `serviceApi.js` | `services.delete`, `deleteService`   | DELETE      | `/services/{id}` | `DeleteServiceFunction`                 | DynamoDB (`ServicesTable`)      | Deletes a service.                                                                |

### Appointment Management (`/appointments`)

| Frontend Service Module | Function/Action Triggering Call           | HTTP Method | API Path                        | Backend Lambda Resource (template.yaml) | AWS Services Accessed by Lambda | Data Flow & Notes                                                                                                 |
| :---------------------- | :---------------------------------------- | :---------- | :------------------------------ | :-------------------------------------- | :------------------------------ | :---------------------------------------------------------------------------------------------------------------- |
| `appointmentService.js` | `getAppointments` (and by doctor/patient) | GET         | `/appointments`                 | `GetAppointmentsFunction`               | DynamoDB (`AppointmentsTable`)  | Fetches appointments. Can include `doctorId` or `patientId` as query params for filtering by the Lambda.          |
| `appointmentService.js` | `getAppointmentById`                      | GET         | `/appointments/{appointmentId}` | `GetAppointmentByIdFunction`            | DynamoDB (`AppointmentsTable`)  | Fetches a specific appointment by ID.                                                                             |
| `appointmentService.js` | `createAppointment`                       | POST        | `/appointments`                 | `CreateAppointmentFunction`             | DynamoDB (`AppointmentsTable`)  | Creates a new appointment.                                                                                        |
| `appointmentService.js` | `updateAppointment`                       | PUT         | `/appointments/{appointmentId}` | `UpdateAppointmentFunction`             | DynamoDB (`AppointmentsTable`)  | Updates an existing appointment.                                                                                  |
| `appointmentService.js` | `deleteAppointment`                       | DELETE      | `/appointments/{appointmentId}` | `DeleteAppointmentFunction`             | DynamoDB (`AppointmentsTable`)  | Deletes an appointment.                                                                                           |
| `appointmentService.js` | `updateAppointmentStatus`                 | PATCH       | `/appointments/{appointmentId}` | `UpdateAppointmentFunction` (Intended)  | DynamoDB (`AppointmentsTable`)  | Updates status of an appointment. `template.yaml` defines PUT for this Lambda, not PATCH. Lambda needs to handle. |

### Medical Reports & AI (`/reports`, `/ai`)

| Frontend Service Module   | Function/Action Triggering Call  | HTTP Method | API Path                           | Backend Lambda Resource (template.yaml) | AWS Services Accessed by Lambda                                                                              | Data Flow & Notes                                                                                                                   |
| :------------------------ | :------------------------------- | :---------- | :--------------------------------- | :-------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `adminService.js`         | `getReportData`                  | GET         | `/reports` (with type/range query) | `GetAggregatedReportsFunction`          | DynamoDB (`AppointmentsTable`, `PatientRecordsTable`, `ServicesTable`, `UsersTable`), S3 (`DocumentsBucket`) | Fetches aggregated report data for admin reporting.                                                                                 |
| `medicalRecordService.js` | `getMedicalRecords` (by patient) | GET         | `/reports/patient/{patientId}`     | `MedicalReportsFunction`                | DynamoDB (`MedicalReportsTable`), S3 (`MedicalReportImagesBucket`)                                           | Fetches medical reports for a specific patient.                                                                                     |
| `medicalRecordService.js` | `getMedicalRecords` (by doctor)  | GET         | `/reports/doctor/{doctorId}`       | `MedicalReportsFunction`                | DynamoDB (`MedicalReportsTable`), S3 (`MedicalReportImagesBucket`)                                           | Fetches medical reports for a specific doctor.                                                                                      |
| `medicalRecordService.js` | `getMedicalRecords` (general)    | GET         | `/reports`                         | `GetAggregatedReportsFunction`          | DynamoDB (various tables), S3 (`DocumentsBucket`)                                                            | Call to `/reports` without ID maps to `GetAggregatedReportsFunction`. If FE expects list of individual reports, this is a mismatch. |
| `medicalRecordService.js` | `getMedicalRecordById`           | GET         | `/reports/{recordId}`              | `MedicalReportsFunction`                | DynamoDB (`MedicalReportsTable`), S3 (`MedicalReportImagesBucket`)                                           | Fetches a specific medical report by its ID.                                                                                        |
| `medicalRecordService.js` | `createMedicalRecord`            | POST        | `/reports`                         | `MedicalReportsFunction`                | DynamoDB (`MedicalReportsTable`), S3 (`MedicalReportImagesBucket`)                                           | Creates a new medical report.                                                                                                       |
| `medicalRecordService.js` | `updateMedicalRecord`            | PUT         | `/reports/{recordId}`              | `MedicalReportsFunction`                | DynamoDB (`MedicalReportsTable`), S3 (`MedicalReportImagesBucket`)                                           | Updates an existing medical report.                                                                                                 |
| `medicalRecordService.js` | `deleteMedicalRecord`            | DELETE      | `/reports/{recordId}`              | `MedicalReportsFunction`                | DynamoDB (`MedicalReportsTable`), S3 (`MedicalReportImagesBucket`)                                           | Deletes a medical report.                                                                                                           |
| `medicalRecordService.js` | `uploadImageToRecord`            | POST        | `/reports/{recordId}/images`       | `MedicalReportsFunction`                | DynamoDB (`MedicalReportsTable`), S3 (`MedicalReportImagesBucket`)                                           | Uploads an image associated with a medical report to S3.                                                                            |
| `medicalRecordService.js` | `summarizeDoctorNotes`           | POST        | `/ai/summarize-note`               | `SummarizeDoctorNoteFunction`           | Amazon Bedrock (`bedrock:InvokeModel`)                                                                       | Sends doctor's notes to Bedrock for summarization.                                                                                  |

### Diagnostics (`/diagnostics`)

| Frontend Service Module | Function/Action Triggering Call | HTTP Method | API Path                          | Backend Lambda Resource (template.yaml) | AWS Services Accessed by Lambda                                             | Data Flow & Notes                                  |
| :---------------------- | :------------------------------ | :---------- | :-------------------------------- | :-------------------------------------- | :-------------------------------------------------------------------------- | :------------------------------------------------- |
| `adminService.js`       | `checkS3Connectivity`           | GET         | `/diagnostics/s3`                 | `CheckS3ConnectivityFunction`           | S3 (`s3:ListAllMyBuckets`)                                                  | Checks basic S3 connectivity.                      |
| `adminService.js`       | `checkDynamoDBCrud`             | GET         | `/diagnostics/crud/{serviceName}` | `CheckDynamoDBCrudFunction`             | DynamoDB (`PatientRecordsTable`, `ServicesTable`, `AppointmentsTable`)      | Performs CRUD checks on specified DynamoDB tables. |
| `adminService.js`       | `checkCognitoUsersCrud`         | GET         | `/diagnostics/cognito-users`      | `CheckCognitoUserCrudFunction`          | Cognito (`cognito-idp:AdminCreateUser`, `AdminGetUser`, etc. on `UserPool`) | Performs CRUD checks on Cognito User Pool.         |

## Direct Cognito Interactions

These frontend operations interact directly with AWS Cognito using the AWS SDK (e.g., Amplify JS SDK or `amazon-cognito-identity-js`) and do not go through API Gateway. The primary AWS service involved is **AWS Cognito User Pools** (resource `UserPool` in `template.yaml`).

| Frontend Service Module | Function/Action     | Cognito Operations (Examples)                            | Notes                                                         |
| :---------------------- | :------------------ | :------------------------------------------------------- | :------------------------------------------------------------ |
| `api-amplify.js` (auth) | `signIn`            | `signIn` (Amplify Auth)                                  | User authentication.                                          |
| `api-amplify.js` (auth) | `signOut`           | `signOut` (Amplify Auth)                                 | User sign-out.                                                |
| `api-amplify.js` (auth) | `getCurrentUser`    | `getCurrentUser` (Amplify Auth)                          | Get current authenticated user details.                       |
| `api-amplify.js` (auth) | `getCurrentSession` | `fetchAuthSession` (Amplify Auth)                        | Get current user session.                                     |
| `authService.js`        | `signIn`            | `cognitoSignIn` (via `cognito-helpers`)                  | User authentication, stores token in localStorage.            |
| `authService.js`        | `signOut`           | `cognitoSignOut` (via `cognito-helpers`)                 | User sign-out, clears token from localStorage.                |
| `authService.js`        | `isAuthenticated`   | `getCognitoSession` (via `cognito-helpers`)              | Checks if user session is valid.                              |
| `userService.js`        | `updateUserProfile` | `user.updateAttributes()` (`amazon-cognito-identity-js`) | Updates user attributes like name, phone directly in Cognito. |
| `userService.js`        | `changePassword`    | `user.changePassword()` (`amazon-cognito-identity-js`)   | Allows authenticated user to change their password.           |
| `userService.js`        | `getUserAttributes` | `getCognitoUserAttributes` (via `cognito-helpers`)       | Fetches attributes for the current user.                      |
| `userService.js`        | `getUserInfo`       | `getCognitoUserInfo` (via `cognito-helpers`)             | Fetches and parses user info.                                 |

## Discrepancies and Notes

This section lists potential mismatches, unmapped endpoints, or areas needing clarification based on the analysis.

1.  **`GET /users/{userId}`:**

    - **Called by:** `api-amplify.js` (`users.getById`), `adminService.js` (`updateUser`, `deleteUser` use it in URL construction).
    - **Issue:** This specific path with the `GET` method is not explicitly defined as an event for any Lambda in `backend/template.yaml`.
    - **Tentative Mapping:** Mapped to `UpdateUserFunction` because it handles `PUT /users/{userId}` and has `cognito-idp:AdminGetUser` permission and access to `UsersTable`, making it capable of fetching user data. This assumes the Lambda or API Gateway is configured to route GET to it, or the frontend expects user data as part of an update response.

2.  **`PUT /users/{userId}/status`:**

    - **Called by:** `adminService.js` (`toggleUserStatus`).
    - **Issue:** This exact path and `PUT` method is not defined in `backend/template.yaml`.
    - **Current Backend:** `EnableUserFunction` uses `POST /users/{userId}/enable` and `DisableUserFunction` uses `POST /users/{userId}/disable`.
    - **Note:** This frontend call might be for a planned or unimplemented backend feature, or there's a misconfiguration. Marked as "Unmapped".

3.  **`PATCH /appointments/{appointmentId}` for Status Update:**

    - **Called by:** `appointmentService.js` (`updateAppointmentStatus`).
    - **Issue:** `backend/template.yaml` defines `UpdateAppointmentFunction` to handle `PUT /appointments/{id}`. There is no explicit `PATCH` method defined for this path.
    - **Note:** The existing `UpdateAppointmentFunction` (handling PUT) is the likely target. The Lambda code would need to be ableto correctly process partial updates if it receives a PATCH request, or API Gateway might be configured to pass PATCH as PUT. Assumed it's intended for `UpdateAppointmentFunction`.

4.  **General `GET /reports` Call by `medicalRecordService.js`:**

    - **Called by:** `medicalRecordService.js` (`getMedicalRecords` when no specific `idType` or `id` is provided).
    - **Issue:** This call results in `GET /reports`. In `backend/template.yaml`, `GET /reports` is mapped to `GetAggregatedReportsFunction`, which is designed for admin reporting and returns aggregated data.
    - **Potential Mismatch:** If the frontend's `getMedicalRecords` function, when called without parameters, expects a list of all _individual_ medical reports, it will instead receive aggregated data. This could be an intended behavior for a summary view or a mismatch in expectations.

5.  **User ID Parameter (`{userId}` vs. `{id}`):**
    - Frontend paths often use `{userId}` (e.g., in `api-amplify.js` for users) or a dynamic variable like `{patientId}`.
    - Backend `template.yaml` sometimes uses a generic `{id}` (e.g., `/patients/{id}`, `/services/{id}`, `/appointments/{id}`) or specific names like `{userId}` for user functions.
    - **Note:** This is generally not an issue as the parameter name in the path definition is a placeholder. The important part is the path structure and the Lambda's ability to extract the value. The frontend services often use specific variable names (like `cognitoUsername` which is an email for user operations) as the actual path parameter value.

## Potential Issues and Areas for Improvement

Based on the documented connections and discrepancies, the following issues and improvement areas are identified:

1.  **Missing Explicit `GET /users/{userId}` Endpoint:**

    - **Issue:** The common REST pattern of fetching a single user by ID (`GET /users/{userId}`) is not explicitly defined in `backend/template.yaml`. It's tentatively mapped to `UpdateUserFunction`, which is not ideal or clear.
    - **Suggestion:** Define a new, dedicated Lambda function (e.g., `GetUserByIdFunction`) in `backend/template.yaml` for the `GET /users/{userId}` path. This function should have appropriate read-only permissions (e.g., `DynamoDBReadPolicy` on `UsersTable` and/or Cognito's `AdminGetUser`). This improves API clarity and adheres to REST principles.

2.  **Mismatched User Status Update Mechanism (`PUT /users/{userId}/status`):**

    - **Issue:** `adminService.js` calls `PUT /users/{userId}/status`, but the backend has `POST /users/{userId}/enable` and `POST /users/{userId}/disable`.
    - **Suggestion (Option A - Align Frontend):** Modify `adminService.js`'s `toggleUserStatus` function to call the existing `POST .../enable` or `POST .../disable` endpoints based on the desired status. This is a minimal-change approach.
    - **Suggestion (Option B - Align Backend & RESTful Design):** Update the backend to support `PUT /users/{userId}/status` with a request body like `{"enabled": true/false}`. This could involve refactoring or replacing `EnableUserFunction` and `DisableUserFunction`. This approach is more RESTful for updating a resource attribute.

3.  **Unsupported `PATCH` Method for Appointment Status:**

    - **Issue:** `appointmentService.js` uses `PATCH /appointments/{appointmentId}` for partial updates (status), but `template.yaml` only defines `PUT` for `UpdateAppointmentFunction`.
    - **Suggestion:**
      - **Backend:** Add `PATCH` as an accepted method for the `/appointments/{id}` path in `template.yaml`, routing to `UpdateAppointmentFunction`.
      - **Lambda:** Ensure the `UpdateAppointmentFunction`'s code can correctly handle partial updates when invoked by `PATCH` (i.e., only modifies the fields present in the request, such as `status`).

4.  **Ambiguous `GET /reports` Endpoint:**

    - **Issue:** `medicalRecordService.js` calling `GET /reports` (no specific ID) is routed to `GetAggregatedReportsFunction`, which provides summary data. If the frontend expects a list of all individual medical reports, this will lead to incorrect data presentation.
    - **Suggestion:**
      - **Clarify Intent:** Determine if fetching _all individual_ medical reports is a required feature.
      - **New Endpoint (if needed):** If so, create a new, distinct backend endpoint (e.g., `GET /reports/list-all` or `GET /reports/detailed`) handled by `MedicalReportsFunction` (or a new Lambda) that returns a list of full report objects. This avoids ambiguity with the existing aggregated reports endpoint.
      - **Documentation:** Update frontend comments to clarify the type of data returned by the general `GET /reports` endpoint.

5.  **Inefficient Client-Side Filtering (`getTodaysAppointments`):**

    - **Issue:** `appointmentService.js`'s `getTodaysAppointments` function fetches all appointments and then filters them on the client-side to find today's appointments. This is inefficient for large datasets.
    - **Suggestion:** Enhance `GetAppointmentsFunction` in the backend to accept date-based query parameters (e.g., `?date=YYYY-MM-DD` or `?startDateTime=...&endDateTime=...`). This allows the server to perform efficient, indexed queries and return only the necessary data, reducing payload size and client-side processing.

6.  **API Design Consistency (User ID Parameters & Enable/Disable):**

    - **Issue (Minor):** Inconsistent path parameter naming in `template.yaml` (e.g., `{id}` vs. more specific like `{userId}`). Also, user enable/disable actions are `POST` to sub-resources (`/enable`, `/disable`) rather than `PUT` to a status attribute.
    - **Suggestion (Low Priority):** For long-term maintainability, consider standardizing path parameter names in `template.yaml` for clarity (e.g., use `{userId}`, `{patientId}`). For user status changes, consider the RESTful `PUT /users/{userId}/status` approach as mentioned in point #2.

7.  **Security Review for Public Endpoints:**
    - **Issue:** `GetServicesFunction` and `GetServiceByIdFunction` are public (`Auth: Authorizer: NONE`).
    - **Suggestion:** Review the data returned by these service-related endpoints. If any data could be considered sensitive or internal, apply Cognito authorization. If they are genuinely public (e.g., listing medical services offered to the public), the current setup is acceptable.

These points provide a good basis for future refactoring and improvement of the API.
