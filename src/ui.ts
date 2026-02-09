// ===== UI LAYER =====

import type { FPLManager, LeagueDataModel, H2HMatch, ChartType } from './types.js';
import { ChartProcessor } from './chartProcessor.js';
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
 * Sets up League subtab switching
 */
export function setupLeagueSubtabs(leagueData: LeagueDataModel | null): void {
    const subtabButtons = document.querySelectorAll<HTMLButtonElement>('.subtab-btn');
    const leaguePages = document.querySelectorAll<HTMLElement>('.league-page');
    
    // Populate initial active page
    const activeButton = document.querySelector<HTMLButtonElement>('.subtab-btn.active');
    if (activeButton && leagueData) {
        const initialPage = activeButton.getAttribute('data-page');
        if (initialPage) {
            populateLeaguePage(initialPage, leagueData);
        }
    }
    
    subtabButtons.forEach((button: HTMLButtonElement): void => {
        button.addEventListener('click', (): void => {
            const targetPage = button.getAttribute('data-page');
            
            // Update active button
            subtabButtons.forEach((btn: HTMLButtonElement): void => {
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
function populateLeaguePage(pageName: string | null, data: LeagueDataModel): void {
    if (!pageName) return;
    
    console.log(`📄 Populating page: ${pageName}`);
    
    const contentElement = document.getElementById(`${pageName}-content`);
    if (!contentElement) {
        console.error(`❌ Content element not found: ${pageName}-content`);
        return;
    }
    
    switch (pageName) {
        case 'overview':
            populateOverviewPage(contentElement, data);
            break;
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
 * Populates Overview page
 */
function populateOverviewPage(element: HTMLElement, data: LeagueDataModel): void {
    element.innerHTML = `
        <div class="overview-stats">
            <div class="stat-card">
                <h4>Total Matches</h4>
                <p class="stat-value">${data.totalMatches}</p>
            </div>
            <div class="stat-card">
                <h4>Last Updated</h4>
                <p class="stat-value">${data.lastUpdated.toLocaleString()}</p>
            </div>
            <div class="stat-card">
                <h4>League Type</h4>
                <p class="stat-value">Head-to-Head</p>
            </div>
        </div>
        <div class="overview-info">
            <p>📊 League data successfully loaded with ${data.matches.length} matches.</p>
        </div>
    `;
}

/**
 * Populates Standings page
 */
function populateStandingsPage(element: HTMLElement, data: LeagueDataModel): void {
    element.innerHTML = `
        <div class="standings-container">
            <p>🏆 Standings will be calculated from match results.</p>
            <p>Total matches available: ${data.totalMatches}</p>
        </div>
    `;
}

/**
 * Populates Matches page
 */
function populateMatchesPage(element: HTMLElement, data: LeagueDataModel): void {
    const matchesByGameweek = groupMatchesByGameweek(data.matches);
    
    let html = '<div class="matches-list">';
    
    Object.keys(matchesByGameweek).sort((a, b) => parseInt(b) - parseInt(a)).forEach(gwStr => {
        const gw = parseInt(gwStr);
        const matches = matchesByGameweek[gw];
        
        if (!matches) return;
        
        html += `
            <div class="gameweek-section">
                <h4>Gameweek ${gw}</h4>
                <div class="matches-grid">
        `;
        
        matches.forEach((match: H2HMatch) => {
            const winner = match.entry_1_points > match.entry_2_points ? 1 : 
                          match.entry_2_points > match.entry_1_points ? 2 : 0;
            
            html += `
                <div class="match-card">
                    <div class="match-entry ${winner === 1 ? 'winner' : ''}">
                        <span class="team-name">${escapeHtml(match.entry_1_name)}</span>
                        <span class="points">${match.entry_1_points}</span>
                    </div>
                    <div class="match-vs">vs</div>
                    <div class="match-entry ${winner === 2 ? 'winner' : ''}">
                        <span class="team-name">${escapeHtml(match.entry_2_name)}</span>
                        <span class="points">${match.entry_2_points}</span>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    element.innerHTML = html;
}

/**
 * Populates Statistics page
 */
/**
 * Populates Statistics page with charts
 */
// Global chart renderer instances to manage lifecycle
let absoluteChartRenderer: ChartRenderer | null = null;
let relativeChartRenderer: ChartRenderer | null = null;

function populateStatisticsPage(element: HTMLElement, data: LeagueDataModel): void {
    console.log('📊 Populating Statistics page...');
    
    // Check if already populated to avoid re-rendering
    if (element.hasAttribute('data-charts-initialized')) {
        console.log('✅ Statistics page already initialized, skipping re-render');
        return;
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
            
            console.log('✅ Chart.js loaded, processing data...');
            
            // Process data to get chart models
            const processor = new ChartProcessor(data.matches);
            const chartData = processor.process();
            
            console.log(`📈 Processed ${chartData.absoluteManagers.length} managers for charts`);
            
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
                        
                        // Render relative chart on first view
                        if (!relativeSection?.hasAttribute('data-rendered') && relativeChartRenderer) {
                            console.log('🎨 Rendering relative chart...');
                            relativeChartRenderer.renderChart(
                                'relative-chart',
                                chartData.relativeManagers,
                                'relative',
                                'relative-legend'
                            );
                            relativeSection?.setAttribute('data-rendered', 'true');
                        }
                    }
                });
            });
            
            // Mark absolute chart as rendered
            const absoluteSection = document.getElementById('absolute-chart-section');
            absoluteSection?.setAttribute('data-rendered', 'true');
            
            // Mark the statistics page as initialized
            element.setAttribute('data-charts-initialized', 'true');
            
            console.log('✅ Statistics page populated successfully');
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
 * Populates History page
 */
function populateHistoryPage(element: HTMLElement, _data: LeagueDataModel): void {
    element.innerHTML = `
        <div class="history-container">
            <p>📜 Historical trends and patterns will be shown here.</p>
        </div>
    `;
}

/**
 * Helper function to group matches by gameweek
 */
function groupMatchesByGameweek(matches: H2HMatch[]): Record<number, H2HMatch[]> {
    const grouped: Record<number, H2HMatch[]> = {};
    
    matches.forEach(match => {
        const eventNum = match.event;
        if (!grouped[eventNum]) {
            grouped[eventNum] = [];
        }
        grouped[eventNum]!.push(match);
    });
    
    return grouped;
}
