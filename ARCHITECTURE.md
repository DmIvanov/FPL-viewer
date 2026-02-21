# FPL Analytics Dashboard - Architecture Documentation

## 📁 Project Structure

The project has been refactored following a clean, modular architecture with clear separation of concerns:

```
src/
├── script.ts      # Main entry point & orchestration
├── types.ts       # TypeScript type definitions
├── api.ts         # Network layer (API calls & local cache)
├── ui.ts          # UI manipulation & DOM interactions
└── utils.ts       # Utility functions (debounce, etc.)

data/
└── cache/         # Local cache for static H2H match pages
    ├── h2h-matches-page-1.json
    ├── h2h-matches-page-2.json
    └── h2h-matches-page-3.json

scripts/
└── refresh-cache.sh  # Script to update cached pages
```

## 🏗️ Architecture Layers

### 1. **Types Layer** (`types.ts`)
- Contains all TypeScript interfaces and type definitions
- Exports: `FPLManager`, `FPLLeague`, `FPLLeagueStandings`
- **Purpose**: Centralized type definitions for type safety

### 2. **API Layer** (`api.ts`)
- Handles all network requests and data fetching
- Pure networking logic with zero UI dependencies
- **Local Cache Optimization**: Loads static match pages from local files
- Functions:
  - `fetchRealFPLData()`: Fetches live FPL data using CORS proxies
  - `fetchH2HStandings()`: Fast single-call H2H standings endpoint
  - `fetchH2HMatches()`: Loads matches with local cache + API fallback
  - `loadCachedPage()`: Loads static pages from local cache
- **Purpose**: Separation of data fetching from business logic
- **Performance**: Pages 1-3 cached locally (instant), page 4+ from API

### 3. **UI Layer** (`ui.ts`)
- All DOM manipulation and UI rendering logic
- Independent of networking concerns
- Functions:
  - `setupMobileMenu()`: Mobile navigation
  - `setupSmoothScrolling()`: Smooth scroll behavior
  - `setupIntersectionObserver()`: Scroll animations
  - `setupKeyboardAccessibility()`: Keyboard handlers
  - `setupResizeHandler()`: Responsive adjustments
  - `initializeFPLFeatures()`: FPL-specific UI setup
  - `initializeTabSwitching()`: Tab navigation
  - `setupTabSwitchingListeners()`: Tab click handlers
  - `populateCupTable()`: Renders manager data in table
  - `showLoadingState()`: Loading indicator
  - `escapeHtml()`: XSS protection
  - `getRankChangeIndicator()`: Rank change emoji
  - `getRankClass()`: CSS class for rank styling
- **Purpose**: Clean separation of presentation logic

### 4. **Utilities Layer** (`utils.ts`)
- Reusable helper functions
- Functions:
  - `debounce()`: Rate limiting for function calls
- **Purpose**: Shared utilities across layers

### 5. **Main Script** (`script.ts`)
- Application entry point
- Orchestrates all layers
- Functions:
  - `initializeWebsite()`: Initializes all modules
  - `fetchCupStandings()`: Coordinates API + UI for data display
- **Purpose**: Application coordination and high-level logic

## 🔄 Data Flow

```
User Interaction
     ↓
script.ts (Orchestration)
     ↓
api.ts (Fetch Data) → types.ts (Type Safety)
     ↓
script.ts (Process)
     ↓
ui.ts (Render)
     ↓
DOM Updates
```

## ✅ Benefits of This Architecture

1. **Separation of Concerns**: UI, networking, and types are completely separated
2. **Testability**: Each layer can be tested independently
3. **Maintainability**: Changes to UI don't affect API layer and vice versa
4. **Reusability**: Functions can be imported and reused across modules
5. **Type Safety**: Centralized type definitions ensure consistency
6. **Scalability**: Easy to add new features to specific layers
7. **Performance**: Multi-level caching and lazy loading strategies

## ⚡ Performance Optimizations

### 1. **Local Cache for Static Data**
- **Problem**: Finished match pages don't change but require slow proxy calls (15s each)
- **Solution**: Cache static pages locally as JSON files
- **Implementation**: `data/cache/h2h-matches-page-*.json`
- **Impact**: Pages 1-3 load instantly (<0.1s vs 45s through proxies)

### 2. **Lazy Loading Strategy**
- **Standings Tab**: Single fast API call (`/leagues-h2h/{id}/standings/`)
- **Matches/Charts Tabs**: Only loaded when user clicks (on-demand)
- **Impact**: Initial page load ~1 second instead of 30+ seconds

### 3. **Multi-Level Caching**
- **Level 1**: Memory cache (5 minutes)
- **Level 2**: Local static files (permanent for finished gameweeks)
- **Level 3**: API with CORS proxies (fallback)

### 4. **Smart API Usage**
- **Before**: 10+ paginated calls for complete data
- **After**: 
  - Standings: 1 API call
  - Matches: 3 local files + only new pages from API
- **Savings**: ~90% reduction in API calls

See [CACHE_OPTIMIZATION.md](CACHE_OPTIMIZATION.md) for details on managing the cache.

## 🔧 Module Dependencies

```
script.ts
  ├── imports types.ts
  ├── imports api.ts
  ├── imports ui.ts
  └── imports utils.ts

api.ts
  └── imports types.ts

ui.ts
  └── imports types.ts

utils.ts
  └── (no dependencies)
```

## 📝 Code Statistics

- **Before Refactoring**: 458 lines (monolithic)
- **After Refactoring**: 
  - script.ts: ~100 lines
  - api.ts: ~90 lines
  - ui.ts: ~280 lines
  - types.ts: ~50 lines
  - utils.ts: ~15 lines
  - **Total**: ~535 lines (more modular, better organized)

## 🚀 Future Improvements

- Add state management layer for complex data
- Implement caching layer for API responses
- Add error boundary utilities
- Create separate module for chart functionality
- Add unit tests for each layer
