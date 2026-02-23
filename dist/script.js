// ===== MAIN APPLICATION ENTRY POINT =====
// Import API layer
import { fetchRealFPLData, fetchH2HMatches, fetchH2HStandings, clearLeagueCache } from './api.js';
// Import view models builder
import { buildLeagueViewModels, buildStandingsOnlyViewModel } from './viewModels.js';
// Import UI layer
import { setupMobileMenu, setupSmoothScrolling, setupIntersectionObserver, setupKeyboardAccessibility, setupResizeHandler, initializeFPLFeatures, initializeTabSwitching, setupTabSwitchingListeners, showLoadingState, populateCupTable, showLeagueLoadingState, hideLeagueLoadingState, setupLeagueSubtabs } from './ui.js';
// Import utilities
import { debounce } from './utils.js';
// ===== WEBSITE INITIALIZATION =====
// Wait for the page to fully load before running TypeScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Website loaded successfully with TypeScript!');
    console.log('📍 Base URL:', document.querySelector('base')?.href || 'No base tag');
    console.log('📂 Current location:', window.location.href);
    console.log('🗂️ Script loaded from:', import.meta.url);
    initializeWebsite();
});
// Main initialization function
function initializeWebsite() {
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
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`⚡ TypeScript page loaded in ${Math.round(loadTime)}ms`);
});
// ===== ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('❌ TypeScript Error:', event.error);
    // In a real project, you might want to report this to an error tracking service
});
// ===== DATA FETCHING & COORDINATION =====
// Track if matches have been loaded for lazy loading
let matchesDataLoaded = false;
let currentLeagueData = null;
/**
 * Sets up the refresh button for League data
 */
function setupRefreshButton() {
    const refreshBtn = document.getElementById('refresh-league-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('🔄 Manual refresh triggered');
            matchesDataLoaded = false; // Reset matches loaded flag
            fetchLeagueData(true);
        });
    }
}
/**
 * Fetches Cup standings and updates the UI
 * Coordinates between the API layer and UI layer
 */
async function fetchCupStandings() {
    const tableBody = document.getElementById('cup-table-body');
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
        }
        else {
            throw new Error('Invalid data structure received');
        }
    }
    catch (error) {
        console.warn('⚠️ Real API failed, falling back to mock data:', error);
        // Fallback to mock data if API fails
        const mockManagers = [
            { id: 1, entry: 942090, rank: 1, player_name: "Sergey Karpin", entry_name: "underdog", total: 1067, event_total: 47, last_rank: 1, rank_sort: 1 },
            { id: 2, entry: 1193330, rank: 2, player_name: "Alex Matveev", entry_name: "FC Matveev", total: 928, event_total: 37, last_rank: 2, rank_sort: 2 },
            { id: 3, entry: 1569289, rank: 3, player_name: "Igor Livenko", entry_name: "Livenko United", total: 884, event_total: 52, last_rank: 3, rank_sort: 3 }
        ];
        populateCupTable(mockManagers);
        console.log('✅ Cup standings loaded with mock data');
    }
}
/**
 * Fetches League H2H data using optimized approach:
 * - Fast path: Only load standings for initial view (1 API call)
 * - Lazy loading: Load full matches when needed for Matches/Charts tabs
 */
async function fetchLeagueData(forceRefresh = false) {
    console.log(`🏆 Fetching League H2H data${forceRefresh ? ' (force refresh)' : ''}...`);
    // Clear cache if force refresh
    if (forceRefresh) {
        clearLeagueCache();
        matchesDataLoaded = false;
        currentLeagueData = null;
        // Clear chart initialization flag to allow re-rendering
        const statisticsContent = document.getElementById('statistics-content');
        if (statisticsContent) {
            statisticsContent.removeAttribute('data-charts-initialized');
        }
    }
    // Show loading state (UI layer)
    showLeagueLoadingState();
    try {
        // FAST PATH: Fetch only standings data (single API call)
        console.log('⚡ Using fast path: Loading standings only...');
        const standingsData = await fetchH2HStandings();
        console.log(`✅ Successfully loaded standings for ${standingsData.standings?.length || 0} managers`);
        // Build standings-only view models
        const viewModels = buildStandingsOnlyViewModel(standingsData.standings);
        console.log('✅ Standings view model built');
        // Attach view models to league data
        standingsData.viewModels = viewModels;
        currentLeagueData = standingsData;
        // Setup UI with standings data and lazy-loading callback
        setupLeagueSubtabs(standingsData, loadMatchesData);
        // Hide loading state
        hideLeagueLoadingState();
        console.log('⚡ Fast load complete! Matches will load on-demand.');
    }
    catch (error) {
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
/**
 * Lazy loads full matches data when needed for Matches or Charts tabs
 * Returns the updated league data with matches and full view models
 */
export async function loadMatchesData() {
    // If already loaded, return current data
    if (matchesDataLoaded && currentLeagueData?.matches) {
        console.log('✅ Matches data already loaded');
        return currentLeagueData;
    }
    console.log('📊 Lazy loading matches data...');
    try {
        // Show loading indicator in matches/charts content areas
        const matchesContent = document.getElementById('matches-content');
        const statisticsContent = document.getElementById('statistics-content');
        if (matchesContent) {
            matchesContent.innerHTML = '<div class="loading-indicator active">Loading matches...</div>';
        }
        if (statisticsContent) {
            statisticsContent.innerHTML = '<div class="loading-indicator active">Loading chart data...</div>';
        }
        // Fetch all H2H matches
        const matchesData = await fetchH2HMatches();
        console.log(`✅ Successfully loaded ${matchesData.matches?.length || 0} H2H matches`);
        // Build full view models from matches
        const viewModels = buildLeagueViewModels(matchesData.matches);
        console.log('✅ Full view models built:', {
            standings: viewModels.standings.length,
            matches: viewModels.matches?.length || 0,
            charts: {
                absolute: viewModels.charts?.absoluteManagers.length || 0,
                relative: viewModels.charts?.relativeManagers.length || 0
            }
        });
        // Merge with existing standings data
        if (currentLeagueData && matchesData.matches && matchesData.totalMatches !== undefined) {
            currentLeagueData.matches = matchesData.matches;
            currentLeagueData.totalMatches = matchesData.totalMatches;
            currentLeagueData.viewModels = viewModels;
        }
        else {
            // If no current data, use matches data directly
            matchesData.viewModels = viewModels;
            currentLeagueData = matchesData;
        }
        matchesDataLoaded = true;
        // Re-setup UI with full data and continue using lazy-loading callback
        setupLeagueSubtabs(currentLeagueData, loadMatchesData);
        return currentLeagueData;
    }
    catch (error) {
        console.error('❌ Failed to load matches data:', error);
        // Show error in both matches and charts areas
        const errorHtml = `
            <div class="error-message">
                <h3>Unable to load detailed data</h3>
                <p>Failed to load match details. Please try again.</p>
            </div>
        `;
        const matchesContent = document.getElementById('matches-content');
        const statisticsContent = document.getElementById('statistics-content');
        if (matchesContent)
            matchesContent.innerHTML = errorHtml;
        if (statisticsContent)
            statisticsContent.innerHTML = errorHtml;
        return null;
    }
}
console.log('⚽ FPL Analytics Dashboard loaded and ready!');
//# sourceMappingURL=script.js.map