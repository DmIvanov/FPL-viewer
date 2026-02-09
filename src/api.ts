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
 * Fetches all H2H matches with pagination
 * Loops through all pages until has_next is false
 */
export async function fetchH2HMatches(): Promise<LeagueDataModel> {
    console.log('🔍 Fetching H2H League matches with pagination...');
    
    const allMatches: H2HMatch[] = [];
    let currentPage = 1;
    let hasNext = true;
    
    while (hasNext) {
        try {
            const pageUrl = `${H2H_API_BASE_URL}?page=${currentPage}`;
            console.log(`📄 Fetching page ${currentPage}: ${pageUrl}`);
            
            // Try CORS proxies for this page
            let pageData: H2HMatchesResponse | null = null;
            
            for (let i = 0; i < CORS_PROXIES.length; i++) {
                const proxyUrl = CORS_PROXIES[i];
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
                    
                    // Validate response structure
                    if (data && typeof data === 'object' && Array.isArray(data.results)) {
                        pageData = data as H2HMatchesResponse;
                        console.log(`✅ Page ${currentPage}: Found ${data.results.length} matches`);
                        break; // Success, exit proxy loop
                    } else {
                        throw new Error('Invalid response structure');
                    }
                    
                } catch (error) {
                    console.warn(`❌ Proxy ${i + 1} failed for page ${currentPage}:`, error);
                    if (i === CORS_PROXIES.length - 1) {
                        throw new Error(`All proxies failed for page ${currentPage}`);
                    }
                }
            }
            
            if (!pageData) {
                throw new Error(`Failed to fetch page ${currentPage}`);
            }
            
            // Add matches from this page to our collection
            allMatches.push(...pageData.results);
            
            // Check if there are more pages
            hasNext = pageData.has_next || false;
            currentPage++;
            
            // Small delay to avoid rate limiting
            if (hasNext) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
        } catch (error) {
            console.error(`🚫 Error fetching H2H matches at page ${currentPage}:`, error);
            throw error;
        }
    }
    
    console.log(`🏆 Successfully fetched all H2H matches: ${allMatches.length} total matches`);
    
    return {
        matches: allMatches,
        totalMatches: allMatches.length,
        lastUpdated: new Date()
    };
}
