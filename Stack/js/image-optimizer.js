/**
 * Image Optimizer for Vrindopnishad Book Collection
 * 
 * Provides functions to optimize images based on display size, container dimensions,
 * and device capabilities. Handles lazy loading, progressive enhancement, and 
 * quality optimization.
 */

// Configuration for image optimization
const ImageConfig = {
    // Quality presets for different image purposes
    quality: {
        thumbnail: 0.8,  // High quality for book covers
        gallery: 0.85,   // Very high quality for gallery display
        hero: 0.9        // Maximum quality for hero images
    },
    
    // Default dimensions for different image types
    dimensions: {
        bookCover: {
            small: { width: 200, height: 300 },
            medium: { width: 300, height: 450 },
            large: { width: 400, height: 600 }
        },
        gallery: {
            small: { width: 400, height: 300 },
            medium: { width: 800, height: 600 },
            large: { width: 1200, height: 900 }
        }
    },
    
    // Maximum image file sizes in KB
    maxFileSizes: {
        mobile: 150,   // For mobile devices
        tablet: 250,   // For tablets
        desktop: 400   // For desktop displays
    },
    
    // Lazy loading options
    lazyLoading: {
        threshold: 0.1,   // Start loading when 10% of the image is in the viewport
        rootMargin: "50px" // Load images 50px before they enter the viewport
    }
};

/**
 * Image Optimizer Class
 * Handles image optimization throughout the book collection website
 */
class ImageOptimizer {
    constructor(config = ImageConfig) {
        this.config = config;
        this.deviceType = this.detectDeviceType();
        this.supportsWebP = this.checkWebPSupport();
        this.observer = null;
        this.isInitialized = false;
    }
    
    /**
     * Initialize the optimizer
     */
    init() {
        if (this.isInitialized) return;
        
        this.setupLazyLoading();
        this.optimizeExistingImages();
        this.setupResizeHandler();
        this.isInitialized = true;
        
        console.log(`ImageOptimizer initialized (${this.deviceType}, WebP: ${this.supportsWebP})`);
    }
    
    /**
     * Detect device type based on screen width
     * @returns {string} Device type (mobile, tablet, or desktop)
     */
    detectDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
    
    /**
     * Check if the browser supports WebP format
     * @returns {Promise<boolean>} Promise resolving to true if WebP is supported
     */
    async checkWebPSupport() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = () => resolve(true);
            webP.onerror = () => resolve(false);
            webP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
        });
    }
    
    /**
     * Set up lazy loading for images using Intersection Observer
     */
    setupLazyLoading() {
        // Skip if IntersectionObserver is not available
        if (!('IntersectionObserver' in window)) {
            // Fallback: load all images immediately
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                if (img.dataset.srcset) img.srcset = img.dataset.srcset;
            });
            return;
        }
        
        // Configure and create the observer
        const config = {
            rootMargin: this.config.lazyLoading.rootMargin,
            threshold: this.config.lazyLoading.threshold
        };
        
        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                
                const img = entry.target;
                
                // Start loading the image
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                    img.removeAttribute('data-srcset');
                }
                
                // Add loading animation
                img.classList.add('loading');
                
                // When image loads, remove loading state and add loaded class
                img.onload = () => {
                    img.classList.remove('loading');
                    img.classList.add('loaded');
                    
                    // Enhance parent container when image loads
                    const container = img.closest('.book-cover, .gallery-item');
                    if (container) container.classList.add('image-loaded');
                };
                
                // Stop observing the image
                observer.unobserve(img);
            });
        }, config);
        
        // Start observing all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.observer.observe(img);
        });
    }
    
    /**
     * Optimize existing images on the page
     */
    optimizeExistingImages() {
        // Find all image containers
        const bookCovers = document.querySelectorAll('.book-card .book-cover img');
        const galleryImages = document.querySelectorAll('.gallery-item img');
        const modalImages = document.querySelectorAll('.book-cover-3d img');
        
        // Process book covers
        bookCovers.forEach(img => {
            this.processImage(img, 'bookCover');
        });
        
        // Process gallery images
        galleryImages.forEach(img => {
            this.processImage(img, 'gallery');
        });
        
        // Process modal images
        modalImages.forEach(img => {
            this.processImage(img, 'bookCover', 'large');
        });
    }
    
    /**
     * Process an individual image for optimization
     * @param {HTMLImageElement} img - The image element to process
     * @param {string} type - Type of image (bookCover, gallery, etc.)
     * @param {string} size - Size preset (small, medium, large)
     */
    processImage(img, type, size = null) {
        if (!img.src && !img.dataset.src) return;
        
        // If size is not specified, determine based on container width
        if (!size) {
            const container = img.parentElement;
            const width = container.offsetWidth;
            
            if (width < 200) size = 'small';
            else if (width < 350) size = 'medium';
            else size = 'large';
        }
        
        // Get the appropriate dimensions for this image type and size
        const dimensions = this.config.dimensions[type][size];
        
        // If the image isn't loaded yet, set up for lazy loading
        if (!img.src && img.dataset.src) {
            const optimizedSrc = this.getOptimizedImageUrl(img.dataset.src, dimensions);
            img.dataset.src = optimizedSrc;
        } 
        // If it's already loaded, update its source
        else if (img.src) {
            const optimizedSrc = this.getOptimizedImageUrl(img.src, dimensions);
            
            // Only replace if different (avoid unnecessary reloads)
            if (optimizedSrc !== img.src) {
                // Create a new image to preload
                const newImg = new Image();
                newImg.onload = () => {
                    img.src = optimizedSrc;
                };
                newImg.src = optimizedSrc;
            }
        }
        
        // Add appropriate sizing attributes
        img.width = dimensions.width;
        img.height = dimensions.height;
        
        // Add loading="lazy" for native lazy loading as backup
        img.loading = "lazy";
        
        // Add appropriate CSS classes
        img.classList.add('optimized');
        
        // Add transition effects for smooth loading
        img.style.transition = "opacity 0.3s ease";
    }
    
    /**
     * Generate an optimized image URL based on the original URL and target dimensions
     * @param {string} originalUrl - Original image URL
     * @param {Object} dimensions - Target dimensions { width, height }
     * @returns {string} Optimized image URL
     */
    getOptimizedImageUrl(originalUrl, dimensions) {
        // For actual production implementation, you would:
        // 1. Check if you're using an image service that supports URL parameters for resizing (like Cloudinary, Imgix, etc.)
        // 2. Or check if server supports image resizing endpoints
        
        // This is a simple implementation that returns the original URL
        // since we can't actually resize images client-side
        return originalUrl;
        
        // If you are using a service like Cloudinary, you might do something like:
        // return originalUrl.replace('/upload/', `/upload/w_${dimensions.width},h_${dimensions.height},q_${quality},c_fill/`);
    }
    
    /**
     * Detect when new images are added to the DOM and process them
     * @param {NodeList} addedNodes - Elements added to the DOM
     */
    processNewImages(addedNodes) {
        addedNodes.forEach(node => {
            // If this is an image element
            if (node.tagName === 'IMG') {
                // Determine image type based on parent containers
                let type = 'bookCover'; // Default
                
                if (node.closest('.gallery-item')) {
                    type = 'gallery';
                } else if (node.closest('.book-cover-3d')) {
                    type = 'bookCover';
                }
                
                this.processImage(node, type);
            }
            
            // If this contains images, process them
            if (node.querySelectorAll) {
                // Process book covers
                node.querySelectorAll('.book-card .book-cover img').forEach(img => {
                    this.processImage(img, 'bookCover');
                });
                
                // Process gallery images
                node.querySelectorAll('.gallery-item img').forEach(img => {
                    this.processImage(img, 'gallery');
                });
                
                // Process modal images
                node.querySelectorAll('.book-cover-3d img').forEach(img => {
                    this.processImage(img, 'bookCover', 'large');
                });
            }
        });
    }
    
    /**
     * Set up a mutation observer to detect new images added to the DOM
     */
    setupMutationObserver() {
        if (!('MutationObserver' in window)) return;
        
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    this.processNewImages(mutation.addedNodes);
                }
            });
        });
        
        observer.observe(document.body, { 
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Set up handler for window resize events to adjust image sizes
     */
    setupResizeHandler() {
        let resizeTimer;
        
        window.addEventListener('resize', () => {
            // Update device type
            this.deviceType = this.detectDeviceType();
            
            // Debounce resize handling
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.optimizeExistingImages();
            }, 250);
        }, { passive: true });
    }
    
    /**
     * Add fade-in effect to images that load dynamically
     * @param {string} selector - CSS selector for the container with images
     */
    enhanceContainer(selector) {
        const container = document.querySelector(selector);
        if (!container) return;
        
        // Process all images in this container
        const images = container.querySelectorAll('img');
        
        images.forEach(img => {
            // Skip images that already have been processed
            if (img.classList.contains('optimized')) return;
            
            // Determine image type based on container
            let type = 'bookCover'; // Default
            if (container.classList.contains('gallery-container')) {
                type = 'gallery';
            }
            
            this.processImage(img, type);
        });
        
        // Add enhanced styles
        container.classList.add('enhanced');
    }
    
    /**
     * Update the source of an image based on screen size (for responsive images)
     * @param {HTMLImageElement} img - The image element
     * @param {Object} sources - Object with sources for different screen sizes
     */
    updateImageSource(img, sources) {
        const deviceType = this.deviceType;
        
        if (sources[deviceType]) {
            if (img.src !== sources[deviceType]) {
                // Set data-src for lazy loading if the image has not loaded yet
                if (!img.complete || img.naturalHeight === 0) {
                    img.dataset.src = sources[deviceType];
                    // Add to lazy loading observation
                    if (this.observer) this.observer.observe(img);
                } else {
                    img.src = sources[deviceType];
                }
            }
        }
    }
}

// Create global instance of the optimizer
const imageOptimizer = new ImageOptimizer();

// Initialize the optimizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    imageOptimizer.init();
    
    // Enhance specific containers
    imageOptimizer.enhanceContainer('.book-grid');
    imageOptimizer.enhanceContainer('.book-preview');
    
    // Set up mutation observer for dynamically added content
    imageOptimizer.setupMutationObserver();
    
    // Add animation classes
    document.querySelectorAll('.book-card').forEach(card => {
        card.classList.add('image-optimize-ready');
    });
});

// Export the optimizer instance for direct use in other scripts
window.imageOptimizer = imageOptimizer; 