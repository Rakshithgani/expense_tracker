/**
 * Dark Mode Toggle Functionality
 * Dark mode is the default. Light mode is the toggled alternative.
 */

function initializeDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    const html = document.documentElement;
    
    if (savedDarkMode === null) {
        // Default to dark mode
        html.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    } else if (savedDarkMode === 'true') {
        html.classList.add('dark-mode');
    } else {
        html.classList.remove('dark-mode');
    }
    
    updateToggleButton();
}

function toggleDarkMode() {
    const html = document.documentElement;
    const isDarkMode = html.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
    updateToggleButton();
}

function updateToggleButton() {
    const toggleBtn = document.querySelector('.theme-toggle');
    if (!toggleBtn) return;
    
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    const sunIcon = toggleBtn.querySelector('.toggle-icon-sun');
    const moonIcon = toggleBtn.querySelector('.toggle-icon-moon');
    
    if (isDarkMode) {
        toggleBtn.setAttribute('aria-label', 'Switch to light mode');
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
    } else {
        toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDarkMode);
} else {
    initializeDarkMode();
}
