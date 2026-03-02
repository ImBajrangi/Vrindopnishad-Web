/**
 * Vrindopnishad Random Loader - Universal Loader Script
 * Automatically adds a random loader (1-4) to any page
 * 
 * Usage: Just include this script in your HTML
 * <script src="path/to/random-loader.js"></script>
 */

(function () {
    'use strict';

    // Get the script element to determine base path
    const currentScript = document.currentScript;
    const scriptSrc = currentScript ? currentScript.src : '';
    const basePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);

    // Pick a random loader type (1, 2, 3, or 4)
    const loaderType = Math.floor(Math.random() * 4) + 1;

    // Pick a random theme
    const themes = ['', 'gold', 'purple', 'teal'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    // Loader HTML templates
    const loaderTemplates = {
        '1': `<div><div><div><div><div><div></div></div></div></div></div></div>`,
        '2': `<div><div><div><div><div><div></div></div></div></div></div></div>`,
        '3': `<div><div><div><div><div><div></div></div></div></div></div></div>`,
        '4': `<div><div><div><div><div><div><div><div><div><div></div></div></div></div></div></div></div></div></div></div>`
    };

    // Create loader HTML
    const themeClass = randomTheme ? `loader-${randomTheme}` : '';
    const loaderHTML = `
        <div class="vrinda-loader-overlay" id="vrindaLoaderOverlay">
            <div class="loader loader${loaderType} ${themeClass}">
                ${loaderTemplates[loaderType]}
            </div>
        </div>
    `;

    // Inject CSS link
    const injectCSS = () => {
        if (document.querySelector('link[href*="loader.css"]')) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = basePath + 'loader.css';

        // Insert at the beginning of head for priority
        if (document.head.firstChild) {
            document.head.insertBefore(link, document.head.firstChild);
        } else {
            document.head.appendChild(link);
        }
    };

    // Inject loader HTML immediately
    const injectLoader = () => {
        if (document.getElementById('vrindaLoaderOverlay')) return;

        // Add loading class to body
        document.body.classList.add('vrinda-loading');

        // Insert loader at the very beginning of body
        document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    };

    // Hide loader
    const hideLoader = () => {
        const overlay = document.getElementById('vrindaLoaderOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            document.body.classList.remove('vrinda-loading');
        }
    };

    // Initialize
    const init = () => {
        // Inject CSS immediately
        injectCSS();

        // Inject loader as soon as body is available
        if (document.body) {
            injectLoader();
        } else {
            document.addEventListener('DOMContentLoaded', injectLoader);
        }

        // Hide when page is fully loaded (including images)
        window.addEventListener('load', () => {
            // Only auto-hide if manual mode is NOT enabled
            if (!window.vrindaLoaderManualHide) {
                // Small delay to ensure smooth animation
                setTimeout(hideLoader, 300);
            }
        });
    };

    // Expose API
    window.VrindaLoader = {
        show: () => {
            const overlay = document.getElementById('vrindaLoaderOverlay');
            if (overlay) {
                overlay.classList.remove('hidden');
                document.body.classList.add('vrinda-loading');
            }
        },
        hide: hideLoader,
        type: loaderType,
        theme: randomTheme
    };

    // Run initialization
    init();

})();
