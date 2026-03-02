// Collection data - will be populated from JSON
let collectionsData = {};
const dataUrl = "/Vrindopnishad Web/class/json/collections_data.json";

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const dataLoaded = await loadCollectionsData();

    initializeSearch();
    initializeHeaderScroll();
    initializeSliders();
    initPopup(); // Make sure popup is initialized

    if (dataLoaded) {
        initializeCollections();
    } else {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <h2>Error Loading Collections</h2>
                    <p>Sorry, we couldn't load the collections data. Please try refreshing the page.</p>
                </div>`;
        }
    }
});

// Search functionality
function initializeSearch() {
    const searchToggle = document.getElementById('search-toggle');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');

    if (!searchToggle || !searchOverlay || !searchInput || !searchResults) return;

    let searchTimeout = null;

    function toggleSearch() {
        searchOverlay.classList.toggle('active');
        if (searchOverlay.classList.contains('active')) searchInput.focus();
    }

    function handleSearch(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.toLowerCase();

        searchTimeout = setTimeout(() => {
            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }
            const allItems = Object.values(collectionsData).flatMap(collection => collection.items || []);
            const results = allItems.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
            searchResults.innerHTML = results.length > 0
                ? results.map(item => `<div class="search-result-item" onclick="navigateToCollection('${item.category}', '${item.title}')"><h3>${item.title}</h3><p>${item.description}</p><span class="category-tag">${item.category}</span></div>`).join('')
                : '<p>No results found</p>';
        }, 300);
    }

    searchToggle.addEventListener('click', toggleSearch);
    searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) toggleSearch(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && searchOverlay.classList.contains('active')) toggleSearch(); });
    searchInput.addEventListener('input', handleSearch);
}


// Collection generation
function initializeCollections() {
    generateCollectionItems('featured-slider', collectionsData.featured?.items, 'featured');
    generateCollectionItems('popular-slider', collectionsData.popular?.items, 'popular');
    generateCollectionItems('rapper-slider', collectionsData.rapper?.items, 'rapper');
    generateCollectionItems('anime-slider', collectionsData.anime?.items, 'anime');
    generateCollectionItems('dark-slider', collectionsData.dark?.items, 'dark');
    generateCollectionItems('warrior-slider', collectionsData.warrior?.items, 'warrior');
    generateCollectionItems('chhibi-slider', collectionsData.chhibi?.items, 'chhibi');
}

function generateCollectionItems(containerId, items, collectionCategory) {
    const container = document.getElementById(containerId);
    if (!container || !items) {
        if (container) container.innerHTML = "<p style='padding: 2rem; color: var(--text-secondary);'>No items in this collection.</p>";
        return;
    }

    container.innerHTML = items.map((item, index) => `
        <div class="collection-item" role="button" tabindex="0" data-id="${item.id || index}" style="background-image: url(${item.image})">
            <div class="item-content">
                <h3 class="item-title">${item.title || 'Untitled'}</h3>
                <p class="item-description">${item.description || ''}</p>
                <div class="item-stats">
                    <span class="item-count"><i class="fas fa-images"></i> ${item.count || 0} images</span>
                    ${item.rating ? `<span class="item-rating"><i class="fas fa-star"></i> ${item.rating.toFixed(1)}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.collection-item').forEach((itemElement, index) => {
        const itemData = items[index];
        itemElement.addEventListener('click', () => openPopup(itemData, collectionCategory));
    });
}

function navigateToCollection(category, title) {
    const url = `pictures.html?category=${category}&title=${encodeURIComponent(title)}`;
    window.location.href = url;
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

        const scrollAmount = () => slider.offsetWidth * 0.8;

        leftBtn.addEventListener('click', () => slider.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
        rightBtn.addEventListener('click', () => slider.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));

        const updateButtonStates = () => {
            const atStart = slider.scrollLeft < 10;
            const atEnd = slider.scrollLeft >= (slider.scrollWidth - slider.clientWidth - 10);
            leftBtn.style.opacity = atStart ? '0.5' : '1';
            rightBtn.style.opacity = atEnd ? '0.5' : '1';
            leftBtn.disabled = atStart;
            rightBtn.disabled = atEnd;
        };

        slider.addEventListener('scroll', updateButtonStates);
        window.addEventListener('resize', updateButtonStates);
        setTimeout(updateButtonStates, 500);
    });
}

// Load collections data from JSON
async function loadCollectionsData() {
    try {
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        collectionsData = data.collections || {};
        if (data.siteConfig) updateSiteConfig(data.siteConfig);
        return true;
    } catch (error) {
        console.error('Error loading collections data:', error);
        return false;
    }
}

function updateSiteConfig(config) {
    const siteName = document.querySelector('.logo h1');
    if (siteName) siteName.textContent = config.siteName;
    if (config.siteName) document.title = `${config.siteName} - Collections`;
}

// --- POPUP LOGIC ---

function initPopup() {
    const closeBtn = document.getElementById('popup-close');
    const modal = document.getElementById('popup-modal');

    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closePopup(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });
}

function openPopup(item, collectionCategory) {
    const modal = document.getElementById('popup-modal');
    if (!modal) return;

    // Update modal content
    modal.querySelector('.popup-hero').style.backgroundImage = `url(${item.image})`;
    modal.querySelector('.popup-title').textContent = item.title || 'Untitled';
    modal.querySelector('.popup-rating span').textContent = item.rating ? item.rating.toFixed(1) : 'N/A';
    modal.querySelector('.popup-year').textContent = item.year || '2024';
    modal.querySelector('.popup-count').textContent = `${item.count || item.itemCount || 0} items`;
    modal.querySelector('.popup-category').textContent = collectionCategory || item.category || 'Collection';
    modal.querySelector('.popup-description').textContent = item.description || 'No description available.';

    // Update stats
    const stats = modal.querySelectorAll('.stat-number');
    stats[0].textContent = item.count || item.itemCount || 0;
    stats[1].textContent = item.views ? (item.views / 1000).toFixed(1) + 'K' : '0';
    stats[2].textContent = (item.likes || Math.floor(Math.random() * 2000)).toLocaleString();

    // Get the "View Collection" button
    const viewButton = modal.querySelector('.popup-btn-primary');

    // To prevent multiple event listeners from stacking up, we replace the button with a clone
    const newViewButton = viewButton.cloneNode(true);
    viewButton.parentNode.replaceChild(newViewButton, viewButton);

    // Add the click event listener to the new button
    newViewButton.addEventListener('click', () => {
        const categoryToFilter = collectionCategory || item.category || 'all';
        navigateToCollection(categoryToFilter, item.title);
    });

    // Show the modal
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