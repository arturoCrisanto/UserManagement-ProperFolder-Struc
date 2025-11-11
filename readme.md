# Express.js User Management API

A RESTful API built with Express.js for user management with JWT authentication, role-based authorization, and bcrypt password hashing.

## Features

- User registration and authentication
- JWT-based authentication
- Role-based access control (RBAC)
- Bcrypt password hashing
- Custom error handling
- Structured logging
- Standardized API responses

## Project Structure

```
.
├── .env                          # Environment variables
├── .gitignore                    # Git ignore file
├── package.json                  # Project dependencies
├── server.js                     # Application entry point
├── controllers/
│   └── userController.js         # User business logic
├── middlewares/
│   ├── authMiddleware.js         # JWT authentication middleware
│   └── roleMiddleware.js         # Role-based authorization middleware
├── models/
│   └── userModels.js             # User data models
├── routes/
│   └── userRoutes.js             # User route definitions
└── utils/
    ├── errorHandler.js           # Error handling utilities
    ├── logger.js                 # Logging configuration
    └── responseHandler.js        # Standardized response format
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd express2
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
SALT_ROUNDS=10
```

## Environment Variables

| Variable         | Description                    | Default |
| ---------------- | ------------------------------ | ------- |
| `PORT`           | Server port number             | 3000    |
| `JWT_SECRET`     | Secret key for JWT signing     | -       |
| `JWT_EXPIRES_IN` | JWT expiration time            | 7d      |
| `SALT_ROUNDS`    | Bcrypt salt rounds for hashing | 10      |

## API Endpoints

### Public Endpoints

#### Register User

```http
POST /api/users/
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "User"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "User"
    },
    "token": "jwt_token"
  }
}
```

#### Login User

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token"
  }
}
```

### Protected Endpoints (Admin Only)

#### Get All Users

```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <token>
```

## Default Test Users

All users have password: `password123`

| Email             | Role      |
| ----------------- | --------- |
| alice@example.com | Admin     |
| bob@example.com   | User      |
| diana@example.com | Moderator |
| fiona@example.com | Admin     |

## Authentication

This API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are returned upon successful registration or login.

## Middleware

### Authentication Middleware

`authenticateToken` - Verifies JWT tokens for protected routes

### Role Middleware

`authorizeRole` - Checks user roles for authorization

## Error Handling

The API uses a centralized error handling mechanism via `asyncHandler`. All errors are logged using the custom logger utility.

## Response Format

All API responses follow a standardized format:

**Success Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error message",
  "error": {}
}
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## Logging

The application uses a custom logger that provides different log levels:

- `info` - General information
- `debug` - Debug information
- `error` - Error messages

## Security Considerations

- All passwords are hashed using bcrypt with configurable salt rounds
- JWT secret should be a strong, random string
- Never commit `.env` file to version control
- Use HTTPS in production
- Implement rate limiting for production use
- Tokens expire after configured time period

## Future Enhancements

- [ ] Add database integration (MongoDB/PostgreSQL)
- [x] Implement password authentication
- [ ] Add refresh token mechanism
- [ ] Implement password reset functionality
- [ ] Add input validation middleware
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add unit and integration tests
- [ ] Implement rate limiting

## License

ISC

## Author

Mark Ruzell Maray

---

**Note:** This is a development project. Additional security measures should be implemented before deploying to production.
