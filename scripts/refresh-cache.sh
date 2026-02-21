#!/bin/bash
# Refresh cache script for H2H match pages
# Usage: ./scripts/refresh-cache.sh [num_pages]
# Example: ./scripts/refresh-cache.sh 5  (to cache 5 pages)

set -e

LEAGUE_ID=154959
CACHE_DIR="data/cache"
DEFAULT_PAGES=3

# Get number of pages from argument or use default
NUM_PAGES=${1:-$DEFAULT_PAGES}

echo "🔄 Refreshing H2H matches cache..."
echo "📦 Caching $NUM_PAGES pages"

# Create cache directory if it doesn't exist
mkdir -p "$CACHE_DIR"

# Download each page
for ((page=1; page<=NUM_PAGES; page++)); do
    echo "⬇️  Downloading page $page..."
    curl -s "https://fantasy.premierleague.com/api/leagues-h2h-matches/league/$LEAGUE_ID/?page=$page" \
        > "$CACHE_DIR/h2h-matches-page-$page.json"
    
    # Verify it's valid JSON
    if jq -e . "$CACHE_DIR/h2h-matches-page-$page.json" >/dev/null 2>&1; then
        MATCH_COUNT=$(jq -r '.results | length' "$CACHE_DIR/h2h-matches-page-$page.json")
        echo "✅ Page $page cached ($MATCH_COUNT matches)"
    else
        echo "❌ Page $page failed - invalid JSON"
        rm "$CACHE_DIR/h2h-matches-page-$page.json"
        exit 1
    fi
done

echo ""
echo "✨ Cache refreshed successfully!"
echo "📊 Total cached pages: $NUM_PAGES"
echo ""
echo "⚠️  Remember to update CACHED_PAGES_COUNT in src/api.ts to $NUM_PAGES"
echo "⚠️  Then run: npm run build"
