// ===== TYPE DEFINITIONS =====

interface FPLManager {
    id: number;
    entry: number;
    entry_name: string;
    player_name: string;
    rank: number;
    last_rank: number;
    rank_sort: number;
    total: number;
    event_total: number;
    has_played?: boolean;
}

interface FPLLeague {
    id: number;
    name: string;
    created?: string;
    closed?: boolean;
    max_entries?: number | null;
    league_type?: string;
    scoring?: string;
    admin_entry?: number;
    start_event?: number;
    code_privacy?: string;
    has_cup?: boolean;
    cup_league?: number | null;
    rank?: number | null;
}

interface FPLLeagueStandings {
    standings: {
        results: FPLManager[];
        has_next?: boolean;
        page?: number;
    };
    league: FPLLeague;
    new_entries?: {
        has_next: boolean;
        page: number;
        results: any[];
    };
    last_updated_data?: string;
}

// ===== WEBSITE FUNCTIONALITY & INTERACTIVITY =====

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
    initializeFPLFeatures();
    initializeTabSwitching();
}

// ===== MOBILE NAVIGATION MENU =====
function setupMobileMenu(): void {
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

// ===== SMOOTH SCROLLING FOR NAVIGATION =====
function setupSmoothScrolling(): void {
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

// ===== SCROLL ANIMATIONS =====
function setupIntersectionObserver(): void {
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

// ===== KEYBOARD ACCESSIBILITY =====
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

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', (): void => {
    // Log page load time for development
    const loadTime: number = performance.now();
    console.log(`⚡ TypeScript page loaded in ${Math.round(loadTime)}ms`);
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (event: ErrorEvent): void => {
    console.error('❌ TypeScript Error:', event.error);
    // In a real project, you might want to report this to an error tracking service
});

// ===== UTILITY FUNCTIONS =====
function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T, 
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: number | null = null;
    
    return function executedFunction(...args: Parameters<T>): void {
        const later = (): void => {
            timeout = null;
            func(...args);
        };
        
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait) as unknown as number;
    };
}

// Add resize handler for responsive adjustments
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

// ===== FPL CUP FUNCTIONS =====

async function fetchCupStandings(): Promise<void> {
    const tableBody: HTMLElement | null = document.getElementById('cup-table-body');
    
    if (!tableBody) {
        console.log('❌ Cup table body not found');
        return;
    }
    
    // Show loading state
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
    
    try {
        console.log('🚀 Fetching real FPL data from API...');
        
        // Try to fetch real data from FPL API
        const data = await fetchRealFPLData();
        
        if (data && data.standings && data.standings.results) {
            console.log(`✅ Successfully loaded ${data.standings.results.length} managers from live FPL API`);
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

async function fetchRealFPLData(): Promise<FPLLeagueStandings> {
    const FPL_API_URL = 'https://fantasy.premierleague.com/api/leagues-classic/841567/standings/';
    
    // Try multiple CORS proxy services for reliability
    const CORS_PROXIES = [
        'https://api.allorigins.win/get?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ];
    
    console.log('🔍 Testing CORS proxies for FPL API access...');
    
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        const proxyUrl = CORS_PROXIES[i];
        
        if (!proxyUrl) continue; // Skip if undefined
        
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

function escapeHtml(text: string): string {
    const div: HTMLDivElement = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function populateCupTable(managers: FPLManager[]): void {
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

function getRankChangeIndicator(currentRank: number, lastRank: number): string {
    if (currentRank < lastRank) {
        return '<span class="rank-up">⬆️</span>';
    } else if (currentRank > lastRank) {
        return '<span class="rank-down">⬇️</span>';
    } else {
        return '<span class="rank-same">➡️</span>';
    }
}

function getRankClass(rank: number): string {
    if (rank === 1) return 'first-place';
    if (rank <= 3) return 'top-three';
    if (rank <= 5) return 'top-five';
    return 'other-rank';
}

// ===== FPL SPECIFIC FUNCTIONS =====

function initializeFPLFeatures(): void {
    console.log('🏆 FPL features initialized successfully!');
}

function initializeTabSwitching(): void {
    // Show Cup section by default, hide Charts section
    const chartsSection: HTMLElement | null = document.getElementById('charts');
    const cupSection: HTMLElement | null = document.getElementById('cup');
    
    if (chartsSection) chartsSection.style.display = 'none';
    if (cupSection) cupSection.style.display = 'block';
    
    // Add active class to Cup tab
    const cupLink: HTMLAnchorElement | null = document.querySelector('a[href="#cup"]');
    if (cupLink) cupLink.classList.add('active');
    
    // Auto-load Cup data on page load
    console.log('🔄 Auto-loading Cup data on page load (with CORS proxy support)...');
    fetchCupStandings();
    
    console.log('🔧 Tab switching initialized - Cup section visible by default');
}

// Add tab switching functionality to nav links
document.addEventListener('DOMContentLoaded', (): void => {
    document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((link: HTMLAnchorElement): void => {
        link.addEventListener('click', (e: MouseEvent): void => {
            e.preventDefault();
            const targetId: string = link.getAttribute('href')?.substring(1) || ''; // Remove #
            
            // Hide all sections
            const chartsSection: HTMLElement | null = document.getElementById('charts');
            const cupSection: HTMLElement | null = document.getElementById('cup');
            
            if (chartsSection) chartsSection.style.display = 'none';
            if (cupSection) cupSection.style.display = 'none';
            
            // Show target section
            const targetSection: HTMLElement | null = document.getElementById(targetId);
            if (targetSection) targetSection.style.display = 'block';
            
            // Update active nav link
            document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((l: HTMLAnchorElement): void => {
                l.classList.remove('active');
            });
            link.classList.add('active');
            
            // Auto-load Cup data when Cup tab is clicked
            if (targetId === 'cup') {
                console.log('Auto-loading Cup data...');
                fetchCupStandings();
            }
            
            console.log('Switched to tab:', targetId);
        });
    });
});

console.log('⚽ FPL Analytics Dashboard loaded and ready!');