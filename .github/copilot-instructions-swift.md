# iOS Swift Development Instructions

## Swift Style & Best Practices

- Follow Swift API Design Guidelines
- Use Swift's type system fully (avoid `Any`, use generics)
- Prefer `struct` over `class` when possible
- Use `enum` for related constants and states
- Leverage Swift's optionals properly (`if let`, `guard let`)
- Use `weak` and `unowned` to prevent retain cycles

## UI Components (SwiftUI/UIKit)

### SwiftUI
- Keep views small and focused
- Extract subviews for reusability
- Use `@State` for local state, `@Binding` for passed state
- Use `@StateObject` and `@ObservedObject` appropriately
- Implement custom ViewModifiers for reusable styling

### UIKit
- Use Auto Layout programmatically or Interface Builder
- Implement proper view lifecycle methods
- Clean up observers in `deinit`
- Use delegation pattern for communication
- Implement accessibility features

### Example Pattern
```swift
struct UserProfileView: View {
    @StateObject private var viewModel: UserProfileViewModel
    
    var body: some View {
        VStack {
            // View content
        }
        .onAppear {
            viewModel.loadProfile()
        }
    }
}
```

## Network Layer

### URLSession
- Use modern async/await APIs
- Implement proper error handling
- Create protocol-oriented network layer
- Use Codable for JSON parsing
- Implement request/response interceptors

### Example Pattern
```swift
protocol NetworkService {
    func fetch<T: Decodable>(_ endpoint: Endpoint) async throws -> T
}

struct APIService: NetworkService {
    func fetch<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        let (data, response) = try await URLSession.shared.data(from: endpoint.url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.invalidResponse
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

## Business Logic & Architecture

- Use MVVM or Clean Architecture patterns
- Keep ViewModels platform-agnostic (no UIKit/SwiftUI imports)
- Use protocols for testability
- Implement dependency injection
- Separate domain models from data models

### Example Pattern
```swift
protocol UserRepository {
    func getUser(id: String) async throws -> User
}

@MainActor
class UserViewModel: ObservableObject {
    @Published var user: User?
    @Published var isLoading = false
    @Published var error: Error?
    
    private let repository: UserRepository
    
    init(repository: UserRepository) {
        self.repository = repository
    }
    
    func loadUser(id: String) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            user = try await repository.getUser(id: id)
        } catch {
            self.error = error
        }
    }
}
```

## Data Models

### Codable Models
- Define clear Codable structures
- Use CodingKeys for custom JSON mapping
- Implement custom encoding/decoding when needed
- Separate API models from domain models

### Core Data / Persistence
- Use NSFetchedResultsController for table views
- Perform operations on background contexts
- Implement proper error handling
- Use lightweight migrations

## Memory Management

- Use `weak` for delegates
- Use `[weak self]` in closures to prevent retain cycles
- Profile with Instruments for memory leaks
- Dispose of observers and subscriptions properly

## Error Handling

- Create custom Error types
- Use Result type for synchronous operations
- Throw errors in async functions
- Provide meaningful error messages
- Handle errors at appropriate levels

## Testing

- Write unit tests for ViewModels
- Mock dependencies using protocols
- Test business logic thoroughly
- Use XCTest for UI testing
- Aim for high test coverage on critical paths

## Performance

- Lazy load content when appropriate
- Use background threads for heavy operations
- Optimize images (use correct sizes)
- Profile with Instruments
- Implement pagination for large lists

## Security

- Use Keychain for sensitive data
- Never log sensitive information
- Implement certificate pinning
- Validate all user inputs
- Use App Transport Security
