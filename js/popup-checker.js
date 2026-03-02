/**
 * Tries to open a new window and shows a warning if it fails.
 * @param {string} url - The URL to open in a new tab.
 * @returns {boolean} - true if the window opened successfully, false if it was blocked.
 */
function openWindowAndCheck(url) {
    const newWindow = window.open(url, '_blank');

    // Check if the window failed to open
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        // Pop-up was blocked
        console.warn('Pop-up was blocked by the browser.');
        showPopupWarning();
        return false; // Indicate failure
    }

    // Pop-up was successful
    if (newWindow) {
        newWindow.opener = null; // Security best practice
    }
    hidePopupWarning(); // Hide warning if it was open
    return true; // Indicate success
}

/**
 * Shows the pop-up warning banner.
 */
function showPopupWarning() {
    const warningBanner = document.getElementById('popup-warning');
    if (warningBanner) {
        warningBanner.style.display = 'flex'; // Changed to flex to match CSS
    }
}

/**
 * Hides the pop-up warning banner.
 */
function hidePopupWarning() {
    const warningBanner = document.getElementById('popup-warning');
    if (warningBanner) {
        warningBanner.style.display = 'none';
    }
}

// Add a listener to the close button *if* it exists
// We'll wait for the DOM to load to be safe
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('popup-warning-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hidePopupWarning();
        });
    }
});