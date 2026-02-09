// ===== UTILITY FUNCTIONS =====

/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
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
