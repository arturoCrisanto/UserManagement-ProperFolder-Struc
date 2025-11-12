# API Documentation

Complete API reference for the Express.js User Management API.

## Base URL

```
http://localhost:3000/api/users
```

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Public Endpoints

These endpoints do not require authentication.

### 1. Register User

Create a new user account.

**Endpoint:** `POST /api/users/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "User"
}
```

**Validation Rules:**

- `name`: Required, 3-50 characters, letters and spaces only
- `email`: Required, valid email format
- `password`: Required, min 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%\*?&#)
- `role`: Optional, defaults to "User"

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "User"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

- **400 Bad Request** - Validation errors

```json
{
  "errors": [
    {
      "type": "field",
      "value": "test",
      "msg": "Password must be at least 8 characters",
      "path": "password",
      "location": "body"
    }
  ]
}
```

- **409 Conflict** - Email already exists

```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

### 2. Login User

Authenticate an existing user.

**Endpoint:** `POST /api/users/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

- **400 Bad Request** - Validation errors
- **401 Unauthorized** - Invalid credentials

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Refresh Access Token

Generate a new access token using a refresh token.

**Endpoint:** `POST /api/users/refresh`

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "email": "john@example.com",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

- **400 Bad Request** - Refresh token required
- **401 Unauthorized** - Invalid or expired refresh token

```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

---

## Protected Endpoints

These endpoints require authentication via JWT access token.

### 4. Get Current User Profile

Retrieve the profile of the currently authenticated user.

**Endpoint:** `GET /api/users/profile`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User"
  }
}
```

**Error Responses:**

- **401 Unauthorized** - No token provided

```json
{
  "success": false,
  "message": "No token provided"
}
```

- **403 Forbidden** - Invalid token

```json
{
  "success": false,
  "message": "Invalid token"
}
```

- **404 Not Found** - User not found

```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 5. Update Current User Profile

Update the profile of the currently authenticated user.

**Endpoint:** `PUT /api/users/profile`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Validation Rules:**

- `name`: Optional, 2-50 characters, letters and spaces only
- `email`: Optional, valid email format

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid-here",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "role": "User"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Validation errors

```json
{
  "errors": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Invalid email format",
      "path": "email",
      "location": "body"
    }
  ]
}
```

- **401 Unauthorized** - No token provided
- **403 Forbidden** - Invalid token
- **404 Not Found** - User not found
- **409 Conflict** - Email already exists

```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

### 6. Logout User

Logout the currently authenticated user by invalidating their refresh token.

**Endpoint:** `POST /api/users/logout`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

**Error Responses:**

- **400 Bad Request** - Refresh token required
- **401 Unauthorized** - Invalid refresh token or no access token

---

## Admin-Only Endpoints

These endpoints require authentication and Admin role.

### 7. Get All Users

Retrieve a list of all users (Admin only).

**Endpoint:** `GET /api/users/all`

**Headers:**

```
Authorization: Bearer <admin_access_token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "uuid-1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "User"
    },
    {
      "id": "uuid-2",
      "name": "Alice Admin",
      "email": "alice@example.com",
      "role": "Admin"
    }
  ]
}
```

**Error Responses:**

- **401 Unauthorized** - No token provided
- **403 Forbidden** - Insufficient permissions

```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

- **404 Not Found** - No users found

```json
{
  "success": false,
  "message": "No users found"
}
```

---

### 8. Get User by ID

Retrieve a specific user by their ID (Admin only).

**Endpoint:** `GET /api/users/:id`

**Headers:**

```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**

- `id` (string, required): User ID

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User"
  }
}
```

**Error Responses:**

- **401 Unauthorized** - No token provided
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - User not found

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## HTTP Status Codes

| Code | Meaning               | When Used                         |
| ---- | --------------------- | --------------------------------- |
| 200  | OK                    | Successful GET, PUT, POST (login) |
| 201  | Created               | Successful POST (registration)    |
| 400  | Bad Request           | Validation errors, missing fields |
| 401  | Unauthorized          | Missing/invalid authentication    |
| 403  | Forbidden             | Insufficient permissions          |
| 404  | Not Found             | Resource doesn't exist            |
| 409  | Conflict              | Duplicate resource (email exists) |
| 500  | Internal Server Error | Unexpected server errors          |

---

## Common Error Response Format

All error responses follow this structure:

**Validation Errors (400):**

```json
{
  "errors": [
    {
      "type": "field",
      "value": "provided-value",
      "msg": "Error message",
      "path": "field-name",
      "location": "body"
    }
  ]
}
```

**Application Errors (401, 403, 404, 409, 500):**

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Testing the API

### Using cURL

**Register:**

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123",
    "role": "User"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

**Get Profile:**

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update Profile:**

```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'
```

---

## Default Test Users

For testing purposes, these users exist by default:

| Email             | Password    | Role      |
| ----------------- | ----------- | --------- |
| alice@example.com | password123 | Admin     |
| bob@example.com   | password123 | User      |
| diana@example.com | password123 | Moderator |
| fiona@example.com | password123 | Admin     |

**⚠️ Warning:** Remove or change passwords for default users in production!
