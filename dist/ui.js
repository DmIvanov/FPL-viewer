// ===== UI LAYER =====
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
export function initializeTabSwitching(onCupTabClick) {
    // Show Cup section by default, hide Charts section
    const chartsSection = document.getElementById('charts');
    const cupSection = document.getElementById('cup');
    if (chartsSection)
        chartsSection.style.display = 'none';
    if (cupSection)
        cupSection.style.display = 'block';
    // Add active class to Cup tab
    const cupLink = document.querySelector('a[href="#cup"]');
    if (cupLink)
        cupLink.classList.add('active');
    // Auto-load Cup data on page load
    console.log('🔄 Auto-loading Cup data on page load (with CORS proxy support)...');
    onCupTabClick();
    console.log('🔧 Tab switching initialized - Cup section visible by default');
}
/**
 * Sets up tab switching event listeners
 */
export function setupTabSwitchingListeners(onCupTabClick) {
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href')?.substring(1) || '';
            // Hide all sections
            const chartsSection = document.getElementById('charts');
            const cupSection = document.getElementById('cup');
            if (chartsSection)
                chartsSection.style.display = 'none';
            if (cupSection)
                cupSection.style.display = 'none';
            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection)
                targetSection.style.display = 'block';
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
//# sourceMappingURL=ui.js.map