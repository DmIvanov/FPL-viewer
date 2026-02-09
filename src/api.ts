// ===== API & NETWORKING LAYER =====

import type { FPLLeagueStandings } from './types.js';

const FPL_API_URL = 'https://fantasy.premierleague.com/api/leagues-classic/841567/standings/';

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
