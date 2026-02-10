// ===== MAIN APPLICATION ENTRY POINT =====

// Import types
import type { FPLManager } from './types.js';

// Import API layer
import { fetchRealFPLData, fetchH2HMatches, clearLeagueCache } from './api.js';

// Import view models builder
import { buildLeagueViewModels } from './viewModels.js';

// Import UI layer
import {
    setupMobileMenu,
    setupSmoothScrolling,
    setupIntersectionObserver,
    setupKeyboardAccessibility,
    setupResizeHandler,
    initializeFPLFeatures,
    initializeTabSwitching,
    setupTabSwitchingListeners,
    showLoadingState,
    populateCupTable,
    showLeagueLoadingState,
    hideLeagueLoadingState,
    setupLeagueSubtabs
} from './ui.js';

// Import utilities
import { debounce } from './utils.js';

// ===== WEBSITE INITIALIZATION =====

// Wait for the page to fully load before running TypeScript
document.addEventListener('DOMContentLoaded', (): void => {
    console.log('🚀 Website loaded successfully with TypeScript!');
    initializeWebsite();
});

// Main initialization function
function initializeWebsite(): void {
    setupMobileMenu();
    setupSmoothScrolling();
    setupIntersectionObserver();
    setupKeyboardAccessibility();
    setupResizeHandler(debounce);
    initializeFPLFeatures();
    initializeTabSwitching(fetchCupStandings);
    setupTabSwitchingListeners(fetchCupStandings, fetchLeagueData);
    setupRefreshButton();
    
    // Auto-load League data on page load
    console.log('🔄 Auto-loading League data on page load...');
    fetchLeagueData();
}

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', (): void => {
    const loadTime: number = performance.now();
    console.log(`⚡ TypeScript page loaded in ${Math.round(loadTime)}ms`);
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (event: ErrorEvent): void => {
    console.error('❌ TypeScript Error:', event.error);
    // In a real project, you might want to report this to an error tracking service
});

// ===== DATA FETCHING & COORDINATION =====

/**
 * Sets up the refresh button for League data
 */
function setupRefreshButton(): void {
    const refreshBtn = document.getElementById('refresh-league-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('🔄 Manual refresh triggered');
            fetchLeagueData(true);
        });
    }
}

/**
 * Fetches Cup standings and updates the UI
 * Coordinates between the API layer and UI layer
 */
async function fetchCupStandings(): Promise<void> {
    const tableBody: HTMLElement | null = document.getElementById('cup-table-body');
    
    if (!tableBody) {
        console.log('❌ Cup table body not found');
        return;
    }
    
    // Show loading state (UI layer)
    showLoadingState();
    
    try {
        console.log('🚀 Fetching real FPL data from API...');
        
        // Fetch data from API (Network layer)
        const data = await fetchRealFPLData();
        
        if (data && data.standings && data.standings.results) {
            console.log(`✅ Successfully loaded ${data.standings.results.length} managers from live FPL API`);
            // Update UI with fetched data
            populateCupTable(data.standings.results);
        } else {
            throw new Error('Invalid data structure received');
        }
        
    } catch (error) {
        console.warn('⚠️ Real API failed, falling back to mock data:', error);
        
        // Fallback to mock data if API fails
        const mockManagers: FPLManager[] = [
            {id: 1, entry: 942090, rank: 1, player_name: "Sergey Karpin", entry_name: "underdog", total: 1067, event_total: 47, last_rank: 1, rank_sort: 1},
            {id: 2, entry: 1193330, rank: 2, player_name: "Alex Matveev", entry_name: "FC Matveev", total: 928, event_total: 37, last_rank: 2, rank_sort: 2},
            {id: 3, entry: 1569289, rank: 3, player_name: "Igor Livenko", entry_name: "Livenko United", total: 884, event_total: 52, last_rank: 3, rank_sort: 3}
        ];
        
        populateCupTable(mockManagers);
        console.log('✅ Cup standings loaded with mock data');
    }
}

/**
 * Fetches League H2H data and updates the UI progressively
 * Coordinates between the API layer and UI layer for the League tab
 */
async function fetchLeagueData(forceRefresh: boolean = false): Promise<void> {
    console.log(`🏆 Fetching League H2H data${forceRefresh ? ' (force refresh)' : ''}...`);
    
    // Clear cache if force refresh
    if (forceRefresh) {
        clearLeagueCache();
        
        // Clear chart initialization flag to allow re-rendering
        const statisticsContent = document.getElementById('statistics-content');
        if (statisticsContent) {
            statisticsContent.removeAttribute('data-charts-initialized');
        }
    }
    
    // Show loading state (UI layer)
    showLeagueLoadingState();
    
    try {
        // Fetch H2H matches with progressive updates
        const leagueData = await fetchH2HMatches((matches, isComplete) => {
            // If complete, build view models and populate all tabs
            if (isComplete) {
                const viewModels = buildLeagueViewModels(matches);
                const progressData = {
                    matches,
                    totalMatches: matches.length,
                    lastUpdated: new Date(),
                    viewModels
                };
                setupLeagueSubtabs(progressData);
            }
        });
        
        console.log(`✅ Successfully loaded ${leagueData.matches.length} H2H matches`);
        
        // Build view models from complete data
        const viewModels = buildLeagueViewModels(leagueData.matches);
        console.log('✅ View models built:', {
            standings: viewModels.standings.length,
            matches: viewModels.matches.length,
            charts: {
                absolute: viewModels.charts.absoluteManagers.length,
                relative: viewModels.charts.relativeManagers.length
            }
        });
        
        // Attach view models to league data
        leagueData.viewModels = viewModels;
        
        // Final setup with complete data and view models
        setupLeagueSubtabs(leagueData);
        
        // Hide loading state
        hideLeagueLoadingState();
        
    } catch (error) {
        console.error('❌ Failed to load League data:', error);
        hideLeagueLoadingState();
        
        // Show error message to user in standings content
        const standingsContent = document.getElementById('standings-content');
        if (standingsContent) {
            standingsContent.innerHTML = `
                <div class="error-message">
                    <h3>Unable to load League data</h3>
                    <p>Please check your internet connection and try again.</p>
                    <button id="retry-league-btn" class="btn-primary">Retry</button>
                </div>
            `;
            
            // Add retry handler
            const retryBtn = document.getElementById('retry-league-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => fetchLeagueData(true));
            }
        }
    }
}

console.log('⚽ FPL Analytics Dashboard loaded and ready!');