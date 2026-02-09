# Backend Service Development Instructions

## API Design

### RESTful Principles
- Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Use meaningful resource names (plural nouns)
- Return appropriate HTTP status codes
- Version your APIs (e.g., `/api/v1/users`)
- Use consistent response formats

### Request/Response
- Validate all inputs
- Sanitize user data
- Use DTOs (Data Transfer Objects) for API contracts
- Document all endpoints (OpenAPI/Swagger)
- Implement proper pagination for list endpoints

### Example Pattern
```typescript
interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    meta?: {
        page?: number;
        total?: number;
    };
}
```

## Database & Data Access

### Queries
- Use parameterized queries to prevent SQL injection
- Implement connection pooling
- Add indexes for frequently queried columns
- Use transactions for related operations
- Implement soft deletes instead of hard deletes

### ORM/Query Builders
- Define clear entity models
- Use migrations for schema changes
- Validate data before persisting
- Handle database errors gracefully

## Authentication & Authorization

- Use industry-standard auth (JWT, OAuth2)
- Hash passwords with bcrypt/argon2
- Implement rate limiting
- Use HTTPS in production
- Validate tokens on every protected route
- Implement role-based access control (RBAC)

## Error Handling

- Create custom error classes
- Log errors with context (user ID, request ID, etc.)
- Never expose internal errors to clients
- Implement global error handlers
- Use error codes for client-side handling

## Logging & Monitoring

- Use structured logging (JSON format)
- Log at appropriate levels (debug, info, warn, error)
- Include correlation IDs for request tracing
- Don't log sensitive data (passwords, tokens)
- Monitor performance metrics

## Business Logic

- Keep business logic in service layer
- Separate from HTTP handlers
- Use dependency injection
- Write unit tests for business logic
- Make functions pure when possible

## Configuration

- Use environment variables
- Never commit secrets
- Validate configuration on startup
- Use different configs for dev/staging/prod
- Document all configuration options

## Performance

- Implement caching strategies (Redis, in-memory)
- Use async/await for I/O operations
- Optimize database queries (avoid N+1)
- Implement request timeouts
- Profile and monitor performance

## Security

- Validate and sanitize all inputs
- Implement CORS properly
- Use security headers (helmet.js)
- Rate limit API endpoints
- Implement request size limits
- Keep dependencies updated

## Testing

- Write unit tests for business logic
- Write integration tests for APIs
- Mock external dependencies
- Test error scenarios
- Aim for 80%+ code coverage
