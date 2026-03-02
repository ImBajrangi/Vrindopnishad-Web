// Enhanced Collection Page Script with Dynamic Collection Details Support
// This script works with the existing collection page and passes data to collection-details.html

// Collection data URL
const dataUrl = "/Vrindopnishad Web/class/json/collections_data.json";
let collectionsData = {};

// Enhanced data structure for collection details
const collectionDetailsMap = {
    "sacred-temples": {
        images: [
            "https://i.postimg.cc/G2Jtvrzx/tempImageN7Ynt8.avif",
            "https://i.postimg.cc/hjgy2bbR/tempImageO8LIr2.avif",
            "https://i.postimg.cc/nzYrqZTT/tempImagepeTFpY.avif",
            "https://i.postimg.cc/L82pZfGK/tempImage0MZ1Qo.avif"
        ],
        price: 2999,
        tags: ["temples", "architecture", "spiritual", "heritage"]
    },
    "divine-portraits": {
        images: [
            "https://i.postimg.cc/yx32SQ76/62.avif",
            "https://i.postimg.cc/G2Jtvrzx/tempImageN7Ynt8.avif",
            "https://i.postimg.cc/SsNLXZf8/tempImageXR0Khf.avif",
            "https://i.postimg.cc/66ZV8GdG/tempImageEpdAxY.avif"
        ],
        price: 3499,
        tags: ["portraits", "deities", "art", "paintings"]
    },
    "spiritual-landscapes": {
        images: [
            "https://i.postimg.cc/nzYrqZTT/tempImagepeTFpY.avif",
            "https://i.postimg.cc/VsxMwHMk/temp-Image-DVx-VWQ.avif",
            "https://i.postimg.cc/h4zxHqXr/temp-Image0m4o-HY.avif",
            "https://i.postimg.cc/g2Yxk92N/temp-Image-Y61d7-W.avif"
        ],
        price: 2499,
        tags: ["landscapes", "nature", "sacred", "pilgrimage"]
    },
    "festival-moments": {
        images: [
            "https://i.postimg.cc/L82pZfGK/tempImage0MZ1Qo.avif",
            "https://i.postimg.cc/L89jQCG1/tempImageQAFHVQ.avif",
            "https://i.postimg.cc/cJ6w0KxH/tempImageyiRJ1l.avif",
            "https://i.postimg.cc/Fs1PCKcg/tempImagez5mFhZ.avif"
        ],
        price: 3999,
        tags: ["festivals", "celebrations", "culture", "events"]
    },
    "meditation-spaces": {
        images: [
            "https://i.postimg.cc/hjgy2bbR/tempImageO8LIr2.avif",
            "https://i.postimg.cc/nzYrqZTT/tempImagepeTFpY.avif",
            "https://i.postimg.cc/VsxMwHMk/temp-Image-DVx-VWQ.avif",
            "https://i.postimg.cc/g2Yxk92N/temp-Image-Y61d7-W.avif"
        ],
        price: 2799,
        tags: ["meditation", "peace", "zen", "tranquility"]
    },
    "character-art": {
        images: [
            "https://i.postimg.cc/RZhCwvYL/temp-Image-Fsblv-Q.avif",
            "https://i.postimg.cc/bN3NGZmF/temp-Imagefa-W5wa.avif",
            "https://i.postimg.cc/L6H86t3s/temp-Image6-M4-FDA.avif",
            "https://i.postimg.cc/hPpPJX24/temp-Imageg-VDr-Y9.avif"
        ],
        price: 4999,
        tags: ["characters", "illustrations", "anime", "art"]
    },
    "warrior-theme": {
        images: [
            "https://i.postimg.cc/XqVRBgBX/temp-Image-KVsh-Fy.avif",
            "https://i.postimg.cc/0yF1XmFV/temp-Image-PRh2-Km.avif",
            "https://i.postimg.cc/nzY8LWzT/temp-Image0-GHro6.avif",
            "https://i.postimg.cc/BnXGCNYt/temp-Image4-RTJPu.avif"
        ],
        price: 3299,
        tags: ["warriors", "samurai", "knights", "battle"]
    },
    "dark-aesthetic": {
        images: [
            "https://i.postimg.cc/rsQv1t57/temp-Imageq2-Af-Gz.avif",
            "https://i.postimg.cc/FFVmFYkR/temp-Imageoo-RS7-Y.avif",
            "https://i.postimg.cc/fWCnn11f/temp-Image-Qu2-Bi-Z.avif",
            "https://i.postimg.cc/GmH1jz7H/temp-Image-UQR4i-G.avif"
        ],
        price: 3799,
        tags: ["dark", "modern", "aesthetic", "moody"]
    }
};

// Search functionality
function initializeSearch() {
    const searchToggle = document.getElementById('search-toggle');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');

    if (!searchToggle || !searchOverlay || !searchInput || !searchResults) {
        console.error('Search elements not found');
        return;
    }

    let searchTimeout = null;

    function toggleSearch() {
        searchOverlay.classList.toggle('active');
        if (searchOverlay.classList.contains('active')) {
            searchInput.focus();
        }
    }

    function handleSearch(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.toLowerCase();

        searchTimeout = setTimeout(() => {
            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }

            const allItems = Object.values(collectionsData).flatMap(category =>
                category.items || category
            );

            const results = allItems
                .filter(item =>
                    (item.title && item.title.toLowerCase().includes(query)) ||
                    (item.description && item.description.toLowerCase().includes(query)) ||
                    (collectionDetailsMap[item.id]?.tags?.some(tag => tag.toLowerCase().includes(query)))
                )
                .slice(0, 10);

            searchResults.innerHTML = '';

            if (results.length > 0) {
                results.forEach(item => {
                    const resultElement = document.createElement('div');
                    resultElement.className = 'search-result-item';
                    resultElement.setAttribute('data-category', item.category || '');

                    const tags = collectionDetailsMap[item.id]?.tags || [];

                    resultElement.innerHTML = `
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <span class="category-tag">${item.category || 'Collection'}</span>
                        ${tags.length > 0 ? `<div class="tags-container">${tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>` : ''}
                    `;

                    resultElement.addEventListener('click', () => {
                        openPopup(item);
                        toggleSearch();
                    });

                    searchResults.appendChild(resultElement);
                });
            } else {
                searchResults.innerHTML = '<p style="padding: 1rem; color: #ccc;">No results found</p>';
            }

        }, 300);
    }

    searchToggle.addEventListener('click', toggleSearch);
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            toggleSearch();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            toggleSearch();
        }
    });
    searchInput.addEventListener('input', handleSearch);
}


// Collection generation
function initializeCollections() {
    if (collectionsData.featured) generateCollectionItems('featured-slider', collectionsData.featured.items || collectionsData.featured);
    if (collectionsData.popular) generateCollectionItems('popular-slider', collectionsData.popular.items || collectionsData.popular);
    if (collectionsData.rapper) generateCollectionItems('rapper-slider', collectionsData.rapper.items || collectionsData.rapper);
    if (collectionsData.anime) generateCollectionItems('anime-slider', collectionsData.anime.items || collectionsData.anime);
    if (collectionsData.dark) generateCollectionItems('dark-slider', collectionsData.dark.items || collectionsData.dark);
    if (collectionsData.warrior) generateCollectionItems('warrior-slider', collectionsData.warrior.items || collectionsData.warrior);
    if (collectionsData.chhibi) generateCollectionItems('chhibi-slider', collectionsData.chhibi.items || collectionsData.chhibi);
}

// Fixed header background rotation
function initializeHeaderBackground() {
    const headerBgs = document.querySelectorAll('.header-bg');
    if (headerBgs.length === 0) {
        return;
    }

    let currentBg = 0;
    setInterval(() => {
        if (headerBgs[currentBg]) {
            headerBgs[currentBg].classList.remove('active');
        }
        currentBg = (currentBg + 1) % headerBgs.length;
        if (headerBgs[currentBg]) {
            headerBgs[currentBg].classList.add('active');
        }
    }, 5000);
}

function generateCollectionItems(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        container.innerHTML = '<p style="padding: 2rem; text-align: center;">No items available</p>';
        return;
    }

    container.innerHTML = '';

    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'collection-item loading';
        itemElement.setAttribute('data-category', item.category || '');
        itemElement.setAttribute('data-id', item.id || index);
        itemElement.style.backgroundImage = `url(${item.image})`;

        itemElement.innerHTML = `
            <div class="item-content">
                <h3 class="item-title">${item.title || 'Untitled'}</h3>
                <p class="item-description">${item.description || ''}</p>
                <div class="item-stats">
                    <span class="item-count">
                        <i class="fas fa-images"></i>
                        ${item.count || item.itemCount || 0} images
                    </span>
                    ${item.rating ? `<span class="item-rating"><i class="fas fa-star"></i> ${item.rating.toFixed(1)}</span>` : ''}
                    ${item.views ? `<span class="item-views"><i class="fas fa-eye"></i> ${item.views.toLocaleString()}</span>` : ''}
                </div>
                ${containerId === 'featured-slider' && item.category ? `<span class="category-tag">${item.category}</span>` : ''}
            </div>
        `;

        itemElement.addEventListener('click', () => {
            openPopup(item);
        });

        container.appendChild(itemElement);

        const img = new Image();
        img.src = item.image;
        img.onload = () => itemElement.classList.remove('loading');
        img.onerror = () => {
            itemElement.classList.remove('loading');
            itemElement.classList.add('error');
        };

        setTimeout(() => itemElement.classList.remove('loading'), 3000);
    });
}

// Header scroll effect
function initializeHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScrollPosition = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        header.classList.toggle('scrolled', currentScroll > lastScrollPosition && currentScroll > 100);
        lastScrollPosition = currentScroll;
    });
}

// Slider functionality
function initializeSliders() {
    document.querySelectorAll('.slider-container').forEach(container => {
        const slider = container.querySelector('.items-slider');
        const leftBtn = container.querySelector('.scroll-btn.left');
        const rightBtn = container.querySelector('.scroll-btn.right');

        if (!slider || !leftBtn || !rightBtn) return;

        let isScrolling = false;
        const scrollAmount = slider.offsetWidth * 0.8;

        const scroll = (direction) => {
            if (isScrolling) return;
            isScrolling = true;
            slider.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
            setTimeout(() => { isScrolling = false; }, 300);
        };

        leftBtn.addEventListener('click', () => scroll(-1));
        rightBtn.addEventListener('click', () => scroll(1));

        function updateButtonStates() {
            const isAtStart = slider.scrollLeft <= 0;
            const isAtEnd = slider.scrollLeft >= (slider.scrollWidth - slider.clientWidth);
            leftBtn.style.opacity = isAtStart ? '0.5' : '1';
            rightBtn.style.opacity = isAtEnd ? '0.5' : '1';
            leftBtn.disabled = isAtStart;
            rightBtn.disabled = isAtEnd;
        }

        updateButtonStates();
        slider.addEventListener('scroll', updateButtonStates);
        window.addEventListener('resize', updateButtonStates);
    });
}

// Load collections data from JSON
async function loadCollectionsData() {
    try {
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        collectionsData = data.collections || data;

        if (data.heroSection) updateHeroSection(data.heroSection);
        if (data.siteConfig) updateSiteConfig(data.siteConfig);
        if (data.navigation) updateNavigation(data.navigation);

        return true;
    } catch (error) {
        console.error('Error loading collections data:', error);
        return false;
    }
}

// Update UI elements from JSON data
function updateHeroSection(heroData) {
    const heroSection = document.querySelector('.hero-section');
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');

    if (heroData.backgroundImage && heroSection) {
        heroSection.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), url('${heroData.backgroundImage}')`;
    }
    if (heroTitle) heroTitle.textContent = heroData.title;
    if (heroDescription) heroDescription.textContent = heroData.description;
}

function updateSiteConfig(config) {
    const siteName = document.querySelector('.logo h1');
    const siteIcon = document.querySelector('.logo i');

    if (siteName) siteName.textContent = config.siteName;
    if (siteIcon) siteIcon.className = config.siteIcon;
    if (config.siteName) document.title = config.siteName + ' - Collection';
}

function updateNavigation(navItems) {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    navMenu.innerHTML = navItems.map(item => `<a href="${item.href}" class="nav-item ${item.active ? 'active' : ''}">${item.name}</a>`).join('');
}

// Enhanced Popup functions with navigation to collection-details
function openPopup(item) {
    const modal = document.getElementById('popup-modal');
    const hero = document.getElementById('popup-hero');

    if (!modal || !hero) {
        console.error('Popup elements not found');
        return;
    }

    hero.style.backgroundImage = `url(${item.image})`;

    const
        popupTitle = document.querySelector('.popup-title'),
        popupRating = document.querySelector('.popup-rating span'),
        popupYear = document.querySelector('.popup-year'),
        popupCount = document.querySelector('.popup-count'),
        popupCategory = document.querySelector('.popup-category'),
        popupDescription = document.querySelector('.popup-description'),
        statNumbers = document.querySelectorAll('.stat-number'),
        viewCollectionBtn = modal.querySelector('.popup-btn-primary');

    if (popupTitle) popupTitle.textContent = item.title || 'Untitled';
    if (popupRating) popupRating.textContent = item.rating ? item.rating.toFixed(1) : '4.5';
    if (popupYear) popupYear.textContent = item.year || '2024';
    if (popupCount) popupCount.textContent = `${item.count || item.itemCount || 0} items`;
    if (popupCategory) popupCategory.textContent = item.category || 'Collection';
    if (popupDescription) popupDescription.textContent = item.description || 'No description available';

    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = item.count || item.itemCount || 0;
        statNumbers[1].textContent = item.views ? formatNumber(item.views) : '0';
        statNumbers[2].textContent = Math.floor(Math.random() * 1000);
    }

    // Enhanced "View Collection" button with proper navigation
    if (viewCollectionBtn) {
        const newBtn = viewCollectionBtn.cloneNode(true);
        viewCollectionBtn.parentNode.replaceChild(newBtn, viewCollectionBtn);

        newBtn.addEventListener('click', () => {
            if (item && item.id) {
                // Store collection data in sessionStorage for the details page
                const detailsData = {
                    ...item,
                    images: collectionDetailsMap[item.id]?.images || [item.image],
                    price: collectionDetailsMap[item.id]?.price || 2999,
                    tags: collectionDetailsMap[item.id]?.tags || []
                };

                sessionStorage.setItem('collectionData', JSON.stringify(detailsData));

                // Navigate to details page - update this path to match your structure
                const detailsPageUrl = `/Vrindopnishad Web/Pictures/temp/collection-details.html?id=${item.id}`;
                window.location.href = detailsPageUrl;
            } else {
                console.error("Cannot navigate: collection item ID is missing.");
            }
        });
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    const modal = document.getElementById('popup-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function initPopup() {
    const closeBtn = document.getElementById('popup-close');
    const modal = document.getElementById('popup-modal');

    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (modal) modal.addEventListener('click', (e) => e.target === modal && closePopup());
    document.addEventListener('keydown', (e) => e.key === 'Escape' && closePopup());
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const dataLoaded = await loadCollectionsData();

    initializeSearch();
    initializeHeaderScroll();
    initializeHeaderBackground();
    initializeSliders();
    initPopup();

    if (dataLoaded && Object.keys(collectionsData).length > 0) {
        initializeCollections();
    } else {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h2>Error Loading Collections</h2>
                    <p>Sorry, we couldn't load the collections data. Please try refreshing the page.</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }
});