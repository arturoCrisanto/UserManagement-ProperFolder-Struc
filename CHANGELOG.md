# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Version control documentation

## [1.0.0] - 2025-11-13

### Added

- User registration and authentication
- JWT-based authentication with access and refresh tokens
- Role-based access control (RBAC)
- Bcrypt password hashing
- Token refresh mechanism
- Secure logout functionality
- User profile management (get/update)
- Input validation and sanitization
- Custom error handling
- Structured logging
- Standardized API responses
- Rate limiting for API protection
- Comprehensive test coverage (23 tests)

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
