# TypeScript Web Development Instructions

## TypeScript Style & Best Practices

- Always use explicit types, avoid `any` unless absolutely necessary
- Use interfaces for object shapes, types for unions/primitives
- Enable strict mode in tsconfig.json
- Use type guards for runtime type checking
- Prefer `const` over `let`, never use `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Define return types for all functions
- Use generics for reusable type-safe functions

## UI Components & DOM Manipulation

### Structure
- Organize UI code into logical, reusable functions
- Separate rendering logic from business logic
- Use semantic HTML elements
- Keep DOM queries minimal, cache element references

### Type Safety
- Always use type guards when working with DOM elements
- Define interfaces for component props/options
- Type event handlers explicitly (e.g., `(event: MouseEvent) => void`)

### Accessibility
- Use ARIA labels where appropriate
- Ensure keyboard navigation works
- Provide focus management
- Use semantic HTML for better screen reader support

### Example Pattern
```typescript
interface ComponentOptions {
    element: HTMLElement;
    onUpdate?: (data: any) => void;
}

function createComponent(options: ComponentOptions): void {
    const { element, onUpdate } = options;
    // Component logic here
}
```

## Network Layer & API Calls

### HTTP Requests
- Use `async/await` for all asynchronous operations
- Always handle both success and error cases
- Implement proper error handling with try-catch
- Add request timeouts where appropriate
- Use AbortController for cancellable requests

### API Response Handling
- Define TypeScript interfaces for all API responses
- Validate API responses before using them
- Don't trust external data, always validate
- Transform API data into domain models

### Example Pattern
```typescript
interface APIResponse<T> {
    data: T;
    status: number;
    message?: string;
}

async function fetchData<T>(url: string): Promise<T> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: APIResponse<T> = await response.json();
        return data.data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}
```

### CORS & Proxies
- Document CORS proxy usage with comments
- Have fallback strategies for API failures
- Cache API responses when appropriate
- Implement retry logic for transient failures

## Business Logic

### Organization
- Keep business logic separate from UI code
- Create pure functions where possible (no side effects)
- Use functional programming patterns (map, filter, reduce)
- Validate inputs at function boundaries

### Data Processing
- Transform data in pipeline stages
- Use Array methods over traditional loops
- Keep transformations immutable
- Type all intermediate data structures

### Example Pattern
```typescript
interface UserData {
    id: number;
    name: string;
    score: number;
}

function processUserData(users: UserData[]): UserData[] {
    return users
        .filter(user => user.score > 0)
        .map(user => ({ ...user, name: user.name.trim() }))
        .sort((a, b) => b.score - a.score);
}
```

## Data Models & Interfaces

### Structure
- Define interfaces for all data structures
- Use readonly properties for immutable data
- Group related types in the same file
- Use discriminated unions for variant types

### Naming Conventions
- Use PascalCase for interfaces and types
- Prefix interfaces with 'I' only if it adds clarity
- Use descriptive names that reflect the domain

### Example Pattern
```typescript
// Core data models
interface User {
    readonly id: number;
    name: string;
    email: string;
    createdAt: Date;
}

// Form data (subset of User)
interface UserFormData {
    name: string;
    email: string;
}

// API response shape
interface UserResponse {
    user: User;
    token: string;
}

// Discriminated union for state
type LoadingState = 
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: User[] }
    | { status: 'error'; error: Error };
```

## Event Handling

- Remove event listeners when they're no longer needed
- Use event delegation for dynamic content
- Type event handlers explicitly
- Debounce/throttle expensive event handlers
- Prevent memory leaks by cleaning up listeners

### Example Pattern
```typescript
function setupEventListeners(): () => void {
    const button = document.getElementById('myButton');
    
    const handleClick = (event: MouseEvent): void => {
        event.preventDefault();
        // Handler logic
    };
    
    button?.addEventListener('click', handleClick);
    
    // Return cleanup function
    return () => {
        button?.removeEventListener('click', handleClick);
    };
}
```

## Form Handling & Validation

- Validate on both client and server
- Provide real-time validation feedback
- Use type-safe form data extraction
- Clear error states appropriately
- Disable submit buttons during submission

### Example Pattern
```typescript
interface FormData {
    email: string;
    password: string;
}

interface ValidationErrors {
    [key: string]: string;
}

function validateForm(data: FormData): ValidationErrors {
    const errors: ValidationErrors = {};
    
    if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.email = 'Invalid email format';
    }
    
    if (data.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
    }
    
    return errors;
}
```

## State Management

- Keep state in a single source of truth
- Use immutable updates
- Separate UI state from data state
- Document state transitions

## Performance Optimization

- Use debounce/throttle for frequent events
- Implement lazy loading for heavy content
- Cache DOM queries
- Use IntersectionObserver for scroll-based triggers
- Minimize reflows and repaints

## Browser Compatibility

- Use polyfills for newer APIs when needed
- Test on multiple browsers
- Use feature detection, not browser detection
- Document browser requirements

## Code Organization

- Group related functions together
- Use clear section comments
- Export only what needs to be public
- Keep files focused (max 300-400 lines)
