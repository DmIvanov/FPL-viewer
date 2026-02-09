// ===== UI LAYER =====

import type { FPLManager } from './types.js';

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
export function initializeTabSwitching(onCupTabClick: () => void): void {
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
    onCupTabClick();
    
    console.log('🔧 Tab switching initialized - Cup section visible by default');
}

/**
 * Sets up tab switching event listeners
 */
export function setupTabSwitchingListeners(onCupTabClick: () => void): void {
    document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((link: HTMLAnchorElement): void => {
        link.addEventListener('click', (e: MouseEvent): void => {
            e.preventDefault();
            const targetId: string = link.getAttribute('href')?.substring(1) || '';
            
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
                onCupTabClick();
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
