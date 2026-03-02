// Super simple system theme detector
(function() {
    // Check if system is in dark mode
    const darkModeOn = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply theme immediately
    if (darkModeOn) {
        document.body.classList.add('dark-mode');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (e.matches) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
})();