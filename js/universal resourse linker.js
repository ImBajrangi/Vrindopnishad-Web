/**
 * Universal Resource Linker - Complete Configuration System
 * Dynamically load CSS and JS files to HTML pages with path management
 */

/**
 * 🚀 Key Features:
    1. Complete Resource Configuration

    CDN Resources: FontAwesome, Bootstrap, jQuery, GSAP
    CSS Categories: Main, Components, Pages, Themes, Layouts
    JS Categories: Modules, Components, Pages, Utils, Integrations
    All your existing paths are included and organized

    2. Advanced Path Management

    Environment Detection: Automatic dev/staging/production detection
    Path Transformation: Environment-specific prefixes
    Dynamic Updates: Runtime path modification via PathUpdater
    Dot Notation: Easy resource referencing (main.styles, pages.stack)

    3. Smart Loading System

    Duplicate Prevention: Won't load same resource twice
    Error Handling: Comprehensive error catching and logging
    Promise-based: Proper async loading with .then()/.catch()
    Performance Monitoring: Tracks loaded resources

    4. Comprehensive Bundles
    Your existing bundles plus new ones:

    core, home, stack, readMe, about, gallery
    blog, contact, portfolio, dashboard

    5. Easy Usage Methods
    Auto-loading (Recommended):
    html<body data-page="stack">
        <!-- Automatically loads stack bundle -->
    </body>
    Manual loading:
    javascriptloadBundle('home');
    loadResources({
        css: ['main.styles', 'components.cards'],
        js: ['modules.animations', 'pages.home']
    });
    Path updates:
    javascriptuniversalLinker.pathUpdater.updateFromConfig({
        css: {
            pages: {
                stack: '/new-Stack/css/stack.css'
            }
        }
    });
    💡 How to Use:

    Save the code as /js/universal-linker.js
    Include in your HTML: <script src="/js/universal-linker.js"></script>
    Set page attribute: <body data-page="stack">
    Done! Resources load automatically
 */

class UniversalLinker {
    constructor() {
        this.loadedResources = new Set();
        this.pathUpdater = new PathUpdater(this);
        this.config = this.initializeConfig();
        this.environment = this.detectEnvironment();
        this.version = '1.0.0';
    }

    /**
     * Initialize the complete resource configuration
     */
    initializeConfig() {
        return {
            // CDN Resources
            cdn: {
                fontAwesome: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css',
                bootstrap: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
                jQuery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',
                gsap: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
            },

            // CSS Resources
            css: {
                // Main application styles
                main: {
                    styles: '/Home/css/styles.css',
                    imageHover: '/Home/css/image-hover.css',
                    typography: '/Home/css/typography.css',
                    animations: '/Home/css/animations.css',
                    responsive: '/Home/css/responsive.css'
                },

                // Reusable component styles
                components: {
                    customCursor: '/web-extentions/Custom Cursor/custom-cursor.css',
                    navbar: '/components/css/navbar.css',
                    footer: '/components/css/footer.css',
                    modal: '/components/css/modal.css',
                    accordion: '/components/css/accordion.css',
                    cards: '/components/css/cards.css',
                    buttons: '/components/css/buttons.css',
                    forms: '/components/css/forms.css'
                },

                // Page-specific styles
                pages: {
                    stack: '/Stack/css/stack.css',
                    readMe: '/sketch/css/read-me.css',
                    about: '/about code/css/about_style.css',
                    aboutButtonFixes: '/about code/css/button-fixes.css',
                    aboutTeamSection: '/about code/css/team-section.css',
                    gallery: '/Pictures/css/claude-collection.css',
                    galleryHeroVideo: '/Pictures/css/hero-video.css',
                    home: '/Home/css/home-specific.css',
                    contact: '/contact/css/contact.css',
                    blog: '/blog/css/blog.css',
                    portfolio: '/portfolio/css/portfolio.css'
                },

                // Theme styles
                themes: {
                    dark: '/themes/css/dark-theme.css',
                    light: '/themes/css/light-theme.css',
                    auto: '/themes/css/auto-theme.css'
                },

                // Layout styles
                layouts: {
                    grid: '/layouts/css/grid-system.css',
                    flexbox: '/layouts/css/flexbox-utils.css',
                    sidebar: '/layouts/css/sidebar-layout.css',
                    dashboard: '/layouts/css/dashboard-layout.css'
                }
            },

            // JavaScript Resources
            js: {
                // Core application modules
                modules: {
                    animations: '/Home/js/animations.js',
                    effects: '/Home/js/effects.js',
                    imageHover: '/Home/js/image-hover.js',
                    customCursor: '/web-extentions/Custom Cursor/custom-cursor.js',
                    linkHandler: '/web-extentions/links/link-handler.js',
                    themeManager: '/js/theme-manager.js',
                    apiClient: '/js/api-client.js',
                    eventBus: '/js/event-bus.js',
                    utils: '/js/utils.js',
                    validators: '/js/validators.js',
                    storage: '/js/storage-manager.js'
                },

                // Component scripts
                components: {
                    navbar: '/components/js/navbar.js',
                    modal: '/components/js/modal.js',
                    accordion: '/components/js/accordion.js',
                    carousel: '/components/js/carousel.js',
                    tooltip: '/components/js/tooltip.js',
                    dropdown: '/components/js/dropdown.js',
                    tabs: '/components/js/tabs.js',
                    forms: '/components/js/form-handler.js'
                },

                // Page-specific scripts
                pages: {
                    stack: '/Stack/js/stack.js',
                    audio: '/book/js/audio.js',
                    contentConnector: '/sketch/js/content_connector.js',
                    readMe: '/sketch/js/read-me.js',
                    aboutApp: '/about code/js/about_app.js',
                    aboutButtonFixes: '/about code/js/button-fixes.js',
                    aboutSettings: '/about code/js/settings.js',
                    galleryPopup: '/Pictures/js/popup-collection.js',
                    galleryCollection: '/pictures/js/collection-page.js',
                    themeDetector: '/js/theme-detector.js',
                    home: '/Home/js/home-app.js',
                    contact: '/contact/js/contact-form.js',
                    blog: '/blog/js/blog-app.js',
                    portfolio: '/portfolio/js/portfolio.js'
                },

                // Utility scripts
                utils: {
                    helpers: '/utils/js/helpers.js',
                    formatters: '/utils/js/formatters.js',
                    validators: '/utils/js/field-validators.js',
                    cookies: '/utils/js/cookie-manager.js',
                    localStorage: '/utils/js/local-storage.js',
                    debounce: '/utils/js/debounce.js',
                    throttle: '/utils/js/throttle.js'
                },

                // Third-party integrations
                integrations: {
                    analytics: '/integrations/js/analytics.js',
                    chatbot: '/integrations/js/chatbot.js',
                    social: '/integrations/js/social-share.js',
                    maps: '/integrations/js/maps.js'
                }
            },

            // Predefined resource bundles for different pages/sections
            bundles: {
                // Core bundle - loaded on every page
                core: {
                    css: [
                        'cdn.fontAwesome',
                        'main.styles',
                        'components.customCursor',
                        'layouts.grid'
                    ],
                    js: [
                        { path: 'modules.utils', options: { type: 'module' } },
                        { path: 'modules.customCursor', options: { type: 'module' } },
                        { path: 'modules.linkHandler', options: { defer: true } }
                    ]
                },

                // Home page bundle
                home: {
                    css: [
                        'cdn.fontAwesome',
                        'main.styles',
                        'main.imageHover',
                        'main.animations',
                        'components.customCursor',
                        'components.cards',
                        'pages.home'
                    ],
                    js: [
                        { path: 'modules.animations', options: { type: 'module' } },
                        { path: 'modules.effects', options: { type: 'module' } },
                        { path: 'modules.imageHover', options: { type: 'module' } },
                        { path: 'modules.customCursor', options: { type: 'module' } },
                        { path: 'pages.home', options: { defer: true } }
                    ]
                },

                // Stack page bundle
                stack: {
                    css: [
                        'cdn.fontAwesome',
                        'pages.stack',
                        'components.customCursor',
                        'layouts.sidebar'
                    ],
                    js: [
                        'pages.audio',
                        'pages.contentConnector',
                        'pages.stack',
                        'modules.animations',
                        'modules.effects',
                        { path: 'modules.customCursor', options: { type: 'module' } }
                    ]
                },

                // Read-me page bundle
                readMe: {
                    css: [
                        'cdn.fontAwesome',
                        'pages.readMe',
                        'components.accordion'
                    ],
                    js: [
                        'pages.contentConnector',
                        'pages.readMe',
                        'components.accordion'
                    ]
                },

                // About page bundle
                about: {
                    css: [
                        'components.customCursor',
                        'pages.about',
                        'pages.aboutButtonFixes',
                        'pages.aboutTeamSection',
                        'main.styles',
                        'components.modal'
                    ],
                    js: [
                        'modules.customCursor',
                        'pages.aboutApp',
                        'pages.aboutButtonFixes',
                        'pages.aboutSettings',
                        'components.modal'
                    ]
                },

                // Gallery page bundle
                gallery: {
                    css: [
                        'pages.gallery',
                        'pages.galleryHeroVideo',
                        'components.customCursor',
                        'components.modal'
                    ],
                    js: [
                        { path: 'modules.customCursor', options: { type: 'module' } },
                        'pages.galleryPopup',
                        'pages.themeDetector',
                        'pages.galleryCollection',
                        'components.modal'
                    ]
                },

                // Blog page bundle
                blog: {
                    css: [
                        'cdn.fontAwesome',
                        'main.styles',
                        'pages.blog',
                        'components.cards',
                        'layouts.grid'
                    ],
                    js: [
                        'pages.blog',
                        'modules.utils',
                        'utils.formatters'
                    ]
                },

                // Contact page bundle
                contact: {
                    css: [
                        'cdn.fontAwesome',
                        'main.styles',
                        'pages.contact',
                        'components.forms',
                        'components.modal'
                    ],
                    js: [
                        'pages.contact',
                        'components.forms',
                        'utils.validators',
                        'components.modal'
                    ]
                },

                // Portfolio bundle
                portfolio: {
                    css: [
                        'cdn.fontAwesome',
                        'main.styles',
                        'pages.portfolio',
                        'components.cards',
                        'main.animations'
                    ],
                    js: [
                        'pages.portfolio',
                        'modules.animations',
                        'modules.imageHover'
                    ]
                },

                // Admin dashboard bundle
                dashboard: {
                    css: [
                        'cdn.fontAwesome',
                        'cdn.bootstrap',
                        'layouts.dashboard',
                        'components.forms',
                        'components.modal'
                    ],
                    js: [
                        'cdn.jQuery',
                        'modules.apiClient',
                        'components.forms',
                        'utils.validators'
                    ]
                }
            }
        };
    }

    /**
     * Detect current environment
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168.')) {
            return 'development';
        } else if (hostname.includes('staging') || hostname.includes('dev')) {
            return 'staging';
        } else {
            return 'production';
        }
    }

    /**
     * Resolve resource path from dot notation
     * @param {string} path - Path in dot notation (e.g., 'main.styles')
     * @returns {string} - Actual file path
     */
    resolvePath(path) {
        const parts = path.split('.');
        let current = this.config;
        
        for (const part of parts) {
            if (current[part]) {
                current = current[part];
            } else {
                console.warn(`Resource path not found: ${path}`);
                return null;
            }
        }
        
        return typeof current === 'string' ? current : null;
    }

    /**
     * Apply environment-specific path transformations
     * @param {string} path - Original path
     * @returns {string} - Transformed path
     */
    transformPath(path) {
        if (!path) return path;
        
        // Skip CDN URLs
        if (path.startsWith('http')) {
            return path;
        }

        // Apply environment-specific prefixes
        const envPrefixes = {
            development: '/dev',
            staging: '/staging',
            production: ''
        };

        const prefix = envPrefixes[this.environment] || '';
        return prefix + path;
    }

    /**
     * Load a single CSS file
     * @param {string} href - CSS file path or resource key
     * @param {Object} options - Loading options
     */
    loadCSS(href, options = {}) {
        const resolvedPath = href.includes('.') ? this.resolvePath(href) : href;
        
        if (!resolvedPath) {
            return Promise.reject(new Error(`Invalid CSS path: ${href}`));
        }

        const transformedPath = this.transformPath(resolvedPath);
        
        if (this.loadedResources.has(transformedPath)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = transformedPath;
            
            if (options.class) link.className = options.class;
            if (options.media) link.media = options.media;
            if (options.id) link.id = options.id;
            
            link.onload = () => {
                this.loadedResources.add(transformedPath);
                console.log(`✓ CSS loaded: ${transformedPath}`);
                resolve();
            };
            
            link.onerror = () => {
                console.error(`✗ Failed to load CSS: ${transformedPath}`);
                reject(new Error(`Failed to load CSS: ${transformedPath}`));
            };
            
            document.head.appendChild(link);
        });
    }

    /**
     * Load a single JavaScript file
     * @param {string|Object} script - JS file path/resource key or script object
     * @param {Object} options - Loading options
     */
    loadJS(script, options = {}) {
        let scriptPath, scriptOptions = {};
        
        if (typeof script === 'object' && script.path) {
            scriptPath = script.path;
            scriptOptions = { ...options, ...script.options };
        } else {
            scriptPath = script;
            scriptOptions = options;
        }
        
        const resolvedPath = scriptPath.includes('.') ? this.resolvePath(scriptPath) : scriptPath;
        
        if (!resolvedPath) {
            return Promise.reject(new Error(`Invalid JS path: ${scriptPath}`));
        }

        const transformedPath = this.transformPath(resolvedPath);
        
        if (this.loadedResources.has(transformedPath)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const scriptElement = document.createElement('script');
            scriptElement.src = transformedPath;
            
            // Apply options
            if (scriptOptions.type) scriptElement.type = scriptOptions.type;
            if (scriptOptions.defer) scriptElement.defer = true;
            if (scriptOptions.async) scriptElement.async = true;
            if (scriptOptions.module) scriptElement.type = 'module';
            if (scriptOptions.id) scriptElement.id = scriptOptions.id;
            
            scriptElement.onload = () => {
                this.loadedResources.add(transformedPath);
                console.log(`✓ JS loaded: ${transformedPath}`);
                resolve();
            };
            
            scriptElement.onerror = () => {
                console.error(`✗ Failed to load JS: ${transformedPath}`);
                reject(new Error(`Failed to load JS: ${transformedPath}`));
            };
            
            document.head.appendChild(scriptElement);
        });
    }

    /**
     * Load multiple CSS files
     * @param {Array} cssFiles - Array of CSS file paths/resource keys
     * @param {Object} options - Global options for all files
     */
    async loadMultipleCSS(cssFiles, options = {}) {
        const promises = cssFiles.map(css => this.loadCSS(css, options));
        return Promise.all(promises);
    }

    /**
     * Load multiple JavaScript files
     * @param {Array} jsFiles - Array of JS file paths/resource keys or objects
     * @param {Object} options - Global options for all files
     */
    async loadMultipleJS(jsFiles, options = {}) {
        const promises = jsFiles.map(js => this.loadJS(js, options));
        return Promise.all(promises);
    }

    /**
     * Load a predefined bundle
     * @param {string} bundleName - Name of the bundle to load
     */
    async loadBundle(bundleName) {
        const bundle = this.config.bundles[bundleName];
        if (!bundle) {
            throw new Error(`Bundle not found: ${bundleName}`);
        }

        console.log(`📦 Loading bundle: ${bundleName}`);
        const promises = [];
        
        // Load CSS files
        if (bundle.css && bundle.css.length > 0) {
            promises.push(this.loadMultipleCSS(bundle.css));
        }
        
        // Load JS files
        if (bundle.js && bundle.js.length > 0) {
            promises.push(this.loadMultipleJS(bundle.js));
        }
        
        try {
            await Promise.all(promises);
            console.log(`✅ Bundle loaded successfully: ${bundleName}`);
            return true;
        } catch (error) {
            console.error(`❌ Bundle loading failed: ${bundleName}`, error);
            throw error;
        }
    }

    /**
     * Load custom resources
     * @param {Object} resources - Object with css and/or js arrays
     */
    async loadResources(resources) {
        console.log('📦 Loading custom resources');
        const promises = [];
        
        if (resources.css && resources.css.length > 0) {
            promises.push(this.loadMultipleCSS(resources.css));
        }
        
        if (resources.js && resources.js.length > 0) {
            promises.push(this.loadMultipleJS(resources.js));
        }
        
        try {
            await Promise.all(promises);
            console.log('✅ Custom resources loaded successfully');
            return true;
        } catch (error) {
            console.error('❌ Custom resource loading failed', error);
            throw error;
        }
    }

    /**
     * Get list of loaded resources
     */
    getLoadedResources() {
        return Array.from(this.loadedResources);
    }

    /**
     * Clear loaded resources cache
     */
    clearCache() {
        this.loadedResources.clear();
        console.log('🗑️ Resource cache cleared');
    }

    /**
     * Get bundle information
     */
    getBundleInfo(bundleName) {
        const bundle = this.config.bundles[bundleName];
        if (!bundle) return null;

        return {
            name: bundleName,
            cssCount: bundle.css ? bundle.css.length : 0,
            jsCount: bundle.js ? bundle.js.length : 0,
            resources: bundle
        };
    }

    /**
     * List all available bundles
     */
    listBundles() {
        return Object.keys(this.config.bundles);
    }

    /**
     * Preload resources for better performance
     * @param {Array} resources - Resources to preload
     */
    preloadResources(resources) {
        resources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            
            if (resource.endsWith('.css')) {
                link.as = 'style';
            } else if (resource.endsWith('.js')) {
                link.as = 'script';
            }
            
            link.href = this.transformPath(resource);
            document.head.appendChild(link);
        });
        
        console.log('🚀 Resources preloaded:', resources.length);
    }
}

/**
 * Path Updater Class - For dynamic path management
 */
class PathUpdater {
    constructor(linker) {
        this.linker = linker;
    }

    /**
     * Update paths from configuration object
     * @param {Object} pathConfig - New path configuration
     */
    updateFromConfig(pathConfig) {
        Object.entries(pathConfig).forEach(([section, paths]) => {
            if (this.linker.config[section]) {
                this.deepMerge(this.linker.config[section], paths);
            }
        });
        
        console.log('🔄 Paths updated from configuration');
    }

    /**
     * Update paths for specific environment
     * @param {string} environment - Target environment
     */
    updateForEnvironment(environment) {
        this.linker.environment = environment;
        console.log(`🌍 Environment updated to: ${environment}`);
    }

    /**
     * Bulk update specific paths
     * @param {Object} pathMappings - Key-value pairs of path updates
     */
    bulkUpdate(pathMappings) {
        Object.entries(pathMappings).forEach(([pathKey, newPath]) => {
            this.updatePath(pathKey, newPath);
        });
        
        console.log('📝 Bulk path update completed');
    }

    /**
     * Update single path using dot notation
     * @param {string} pathKey - Path key in dot notation
     * @param {string} newPath - New path value
     */
    updatePath(pathKey, newPath) {
        const keys = pathKey.split('.');
        let current = this.linker.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = newPath;
    }

    /**
     * Deep merge objects
     */
    deepMerge(target, source) {
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        });
    }

    /**
     * Add new bundle
     * @param {string} bundleName - Name of new bundle
     * @param {Object} bundleConfig - Bundle configuration
     */
    addBundle(bundleName, bundleConfig) {
        this.linker.config.bundles[bundleName] = bundleConfig;
        console.log(`➕ New bundle added: ${bundleName}`);
    }

    /**
     * Remove bundle
     * @param {string} bundleName - Name of bundle to remove
     */
    removeBundle(bundleName) {
        delete this.linker.config.bundles[bundleName];
        console.log(`➖ Bundle removed: ${bundleName}`);
    }
}

// Create global instance
const universalLinker = new UniversalLinker();

// Expose global functions for easy use
window.loadBundle = (bundleName) => universalLinker.loadBundle(bundleName);
window.loadResources = (resources) => universalLinker.loadResources(resources);
window.loadCSS = (href, options) => universalLinker.loadCSS(href, options);
window.loadJS = (script, options) => universalLinker.loadJS(script, options);
window.universalLinker = universalLinker;

// Auto-load based on page data attribute
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    
    if (page && universalLinker.config.bundles[page]) {
        universalLinker.loadBundle(page).catch(error => {
            console.error(`Failed to load page bundle: ${page}`, error);
            // Fallback to core bundle
            universalLinker.loadBundle('core').catch(console.error);
        });
    } else {
        // Load core bundle by default
        universalLinker.loadBundle('core').catch(console.error);
    }
});

// Performance monitoring
window.addEventListener('load', () => {
    const loadedCount = universalLinker.getLoadedResources().length;
    console.log(`📊 Total resources loaded: ${loadedCount}`);
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UniversalLinker, PathUpdater };
}
