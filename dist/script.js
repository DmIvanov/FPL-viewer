// ===== MAIN APPLICATION ENTRY POINT =====
// Import API layer
import { fetchRealFPLData } from './api.js';
// Import UI layer
import { setupMobileMenu, setupSmoothScrolling, setupIntersectionObserver, setupKeyboardAccessibility, setupResizeHandler, initializeFPLFeatures, initializeTabSwitching, setupTabSwitchingListeners, showLoadingState, populateCupTable } from './ui.js';
// Import utilities
import { debounce } from './utils.js';
// ===== WEBSITE INITIALIZATION =====
// Wait for the page to fully load before running TypeScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Website loaded successfully with TypeScript!');
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
    setupTabSwitchingListeners(fetchCupStandings);
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
console.log('⚽ FPL Analytics Dashboard loaded and ready!');
//# sourceMappingURL=script.js.map