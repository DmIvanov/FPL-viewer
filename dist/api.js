// ===== API & NETWORKING LAYER =====
const FPL_API_URL = 'https://fantasy.premierleague.com/api/leagues-classic/841567/standings/';
const H2H_LEAGUE_ID = 154959;
const H2H_API_BASE_URL = `https://fantasy.premierleague.com/api/leagues-h2h-matches/league/${H2H_LEAGUE_ID}`;
const H2H_STANDINGS_URL = `https://fantasy.premierleague.com/api/leagues-h2h/${H2H_LEAGUE_ID}/standings/`;
// Configuration for cached static pages
const CACHED_PAGES_COUNT = 3; // Number of pages we have cached locally
const CACHED_PAGES_BASE_URL = '../data/cache/h2h-matches-page-'; // Relative to dist/
const CORS_PROXIES = [
    'https://corsproxy.io/?', // Fast but may have rate limits
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://api.allorigins.win/get?url=' // Slowest - use as fallback
];
// Cache for API responses
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedStandingsData = null;
let cachedMatchesData = null;
let workingProxyIndex = 0; // Remember which proxy works
let directAccessWorks = null; // Track if direct access works (null = not tested yet)
/**
 * Loads a cached H2H matches page from local storage
 */
async function loadCachedPage(pageNumber) {
    if (pageNumber > CACHED_PAGES_COUNT) {
        return null; // Page not cached
    }
    try {
        const response = await fetch(`${CACHED_PAGES_BASE_URL}${pageNumber}.json`);
        if (response.ok) {
            const data = await response.json();
            console.log(`📦 Loaded page ${pageNumber} from cache (${data.results?.length || 0} matches)`);
            return data;
        }
    }
    catch (error) {
        console.warn(`⚠️ Failed to load cached page ${pageNumber}:`, error);
    }
    return null;
}
/**
 * Fetches real FPL data from the Fantasy Premier League API
 * Uses multiple CORS proxy services for reliability
 */
export async function fetchRealFPLData() {
    // Try direct access first if we haven't confirmed it doesn't work
    if (directAccessWorks !== false) {
        try {
            console.log('🚀 Attempting direct API access (no proxy)...');
            const response = await fetch(FPL_API_URL, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
            if (response.ok) {
                const data = await response.json();
                if (data && typeof data === 'object' && data.standings && Array.isArray(data.standings.results)) {
                    console.log('✅ Direct API access successful! No proxy needed.');
                    directAccessWorks = true;
                    return data;
                }
            }
        }
        catch (error) {
            console.log('⚠️ Direct API access blocked by CORS, falling back to proxies...');
            directAccessWorks = false;
        }
    }
    console.log('🔍 Using CORS proxies for FPL API access...');
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        const proxyUrl = CORS_PROXIES[i];
        if (!proxyUrl)
            continue;
        try {
            console.log(`🔄 Attempting CORS proxy ${i + 1}/${CORS_PROXIES.length}: ${proxyUrl}`);
            let fetchUrl;
            let processResponse;
            if (proxyUrl.includes('allorigins')) {
                // AllOrigins returns data wrapped in a contents field
                fetchUrl = `${proxyUrl}${encodeURIComponent(FPL_API_URL)}`;
                processResponse = async (response) => {
                    const data = await response.json();
                    console.log('📦 AllOrigins raw response:', data);
                    return JSON.parse(data.contents);
                };
            }
            else {
                // Other proxies return data directly
                fetchUrl = `${proxyUrl}${FPL_API_URL}`;
                processResponse = async (response) => {
                    const data = await response.json();
                    console.log('📦 Direct proxy response:', data);
                    return data;
                };
            }
            console.log('🌐 Fetching from:', fetchUrl);
            const response = await fetch(fetchUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            console.log(`📊 Response status: ${response.status} ${response.statusText}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await processResponse(response);
            console.log('✅ Parsed FPL data:', data);
            // Validate response structure
            if (data && typeof data === 'object' && data.standings && Array.isArray(data.standings.results)) {
                console.log(`📊 Found ${data.standings.results.length} managers in live data`);
                console.log('🏆 Live data validation successful!');
                return data;
            }
            else {
                console.warn('⚠️ Invalid response structure from proxy:', data);
                throw new Error('Invalid response structure');
            }
        }
        catch (error) {
            console.warn(`❌ CORS proxy ${i + 1} failed:`, error);
            // If this was the last proxy, throw the error
            if (i === CORS_PROXIES.length - 1) {
                console.error('🚫 All CORS proxy attempts failed');
                throw new Error('All CORS proxy attempts failed');
            }
            // Otherwise, continue to next proxy
            console.log(`⏭️ Trying next proxy...`);
        }
    }
    // This should never be reached, but TypeScript needs it
    throw new Error('No proxy services available');
}
/**
 * Fetches a single page of H2H matches
 * Checks local cache first for static pages, then falls back to API
 */
async function fetchH2HPage(pageNumber) {
    // Try loading from cache first (for static finished pages)
    const cachedData = await loadCachedPage(pageNumber);
    if (cachedData) {
        return cachedData;
    }
    // Not in cache, fetch from API
    const pageUrl = `${H2H_API_BASE_URL}?page=${pageNumber}`;
    // Try direct access first if we know it works or haven't tested it yet
    if (directAccessWorks !== false) {
        try {
            const response = await fetch(pageUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                if (data && typeof data === 'object' && Array.isArray(data.results)) {
                    if (directAccessWorks === null) {
                        console.log('✅ Direct API access works! Using direct calls for faster loading.');
                        directAccessWorks = true;
                    }
                    return data;
                }
            }
        }
        catch (error) {
            // CORS blocked, fall through to proxy method
            if (directAccessWorks === null) {
                console.log('⚠️ Direct API access blocked, using proxies...');
                directAccessWorks = false;
            }
        }
    }
    // Try working proxy first, then others
    const proxyOrder = [
        ...CORS_PROXIES.slice(workingProxyIndex),
        ...CORS_PROXIES.slice(0, workingProxyIndex)
    ];
    for (let i = 0; i < proxyOrder.length; i++) {
        const proxyUrl = proxyOrder[i];
        if (!proxyUrl)
            continue;
        try {
            let fetchUrl;
            let processResponse;
            if (proxyUrl.includes('allorigins')) {
                fetchUrl = `${proxyUrl}${encodeURIComponent(pageUrl)}`;
                processResponse = async (response) => {
                    const data = await response.json();
                    return JSON.parse(data.contents);
                };
            }
            else {
                fetchUrl = `${proxyUrl}${pageUrl}`;
                processResponse = async (response) => {
                    return await response.json();
                };
            }
            const response = await fetch(fetchUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await processResponse(response);
            if (data && typeof data === 'object' && Array.isArray(data.results)) {
                // Remember this working proxy
                workingProxyIndex = CORS_PROXIES.indexOf(proxyUrl);
                return data;
            }
            else {
                throw new Error('Invalid response structure');
            }
        }
        catch (error) {
            if (i === proxyOrder.length - 1) {
                throw new Error(`All proxies failed for page ${pageNumber}`);
            }
        }
    }
    throw new Error(`Failed to fetch page ${pageNumber}`);
}
/**
 * Fetches H2H standings (fast, single API call)
 * Returns league standings with win/draw/loss records
 */
export async function fetchH2HStandings() {
    // Check cache first
    if (cachedStandingsData && (Date.now() - cachedStandingsData.timestamp) < CACHE_DURATION) {
        console.log('✨ Using cached H2H standings data');
        return cachedStandingsData.data;
    }
    console.log('🔍 Fetching H2H standings (single API call)...');
    // Try direct access first
    if (directAccessWorks !== false) {
        try {
            const response = await fetch(H2H_STANDINGS_URL, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.standings && Array.isArray(data.standings.results)) {
                    if (directAccessWorks === null) {
                        console.log('✅ Direct API access works! Using direct calls.');
                        directAccessWorks = true;
                    }
                    const result = {
                        standings: data.standings.results,
                        lastUpdated: new Date()
                    };
                    // Cache the result
                    cachedStandingsData = {
                        data: result,
                        timestamp: Date.now()
                    };
                    console.log(`✅ Successfully loaded ${data.standings.results.length} managers from H2H standings`);
                    return result;
                }
            }
        }
        catch (error) {
            if (directAccessWorks === null) {
                console.log('⚠️ Direct API access blocked, using proxies...');
                directAccessWorks = false;
            }
        }
    }
    // Try with proxies
    const proxyOrder = [
        ...CORS_PROXIES.slice(workingProxyIndex),
        ...CORS_PROXIES.slice(0, workingProxyIndex)
    ];
    for (let i = 0; i < proxyOrder.length; i++) {
        const proxyUrl = proxyOrder[i];
        if (!proxyUrl)
            continue;
        try {
            let fetchUrl;
            let processResponse;
            if (proxyUrl.includes('allorigins')) {
                fetchUrl = `${proxyUrl}${encodeURIComponent(H2H_STANDINGS_URL)}`;
                processResponse = async (response) => {
                    const data = await response.json();
                    return JSON.parse(data.contents);
                };
            }
            else {
                fetchUrl = `${proxyUrl}${H2H_STANDINGS_URL}`;
                processResponse = async (response) => {
                    return await response.json();
                };
            }
            const response = await fetch(fetchUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await processResponse(response);
            if (data && data.standings && Array.isArray(data.standings.results)) {
                workingProxyIndex = CORS_PROXIES.indexOf(proxyUrl);
                const result = {
                    standings: data.standings.results,
                    lastUpdated: new Date()
                };
                // Cache the result
                cachedStandingsData = {
                    data: result,
                    timestamp: Date.now()
                };
                console.log(`✅ Successfully loaded ${data.standings.results.length} managers from H2H standings`);
                return result;
            }
            else {
                throw new Error('Invalid response structure');
            }
        }
        catch (error) {
            if (i === proxyOrder.length - 1) {
                throw new Error('All proxies failed for H2H standings');
            }
        }
    }
    throw new Error('Failed to fetch H2H standings');
}
/**
 * Fetches all H2H matches with parallel pagination and local caching
 * - Pages 1-3: Loaded from local cache (static/finished gameweeks)
 * - Page 4+: Fetched from API (recent/ongoing gameweeks)
 * Supports progressive callback for updating UI as data arrives
 */
export async function fetchH2HMatches(onProgress) {
    // Check memory cache first
    if (cachedMatchesData && (Date.now() - cachedMatchesData.timestamp) < CACHE_DURATION) {
        console.log('✨ Using cached H2H matches data from memory');
        if (onProgress) {
            onProgress(cachedMatchesData.data.matches, true);
        }
        return cachedMatchesData.data;
    }
    console.log(`🔍 Fetching H2H League matches (pages 1-${CACHED_PAGES_COUNT} from local cache, rest from API)...`);
    const allMatches = [];
    // Load cached pages first (pages 1-3)
    console.log(`📦 Loading ${CACHED_PAGES_COUNT} cached pages...`);
    for (let pageNum = 1; pageNum <= CACHED_PAGES_COUNT; pageNum++) {
        const pageData = await fetchH2HPage(pageNum);
        allMatches.push(...pageData.results);
    }
    console.log(`✅ Loaded ${allMatches.length} matches from ${CACHED_PAGES_COUNT} cached pages`);
    // Check if there are more pages beyond cached ones
    const lastCachedPage = await fetchH2HPage(CACHED_PAGES_COUNT);
    // Notify progress after cached pages
    if (onProgress) {
        onProgress([...allMatches], !lastCachedPage.has_next);
    }
    // If there are more pages, fetch them from API (starting at page 4)
    if (lastCachedPage.has_next) {
        console.log(`🌐 Fetching remaining pages from API (starting at page ${CACHED_PAGES_COUNT + 1})...`);
        let currentPage = CACHED_PAGES_COUNT + 1; // Start from page 4
        let hasNext = true;
        const BATCH_SIZE = 3; // Fetch 3 pages at a time to avoid overwhelming the API
        while (hasNext) {
            const pagesToFetch = [];
            // Prepare batch of page numbers to fetch
            for (let i = 0; i < BATCH_SIZE; i++) {
                pagesToFetch.push(currentPage + i);
            }
            try {
                // Fetch multiple pages in parallel
                const pageResults = await Promise.all(pagesToFetch.map(pageNum => fetchH2HPage(pageNum).catch(err => {
                    console.warn(`⚠️ Page ${pageNum} failed:`, err);
                    return null;
                })));
                // Process results
                hasNext = false;
                for (let i = 0; i < pageResults.length; i++) {
                    const pageData = pageResults[i];
                    if (pageData && pageData.results) {
                        allMatches.push(...pageData.results);
                        console.log(`✅ Page ${pagesToFetch[i]}: Found ${pageData.results.length} matches`);
                        // Check if there are more pages after this batch
                        if (i === pageResults.length - 1 && pageData.has_next) {
                            hasNext = true;
                        }
                    }
                    else {
                        // If we get a null result, assume we've reached the end
                        break;
                    }
                }
                // Notify progress once per batch (after all pages in batch are processed)
                if (onProgress) {
                    onProgress([...allMatches], !hasNext);
                }
                currentPage += BATCH_SIZE;
            }
            catch (error) {
                console.error('🚫 Error in parallel fetch:', error);
                hasNext = false;
            }
        }
    }
    console.log(`🏆 Successfully fetched all H2H matches: ${allMatches.length} total matches`);
    const result = {
        matches: allMatches,
        totalMatches: allMatches.length,
        lastUpdated: new Date()
    };
    // Cache the result
    cachedMatchesData = {
        data: result,
        timestamp: Date.now()
    };
    return result;
}
/**
 * Clears the cached league data (useful for manual refresh)
 */
export function clearLeagueCache() {
    cachedStandingsData = null;
    cachedMatchesData = null;
    directAccessWorks = null; // Re-test direct access on next request
    console.log('🗑️ League cache cleared');
}
// ===== MATCH DETAILS API FUNCTIONS =====
const FPL_BOOTSTRAP_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';
/**
 * Fetches manager's team picks for a specific gameweek
 */
export async function fetchManagerPicks(managerId, gameweek) {
    const url = `https://fantasy.premierleague.com/api/entry/${managerId}/event/${gameweek}/picks/`;
    console.log(`🔍 Fetching picks for manager ${managerId} GW${gameweek}...`);
    // Try direct access first
    try {
        const response = await fetch(url);
        if (response.ok) {
            return await response.json();
        }
    }
    catch (error) {
        console.log('Direct access failed, trying proxy...');
    }
    // Try with CORS proxy
    for (const proxy of CORS_PROXIES) {
        try {
            const proxyUrl = proxy.includes('allorigins')
                ? `${proxy}${encodeURIComponent(url)}`
                : `${proxy}${url}`;
            const response = await fetch(proxyUrl);
            if (response.ok) {
                const data = await response.json();
                return proxy.includes('allorigins') ? JSON.parse(data.contents) : data;
            }
        }
        catch (error) {
            continue;
        }
    }
    throw new Error(`Failed to fetch picks for manager ${managerId}`);
}
/**
 * Fetches live gameweek data for all players
 */
export async function fetchLiveGameweekData(gameweek) {
    const url = `https://fantasy.premierleague.com/api/event/${gameweek}/live/`;
    console.log(`🔍 Fetching live data for GW${gameweek}...`);
    // Try direct access first
    try {
        const response = await fetch(url);
        if (response.ok) {
            return await response.json();
        }
    }
    catch (error) {
        console.log('Direct access failed, trying proxy...');
    }
    // Try with CORS proxy
    for (const proxy of CORS_PROXIES) {
        try {
            const proxyUrl = proxy.includes('allorigins')
                ? `${proxy}${encodeURIComponent(url)}`
                : `${proxy}${url}`;
            const response = await fetch(proxyUrl);
            if (response.ok) {
                const data = await response.json();
                return proxy.includes('allorigins') ? JSON.parse(data.contents) : data;
            }
        }
        catch (error) {
            continue;
        }
    }
    throw new Error(`Failed to fetch live data for GW${gameweek}`);
}
/**
 * Fetches bootstrap-static data (contains all player info)
 */
let cachedBootstrapData = null;
export async function fetchBootstrapData() {
    if (cachedBootstrapData) {
        console.log('✨ Using cached bootstrap data');
        return cachedBootstrapData;
    }
    console.log('🔍 Fetching bootstrap-static data...');
    // Try direct access first
    try {
        const response = await fetch(FPL_BOOTSTRAP_URL);
        if (response.ok) {
            cachedBootstrapData = await response.json();
            return cachedBootstrapData;
        }
    }
    catch (error) {
        console.log('Direct access failed, trying proxy...');
    }
    // Try with CORS proxy
    for (const proxy of CORS_PROXIES) {
        try {
            const proxyUrl = proxy.includes('allorigins')
                ? `${proxy}${encodeURIComponent(FPL_BOOTSTRAP_URL)}`
                : `${proxy}${FPL_BOOTSTRAP_URL}`;
            const response = await fetch(proxyUrl);
            if (response.ok) {
                const data = await response.json();
                cachedBootstrapData = proxy.includes('allorigins') ? JSON.parse(data.contents) : data;
                return cachedBootstrapData;
            }
        }
        catch (error) {
            continue;
        }
    }
    throw new Error('Failed to fetch bootstrap data');
}
/**
 * Fetches complete match details including picks and live data
 */
export async function fetchMatchDetails(manager1Entry, manager1Name, manager1TeamName, manager1Points, manager2Entry, manager2Name, manager2TeamName, manager2Points, gameweek) {
    console.log(`📊 Fetching match details for GW${gameweek}: ${manager1TeamName} vs ${manager2TeamName}`);
    try {
        // Fetch all data in parallel
        const [picks1, picks2, liveData, bootstrapData] = await Promise.all([
            fetchManagerPicks(manager1Entry, gameweek),
            fetchManagerPicks(manager2Entry, gameweek),
            fetchLiveGameweekData(gameweek),
            fetchBootstrapData()
        ]);
        // Create player info map
        const playerInfo = new Map();
        bootstrapData.elements.forEach((player) => {
            playerInfo.set(player.id, {
                id: player.id,
                web_name: player.web_name,
                team: player.team,
                element_type: player.element_type,
                now_cost: player.now_cost
            });
        });
        return {
            manager1Entry,
            manager1Name,
            manager1TeamName,
            manager1Picks: picks1,
            manager1Points,
            manager2Entry,
            manager2Name,
            manager2TeamName,
            manager2Picks: picks2,
            manager2Points,
            gameweek,
            liveData,
            playerInfo,
            teams: bootstrapData.teams
        };
    }
    catch (error) {
        console.error('❌ Error fetching match details:', error);
        throw error;
    }
}
/**
 * Enriches match data with captain and chip information
 * Returns an object with captain names and chips for both managers
 */
export async function fetchMatchCaptainAndChip(manager1Entry, manager2Entry, gameweek) {
    try {
        // Fetch picks for both managers in parallel
        const [picks1, picks2, bootstrapData] = await Promise.all([
            fetchManagerPicks(manager1Entry, gameweek),
            fetchManagerPicks(manager2Entry, gameweek),
            fetchBootstrapData()
        ]);
        // Create player info map
        const playerInfo = new Map();
        bootstrapData.elements.forEach((player) => {
            playerInfo.set(player.id, {
                web_name: player.web_name
            });
        });
        // Find captains
        const captain1Pick = picks1.picks.find((p) => p.is_captain);
        const captain2Pick = picks2.picks.find((p) => p.is_captain);
        const manager1Captain = captain1Pick ? playerInfo.get(captain1Pick.element)?.web_name || 'Unknown' : 'Unknown';
        const manager2Captain = captain2Pick ? playerInfo.get(captain2Pick.element)?.web_name || 'Unknown' : 'Unknown';
        return {
            manager1Captain,
            manager1Chip: picks1.active_chip || null,
            manager2Captain,
            manager2Chip: picks2.active_chip || null
        };
    }
    catch (error) {
        console.error(`⚠️ Failed to fetch captain/chip data for match:`, error);
        return null;
    }
}
//# sourceMappingURL=api.js.map