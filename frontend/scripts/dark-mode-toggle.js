/**
 * Dark Mode Toggle Functionality
 * Handles theme switching and localStorage persistence
 */

/**
 * Initialize dark mode on page load
 */
function initializeDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    const html = document.documentElement;
    
    if (savedDarkMode === null) {
        // Check system preference if no saved preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            html.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        } else {
            localStorage.setItem('darkMode', 'false');
        }
    } else if (savedDarkMode === 'true') {
        html.classList.add('dark-mode');
    }
    
    // Update toggle button state
    updateToggleButton();
}

/**
 * Toggle dark mode on and off
 */
function toggleDarkMode() {
    const html = document.documentElement;
    const isDarkMode = html.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
    updateToggleButton();
}

/**
 * Update the appearance of the toggle button to reflect current state
 */
function updateToggleButton() {
    const toggleBtn = document.querySelector('.theme-toggle');
    if (!toggleBtn) return;
    
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    const icon = toggleBtn.querySelector('.toggle-icon');
    
    if (isDarkMode) {
        toggleBtn.setAttribute('aria-label', 'Switch to light mode');
        if (icon) {
            icon.textContent = '☀️';  // Sun icon for light mode option
        }
    } else {
        toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
        if (icon) {
            icon.textContent = '🌙';  // Moon icon for dark mode option
        }
    }
}

/**
 * Listen for system dark mode preference changes
 */
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addListener(function(e) {
        const savedDarkMode = localStorage.getItem('darkMode');
        // Only auto-switch if user hasn't manually set a preference
        if (savedDarkMode === null) {
            if (e.matches) {
                document.documentElement.classList.add('dark-mode');
            } else {
                document.documentElement.classList.remove('dark-mode');
            }
            updateToggleButton();
        }
    });
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDarkMode);
} else {
    initializeDarkMode();
}
