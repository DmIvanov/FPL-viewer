// ===== UI LAYER =====
import { ChartRenderer } from './chartRenderer.js';
/**
 * Escapes HTML to prevent XSS attacks
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
/**
 * Gets rank change indicator emoji
 */
export function getRankChangeIndicator(currentRank, lastRank) {
    if (currentRank < lastRank) {
        return '<span class="rank-up">⬆️</span>';
    }
    else if (currentRank > lastRank) {
        return '<span class="rank-down">⬇️</span>';
    }
    else {
        return '<span class="rank-same">➡️</span>';
    }
}
/**
 * Gets CSS class based on rank position
 */
export function getRankClass(rank) {
    if (rank === 1)
        return 'first-place';
    if (rank <= 3)
        return 'top-three';
    if (rank <= 5)
        return 'top-five';
    return 'other-rank';
}
/**
 * Populates the Cup table with manager data
 */
export function populateCupTable(managers) {
    const tableBody = document.getElementById('cup-table-body');
    if (!tableBody)
        return;
    const rows = managers.map((manager) => {
        const rankChange = getRankChangeIndicator(manager.rank, manager.last_rank);
        const rankClass = getRankClass(manager.rank);
        return `
            <tr class="cup-row ${rankClass}">
                <td class="position">
                    <span class="rank-number">${manager.rank}</span>
                    ${rankChange}
                </td>
                <td class="manager-name">${escapeHtml(manager.player_name)}</td>
                <td class="team-name">${escapeHtml(manager.entry_name)}</td>
                <td class="total-points">${manager.total.toLocaleString()}</td>
                <td class="gw-points">${manager.event_total}</td>
                <td class="last-rank">${manager.last_rank}</td>
            </tr>
        `;
    });
    tableBody.innerHTML = rows.join('');
    // Add hover effects
    document.querySelectorAll('.cup-row').forEach((row) => {
        row.addEventListener('mouseenter', () => {
            row.style.transform = 'scale(1.02)';
            row.style.transition = 'transform 0.2s ease';
        });
        row.addEventListener('mouseleave', () => {
            row.style.transform = 'scale(1)';
        });
    });
}
/**
 * Shows loading state in the Cup table
 */
export function showLoadingState() {
    const tableBody = document.getElementById('cup-table-body');
    if (!tableBody)
        return;
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 2rem;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">⏳</span>
                    <span>Loading real FPL data...</span>
                </div>
            </td>
        </tr>
    `;
}
/**
 * Sets up mobile navigation menu
 */
export function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (!hamburger || !navMenu)
        return;
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    // Close menu when clicking on a nav link
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!hamburger.contains(target) && !navMenu.contains(target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}
/**
 * Sets up smooth scrolling for navigation links
 */
export function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            if (!targetId)
                return;
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const header = document.querySelector('.header');
                const headerHeight = header?.offsetHeight || 0;
                const targetPosition = targetSection.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
/**
 * Sets up intersection observer for scroll animations
 */
export function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    // Observe elements for animation
    document.querySelectorAll('.about-card, .contact-form, .progress-item')
        .forEach((el) => {
        observer.observe(el);
    });
}
/**
 * Initializes FPL-specific UI features
 */
export function initializeFPLFeatures() {
    console.log('🏆 FPL features initialized successfully!');
}
/**
 * Initializes tab switching functionality
 */
export function initializeTabSwitching(_onCupTabClick) {
    console.log('🔧 Initializing tab switching...');
    // Add active class to League tab
    const leagueLink = document.querySelector('a[href="#league"]');
    console.log('League link found:', leagueLink);
    if (leagueLink) {
        leagueLink.classList.add('active');
        console.log('✅ Added active class to League tab');
    }
    // Verify sections exist
    const leagueSection = document.getElementById('league');
    const cupSection = document.getElementById('cup');
    console.log('League section:', leagueSection, 'has active class:', leagueSection?.classList.contains('active'));
    console.log('Cup section:', cupSection, 'has active class:', cupSection?.classList.contains('active'));
    console.log('🔧 Tab switching initialized - League section visible by default');
}
/**
 * Sets up tab switching event listeners
 */
export function setupTabSwitchingListeners(onCupTabClick, onLeagueTabClick) {
    let leagueDataLoaded = false;
    const navLinks = document.querySelectorAll('.nav-link');
    console.log(`🔗 Setting up tab switching for ${navLinks.length} nav links`);
    document.querySelectorAll('.nav-link').forEach((link) => {
        console.log('Adding listener to:', link.textContent, link.getAttribute('href'));
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href')?.substring(1) || '';
            console.log(`🖱️ Tab clicked: ${targetId}`);
            // Hide all tab sections
            document.querySelectorAll('.tab-section').forEach((section) => {
                section.classList.remove('active');
                console.log('Removed active from:', section.id);
            });
            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('✅ Added active to:', targetId);
            }
            else {
                console.error('❌ Target section not found:', targetId);
            }
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach((l) => {
                l.classList.remove('active');
            });
            link.classList.add('active');
            // Auto-load Cup data when Cup tab is clicked
            if (targetId === 'cup') {
                console.log('Auto-loading Cup data...');
                onCupTabClick();
            }
            // Auto-load League data when League tab is clicked (only once)
            if (targetId === 'league' && onLeagueTabClick && !leagueDataLoaded) {
                console.log('Auto-loading League data...');
                onLeagueTabClick();
                leagueDataLoaded = true;
            }
            console.log('Switched to tab:', targetId);
        });
    });
}
/**
 * Sets up keyboard accessibility handlers
 */
export function setupKeyboardAccessibility() {
    document.addEventListener('keydown', (event) => {
        // Close mobile menu with Escape key
        if (event.key === 'Escape') {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    });
}
/**
 * Sets up window resize handler for responsive adjustments
 */
export function setupResizeHandler(debounce) {
    window.addEventListener('resize', debounce(() => {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    }, 250));
}
// ===== LEAGUE UI FUNCTIONS =====
/**
 * Shows loading state in the League section
 */
export function showLeagueLoadingState() {
    const loadingIndicator = document.getElementById('league-loading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}
/**
 * Hides loading state in the League section
 */
export function hideLeagueLoadingState() {
    const loadingIndicator = document.getElementById('league-loading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}
/**
 * Sets up League subtab switching
 */
export function setupLeagueSubtabs(leagueData) {
    const subtabButtons = document.querySelectorAll('.subtab-btn');
    const leaguePages = document.querySelectorAll('.league-page');
    // Populate initial active page
    const activeButton = document.querySelector('.subtab-btn.active');
    if (activeButton && leagueData) {
        const initialPage = activeButton.getAttribute('data-page');
        if (initialPage) {
            populateLeaguePage(initialPage, leagueData);
        }
    }
    subtabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetPage = button.getAttribute('data-page');
            // Update active button
            subtabButtons.forEach((btn) => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            // Show corresponding page
            leaguePages.forEach((page) => {
                page.classList.remove('active');
            });
            const targetPageElement = document.getElementById(`league-${targetPage}`);
            if (targetPageElement) {
                targetPageElement.classList.add('active');
                // Populate page content if data is available
                if (leagueData) {
                    populateLeaguePage(targetPage, leagueData);
                }
            }
            console.log(`📄 Switched to League subtab: ${targetPage}`);
        });
    });
}
/**
 * Populates content for a specific League page
 */
function populateLeaguePage(pageName, data) {
    if (!pageName)
        return;
    console.log(`📄 Populating page: ${pageName}`);
    const contentElement = document.getElementById(`${pageName}-content`);
    if (!contentElement) {
        console.error(`❌ Content element not found: ${pageName}-content`);
        return;
    }
    switch (pageName) {
        case 'standings':
            populateStandingsPage(contentElement, data);
            break;
        case 'matches':
            populateMatchesPage(contentElement, data);
            break;
        case 'statistics':
            populateStatisticsPage(contentElement, data);
            break;
        case 'history':
            populateHistoryPage(contentElement, data);
            break;
        default:
            console.warn(`⚠️ Unknown page: ${pageName}`);
    }
}
/**
 * Populates Standings page
 */
function populateStandingsPage(element, data) {
    // Hide loading indicator first
    const loadingIndicator = element.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('active');
    }
    // Use pre-built standings from view models
    if (!data.viewModels) {
        console.error('❌ No view models available for standings');
        return;
    }
    const standings = data.viewModels.standings;
    let html = `
        <div class="standings-container">
            <div class="league-table-wrapper">
                <table class="league-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Manager</th>
                            <th>Team</th>
                            <th>Points</th>
                            <th>Total Pts</th>
                            <th>W</th>
                            <th>D</th>
                            <th>L</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    standings.forEach((manager, index) => {
        html += `
            <tr>
                <td class="rank">${index + 1}</td>
                <td class="manager-name">${escapeHtml(manager.playerName)}</td>
                <td class="team-name">${escapeHtml(manager.teamName)}</td>
                <td class="league-points"><strong>${manager.leaguePoints}</strong></td>
                <td class="total-points">${manager.totalPoints}</td>
                <td class="wins">${manager.wins}</td>
                <td class="draws">${manager.draws}</td>
                <td class="losses">${manager.losses}</td>
            </tr>
        `;
    });
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    element.innerHTML = html;
}
/**
 * Populates Matches page
 */
function populateMatchesPage(element, data) {
    // Hide loading indicator if present
    const loadingIndicator = element.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('active');
    }
    // Use pre-built matches view model
    if (!data.viewModels) {
        console.error('❌ No view models available for matches');
        return;
    }
    const matchViewModels = data.viewModels.matches;
    // Get unique managers from view models
    const managersSet = new Set();
    matchViewModels.forEach(match => {
        managersSet.add(match.manager1TeamName);
        managersSet.add(match.manager2TeamName);
    });
    const managers = Array.from(managersSet).sort();
    // Get all gameweeks sorted descending
    const gameweeks = Array.from(new Set(matchViewModels.map(m => m.gameWeek))).sort((a, b) => b - a);
    // Find last gameweek with played matches
    const currentGameweek = matchViewModels
        .filter(m => m.result !== 'pending')
        .reduce((max, match) => Math.max(max, match.gameWeek), 0);
    // If no played matches found, use the latest gameweek
    const defaultGameweek = currentGameweek > 0 ? currentGameweek : (gameweeks[0] || 1);
    // Create filter UI
    let html = `
        <div class="matches-filters">
            <div class="filter-group">
                <label for="gameweek-filter">Filter by Gameweek:</label>
                <select id="gameweek-filter" class="filter-select">
                    <option value="all">All Gameweeks</option>
                    ${gameweeks.map(gw => {
        const isCurrent = gw === currentGameweek && currentGameweek > 0;
        const label = `Gameweek ${gw}${isCurrent ? ' (current)' : ''}`;
        return `<option value="${gw}" ${gw === defaultGameweek ? 'selected' : ''}>${label}</option>`;
    }).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label for="manager-filter">Filter by Manager:</label>
                <select id="manager-filter" class="filter-select">
                    <option value="all">All Managers</option>
                    ${managers.map(manager => `<option value="${escapeHtml(manager)}">${escapeHtml(manager)}</option>`).join('')}
                </select>
            </div>
        </div>
        <div id="matches-display" class="matches-list"></div>
    `;
    element.innerHTML = html;
    // Render matches with default filter (default gameweek)
    renderFilteredMatches(matchViewModels, String(defaultGameweek), 'all');
    // Setup filter event listeners
    const gameweekFilter = document.getElementById('gameweek-filter');
    const managerFilter = document.getElementById('manager-filter');
    if (gameweekFilter && managerFilter) {
        gameweekFilter.addEventListener('change', () => {
            // Reset manager filter when gameweek changes
            if (gameweekFilter.value !== 'all') {
                managerFilter.value = 'all';
            }
            renderFilteredMatches(matchViewModels, gameweekFilter.value, managerFilter.value);
        });
        managerFilter.addEventListener('change', () => {
            // Reset gameweek filter when manager changes
            if (managerFilter.value !== 'all') {
                gameweekFilter.value = 'all';
            }
            renderFilteredMatches(matchViewModels, gameweekFilter.value, managerFilter.value);
        });
    }
}
/**
 * Renders matches based on filter criteria
 */
function renderFilteredMatches(matches, gameweekFilter, managerFilter) {
    const displayElement = document.getElementById('matches-display');
    if (!displayElement)
        return;
    // Filter matches based on criteria
    let filteredMatches = matches;
    if (gameweekFilter !== 'all') {
        const gw = parseInt(gameweekFilter);
        filteredMatches = filteredMatches.filter(m => m.gameWeek === gw);
    }
    if (managerFilter !== 'all') {
        filteredMatches = filteredMatches.filter(m => m.manager1TeamName === managerFilter || m.manager2TeamName === managerFilter);
    }
    // Group by gameweek if showing multiple gameweeks
    const matchesByGameweek = groupMatchesByGameweek(filteredMatches);
    let html = '';
    if (filteredMatches.length === 0) {
        html = '<div class="no-matches"><p>No matches found for selected filters.</p></div>';
    }
    else {
        Object.keys(matchesByGameweek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(gwStr => {
            const gw = parseInt(gwStr);
            const gwMatches = matchesByGameweek[gw];
            if (!gwMatches)
                return;
            html += `
                <div class="gameweek-section">
                    <h4>Gameweek ${gw}</h4>
                    <div class="matches-grid">
            `;
            gwMatches.forEach((match) => {
                // Highlight the filtered manager if applicable
                const isEntry1Highlighted = managerFilter !== 'all' && match.manager1TeamName === managerFilter;
                const isEntry2Highlighted = managerFilter !== 'all' && match.manager2TeamName === managerFilter;
                html += `
                    <div class="match-card">
                        <div class="match-entry ${match.result === 'win1' ? 'winner' : ''} ${isEntry1Highlighted ? 'highlighted' : ''}">
                            <span class="team-name">${escapeHtml(match.manager1TeamName)}</span>
                            <span class="points">${match.manager1Points}</span>
                        </div>
                        <div class="match-vs">vs</div>
                        <div class="match-entry ${match.result === 'win2' ? 'winner' : ''} ${isEntry2Highlighted ? 'highlighted' : ''}">
                            <span class="team-name">${escapeHtml(match.manager2TeamName)}</span>
                            <span class="points">${match.manager2Points}</span>
                        </div>
                    </div>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        });
    }
    displayElement.innerHTML = html;
}
/**
 * Populates Charts page
 */
/**
 * Populates Charts page with charts
 */
// Global chart renderer instances to manage lifecycle
let absoluteChartRenderer = null;
let relativeChartRenderer = null;
function populateStatisticsPage(element, data) {
    console.log('📊 Populating Charts page...');
    // Hide loading indicator if present
    const loadingIndicator = element.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('active');
    }
    // Destroy any existing chart instances before recreating HTML
    if (absoluteChartRenderer) {
        absoluteChartRenderer.destroy();
        absoluteChartRenderer = null;
    }
    if (relativeChartRenderer) {
        relativeChartRenderer.destroy();
        relativeChartRenderer = null;
    }
    // Create chart HTML structure
    element.innerHTML = `
        <div class="statistics-container">
            <div class="chart-type-selector">
                <button class="chart-type-btn active" data-chart-type="absolute">Absolute</button>
                <button class="chart-type-btn" data-chart-type="relative">Relative</button>
            </div>
            
            <div class="chart-section" id="absolute-chart-section">
                <div class="chart-canvas-wrapper">
                    <canvas id="absolute-chart"></canvas>
                </div>
                <div id="absolute-legend" class="chart-legend"></div>
            </div>
            
            <div class="chart-section hidden" id="relative-chart-section">
                <div class="chart-canvas-wrapper">
                    <canvas id="relative-chart"></canvas>
                </div>
                <div id="relative-legend" class="chart-legend"></div>
            </div>
        </div>
    `;
    // Wait for DOM to be ready, then render charts
    setTimeout(() => {
        try {
            // Check if Chart.js is loaded
            if (typeof Chart === 'undefined') {
                console.error('❌ Chart.js library not loaded');
                element.innerHTML = `
                    <div class="error-message">
                        <h3>Chart library not loaded</h3>
                        <p>Please refresh the page to load the chart library.</p>
                    </div>
                `;
                return;
            }
            console.log('✅ Chart.js loaded, using pre-built chart data...');
            // Use pre-built chart data from view models
            if (!data.viewModels) {
                console.error('❌ No view models available for charts');
                return;
            }
            const chartData = data.viewModels.charts;
            console.log(`📈 Using chart data for ${chartData.absoluteManagers.length} managers`);
            // Create chart renderers (store globally for lifecycle management)
            absoluteChartRenderer = new ChartRenderer();
            relativeChartRenderer = new ChartRenderer();
            // Render absolute chart (default view)
            console.log('🎨 Rendering absolute chart...');
            absoluteChartRenderer.renderChart('absolute-chart', chartData.absoluteManagers, 'absolute', 'absolute-legend');
            // Setup chart type switching
            const chartTypeButtons = element.querySelectorAll('.chart-type-btn');
            chartTypeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const chartType = button.getAttribute('data-chart-type');
                    // Update active button
                    chartTypeButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    // Show/hide chart sections
                    const absoluteSection = document.getElementById('absolute-chart-section');
                    const relativeSection = document.getElementById('relative-chart-section');
                    if (chartType === 'absolute') {
                        absoluteSection?.classList.remove('hidden');
                        relativeSection?.classList.add('hidden');
                        // Render absolute chart if not already rendered
                        if (!absoluteSection?.hasAttribute('data-rendered') && absoluteChartRenderer) {
                            absoluteChartRenderer.renderChart('absolute-chart', chartData.absoluteManagers, 'absolute', 'absolute-legend');
                            absoluteSection?.setAttribute('data-rendered', 'true');
                        }
                    }
                    else {
                        absoluteSection?.classList.add('hidden');
                        relativeSection?.classList.remove('hidden');
                        // Always render relative chart when switching to it (to handle data updates)
                        if (relativeChartRenderer) {
                            relativeChartRenderer.renderChart('relative-chart', chartData.relativeManagers, 'relative', 'relative-legend');
                        }
                    }
                });
            });
            // Mark absolute chart as rendered
            const absoluteSection = document.getElementById('absolute-chart-section');
            absoluteSection?.setAttribute('data-rendered', 'true');
            // Mark the statistics page as initialized
            element.setAttribute('data-charts-initialized', 'true');
            console.log('✅ Charts page populated successfully');
        }
        catch (error) {
            console.error('❌ Error rendering charts:', error);
            element.innerHTML = `
                <div class="error-message">
                    <h3>Error loading charts</h3>
                    <p>An error occurred while rendering the charts. Please try again.</p>
                    <p style="font-size: 0.85em; color: var(--text-secondary);">${error}</p>
                </div>
            `;
        }
    }, 100);
}
/**
 * Populates History page
 */
function populateHistoryPage(element, _data) {
    element.innerHTML = `
        <div class="history-container">
            <p>📜 Historical trends and patterns will be shown here.</p>
        </div>
    `;
}
/**
 * Helper function to group matches by gameweek
 */
function groupMatchesByGameweek(matches) {
    const grouped = {};
    matches.forEach(match => {
        const gameWeek = match.gameWeek;
        if (!grouped[gameWeek]) {
            grouped[gameWeek] = [];
        }
        grouped[gameWeek].push(match);
    });
    return grouped;
}
//# sourceMappingURL=ui.js.map