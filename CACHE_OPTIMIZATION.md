# Local Cache Optimization

## Overview

To speed up loading times, the application uses a local cache for static (finished) H2H match pages. This eliminates slow CORS proxy calls for gameweeks that won't change.

## How It Works

### Current Setup:
- **Pages 1-3**: Loaded from local cache (150 matches from finished gameweeks)
- **Page 4+**: Fetched from API (ongoing/recent gameweeks)

### Performance Impact:
- **Before**: All pages through slow proxies (~15s per page = 45+ seconds for 3 pages)
- **After**: Pages 1-3 instant (<0.1s), only page 4+ uses proxies

### Configuration

The number of cached pages is configured in `src/api.ts`:

```typescript
const CACHED_PAGES_COUNT = 3; // Number of pages cached locally
```

## Refreshing the Cache

As more gameweeks finish, you can cache additional pages:

### Method 1: Using the Script

```bash
# Cache 5 pages instead of 3
npm run refresh-cache 5
```

Or directly:

```bash
./scripts/refresh-cache.sh 5
```

### Method 2: Manual Download

```bash
# Download page 4
curl "https://fantasy.premierleague.com/api/leagues-h2h-matches/league/154959/?page=4" \
  > data/cache/h2h-matches-page-4.json
```

### After Adding More Cached Pages:

1. Update `CACHED_PAGES_COUNT` in `src/api.ts`
2. Run `npm run build` to rebuild
3. Cached pages will now be served instantly

## File Structure

```
data/
  cache/
    h2h-matches-page-1.json  (50 matches, GW 1-7)
    h2h-matches-page-2.json  (50 matches, GW 8-14)
    h2h-matches-page-3.json  (50 matches, GW 15-21)
    # Add more as gameweeks finish
```

## When to Refresh

Refresh the cache when:
- New gameweeks finish (all matches played)
- You want to cache more historical data
- Data gets corrupted or needs updating

## Verification

After building, check that cache files are deployed:

```bash
ls -lh dist/data/cache/
```

You should see the JSON files with ~25KB each.

## Console Logs

When the app loads, you'll see:

```
📦 Loading 3 cached pages...
📦 Loaded page 1 from cache (50 matches)
📦 Loaded page 2 from cache (50 matches)
📦 Loaded page 3 from cache (50 matches)
✅ Loaded 150 matches from 3 cached pages
🌐 Fetching remaining pages from API (starting at page 4)...
```

This confirms the optimization is working!
