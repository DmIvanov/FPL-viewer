// ===== UI LAYER =====

import type { FPLManager, LeagueDataModel, ChartType } from './types.js';
import type { MatchViewModel } from './viewModels.js';
import { ChartRenderer } from './chartRenderer.js';

// Declare Chart.js global
declare const Chart: any;

/**
 * Escapes HTML to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
    const div: HTMLDivElement = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Gets rank change indicator emoji
 */
export function getRankChangeIndicator(currentRank: number, lastRank: number): string {
    if (currentRank < lastRank) {
        return '<span class="rank-up">⬆️</span>';
    } else if (currentRank > lastRank) {
        return '<span class="rank-down">⬇️</span>';
    } else {
        return '<span class="rank-same">➡️</span>';
    }
}

/**
 * Gets CSS class based on rank position
 */
export function getRankClass(rank: number): string {
    if (rank === 1) return 'first-place';
    if (rank <= 3) return 'top-three';
    if (rank <= 5) return 'top-five';
    return 'other-rank';
}

/**
 * Populates the Cup table with manager data
 */
export function populateCupTable(managers: FPLManager[]): void {
    const tableBody: HTMLElement | null = document.getElementById('cup-table-body');
    if (!tableBody) return;
    
    const rows: string[] = managers.map((manager: FPLManager): string => {
        const rankChange: string = getRankChangeIndicator(manager.rank, manager.last_rank);
        const rankClass: string = getRankClass(manager.rank);
        
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
    document.querySelectorAll<HTMLTableRowElement>('.cup-row').forEach((row: HTMLTableRowElement): void => {
        row.addEventListener('mouseenter', (): void => {
            row.style.transform = 'scale(1.02)';
            row.style.transition = 'transform 0.2s ease';
        });
        
        row.addEventListener('mouseleave', (): void => {
            row.style.transform = 'scale(1)';
        });
    });
}

/**
 * Shows loading state in the Cup table
 */
export function showLoadingState(): void {
    const tableBody: HTMLElement | null = document.getElementById('cup-table-body');
    if (!tableBody) return;
    
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
export function setupMobileMenu(): void {
    const hamburger: HTMLElement | null = document.querySelector('.hamburger');
    const navMenu: HTMLElement | null = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', (): void => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a nav link
    document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((link: HTMLAnchorElement): void => {
        link.addEventListener('click', (): void => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event: MouseEvent): void => {
        const target = event.target as HTMLElement;
        if (!hamburger.contains(target) && !navMenu.contains(target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

/**
 * Sets up smooth scrolling for navigation links
 */
export function setupSmoothScrolling(): void {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor: HTMLAnchorElement): void => {
        anchor.addEventListener('click', (e: MouseEvent): void => {
            e.preventDefault();
            const targetId: string | null = anchor.getAttribute('href');
            
            if (!targetId) return;
            
            const targetSection: HTMLElement | null = document.querySelector(targetId);
            
            if (targetSection) {
                const header: HTMLElement | null = document.querySelector('.header');
                const headerHeight: number = header?.offsetHeight || 0;
                const targetPosition: number = targetSection.offsetTop - headerHeight;
                
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
export function setupIntersectionObserver(): void {
    const observerOptions: IntersectionObserverInit = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer: IntersectionObserver = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]): void => {
            entries.forEach((entry: IntersectionObserverEntry): void => {
                if (entry.isIntersecting) {
                    (entry.target as HTMLElement).classList.add('fade-in');
                }
            });
        },
        observerOptions
    );
    
    // Observe elements for animation
    document.querySelectorAll<HTMLElement>('.about-card, .contact-form, .progress-item')
        .forEach((el: HTMLElement): void => {
            observer.observe(el);
        });
}

/**
 * Initializes FPL-specific UI features
 */
export function initializeFPLFeatures(): void {
    console.log('🏆 FPL features initialized successfully!');
}

/**
 * Initializes tab switching functionality
 */
export function initializeTabSwitching(_onCupTabClick: () => void): void {
    console.log('🔧 Initializing tab switching...');
    
    // Add active class to League tab
    const leagueLink: HTMLAnchorElement | null = document.querySelector('a[href="#league"]');
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
export function setupTabSwitchingListeners(onCupTabClick: () => void, onLeagueTabClick?: () => void): void {
    let leagueDataLoaded = false;
    
    const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-link');
    console.log(`🔗 Setting up tab switching for ${navLinks.length} nav links`);
    
    document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((link: HTMLAnchorElement): void => {
        console.log('Adding listener to:', link.textContent, link.getAttribute('href'));
        
        link.addEventListener('click', (e: MouseEvent): void => {
            e.preventDefault();
            const targetId: string = link.getAttribute('href')?.substring(1) || '';
            
            console.log(`🖱️ Tab clicked: ${targetId}`);
            
            // Hide all tab sections
            document.querySelectorAll('.tab-section').forEach((section: Element) => {
                section.classList.remove('active');
                console.log('Removed active from:', section.id);
            });
            
            // Show target section
            const targetSection: HTMLElement | null = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('✅ Added active to:', targetId);
            } else {
                console.error('❌ Target section not found:', targetId);
            }
            
            // Update active nav link
            document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((l: HTMLAnchorElement): void => {
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
export function setupKeyboardAccessibility(): void {
    document.addEventListener('keydown', (event: KeyboardEvent): void => {
        // Close mobile menu with Escape key
        if (event.key === 'Escape') {
            const hamburger: HTMLElement | null = document.querySelector('.hamburger');
            const navMenu: HTMLElement | null = document.querySelector('.nav-menu');
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
export function setupResizeHandler(debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => (...args: Parameters<T>) => void): void {
    window.addEventListener('resize', debounce((): void => {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            const hamburger: HTMLElement | null = document.querySelector('.hamburger');
            const navMenu: HTMLElement | null = document.querySelector('.nav-menu');
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
export function showLeagueLoadingState(): void {
    const loadingIndicator: HTMLElement | null = document.getElementById('league-loading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

/**
 * Hides loading state in the League section
 */
export function hideLeagueLoadingState(): void {
    const loadingIndicator: HTMLElement | null = document.getElementById('league-loading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Sets up League subtab switching with lazy loading support
 * @param leagueData Initial league data (may only contain standings)
 * @param loadMatchesCallback Optional callback to load matches data when needed
 */
export function setupLeagueSubtabs(
    leagueData: LeagueDataModel | null,
    loadMatchesCallback?: () => Promise<LeagueDataModel | null>
): void {
    const subtabButtons = document.querySelectorAll<HTMLButtonElement>('.subtab-btn');
    const leaguePages = document.querySelectorAll<HTMLElement>('.league-page');
    
    // Populate initial active page
    const activeButton = document.querySelector<HTMLButtonElement>('.subtab-btn.active');
    if (activeButton && leagueData) {
        const initialPage = activeButton.getAttribute('data-page');
        if (initialPage) {
            // Use setTimeout to ensure DOM is ready and await the async operation
            setTimeout(() => {
                populateLeaguePage(initialPage, leagueData, loadMatchesCallback);
            }, 0);
        }
    }
    
    // Remove old event listeners by cloning and replacing nodes
    subtabButtons.forEach((button: HTMLButtonElement): void => {
        const newButton = button.cloneNode(true) as HTMLButtonElement;
        button.parentNode?.replaceChild(newButton, button);
    });
    
    // Get updated button references after cloning
    const updatedSubtabButtons = document.querySelectorAll<HTMLButtonElement>('.subtab-btn');
    
    updatedSubtabButtons.forEach((button: HTMLButtonElement): void => {
        button.addEventListener('click', async (): Promise<void> => {
            const targetPage = button.getAttribute('data-page');
            
            // Update active button
            updatedSubtabButtons.forEach((btn: HTMLButtonElement): void => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // Show corresponding page
            leaguePages.forEach((page: HTMLElement): void => {
                page.classList.remove('active');
            });
            
            const targetPageElement = document.getElementById(`league-${targetPage}`);
            if (targetPageElement) {
                targetPageElement.classList.add('active');
                
                // Populate page content if data is available
                if (leagueData) {
                    await populateLeaguePage(targetPage, leagueData, loadMatchesCallback);
                }
            }
            
            console.log(`📄 Switched to League subtab: ${targetPage}`);
        });
    });
}

/**
 * Populates content for a specific League page with lazy loading support
 */
async function populateLeaguePage(
    pageName: string | null,
    data: LeagueDataModel,
    loadMatchesCallback?: () => Promise<LeagueDataModel | null>
): Promise<void> {
    if (!pageName) return;
    
    console.log(`📄 Populating page: ${pageName}`);
    
    const contentElement = document.getElementById(`${pageName}-content`);
    if (!contentElement) {
        console.error(`❌ Content element not found: ${pageName}-content`);
        return;
    }
    
    // Check if page requires matches data
    const requiresMatches = pageName === 'matches' || pageName === 'statistics' || pageName === 'topscores';
    const hasMatches = data.viewModels?.matches && data.viewModels?.charts;
    
    // If page requires matches but they're not loaded yet, trigger lazy load
    if (requiresMatches && !hasMatches && loadMatchesCallback) {
        console.log(`📊 ${pageName} requires matches data, loading...`);
        
        // Show loading state
        contentElement.innerHTML = '<div class="loading-indicator active">Loading data...</div>';
        
        try {
            const updatedData = await loadMatchesCallback();
            if (updatedData) {
                // Data was loaded, continue with population
                data = updatedData;
            } else {
                // Failed to load, error message already shown by callback
                return;
            }
        } catch (error) {
            console.error('Failed to load matches:', error);
            contentElement.innerHTML = `
                <div class="error-message">
                    <p>Failed to load detailed data.</p>
                </div>
            `;
            return;
        }
    }
    
    switch (pageName) {
        case 'standings':
            populateStandingsPage(contentElement, data);
            break;
        case 'matches':
            if (data.viewModels?.matches) {
                populateMatchesPage(contentElement, data);
            }
            break;
        case 'statistics':
            if (data.viewModels?.charts) {
                populateStatisticsPage(contentElement, data);
            }
            break;
        case 'topscores':
            if (data.viewModels?.matches) {
                populateTopScoresPage(contentElement, data);
            }
            break;
        default:
            console.warn(`⚠️ Unknown page: ${pageName}`);
    }
}

/**
 * Populates Standings page
 */
function populateStandingsPage(element: HTMLElement, data: LeagueDataModel): void {
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
function populateMatchesPage(element: HTMLElement, data: LeagueDataModel): void {
    // Hide loading indicator if present
    const loadingIndicator = element.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('active');
    }
    
    // Use pre-built matches view model
    if (!data.viewModels || !data.viewModels.matches) {
        console.error('❌ No view models available for matches');
        element.innerHTML = '<div class="error-message"><p>Matches data not available</p></div>';
        return;
    }
    
    const matchViewModels = data.viewModels.matches;
    
    // Get unique managers from view models
    const managersSet = new Set<string>();
    matchViewModels.forEach(match => {
        managersSet.add(match.manager1TeamName);
        managersSet.add(match.manager2TeamName);
    });
    const managers = Array.from(managersSet).sort();
    
    // Get all gameweeks sorted descending
    const gameweeks = Array.from(new Set(matchViewModels.map(m => m.gameWeek))).sort((a, b) => b - a);
    
    // Find the highest consecutive finished gameweek (not just max finished gameweek)
    // Strategy: Find the highest gameweek that has any pending matches, then use the one before
    // This handles cases where we have previous season data (GW 1-38 all finished) mixed with current season
    const gameweeksWithPending = new Set(
        matchViewModels
            .filter(m => m.result === 'pending')
            .map(m => m.gameWeek)
    );
    
    let currentGameweek = 0;
    
    if (gameweeksWithPending.size > 0) {
        // Find the lowest gameweek with pending matches, then use the one before it
        const lowestPending = Math.min(...Array.from(gameweeksWithPending));
        currentGameweek = lowestPending > 1 ? lowestPending - 1 : 1;
    } else {
        // All matches finished - find highest consecutive from GW1
        const finishedGameweeks = new Set(
            matchViewModels
                .filter(m => m.result !== 'pending')
                .map(m => m.gameWeek)
        );
        
        const sortedGameweeks = Array.from(new Set(matchViewModels.map(m => m.gameWeek))).sort((a, b) => a - b);
        
        for (const gw of sortedGameweeks) {
            if (finishedGameweeks.has(gw)) {
                currentGameweek = gw;
            } else {
                break;
            }
        }
    }
    
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
                    ${managers.map(manager => 
                        `<option value="${escapeHtml(manager)}">${escapeHtml(manager)}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
        <div id="matches-display" class="matches-list"></div>
    `;
    
    element.innerHTML = html;
    
    // Render matches with default filter (default gameweek)
    renderFilteredMatches(matchViewModels, String(defaultGameweek), 'all');
    
    // Setup filter event listeners
    const gameweekFilter = document.getElementById('gameweek-filter') as HTMLSelectElement;
    const managerFilter = document.getElementById('manager-filter') as HTMLSelectElement;
    
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
function renderFilteredMatches(matches: MatchViewModel[], gameweekFilter: string, managerFilter: string): void {
    const displayElement = document.getElementById('matches-display');
    if (!displayElement) return;
    
    // Filter matches based on criteria
    let filteredMatches = matches;
    
    if (gameweekFilter !== 'all') {
        const gw = parseInt(gameweekFilter);
        filteredMatches = filteredMatches.filter(m => m.gameWeek === gw);
    }
    
    if (managerFilter !== 'all') {
        filteredMatches = filteredMatches.filter(m => 
            m.manager1TeamName === managerFilter || m.manager2TeamName === managerFilter
        );
    }
    
    // Group by gameweek if showing multiple gameweeks
    const matchesByGameweek = groupMatchesByGameweek(filteredMatches);
    
    let html = '';
    
    if (filteredMatches.length === 0) {
        html = '<div class="no-matches"><p>No matches found for selected filters.</p></div>';
    } else {
        Object.keys(matchesByGameweek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(gwStr => {
            const gw = parseInt(gwStr);
            const gwMatches = matchesByGameweek[gw];
            
            if (!gwMatches) return;
            
            html += `
                <div class="gameweek-section">
                    <h4>Gameweek ${gw}</h4>
                    <div class="matches-grid">
            `;
            
            gwMatches.forEach((match: MatchViewModel) => {
                // Highlight the filtered manager if applicable
                const isEntry1Highlighted = managerFilter !== 'all' && match.manager1TeamName === managerFilter;
                const isEntry2Highlighted = managerFilter !== 'all' && match.manager2TeamName === managerFilter;
                
                // Determine winner/loser classes
                let entry1Class = '';
                let entry2Class = '';
                
                if (match.result === 'win1') {
                    entry1Class = 'winner';
                    entry2Class = 'loser';
                } else if (match.result === 'win2') {
                    entry1Class = 'loser';
                    entry2Class = 'winner';
                }
                // Draw: no winner/loser classes
                
                html += `
                    <div class="match-card">
                        <div class="match-entry ${entry1Class} ${isEntry1Highlighted ? 'highlighted' : ''}">
                            <span class="team-name">${escapeHtml(match.manager1TeamName)}</span>
                            <span class="points">${match.manager1Points}</span>
                        </div>
                        <div class="match-vs">vs</div>
                        <div class="match-entry ${entry2Class} ${isEntry2Highlighted ? 'highlighted' : ''}">
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
let absoluteChartRenderer: ChartRenderer | null = null;
let relativeChartRenderer: ChartRenderer | null = null;

function populateStatisticsPage(element: HTMLElement, data: LeagueDataModel): void {
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
            if (!data.viewModels || !data.viewModels.charts) {
                console.error('❌ No view models available for charts');
                element.innerHTML = '<div class="error-message"><p>Chart data not available</p></div>';
                return;
            }
            
            const chartData = data.viewModels.charts;
            
            console.log(`📈 Using chart data for ${chartData.absoluteManagers.length} managers`);
            
            // Create chart renderers (store globally for lifecycle management)
            absoluteChartRenderer = new ChartRenderer();
            relativeChartRenderer = new ChartRenderer();
            
            // Render absolute chart (default view)
            console.log('🎨 Rendering absolute chart...');
            absoluteChartRenderer.renderChart(
                'absolute-chart',
                chartData.absoluteManagers,
                'absolute',
                'absolute-legend'
            );
            
            // Setup chart type switching
            const chartTypeButtons = element.querySelectorAll('.chart-type-btn');
            chartTypeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const chartType = button.getAttribute('data-chart-type') as ChartType;
                    
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
                            absoluteChartRenderer.renderChart(
                                'absolute-chart',
                                chartData.absoluteManagers,
                                'absolute',
                                'absolute-legend'
                            );
                            absoluteSection?.setAttribute('data-rendered', 'true');
                        }
                    } else {
                        absoluteSection?.classList.add('hidden');
                        relativeSection?.classList.remove('hidden');
                        
                        // Always render relative chart when switching to it (to handle data updates)
                        if (relativeChartRenderer) {
                            relativeChartRenderer.renderChart(
                                'relative-chart',
                                chartData.relativeManagers,
                                'relative',
                                'relative-legend'
                            );
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
        } catch (error) {
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
 * Populates Top Scores page
 */
function populateTopScoresPage(element: HTMLElement, data: LeagueDataModel): void {
    if (!data.viewModels?.matches) {
        element.innerHTML = '<p>No matches data available.</p>';
        return;
    }
    
    const matches = data.viewModels.matches;
    
    // Create array of all individual scores with match details
    interface ScoreEntry {
        score: number;
        managerName: string;
        teamName: string;
        opponentName: string;
        opponentTeamName: string;
        opponentScore: number;
        gameWeek: number;
        result: string;
    }
    
    const allScores: ScoreEntry[] = [];
    
    matches.forEach(match => {
        // Only include finished matches
        if (match.result !== 'pending') {
            // Add manager 1's score
            allScores.push({
                score: match.manager1Points,
                managerName: match.manager1Name,
                teamName: match.manager1TeamName,
                opponentName: match.manager2Name,
                opponentTeamName: match.manager2TeamName,
                opponentScore: match.manager2Points,
                gameWeek: match.gameWeek,
                result: match.result === 'win1' ? 'W' : match.result === 'draw' ? 'D' : 'L'
            });
            
            // Add manager 2's score
            allScores.push({
                score: match.manager2Points,
                managerName: match.manager2Name,
                teamName: match.manager2TeamName,
                opponentName: match.manager1Name,
                opponentTeamName: match.manager1TeamName,
                opponentScore: match.manager1Points,
                gameWeek: match.gameWeek,
                result: match.result === 'win2' ? 'W' : match.result === 'draw' ? 'D' : 'L'
            });
        }
    });
    
    // Sort by score descending and take top 10
    const topScores = allScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    
    // Build HTML
    let html = `
        <div class="top-scores-container">
            <p class="section-description">🏆 Highest individual scores across all gameweeks</p>
            <div class="top-scores-list">
    `;
    
    topScores.forEach((entry, index) => {
        const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const resultClass = entry.result === 'W' ? 'win' : entry.result === 'D' ? 'draw' : 'loss';
        const resultEmoji = entry.result === 'W' ? '✅' : entry.result === 'D' ? '🤝' : '❌';
        
        html += `
            <div class="top-score-card">
                <div class="rank">${rankEmoji}</div>
                <div class="score-details">
                    <div class="score-header">
                        <span class="big-score">${entry.score} pts</span>
                        <span class="result-badge ${resultClass}">${resultEmoji} ${entry.result}</span>
                    </div>
                    <div class="manager-info">
                        <strong>${escapeHtml(entry.teamName)}</strong> <span class="manager-name">(${escapeHtml(entry.managerName)})</span>
                    </div>
                    <div class="match-info">
                        <span class="vs-text">vs</span> ${escapeHtml(entry.opponentTeamName)} <span class="opponent-score">(${entry.opponentScore} pts)</span>
                    </div>
                    <div class="gameweek-info">
                        📅 Gameweek ${entry.gameWeek}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    element.innerHTML = html;
}

/**
 * Helper function to group matches by gameweek
 */
function groupMatchesByGameweek(matches: MatchViewModel[]): Record<number, MatchViewModel[]> {
    const grouped: Record<number, MatchViewModel[]> = {};
    
    matches.forEach(match => {
        const gameWeek = match.gameWeek;
        if (!grouped[gameWeek]) {
            grouped[gameWeek] = [];
        }
        grouped[gameWeek]!.push(match);
    });
    
    return grouped;
}
