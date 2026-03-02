/**
 * Vrindopnishad Loader - Auto-loading Script
 * Supports all 4 loader variants
 * 
 * Usage:
 * <script src="path/to/loader.js"></script>
 * 
 * With options:
 * <script src="path/to/loader.js" 
 *         data-loader-type="3"
 *         data-loader-size="lg" 
 *         data-loader-theme="gold"></script>
 * 
 * API:
 * - VrindaLoader.show() - Show the loader
 * - VrindaLoader.hide() - Hide the loader
 * - VrindaLoader.init(options) - Reinitialize with options
 */

(function () {
    'use strict';

    // Get the script element to read data attributes
    const currentScript = document.currentScript;
    const scriptSrc = currentScript ? currentScript.src : '';
    const basePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);

    // Read options from data attributes
    const options = {
        type: currentScript?.getAttribute('data-loader-type') || '3', // '1', '2', '3', '4'
        size: currentScript?.getAttribute('data-loader-size') || '', // '', 'sm', 'lg', 'xl'
        theme: currentScript?.getAttribute('data-loader-theme') || '', // '', 'gold', 'purple', 'teal', 'red', 'green'
        autoHide: currentScript?.getAttribute('data-loader-auto-hide') !== 'false',
        minDisplayTime: parseInt(currentScript?.getAttribute('data-loader-min-time') || '500', 10)
    };

    // Loader HTML templates for each type
    const loaderTemplates = {
        // Loader 1: 6 nested divs
        '1': `<div><div><div><div><div><div></div></div></div></div></div></div>`,
        // Loader 2: 6 nested divs
        '2': `<div><div><div><div><div><div></div></div></div></div></div></div>`,
        // Loader 3: 6 nested divs
        '3': `<div><div><div><div><div><div></div></div></div></div></div></div>`,
        // Loader 4: 10 nested divs (deeper for more rings)
        '4': `<div><div><div><div><div><div><div><div><div><div></div></div></div></div></div></div></div></div></div></div>`
    };

    // Create loader HTML
    const createLoaderHTML = () => {
        const type = options.type || '3';
        const sizeClass = options.size ? `loader-${options.size}` : '';
        const themeClass = options.theme ? `loader-${options.theme}` : '';
        const classes = ['loader', `loader${type}`, sizeClass, themeClass].filter(Boolean).join(' ');
        const innerHTML = loaderTemplates[type] || loaderTemplates['3'];

        return `
            <div class="vrinda-loader-overlay" id="vrindaLoaderOverlay">
                <div class="${classes}">
                    ${innerHTML}
                </div>
            </div>
        `;
    };

    // Inject CSS if not already present
    const injectCSS = () => {
        if (document.querySelector('link[href*="loader.css"]')) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = basePath + 'loader.css';
        document.head.insertBefore(link, document.head.firstChild);
    };

    // Inject loader HTML
    const injectLoader = () => {
        if (document.getElementById('vrindaLoaderOverlay')) return;

        // Add loading class to body immediately
        document.body.classList.add('vrinda-loading');

        // Insert loader at the start of body
        document.body.insertAdjacentHTML('afterbegin', createLoaderHTML());
    };

    // Show loader
    const show = (loaderType) => {
        if (loaderType) options.type = loaderType;

        let overlay = document.getElementById('vrindaLoaderOverlay');
        if (!overlay) {
            injectLoader();
            overlay = document.getElementById('vrindaLoaderOverlay');
        }

        if (overlay) {
            overlay.classList.remove('hidden');
            document.body.classList.add('vrinda-loading');
        }
    };

    // Hide loader
    const hide = () => {
        const overlay = document.getElementById('vrindaLoaderOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            document.body.classList.remove('vrinda-loading');
        }
    };

    // Initialize
    const init = (customOptions = {}) => {
        Object.assign(options, customOptions);

        // Inject CSS immediately
        injectCSS();

        // Wait for DOM to be ready to inject loader
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectLoader);
        } else {
            injectLoader();
        }

        // Auto-hide when page is fully loaded
        if (options.autoHide) {
            const startTime = Date.now();

            window.addEventListener('load', () => {
                const elapsed = Date.now() - startTime;
                const remainingTime = Math.max(0, options.minDisplayTime - elapsed);

                setTimeout(hide, remainingTime);
            });
        }
    };

    // Expose API globally
    window.VrindaLoader = {
        show,
        hide,
        init,
        options
    };

    // Auto-initialize
    init();

})();
