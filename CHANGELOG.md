# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Database integration (MongoDB/PostgreSQL)
- Password reset functionality
- Email verification for new users
- API documentation (Swagger/OpenAPI)
- Pagination for user lists
- File upload for profile pictures

## [1.0.0] - 2025-11-13

### Added

- **Authentication & Authorization**

  - User registration with email and password
  - User login with JWT token generation
  - JWT-based authentication with access tokens (1 hour expiry)
  - Refresh token mechanism (7 days expiry)
  - Secure logout functionality with token invalidation
  - Role-based access control (Admin, User, Moderator roles)

- **Security Features**

  - Bcrypt password hashing with configurable salt rounds (default: 10)
  - Password validation (minimum 8 characters, uppercase, lowercase, number)
  - Input validation and sanitization using express-validator
  - XSS protection through input sanitization
  - Rate limiting for API protection:
    - General API: 100 requests per 15 minutes
    - Authentication endpoints: 5 attempts per 15 minutes
    - Account creation: 3 accounts per hour
  - Secure error handling without exposing sensitive data
  - Environment variable protection (.env excluded from Git)

- **User profile management** (get/update)

### Security

- Implemented rate limiting (5 auth attempts per 15 minutes)
- Password validation (8+ chars, uppercase, lowercase, number)
- JWT token expiration (1 hour for access, 7 days for refresh)
- Input sanitization for XSS protection

### Changed

- Removed special character requirement from password validation

### Documentation

- Complete API documentation
- Security best practices guide
- Testing documentation
- Authentication flow diagrams
- Rate limiting implementation details

[Unreleased]: https://github.com/yourusername/express-user-management-api/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/express-user-management-api/releases/tag/v1.0.0
