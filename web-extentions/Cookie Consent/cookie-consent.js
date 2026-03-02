/**
 * Vrindopnishad Global Cookie Consent
 * Handles cookie acceptance/rejection across all pages.
 */

(function () {
    const COOKIE_STORAGE_KEY = 'vrindopnishad_cookie_consent';

    // Helper to get cookie value
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Helper to set cookie
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function initCookieConsent() {
        // Check if user has already made a choice (check both LocalStorage and Cookies for robustness)
        const localConsent = localStorage.getItem(COOKIE_STORAGE_KEY);
        const cookieConsent = getCookie(COOKIE_STORAGE_KEY);

        if (localConsent || cookieConsent) return; // Exit if choice already exists

        // Prevent duplicate banners
        if (document.getElementById('cookie-consent-banner')) return;

        // Create Banner HTML
        const banner = document.createElement('div');
        banner.className = 'cookie-consent-banner';
        banner.id = 'cookie-consent-banner';

        banner.innerHTML = `
            <div class="cookie-content">
                <div class="cookie-icon">
                    <i class="fas fa-cookie-bite"></i>
                </div>
                <div class="cookie-text">
                    <h3>Cookie Preferences</h3>
                    <p>We use cookies to enhance your experience, analyze site traffic, and serve divine content. By clicking "Accept All", you agree to our use of cookies.</p>
                </div>
            </div>
            <div class="cookie-actions">
                <button class="cookie-btn cookie-btn-reject" id="cookie-reject">Reject All</button>
                <button class="cookie-btn cookie-btn-accept" id="cookie-accept">Accept All</button>
            </div>
        `;

        document.body.appendChild(banner);

        // Show banner with delay for better UX
        setTimeout(() => {
            banner.classList.add('active');
        }, 1500);

        // Event Listeners
        const acceptBtn = document.getElementById('cookie-accept');
        const rejectBtn = document.getElementById('cookie-reject');

        acceptBtn.addEventListener('click', () => {
            handleChoice('accepted');
        });

        rejectBtn.addEventListener('click', () => {
            handleChoice('rejected');
        });

        function handleChoice(status) {
            // Save to both LocalStorage and Cookies
            localStorage.setItem(COOKIE_STORAGE_KEY, status);
            setCookie(COOKIE_STORAGE_KEY, status, 365); // Store for 1 year

            banner.classList.remove('active');

            // Allow animation to finish before removing from DOM
            setTimeout(() => {
                banner.remove();
            }, 600);

            // Optional: You can play a sound or show a mini notification
            if (window.showNotification) {
                showNotification(`Preferences ${status}`, status === 'accepted' ? 'success' : 'info');
            }
        }
    }

    // Run on interactive or complete
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCookieConsent);
    } else {
        initCookieConsent();
    }
})();
