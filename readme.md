# Express.js User Management API

A RESTful API built with Express.js for user management with JWT authentication and role-based authorization.

## Features

- User CRUD operations
- JWT-based authentication
- Role-based access control (RBAC)
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
    ├── jwt.js                    # JWT token utilities
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
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

## Environment Variables

| Variable         | Description                          | Default     |
| ---------------- | ------------------------------------ | ----------- |
| `PORT`           | Server port number                   | 3000        |
| `NODE_ENV`       | Environment (development/production) | development |
| `JWT_SECRET`     | Secret key for JWT signing           | -           |
| `JWT_EXPIRES_IN` | JWT expiration time                  | 7d          |

## API Endpoints

### Public Endpoints

#### Create User

```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Admin"
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
      "role": "Admin"
    },
    "token": "jwt_token"
  }
}
```

### Protected Endpoints (Admin Only)

#### Get All Users

```http
GET /users/profile
Authorization: Bearer <token>
```

#### Get User by ID

```http
GET /users/:id
Authorization: Bearer <token>
```

## Authentication

This API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is returned when creating a new user via [`createUser`](controllers/userController.js) in [controllers/userController.js](controllers/userController.js).

## Middleware

### Authentication Middleware

[`authenticateToken`](middlewares/authMiddleware.js) - Verifies JWT tokens for protected routes

### Role Middleware

[`authorizeRole`](middlewares/roleMiddleware.js) - Checks user roles for authorization

## Error Handling

The API uses a centralized error handling mechanism via [`asyncHandler`](utils/errorHandler.js) in [utils/errorHandler.js](utils/errorHandler.js). All errors are logged using the [`logger`](utils/logger.js) utility from [utils/logger.js](utils/logger.js).

## Response Format

All API responses follow a standardized format using [`sendSuccessResponse`](utils/responseHandler.js) and [`sendErrorResponse`](utils/responseHandler.js) from [utils/responseHandler.js](utils/responseHandler.js):

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

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in [.env](.env)).

## Logging

The application uses a custom logger ([utils/logger.js](utils/logger.js)) that provides different log levels:

- `info` - General information
- `debug` - Debug information
- `error` - Error messages

## Security Considerations

- JWT secret should be a strong, random string
- Never commit [.env](.env) file to version control (already listed in [.gitignore](.gitignore))
- Use HTTPS in production
- Implement rate limiting for production use
- Add password hashing for user passwords

## Future Enhancements

- [/] Add database integration (MongoDB/PostgreSQL)
- [ ] Implement password authentication
- [ ] Add refresh token mechanism
- [ ] Implement password reset functionality
- [ ] Add input validation middleware
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add unit and integration tests
- [ ] Implement rate limiting

## License

ISC

## Author

MarK Ruzell Maray

---

**Note:** This is a development project. Additional security measures should be implemented before deploying to production.
