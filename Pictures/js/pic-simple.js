// Using relative path to avoid CORS issues when accessed from custom domain (vrindopnishad.in)
const dataUrl = "/Vrindopnishad Web/class/json/images.json";

// Initialize touch interactions for mobile/tablet
function initializeTouchInteractions() {
    // Use event delegation for handling touches on image cards
    document.addEventListener('touchstart', handleImageCardTouch);
    document.addEventListener('click', handleImageCardTouch);
}

function handleImageCardTouch(e) {
    const imageCard = e.target.closest('.image-card');
    if (!imageCard) return;

    // Remove active class from all other cards
    document.querySelectorAll('.image-card.active').forEach(card => {
        if (card !== imageCard) {
            card.classList.remove('active');
        }
    });

    // Toggle active class on the touched card
    imageCard.classList.toggle('active');

    // Prevent immediate propagation to avoid triggering other events
    e.stopPropagation();
}

// Handle clicks outside image cards to remove active state
document.addEventListener('click', (e) => {
    if (!e.target.closest('.image-card')) {
        document.querySelectorAll('.image-card.active').forEach(card => {
            card.classList.remove('active');
        });
    }
});

// Create image card element with proper action button structure and animations
// Image card creation is handled by the improved version later in the file


// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Global variables
let allImages = [];
let currentFilter = 'all';
let currentLightboxIndex = 0;
let lightboxInitialized = false;

// Image preloader cache
const imageCache = new Map();
const preloadQueue = [];
let isPreloading = false;

// Initialize Intersection Observer for lazy loading with larger margin
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        const img = entry.target;
        const src = img.dataset.src;

        if (!src) return;

        if (entry.isIntersecting) {
            // Add to preload queue with priority based on viewport position
            const priority = Math.abs(entry.boundingClientRect.y);
            addToPreloadQueue({ img, src, priority });

            // Start preloading if not already running
            if (!isPreloading) {
                processPreloadQueue();
            }
        }
    });
}, {
    // Increase root margin to start loading earlier
    rootMargin: '200px 0px 200px 0px',
    threshold: [0, 0.1, 0.5],
    root: null
});

// Add image to preload queue with priority
function addToPreloadQueue({ img, src, priority }) {
    // Don't add if already in queue or cached
    if (imageCache.has(src) || preloadQueue.some(item => item.src === src)) {
        return;
    }

    // Insert into queue based on priority
    const queueItem = { img, src, priority };
    const insertIndex = preloadQueue.findIndex(item => item.priority > priority);

    if (insertIndex === -1) {
        preloadQueue.push(queueItem);
    } else {
        preloadQueue.splice(insertIndex, 0, queueItem);
    }
}

// Process the preload queue
async function processPreloadQueue() {
    if (isPreloading || preloadQueue.length === 0) return;

    isPreloading = true;

    while (preloadQueue.length > 0) {
        const { img, src } = preloadQueue.shift();

        try {
            // Check cache first
            if (imageCache.has(src)) {
                applyImage(img, src);
                continue;
            }

            // Load and cache the image
            await loadImage(img, src);

        } catch (error) {
            console.warn(`Failed to load image: ${src}`, error);
            setFallbackImage(img);
        }

        // Small delay to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    isPreloading = false;
}

// Helper function to load an image
function loadImage(img, src) {
    return new Promise((resolve, reject) => {
        const tmpImg = new Image();

        tmpImg.onload = () => {
            imageCache.set(src, true);
            applyImage(img, src);
            resolve();
        };

        tmpImg.onerror = () => {
            reject(new Error(`Failed to load image: ${src}`));
        };

        tmpImg.src = src;
    });
}

// Apply loaded image to element
function applyImage(img, src) {
    img.src = src;
    img.setAttribute('data-vault', src);
    img.classList.add('loaded');
    img.style.opacity = '1';
    img.removeAttribute('data-src');
}

// Set fallback image
function setFallbackImage(img) {
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cpath fill="%23ccc" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/%3E%3C/svg%3E';
    img.classList.add('error');
}

// Consolidated initialization handled at the end of the file to include URL parameter processing


// Initialize all features
function initializeAllFeatures() {

    initializeFilters();
    initializeLightbox();

    initializeSearch();
    initializeAllActionButtons();
    initializeToolsMenu();
    initializeMagneticEffect();
    initializeAnimations();

    // Load saved like states after everything is initialized
    setTimeout(loadLikeStates, 100);

    console.log("All features initialized");
}

// Load gallery data (from Supabase or fallback JSON)
async function loadGalleryData() {
    try {
        console.log("Attempting to load gallery data...");

        let images = null;
        let categories = null;

        // 1. Try fetching from Supabase if configured
        if (window.supabaseClient && window.supabaseClient.supabaseUrl !== 'https://your-project-url.supabase.co') {
            const data = await fetchImagesFromSupabase();
            if (data && data.length > 0) {
                console.log(`Loaded ${data.length} images from Supabase`);
                images = data;
                // Category counts will be calculated from the fetched images
                categories = [
                    { id: 'all', name: 'All' },
                    { id: 'anime', name: 'Anime' },
                    { id: 'landscape', name: 'Landscape' },
                    { id: 'nature', name: 'Nature' },
                    { id: 'spiritual', name: 'Spiritual' }
                ];
            }
        }

        // 2. Fallback to local JSON if Supabase failed or isn't configured
        if (!images) {
            console.log("Supabase not configured or failed, falling back to local JSON...");
            const response = await fetch(dataUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const localData = await response.json();
            images = localData.images;
            categories = localData.categories;
            console.log(`Loaded ${images.length} images from local JSON`);
        }

        // Clear existing content
        const masonryLayout = document.querySelector('.masonry-layout');
        if (!masonryLayout) return;
        masonryLayout.querySelectorAll('.image-card').forEach(card => card.remove());

        // Store images globally
        allImages = images;

        // Generate image cards
        images.forEach((image, index) => {
            const imageCard = createImageCard(image, index);
            masonryLayout.appendChild(imageCard);
        });

        // Update filter buttons
        updateFilterButtons(categories, images);

    } catch (error) {
        console.error('Failed to load gallery data:', error);
        initializeFallbackImages();
    }
}

// Keep the old function name for compatibility if needed, but point to the new logic
async function loadGalleryFromJSON() {
    return loadGalleryData();
}

function createImageCard(image, index) {
    const imageCard = document.createElement('div');
    imageCard.className = 'image-card';
    imageCard.setAttribute('data-category', image.category);
    imageCard.setAttribute('data-index', index);
    imageCard.setAttribute('data-image-id', image.id || index);

    // Pinterest discovery attributes
    imageCard.setAttribute('data-pin-description', image.description || image.alt);
    imageCard.setAttribute('data-pin-media', image.src);
    imageCard.setAttribute('data-pin-url', window.location.href);

    // Schema.org Product & Offer (for Google Shopping discovery)
    imageCard.setAttribute('itemscope', '');
    imageCard.setAttribute('itemtype', 'http://schema.org/Product');

    imageCard.innerHTML = `
        <div itemprop="image" itemscope itemtype="http://schema.org/ImageObject">
            <img data-src="${image.src}" 
                 alt="${image.alt}" 
                 itemprop="contentUrl"
                 loading="lazy" 
                 class="lazy">
            <meta itemprop="url" content="${image.src}">
        </div>
        <div class="image-overlay">
            <div class="image-actions">
                <button class="action-btn like-btn magnetic" 
                        data-magnetic-strength="0.6" 
                        data-action="like"
                        data-image-index="${index}"
                        title="Like this image">
                    <i class="far fa-heart"></i>
                </button>
                <button class="action-btn view-btn magnetic" 
                        data-magnetic-strength="0.6"
                        data-action="view"
                        data-image-index="${index}"
                        title="View full size">
                    <i class="fas fa-expand"></i>
                </button>
                <button class="action-btn download-btn magnetic" 
                        data-magnetic-strength="0.6"
                        data-action="download"
                        data-image-index="${index}"
                        title="Download image">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
        <meta itemprop="name" content="${image.title || image.alt}">
        <meta itemprop="description" content="${image.description || image.alt}">
        
        <!-- Offers Schema for Google Shopping Discovery -->
        <div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
            <meta itemprop="price" content="${image.price || '0.00'}">
            <meta itemprop="priceCurrency" content="${image.currency || 'INR'}">
            <meta itemprop="availability" content="https://schema.org/InStock">
            <meta itemprop="url" content="${window.location.href}">
        </div>
    `;

    return imageCard;
}

// Initialize comprehensive action button handling
function initializeAllActionButtons() {
    // Add CSS to ensure proper action button animations
    if (!document.getElementById('action-buttons-style')) {
        const style = document.createElement('style');
        style.id = 'action-buttons-style';
        style.textContent = `
            .image-card .action-btn {
                transform: translateY(20px) !important;
                opacity: 0 !important;
                transition: all 0.3s cubic-bezier(0.21, 0.61, 0.35, 1) !important;
            }
            .image-card:hover .action-btn {
                transform: translateY(0) !important;
                opacity: 1 !important;
            }
            .image-card:hover .action-btn:nth-child(1) { transition-delay: 0.1s !important; }
            .image-card:hover .action-btn:nth-child(2) { transition-delay: 0.2s !important; }
            .image-card:hover .action-btn:nth-child(3) { transition-delay: 0.3s !important; }
            .action-btn:hover {
                background-color: var(--primary-color) !important;
                transform: translateY(-5px) !important;
            }
        `;
        document.head.appendChild(style);
    }

    console.log("Setting up action button handlers...");

    // Use event delegation for all action buttons
    document.addEventListener('click', handleAllActionButtons);

    console.log("Action button handlers ready");
}

// Handle all action button clicks with proper event delegation
function handleAllActionButtons(e) {
    // Check if clicked element or its parent is an action button
    const button = e.target.closest('.action-btn, .like-btn, .view-btn, .download-btn');

    if (!button) return;

    e.preventDefault();
    e.stopPropagation();

    // Determine action type
    let action = button.getAttribute('data-action');
    if (!action) {
        if (button.classList.contains('like-btn')) action = 'like';
        else if (button.classList.contains('view-btn')) action = 'view';
        else if (button.classList.contains('download-btn')) action = 'download';
    }

    // Get image index
    let imageIndex = parseInt(button.getAttribute('data-image-index'));
    if (isNaN(imageIndex)) {
        const imageCard = button.closest('.image-card');
        if (imageCard) {
            imageIndex = parseInt(imageCard.getAttribute('data-index'));
        }
    }

    if (isNaN(imageIndex) || imageIndex < 0) {
        console.error("Could not determine image index for button:", button);
        return;
    }

    console.log(`Action button clicked: ${action} for image ${imageIndex}`);

    // Add visual feedback
    addButtonClickFeedback(button);

    // Execute action
    switch (action) {
        case 'like':
            handleLikeAction(button, imageIndex);
            break;
        case 'view':
            handleViewAction(imageIndex);
            break;
        case 'download':
            handleDownloadAction(imageIndex);
            break;
        default:
            console.warn("Unknown action:", action);
    }
}

// Add visual feedback to button clicks
function addButtonClickFeedback(button) {
    // Scale animation
    gsap.fromTo(button,
        { scale: 1 },
        {
            scale: 0.9,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
        }
    );

    // Add ripple effect
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        z-index: 1000;
    `;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width - size) / 2 + 'px';
    ripple.style.top = (rect.height - size) / 2 + 'px';

    button.appendChild(ripple);

    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

// Handle like action with proper state management
function handleLikeAction(button, imageIndex) {
    console.log("Processing like action for image:", imageIndex);

    const icon = button.querySelector('i');
    const isLiked = button.classList.contains('liked');
    const imageId = allImages[imageIndex]?.id || imageIndex;

    if (isLiked) {
        // Unlike
        button.classList.remove('liked');
        icon.classList.remove('fas', 'fa-heart');
        icon.classList.add('far', 'fa-heart');
        showNotification('Removed from favorites', 'info', 2000);
        saveLikeState(imageId, false);
    } else {
        // Like
        button.classList.add('liked');
        icon.classList.remove('far', 'fa-heart');
        icon.classList.add('fas', 'fa-heart');
        showNotification('Added to favorites!', 'success', 2000);
        saveLikeState(imageId, true);
    }

    // Heart animation with enhanced effect
    gsap.timeline()
        .to(button, {
            scale: 1.4,
            duration: 0.2,
            ease: "back.out(2)"
        })
        .to(button, {
            scale: 1,
            duration: 0.3,
            ease: "elastic.out(1, 0.5)"
        });

    // Add floating heart effect for likes
    if (!isLiked) {
        createFloatingHeart(button);
    }
}

// Create floating heart effect
function createFloatingHeart(button) {
    const heart = document.createElement('div');
    heart.innerHTML = '<i class="fas fa-heart"></i>';
    heart.style.cssText = `
        position: absolute;
        color: #ff4757;
        font-size: 1.2rem;
        pointer-events: none;
        z-index: 1001;
        opacity: 1;
        transform: translateY(0px);
    `;

    const rect = button.getBoundingClientRect();
    heart.style.left = (rect.left + rect.width / 2 - 10) + 'px';
    heart.style.top = (rect.top + rect.height / 2 - 10) + 'px';

    document.body.appendChild(heart);

    // Animate floating heart
    gsap.to(heart, {
        y: -50,
        opacity: 0,
        scale: 1.5,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }
    });
}

// Handle view action with enhanced debugging
function handleViewAction(imageIndex) {
    console.log("Processing view action for image:", imageIndex);
    console.log("All images array:", allImages);
    console.log("Requested image:", allImages[imageIndex]);

    if (!allImages[imageIndex]) {
        console.error("Image not found at index:", imageIndex);
        console.error("Available images:", allImages.length);
        showNotification('Image not found', 'error');
        return;
    }

    const image = allImages[imageIndex];
    console.log("Image data:", {
        id: image.id,
        src: image.src,
        alt: image.alt,
        category: image.category
    });

    // Test if the image URL is accessible
    const testImg = new Image();
    testImg.onload = () => {
        console.log("Image URL is accessible:", image.src);
        openLightbox(imageIndex);
    };
    testImg.onerror = () => {
        console.error("Image URL is not accessible:", image.src);
        showNotification('Image could not be loaded', 'error');
        // Still try to open lightbox in case it's a CORS issue
        openLightbox(imageIndex);
    };
    testImg.src = image.src;
}

// Handle download action with enhanced feedback
function handleDownloadAction(imageIndex) {
    console.log("Processing download action for image:", imageIndex);

    const image = allImages[imageIndex];
    if (!image) {
        console.error("Image not found at index:", imageIndex);
        showNotification('Image not found', 'error');
        return;
    }

    const filename = (image.title || image.alt || 'image').replace(/\s+/g, '_').toLowerCase();

    // Show immediate feedback
    showNotification('Starting download...', 'info', 1500);

    // Start download
    downloadImage(image.src, filename).then(success => {
        if (success) {
            showNotification('Download completed!', 'success');
        } else {
            showNotification('Download failed. Opening image in new tab.', 'warning');
        }
    });
}

// Update filter buttons with counts
function updateFilterButtons(categories, images) {
    const counts = {
        all: images.length,
        anime: images.filter(img => img.category === 'anime').length,
        landscape: images.filter(img => img.category === 'landscape').length,
        nature: images.filter(img => img.category === 'nature').length,
        spiritual: images.filter(img => img.category === 'spiritual').length
    };

    categories.forEach(category => {
        const button = document.querySelector(`[data-filter="${category.id}"]`);
        if (button && counts[category.id] !== undefined) {
            button.textContent = `${category.name} (${counts[category.id]})`;
        }
    });
}

// Initialize fallback for existing HTML images
function initializeFallbackImages() {
    console.log("Initializing fallback images...");
    const existingCards = document.querySelectorAll('.image-card');
    allImages = [];

    existingCards.forEach((card, index) => {
        const img = card.querySelector('img');
        if (img) {
            const imageData = {
                id: index,
                src: img.src,
                alt: img.alt,
                category: card.getAttribute('data-category') || 'anime'
            };
            allImages.push(imageData);

            // Update card attributes
            card.setAttribute('data-index', index);
            card.setAttribute('data-image-id', index);

            // Update action buttons
            const actionButtons = card.querySelectorAll('.action-btn');
            actionButtons.forEach(btn => {
                btn.setAttribute('data-image-index', index);
                if (!btn.getAttribute('data-action')) {
                    if (btn.classList.contains('like-btn')) btn.setAttribute('data-action', 'like');
                    else if (btn.classList.contains('view-btn')) btn.setAttribute('data-action', 'view');
                    else if (btn.classList.contains('download-btn')) btn.setAttribute('data-action', 'download');
                }
            });
        }
    });

    console.log(`Using ${allImages.length} fallback images`);
}

// Animation functions
function initializeAnimations() {
    const imageCards = document.querySelectorAll('.image-card');

    imageCards.forEach((card, index) => {
        gsap.fromTo(card, {
            opacity: 0,
            y: 50,
            rotateX: 10,
        }, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.6,
            delay: index * 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: card,
                start: "top bottom-=100",
                end: "top center",
                toggleActions: "play none none none",
                markers: false,
            }
        });
    });
}

// Filter functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');
            currentFilter = filterValue;

            // Apply filter with animation
            applyCurrentFilters();
        });
    });
}

// Apply current filters with smooth animations
function applyCurrentFilters() {
    const imageCards = document.querySelectorAll('.image-card');
    const searchValue = document.getElementById('search-input')?.value.toLowerCase() || '';

    imageCards.forEach((card, index) => {
        const category = card.getAttribute('data-category');
        const img = card.querySelector('img');
        const imgAlt = img ? img.getAttribute('alt').toLowerCase() : '';

        const categoryMatch = currentFilter === 'all' || category === currentFilter;
        const searchMatch = !searchValue || imgAlt.includes(searchValue);

        if (categoryMatch && searchMatch) {
            // Show card with staggered animation
            card.style.display = 'block';
            gsap.fromTo(card, {
                opacity: 0,
                scale: 0.8,
                y: 20
            }, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.4,
                delay: index * 0.05,
                ease: "back.out(1.7)"
            });
        } else {
            // Hide card with animation
            gsap.to(card, {
                opacity: 0,
                scale: 0.8,
                y: -20,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    card.style.display = 'none';
                }
            });
        }
    });

    // Refresh ScrollTrigger after layout changes
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 500);
}

// Lightbox functionality
function initializeLightbox() {
    console.log("Initializing lightbox...");

    if (!lightboxInitialized) {
        createLightbox();
        attachLightboxEvents();
        lightboxInitialized = true;
        console.log("Lightbox initialized");
    }
}

// Create enhanced lightbox
function createLightbox() {
    // Remove existing lightbox if any
    const existingLightbox = document.querySelector('.lightbox');
    if (existingLightbox) {
        existingLightbox.remove();
    }

    const lightboxHTML = `
        <div class="lightbox" id="mainLightbox">
            <div class="lightbox-content">
                <img class="lightbox-img" src="" alt="Lightbox image">
                <div class="lightbox-caption"></div>
            </div>
            <button class="lightbox-btn prev-btn" 
                    data-lightbox-action="prev" 
                    title="Previous Image">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="lightbox-btn next-btn" 
                    data-lightbox-action="next" 
                    title="Next Image">
                <i class="fas fa-chevron-right"></i>
            </button>
            <button class="lightbox-download-btn" 
                    data-lightbox-action="download" 
                    title="Download Image">
                <i class="fas fa-download"></i>
            </button>
            <button class="close-lightbox" 
                    data-lightbox-action="close" 
                    title="Close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    // Add enhanced CSS for better functionality
    const lightboxStyle = document.createElement('style');
    lightboxStyle.id = 'lightbox-enhanced-styles';
    lightboxStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        #mainLightbox {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background-color: rgba(0, 0, 0, 0.95) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 9999 !important;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease !important;
            backdrop-filter: blur(10px);
        }
        
        #mainLightbox.active {
            opacity: 1 !important;
            pointer-events: all !important;
        }
        
        #mainLightbox .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        #mainLightbox .lightbox-img {
            max-width: 100%;
            max-height: 80vh;
            border-radius: 8px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease;
        }
        
        #mainLightbox .lightbox-caption {
            color: white;
            text-align: center;
            padding: 1rem 0;
            max-width: 80%;
            margin: 0 auto;
        }
        
        #mainLightbox .lightbox-btn,
        #mainLightbox .close-lightbox,
        #mainLightbox .lightbox-download-btn {
            position: absolute !important;
            z-index: 10001 !important;
            cursor: pointer !important;
            border: none !important;
            background-color: rgba(255, 255, 255, 0.15) !important;
            color: white !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.3s cubic-bezier(0.21, 0.61, 0.35, 1) !important;
            backdrop-filter: blur(10px) !important;
            user-select: none !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
        }
        
        #mainLightbox .lightbox-btn {
            width: 60px !important;
            height: 60px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            font-size: 20px !important;
        }
        
        #mainLightbox .prev-btn {
            left: 30px !important;
        }
        
        #mainLightbox .next-btn {
            right: 30px !important;
        }
        
        #mainLightbox .close-lightbox,
        #mainLightbox .lightbox-download-btn {
            width: 50px !important;
            height: 50px !important;
            font-size: 18px !important;
        }
        
        #mainLightbox .close-lightbox {
            top: 30px !important;
            right: 30px !important;
        }
        
        #mainLightbox .lightbox-download-btn {
            top: 30px !important;
            left: 30px !important;
        }
        
        #mainLightbox .lightbox-btn:hover,
        #mainLightbox .close-lightbox:hover,
        #mainLightbox .lightbox-download-btn:hover {
            background-color: var(--primary-color, #faf861) !important;
            transform: scale(1.1) !important;
            box-shadow: 0 8px 25px rgba(250, 248, 97, 0.4) !important;
        }
        
        #mainLightbox .prev-btn:hover,
        #mainLightbox .next-btn:hover {
            transform: translateY(-50%) scale(1.1) !important;
        }
        
        #mainLightbox .close-lightbox:hover i {
            transform: rotate(90deg);
        }
        
        @media (max-width: 768px) {
            #mainLightbox .prev-btn { left: 15px !important; }
            #mainLightbox .next-btn { right: 15px !important; }
            #mainLightbox .close-lightbox { top: 15px !important; right: 15px !important; }
            #mainLightbox .lightbox-download-btn { top: 15px !important; left: 15px !important; }
        }
    `;

    document.head.appendChild(lightboxStyle);
}

// Attach lightbox event listeners
function attachLightboxEvents() {
    console.log("Attaching lightbox event listeners...");

    document.addEventListener('click', handleLightboxClicks);
    document.addEventListener('keydown', handleLightboxKeyboard);

    console.log("Lightbox event listeners attached");
}

// Handle all lightbox button clicks
function handleLightboxClicks(e) {
    const lightbox = document.querySelector('#mainLightbox');
    if (!lightbox) return;

    // Check for lightbox action buttons
    const actionButton = e.target.closest('[data-lightbox-action]');
    if (actionButton && lightbox.classList.contains('active')) {
        e.preventDefault();
        e.stopPropagation();

        const action = actionButton.getAttribute('data-lightbox-action');
        console.log(`Lightbox button clicked: ${action}`);

        // Add visual feedback
        addButtonClickFeedback(actionButton);

        switch (action) {
            case 'close':
                closeLightboxFunction();
                break;
            case 'prev':
                navigateLightbox(-1);
                break;
            case 'next':
                navigateLightbox(1);
                break;
            case 'download':
                downloadCurrentLightboxImage();
                break;
        }
        return;
    }

    // Check for background click
    if (e.target === lightbox && lightbox.classList.contains('active')) {
        console.log("Lightbox background clicked");
        closeLightboxFunction();
    }
}

// Handle lightbox keyboard navigation
function handleLightboxKeyboard(e) {
    const lightbox = document.querySelector('#mainLightbox');
    if (!lightbox || !lightbox.classList.contains('active')) return;

    switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            e.preventDefault();
            navigateLightbox(1);
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            navigateLightbox(-1);
            break;
        case 'Escape':
            e.preventDefault();
            closeLightboxFunction();
            break;
        case ' ': // Spacebar
            e.preventDefault();
            navigateLightbox(1);
            break;
    }
}

// Open lightbox at specific index
function openLightbox(index) {
    console.log("Opening lightbox for image:", index);

    const lightbox = document.querySelector('#mainLightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');

    if (!lightbox || !allImages[index]) {
        console.error('Lightbox or image not found:', { lightbox: !!lightbox, imageExists: !!allImages[index], index });
        return;
    }

    currentLightboxIndex = index;
    const image = allImages[index];

    // Set image with loading animation
    gsap.set(lightboxImg, { opacity: 0, scale: 0.8 });

    lightboxImg.src = image.src;
    lightboxImg.alt = image.alt;
    lightboxCaption.innerHTML = image.title ?
        `<h3>${image.title}</h3><p>${image.alt}</p>` :
        `<p>${image.alt}</p>`;

    // Show lightbox
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Animate image in
    lightboxImg.onload = () => {
        gsap.to(lightboxImg, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
    };

    console.log('Lightbox opened successfully for image:', index);
}

// Navigate lightbox with enhanced animations
function navigateLightbox(direction) {
    const newIndex = currentLightboxIndex + direction;

    if (newIndex < 0 || newIndex >= allImages.length) {
        console.log('Navigation out of bounds:', newIndex, '/', allImages.length);

        // Add shake effect to indicate boundary
        const lightboxImg = document.querySelector('.lightbox-img');
        if (lightboxImg) {
            gsap.to(lightboxImg, {
                x: direction * 20,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });
        }
        return;
    }

    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');

    if (!lightboxImg || !lightboxCaption) {
        console.error('Lightbox elements not found');
        return;
    }

    console.log(`Navigating from ${currentLightboxIndex} to ${newIndex}`);

    // Slide out current image
    gsap.to(lightboxImg, {
        x: direction * -100,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            currentLightboxIndex = newIndex;
            const image = allImages[newIndex];

            if (image) {
                lightboxImg.src = image.src;
                lightboxImg.alt = image.alt;
                lightboxCaption.innerHTML = image.title ?
                    `<h3>${image.title}</h3><p>${image.alt}</p>` :
                    `<p>${image.alt}</p>`;

                // Set up for slide in from opposite direction
                gsap.set(lightboxImg, { x: direction * 100, opacity: 0 });

                // Slide in new image
                gsap.to(lightboxImg, {
                    x: 0,
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });

                console.log('Navigated to image:', newIndex);
            }
        }
    });
}

// Close lightbox function with animation
function closeLightboxFunction() {
    console.log("Closing lightbox");
    const lightbox = document.querySelector('#mainLightbox');
    const lightboxImg = document.querySelector('.lightbox-img');

    if (lightbox) {
        // Animate image out
        if (lightboxImg) {
            gsap.to(lightboxImg, {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                ease: "back.in(1.7)"
            });
        }

        // Close lightbox
        setTimeout(() => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }, 100);
    }
}

// Download current lightbox image
function downloadCurrentLightboxImage() {
    const image = allImages[currentLightboxIndex];
    if (image) {
        const filename = (image.title || image.alt || 'image').replace(/\s+/g, '_').toLowerCase();
        downloadImage(image.src, filename).then(success => {
            if (success) {
                showNotification('Download completed!', 'success');
            } else {
                showNotification('Opening image in new tab', 'info');
            }
        });
    }
}

// Theme toggle functionality

// Search functionality with live filtering
function initializeSearch() {
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        // Add debouncing for better performance
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);

            searchTimeout = setTimeout(() => {
                applyCurrentFilters();
            }, 300); // 300ms debounce
        });

        // Clear search on escape
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                applyCurrentFilters();
            }
        });
    }
}

// Enhanced download functionality with multiple fallback methods
async function downloadImage(imgSrc, fileName) {
    console.log("Starting download for:", imgSrc);

    try {
        // Method 1: Try direct blob download (works for same-origin and CORS-enabled images)
        const response = await fetch(imgSrc, {
            mode: 'cors',
            headers: {
                'Origin': window.location.origin
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${fileName}_${Date.now()}.jpg`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

            return true;
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

    } catch (error) {
        console.log("Blob download failed, trying canvas method:", error);

        // Method 2: Try canvas method for cross-origin images
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = function () {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob(function (blob) {
                        if (blob) {
                            const blobUrl = URL.createObjectURL(blob);

                            const link = document.createElement('a');
                            link.href = blobUrl;
                            link.download = `${fileName}_${Date.now()}.png`;
                            link.style.display = 'none';

                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

                            resolve(true);
                        } else {
                            throw new Error('Failed to create blob');
                        }
                    }, 'image/png');

                } catch (canvasError) {
                    console.log("Canvas method failed:", canvasError);
                    fallbackDownload(imgSrc, fileName);
                    resolve(false);
                }
            };

            img.onerror = function () {
                console.log("Image load failed, using fallback");
                fallbackDownload(imgSrc, fileName);
                resolve(false);
            };

            img.src = imgSrc;
        });
    }
}

// Fallback download method - opens in new tab
function fallbackDownload(imgSrc, fileName) {
    console.log("Using fallback download method");

    const link = document.createElement('a');
    link.href = imgSrc;
    link.download = `${fileName}_${Date.now()}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    // For mobile devices, try to trigger download
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        link.download = '';
    }

    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Tools Menu functionality
function initializeToolsMenu() {
    const toolsIcon = document.querySelector('.tools-icon');
    const toolsMenu = document.querySelector('.tools-menu');
    const toolsMenuClose = document.querySelector('.tools-menu-close');
    const toolItems = document.querySelectorAll('.tool-item');

    if (!toolsIcon || !toolsMenu || !toolsMenuClose) return;

    // Open tools menu with enhanced animation
    toolsIcon.addEventListener('click', () => {
        toolsIcon.classList.add('pulse-animation');

        // Animate icon rotation
        gsap.to(toolsIcon, {
            rotation: 360,
            scale: 1.2,
            duration: 0.5,
            ease: "back.out(1.7)"
        });

        setTimeout(() => {
            toolsMenu.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Animate tool items
            toolItems.forEach((item, index) => {
                gsap.fromTo(item, {
                    opacity: 0,
                    y: 30,
                    scale: 0.8
                }, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "back.out(1.7)"
                });
            });
        }, 200);
    });

    // Close tools menu
    toolsMenuClose.addEventListener('click', () => {
        closeToolsMenu();
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toolsMenu.classList.contains('active')) {
            closeToolsMenu();
        }
    });

    function closeToolsMenu() {
        // Animate tool items out
        toolItems.forEach((item, index) => {
            gsap.to(item, {
                opacity: 0,
                y: -30,
                scale: 0.8,
                duration: 0.3,
                delay: index * 0.05,
                ease: "back.in(1.7)"
            });
        });

        setTimeout(() => {
            toolsMenu.classList.remove('active');
            document.body.style.overflow = '';

            // Reset tools icon
            toolsIcon.classList.remove('pulse-animation');
            gsap.to(toolsIcon, {
                rotation: 0,
                scale: 1,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        }, 200);
    }

    // Add hover effects to tool items
    toolItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const bgColor = item.getAttribute('data-bg-color');
            const textColor = item.getAttribute('data-text-color');

            if (bgColor && textColor) {
                gsap.to(item, {
                    backgroundColor: bgColor,
                    color: textColor,
                    scale: 1.02,
                    duration: 0.3,
                    ease: "power2.out"
                });

                // Animate child elements
                const icon = item.querySelector('.tool-icon');
                const h3 = item.querySelector('h3');
                const p = item.querySelector('p');

                if (icon) gsap.to(icon, { scale: 1.1, duration: 0.3 });
                if (h3) gsap.to(h3, { color: textColor, duration: 0.3 });
                if (p) gsap.to(p, { color: textColor, duration: 0.3 });
            }
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                backgroundColor: '',
                color: '',
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });

            const icon = item.querySelector('.tool-icon');
            const h3 = item.querySelector('h3');
            const p = item.querySelector('p');

            if (icon) gsap.to(icon, { scale: 1, duration: 0.3 });
            if (h3) gsap.to(h3, { color: '', duration: 0.3 });
            if (p) gsap.to(p, { color: '', duration: 0.3 });
        });
    });
}

// Enhanced magnetic effect functionality
function initializeMagneticEffect() {
    const magneticElements = document.querySelectorAll('.magnetic');

    magneticElements.forEach(elem => {
        const strength = parseFloat(elem.getAttribute('data-magnetic-strength')) || 0.3;

        // Adjust strength based on element type
        let adjustedStrength = strength;
        if (elem.classList.contains('logo')) adjustedStrength = strength * 0.3;
        else if (elem.classList.contains('search-box')) adjustedStrength = strength * 0.2;
        else if (elem.classList.contains('filter-btn')) adjustedStrength = strength * 0.5;
        else if (elem.classList.contains('social-link')) adjustedStrength = strength * 0.4;

        // Skip magnetic effect on touch devices
        if (window.matchMedia('(hover: none)').matches) {
            return;
        }

        elem.addEventListener('mouseenter', () => {
            elem.classList.add('magnetic-active');
        });

        elem.addEventListener('mouseleave', () => {
            elem.classList.remove('magnetic-active');

            gsap.to(elem, {
                x: 0,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                duration: 0.7,
                ease: 'elastic.out(1, 0.3)'
            });

            // Reset child elements
            const children = elem.querySelectorAll('i, svg');
            children.forEach(child => {
                gsap.to(child, {
                    x: 0,
                    y: 0,
                    duration: 0.7,
                    ease: 'elastic.out(1, 0.3)'
                });
            });
        });

        elem.addEventListener('mousemove', (e) => {
            if (!elem.classList.contains('magnetic-active')) return;

            const rect = elem.getBoundingClientRect();
            const relX = e.clientX - rect.left - rect.width / 2;
            const relY = e.clientY - rect.top - rect.height / 2;

            const maxMove = 10 * adjustedStrength;
            const limitedX = Math.max(Math.min(relX * adjustedStrength, maxMove), -maxMove);
            const limitedY = Math.max(Math.min(relY * adjustedStrength, maxMove), -maxMove);

            // Apply main element movement
            gsap.to(elem, {
                duration: 0.3,
                x: limitedX,
                y: limitedY,
                ease: 'power2.out'
            });

            // Add subtle rotation for certain elements
            if (!elem.classList.contains('tools-icon') &&
                !elem.classList.contains('logo') &&
                !elem.classList.contains('search-box')) {
                const rotationStrength = adjustedStrength * 5;
                const maxRotation = 10 * adjustedStrength;
                const rotationX = Math.max(Math.min(relY * rotationStrength * -0.5, maxRotation), -maxRotation);
                const rotationY = Math.max(Math.min(relX * rotationStrength * 0.5, maxRotation), -maxRotation);

                gsap.to(elem, {
                    duration: 0.3,
                    rotationX: rotationX,
                    rotationY: rotationY,
                    ease: 'power2.out'
                });
            }

            // Animate child elements
            const children = elem.querySelectorAll('i, svg');
            if (children.length > 0 &&
                (elem.classList.contains('action-btn') ||
                    elem.classList.contains('theme-toggle') ||
                    elem.classList.contains('tools-icon') ||
                    elem.classList.contains('social-link'))) {

                const maxChildMove = 8 * adjustedStrength;
                const childX = Math.max(Math.min(relX * adjustedStrength * 0.8, maxChildMove), -maxChildMove);
                const childY = Math.max(Math.min(relY * adjustedStrength * 0.8, maxChildMove), -maxChildMove);

                children.forEach(child => {
                    gsap.to(child, {
                        duration: 0.3,
                        x: childX,
                        y: childY,
                        ease: 'power2.out'
                    });
                });
            }
        });
    });
}

// Like state management
function saveLikeState(imageId, isLiked) {
    try {
        let likedImages = JSON.parse(localStorage.getItem('likedImages') || '[]');

        if (isLiked && !likedImages.includes(imageId)) {
            likedImages.push(imageId);
        } else if (!isLiked) {
            likedImages = likedImages.filter(id => id !== imageId);
        }

        localStorage.setItem('likedImages', JSON.stringify(likedImages));
        console.log(`Like state saved for image ${imageId}: ${isLiked}`);
    } catch (error) {
        console.error('Failed to save like state:', error);
    }
}

function loadLikeStates() {
    try {
        const likedImages = JSON.parse(localStorage.getItem('likedImages') || '[]');
        console.log('Loading like states for images:', likedImages);

        likedImages.forEach(imageId => {
            const card = document.querySelector(`[data-image-id="${imageId}"]`);
            if (card) {
                const likeBtn = card.querySelector('.like-btn');
                if (likeBtn) {
                    likeBtn.classList.add('liked');
                    const icon = likeBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    }
                    console.log(`Restored like state for image ${imageId}`);
                }
            }
        });
    } catch (error) {
        console.error('Failed to load like states:', error);
    }
}

// Consolidated initialization handled at the end of the file
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded - Starting initialization");

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const collectionId = urlParams.get('collection');
    const category = urlParams.get('category');
    const title = urlParams.get('title');
    const count = urlParams.get('count');
    const imageId = urlParams.get('id');

    // Load gallery from JSON first, then initialize everything else
    loadGalleryFromJSON().then(() => {
        initializeAllFeatures();

        // If coming from a product link (Google Shopping), scroll to the specific image
        if (imageId) {
            setTimeout(() => {
                const targetCard = document.querySelector(`.image-card[data-image-id="${imageId}"]`);
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetCard.classList.add('active'); // Highlight the card
                }
            }, 800); // Wait for images to render
        }

        // If coming from popup, apply the specific filter
        if (category && category !== 'all') {
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-filter') === category) {
                    btn.classList.add('active');
                }
            });

            currentFilter = category;
            applyCurrentFilters();
        }

        // Update page title if specified
        if (title) {
            document.title = `${title} - Vrindopnishad Collection`;
            const header = document.querySelector('.filter-container');
            if (header && (collectionId || category)) {
                const collectionHeader = document.createElement('div');
                collectionHeader.className = 'collection-header';
                collectionHeader.innerHTML = `
                    <h2 style="margin-bottom: 1rem; color: var(--text-light);">
                        ${title} <span style="opacity: 0.7;">(${count || ''} images)</span>
                    </h2>
                `;
                header.insertBefore(collectionHeader, header.firstChild);
            }
        }

        // Start observing all lazy images
        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    });
});