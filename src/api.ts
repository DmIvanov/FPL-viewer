// ===== API & NETWORKING LAYER =====

import type { FPLLeagueStandings, H2HMatchesResponse, H2HMatch, LeagueDataModel } from './types.js';

const FPL_API_URL = 'https://fantasy.premierleague.com/api/leagues-classic/841567/standings/';
const H2H_LEAGUE_ID = 154959;
const H2H_API_BASE_URL = `https://fantasy.premierleague.com/api/leagues-h2h-matches/league/${H2H_LEAGUE_ID}`;

const CORS_PROXIES = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
];

// Cache for API responses
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedLeagueData: { data: LeagueDataModel; timestamp: number } | null = null;
let workingProxyIndex: number = 0; // Remember which proxy works

/**
 * Fetches real FPL data from the Fantasy Premier League API
 * Uses multiple CORS proxy services for reliability
 */
export async function fetchRealFPLData(): Promise<FPLLeagueStandings> {
    console.log('🔍 Testing CORS proxies for FPL API access...');
    
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        const proxyUrl = CORS_PROXIES[i];
        
        if (!proxyUrl) continue;
        
        try {
            console.log(`🔄 Attempting CORS proxy ${i + 1}/${CORS_PROXIES.length}: ${proxyUrl}`);
            
            let fetchUrl: string;
            let processResponse: (response: Response) => Promise<any>;
            
            if (proxyUrl.includes('allorigins')) {
                // AllOrigins returns data wrapped in a contents field
                fetchUrl = `${proxyUrl}${encodeURIComponent(FPL_API_URL)}`;
                processResponse = async (response: Response) => {
                    const data = await response.json();
                    console.log('📦 AllOrigins raw response:', data);
                    return JSON.parse(data.contents);
                };
            } else {
                // Other proxies return data directly
                fetchUrl = `${proxyUrl}${FPL_API_URL}`;
                processResponse = async (response: Response) => {
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
                return data as FPLLeagueStandings;
            } else {
                console.warn('⚠️ Invalid response structure from proxy:', data);
                throw new Error('Invalid response structure');
            }
            
        } catch (error) {
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
 */
async function fetchH2HPage(pageNumber: number): Promise<H2HMatchesResponse> {
    const pageUrl = `${H2H_API_BASE_URL}?page=${pageNumber}`;
    
    // Try working proxy first, then others
    const proxyOrder = [
        ...CORS_PROXIES.slice(workingProxyIndex),
        ...CORS_PROXIES.slice(0, workingProxyIndex)
    ];
    
    for (let i = 0; i < proxyOrder.length; i++) {
        const proxyUrl = proxyOrder[i];
        if (!proxyUrl) continue;
        
        try {
            let fetchUrl: string;
            let processResponse: (response: Response) => Promise<any>;
            
            if (proxyUrl.includes('allorigins')) {
                fetchUrl = `${proxyUrl}${encodeURIComponent(pageUrl)}`;
                processResponse = async (response: Response) => {
                    const data = await response.json();
                    return JSON.parse(data.contents);
                };
            } else {
                fetchUrl = `${proxyUrl}${pageUrl}`;
                processResponse = async (response: Response) => {
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
                return data as H2HMatchesResponse;
            } else {
                throw new Error('Invalid response structure');
            }
            
        } catch (error) {
            if (i === proxyOrder.length - 1) {
                throw new Error(`All proxies failed for page ${pageNumber}`);
            }
        }
    }
    
    throw new Error(`Failed to fetch page ${pageNumber}`);
}

/**
 * Fetches all H2H matches with parallel pagination and caching
 * Supports progressive callback for updating UI as data arrives
 */
export async function fetchH2HMatches(
    onProgress?: (matches: H2HMatch[], isComplete: boolean) => void
): Promise<LeagueDataModel> {
    // Check cache first
    if (cachedLeagueData && (Date.now() - cachedLeagueData.timestamp) < CACHE_DURATION) {
        console.log('✨ Using cached League data');
        if (onProgress) {
            onProgress(cachedLeagueData.data.matches, true);
        }
        return cachedLeagueData.data;
    }
    
    console.log('🔍 Fetching H2H League matches with parallel pagination...');
    
    const allMatches: H2HMatch[] = [];
    
    // First, fetch page 1 to determine total pages
    const firstPage = await fetchH2HPage(1);
    allMatches.push(...firstPage.results);
    console.log(`✅ Page 1: Found ${firstPage.results.length} matches`);
    
    // Notify progress
    if (onProgress) {
        onProgress([...allMatches], !firstPage.has_next);
    }
    
    // If there are more pages, fetch them in parallel (batches of 3)
    if (firstPage.has_next) {
        let currentPage = 2;
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
                const pageResults = await Promise.all(
                    pagesToFetch.map(pageNum => 
                        fetchH2HPage(pageNum).catch(err => {
                            console.warn(`⚠️ Page ${pageNum} failed:`, err);
                            return null;
                        })
                    )
                );
                
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
                        
                        // Notify progress after each batch
                        if (onProgress) {
                            onProgress([...allMatches], !hasNext);
                        }
                    } else {
                        // If we get a null result, assume we've reached the end
                        break;
                    }
                }
                
                currentPage += BATCH_SIZE;
                
            } catch (error) {
                console.error('🚫 Error in parallel fetch:', error);
                hasNext = false;
            }
        }
    }
    
    console.log(`🏆 Successfully fetched all H2H matches: ${allMatches.length} total matches`);
    
    const result: LeagueDataModel = {
        matches: allMatches,
        totalMatches: allMatches.length,
        lastUpdated: new Date()
    };
    
    // Cache the result
    cachedLeagueData = {
        data: result,
        timestamp: Date.now()
    };
    
    return result;
}

/**
 * Clears the cached league data (useful for manual refresh)
 */
export function clearLeagueCache(): void {
    cachedLeagueData = null;
    console.log('🗑️ League cache cleared');
}
