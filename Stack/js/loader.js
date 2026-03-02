(function initLoadingOverlay() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '1';
        loadingOverlay.style.visibility = 'visible';
        loadingOverlay.classList.add('active');
        
        // Set loading state in global state
        if (window.state) {
            window.state.isLoading = true;
            // Track when the animation started
            window.state.loadingStartTime = Date.now();
        }
        
        // Prevent scrolling while loading
        document.body.style.overflow = 'hidden';
    }
})();

function showLoadingOverlay(show) {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (!loadingOverlay) return;
    
    if (show) {
        // Show immediately
        window.state.isLoading = true;
        window.state.loadingStartTime = Date.now(); // Reset start time
        loadingOverlay.style.display = 'flex';
        
        // Force a reflow before adding the active class to ensure proper transition
        loadingOverlay.offsetWidth;
        
        // Restart animations for text-loader (if browser supports it)
        const textLoaderChars = loadingOverlay.querySelectorAll('.text-loader span');
        if (textLoaderChars) {
            textLoaderChars.forEach(char => {
                // Reset animation
                char.style.animation = 'none';
                char.offsetHeight; // Force reflow
                char.style.animation = '';
            });
        }
        
        loadingOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling while loading
    } else {
        // Calculate how long the loader has been shown
        const minDisplayTime = 3600; // 3.6 seconds (3 full animation cycles)
        const timeShown = Date.now() - (window.state.loadingStartTime || 0);
        const remainingTime = Math.max(0, minDisplayTime - timeShown);
        
        // Delay hiding the loader if it hasn't been shown for the minimum time
        setTimeout(() => {
            // Remove active class to start the fade-out transition
            loadingOverlay.classList.remove('active');
            
            // Restore scrolling immediately
            document.body.style.overflow = '';
            
            // Update global state
            window.state.isLoading = false;
            
            // Set display: none after transition completes
            setTimeout(() => {
                if (!window.state.isLoading) {
                    loadingOverlay.style.display = 'none';
                }
            }, 500); // Match this with your CSS transition duration
        }, remainingTime);
    }
}