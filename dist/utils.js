// ===== UTILITY FUNCTIONS =====
/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce(func, wait) {
    let timeout = null;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
//# sourceMappingURL=utils.js.map