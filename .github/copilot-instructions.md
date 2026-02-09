# Global Workspace Instructions

## General Code Quality Rules

- Write clean, readable, and maintainable code
- Follow the Single Responsibility Principle
- Use meaningful and descriptive variable/function names
- Add comments only when the code intent is not obvious
- Prefer composition over inheritance
- Keep functions small and focused (max 20-30 lines)
- Use early returns to reduce nesting depth

## Documentation

- Document complex algorithms and business logic
- Include JSDoc/TSDoc comments for public APIs
- Update README.md when adding new features
- Add inline comments for non-obvious code decisions

## Error Handling

- Always handle errors explicitly, never silently fail
- Provide meaningful error messages
- Log errors with context for debugging
- Use try-catch blocks for operations that may fail

## Performance

- Optimize for readability first, performance second
- Profile before optimizing
- Avoid premature optimization
- Consider memory usage in loops and large data operations

## Security

- Never commit sensitive data (API keys, passwords, tokens)
- Sanitize user inputs
- Validate data on both client and server
- Use environment variables for configuration

## Version Control

- Write clear, descriptive commit messages
- Keep commits atomic and focused
- Don't commit commented-out code
- Don't commit console.log statements in production code

## Testing

- Write tests for critical business logic
- Aim for meaningful test coverage, not just high percentages
- Use descriptive test names that explain the scenario
- Follow AAA pattern: Arrange, Act, Assert
