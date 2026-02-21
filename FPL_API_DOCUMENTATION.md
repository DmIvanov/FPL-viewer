# FPL API Documentation

## Base URL
```
https://fantasy.premierleague.com/api/
```

## Important Notes
- **CORS Policy**: The API has CORS restrictions, so cannot be called directly from frontend clients
- **Authentication**: Some endpoints require authentication via cookie headers
- **No Official Documentation**: This is based on community research and reverse engineering

## Key Terminology

| Term | Description |
|------|-------------|
| `manager_id` | ID for a fantasy team manager (real FPL user) |
| `league_id` | ID for a league (mini-league, H2H, or public classic) |
| `element_id` | ID for football players in the Premier League |
| `event_id` | Gameweek number (1-38 in a season) |

## How to Find IDs

### Manager ID
1. Log in to https://fantasy.premierleague.com/
2. Click on "Points" tab
3. Your `manager_id` appears in the URL: `https://fantasy.premierleague.com/entry/{manager_id}/event/{event_id}`

### League ID
1. Log in to https://fantasy.premierleague.com/
2. Click "Leagues & Cups" tab
3. Click on your desired league
4. The `league_id` appears in the URL: `https://fantasy.premierleague.com/leagues/{league_id}/standings/c`

---

## Public Endpoints (No Authentication Required)

### 1. General Information - Bootstrap Static
**Endpoint:** `bootstrap-static/`  
**Full URL:** https://fantasy.premierleague.com/api/bootstrap-static/

**Returns:**
- Summary of all gameweeks
- FPL phases (pre-season, active, finished)
- All teams (Premier League clubs)
- All players with statistics
- Game settings

**Use Cases:**
- Get complete player list with stats
- Get all teams
- Check current gameweek

---

### 2. All Fixtures
**Endpoint:** `fixtures/`  
**Full URL:** https://fantasy.premierleague.com/api/fixtures/

**Returns:**
- Array of all fixture objects
- Future fixtures: teams, kickoff time, difficulty ratings
- Past fixtures: includes match statistics

---

### 3. Fixtures by Gameweek
**Endpoint:** `fixtures/?event={event_id}`  
**Full URL:** `https://fantasy.premierleague.com/api/fixtures/?event={event_id}`

**Parameters:**
- `event_id`: Gameweek number (1-38)

**Returns:**
- Fixtures for specific gameweek
- Future: teams, kickoff, difficulty
- Past: includes statistics

---

### 4. Player Details
**Endpoint:** `element-summary/{element_id}/`  
**Full URL:** `https://fantasy.premierleague.com/api/element-summary/{element_id}/`

**Parameters:**
- `element_id`: Player ID

**Returns:**
- Player's current season fixtures
- Past season summaries
- Detailed player statistics

---

### 5. Gameweek Live Data
**Endpoint:** `event/{event_id}/live/`  
**Full URL:** `https://fantasy.premierleague.com/api/event/{event_id}/live/`

**Parameters:**
- `event_id`: Gameweek number

**Returns:**
- Live statistics for every player in the specified gameweek
- Points, bonus, assists, goals, etc.

---

### 6. Manager Summary
**Endpoint:** `entry/{manager_id}/`  
**Full URL:** `https://fantasy.premierleague.com/api/entry/{manager_id}/`

**Parameters:**
- `manager_id`: Manager's team ID

**Returns:**
- Manager's summary data
- Current rank
- Total points
- Team name
- Favorite team
- Started gameweek
- etc.

---

### 7. Manager History
**Endpoint:** `entry/{manager_id}/history/`  
**Full URL:** `https://fantasy.premierleague.com/api/entry/{manager_id}/history/`

**Parameters:**
- `manager_id`: Manager's team ID

**Returns:**
- `current`: Statistics for every gameweek in current season
- `past`: Summary of previous seasons
- `chips`: Chips played and when (Wildcard, Bench Boost, Triple Captain, Free Hit)

---

### 8. Manager Transfers (All Season)
**Endpoint:** `entry/{manager_id}/transfers/`  
**Full URL:** `https://fantasy.premierleague.com/api/entry/{manager_id}/transfers/`

**Parameters:**
- `manager_id`: Manager's team ID

**Returns:**
- All transfers made by the manager in current season
- Transfer in/out player IDs
- Transfer cost
- Gameweek of transfer

---

### 9. Manager's Team for Specific Gameweek
**Endpoint:** `entry/{manager_id}/event/{event_id}/picks/`  
**Full URL:** `https://fantasy.premierleague.com/api/entry/{manager_id}/event/{event_id}/picks/`

**Parameters:**
- `manager_id`: Manager's team ID
- `event_id`: Gameweek number

**Returns:**
- Manager's team selection for that gameweek
- Captain/Vice-captain
- Starting XI and bench
- Points for that gameweek
- Active chip

---

### 10. Classic League Standings
**Endpoint:** `leagues-classic/{league_id}/standings/`  
**Full URL:** `https://fantasy.premierleague.com/api/leagues-classic/{league_id}/standings/`

**Parameters:**
- `league_id`: League ID

**Optional Query Parameters:**
- `page_new_entries`
- `page_standings`
- `phase`

**Returns:**
- League standings
- Manager rankings
- Points
- League information
- Pagination info

---

### 11. Head-to-Head League Matches
**Endpoint:** `leagues-h2h-matches/league/{league_id}/`  
**Full URL:** `https://fantasy.premierleague.com/api/leagues-h2h-matches/league/{league_id}/?page=1`

**Parameters:**
- `league_id`: H2H League ID
- `page`: Page number (paginated)

**Returns:**
- Head-to-head match results for each gameweek
- Match details (scores, winners, draws)
- Requires pagination to get all matches

**Note:** ⚠️ This endpoint requires pagination through multiple pages. For faster league table access, use the H2H Standings endpoint below.

---

### 11b. Head-to-Head League Standings (Fast Alternative)
**Endpoint:** `leagues-h2h/{league_id}/standings/`  
**Full URL:** `https://fantasy.premierleague.com/api/leagues-h2h/{league_id}/standings/`

**Parameters:**
- `league_id`: H2H League ID

**Returns:**
- Complete league standings in **one API call**
- Win/draw/loss records for each manager
- League points (W=3, D=1, L=0)
- Total FPL points for each manager
- Current and previous ranks

**Example Response:**
```json
{
  "standings": {
    "results": [
      {
        "id": 594111,
        "entry": 2901199,
        "player_name": "John Doe",
        "rank": 1,
        "last_rank": 1,
        "total": 54,
        "entry_name": "Team Name",
        "matches_played": 26,
        "matches_won": 18,
        "matches_drawn": 0,
        "matches_lost": 8,
        "points_for": 1390
      }
    ]
  }
}
```

**Use Cases:**
- ✅ **Fast league table display** - No pagination needed
- ✅ Get win/draw/loss statistics
- ✅ Get overall league standings
- ❌ Does NOT include gameweek-by-gameweek match details
- ❌ Does NOT include individual match scores

**Performance:** Much faster than paginating through all matches. Use this for standings tables, use the matches endpoint only when you need detailed match history.

---

### 12. Event Status
**Endpoint:** `event-status/`  
**Full URL:** https://fantasy.premierleague.com/api/event-status/

**Returns:**
- Status of bonus points additions
- League update status for current gameweek

---

### 13. Dream Team
**Endpoint:** `dream-team/{event_id}/`  
**Full URL:** `https://fantasy.premierleague.com/api/dream-team/{event_id}/`

**Parameters:**
- `event_id`: Gameweek number

**Returns:**
- Best performing team for the gameweek
- Highest scoring players

---

### 14. Set Piece Takers
**Endpoint:** `team/set-piece-notes/`  
**Full URL:** https://fantasy.premierleague.com/api/team/set-piece-notes/

**Returns:**
- Notes on set piece takers for each Premier League team
- Penalty takers
- Free kick takers
- Corner takers

---

### 15. Cup Status
**Endpoint:** `league/{league_id}/cup-status/`  
**Full URL:** `https://fantasy.premierleague.com/api/league/{league_id}/cup-status/`

**Parameters:**
- `league_id`: League ID

**Returns:**
- Cup competition status for the league
- Current round
- Matches

---

### 16. Most Valuable Teams
**Endpoint:** `stats/most-valuable-teams/`  
**Full URL:** https://fantasy.premierleague.com/api/stats/most-valuable-teams/

**Returns:**
- Top 5 most valuable FPL teams
- Team value
- Manager details

---

### 17. Best Leagues
**Endpoint:** `stats/best-classic-private-leagues/`  
**Full URL:** https://fantasy.premierleague.com/api/stats/best-classic-private-leagues/

**Returns:**
- Best performing private leagues
- Ranked by average score of top 5 players

---

## Authenticated Endpoints (Require Cookie Header)

### 18. Current Manager Data
**Endpoint:** `me/`  
**Full URL:** https://fantasy.premierleague.com/api/me/

**Authentication:** Required  
**Returns:**
- Authenticated manager's personal data
- Email, preferences, etc.

---

### 19. Manager's Current Team
**Endpoint:** `my-team/{manager_id}/`  
**Full URL:** `https://fantasy.premierleague.com/api/my-team/{manager_id}/`

**Authentication:** Required (must match authenticated manager)

**Returns:**
- Current team selection
- Chips used and available
- Recent transfers

---

### 20. Manager's Latest Transfers
**Endpoint:** `entry/{manager_id}/transfers-latest/`  
**Full URL:** `https://fantasy.premierleague.com/api/entry/{manager_id}/transfers-latest/`

**Authentication:** Required

**Returns:**
- Transfers from most recently completed gameweek
- Does NOT include ongoing live gameweek transfers

---

## Authentication Setup

To use authenticated endpoints:

1. Log in to https://fantasy.premierleague.com/
2. Open browser DevTools → Network tab
3. Find request to `me/`
4. Copy the `cookie` header value
5. Add header to your requests:
   ```
   Cookie: <copied-cookie-value>
   ```

**Note:** Cookie authentication tokens expire and need to be refreshed periodically.

---

## Common Use Cases

### Get H2H League Standings (Optimized)
**Fast Path - Standings Only:**
1. `GET /api/leagues-h2h/{league_id}/standings/` - Get complete standings in 1 call
2. For each manager, optionally `GET /api/entry/{manager_id}/` - Get detailed manager info

**Full Path - With Match History:**
1. `GET /api/leagues-h2h-matches/league/{league_id}/?page=1` - Get first page
2. Continue pagination if `has_next: true`
3. Process all matches for detailed analysis

**Recommended:** Use standings endpoint for quick table display, lazy-load matches only when user needs detailed match history or charts.

### Get League Standings with Manager Details
1. `GET /api/leagues-classic/{league_id}/standings/` - Get all managers in league
2. For each manager, `GET /api/entry/{manager_id}/` - Get detailed manager info
3. Optionally, `GET /api/entry/{manager_id}/history/` - Get gameweek-by-gameweek performance

### Track Weekly Performance
1. `GET /api/bootstrap-static/` - Get current gameweek
2. `GET /api/entry/{manager_id}/event/{event_id}/picks/` - Get team selection
3. `GET /api/event/{event_id}/live/` - Get live player stats

### Compare Managers
1. Get multiple manager summaries via `/api/entry/{manager_id}/`
2. Get their histories via `/api/entry/{manager_id}/history/`
3. Compare stats like overall rank, gameweek points, season points

---

## Data Structure Examples

### Manager Object (from league standings)
```json
{
  "id": 123456,
  "event_total": 67,
  "player_name": "John Doe",
  "rank": 15,
  "last_rank": 20,
  "rank_sort": 15,
  "total": 1234,
  "entry": 123456,
  "entry_name": "Team Name"
}
```

### Gameweek History (from manager history)
```json
{
  "event": 25,
  "points": 67,
  "total_points": 1234,
  "rank": 123456,
  "rank_sort": 123456,
  "overall_rank": 123456,
  "bank": 5,
  "value": 1025,
  "event_transfers": 1,
  "event_transfers_cost": 4,
  "points_on_bench": 12
}
```

---

## Rate Limiting & Best Practices

- No official rate limits documented
- Be respectful: avoid excessive requests
- Cache responses when possible
- Use pagination for large datasets
- Consider using CORS proxies for frontend applications

---

## Additional Resources

- [Oliver Looney's FPL API Guide](https://www.oliverlooney.com/blogs/FPL-APIs-Explained)
- Community GitHub repositories with FPL API wrappers
- FPL subreddit: r/FantasyPL
