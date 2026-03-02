// Collection data will be loaded from JSON
let collectionsData = {};
const dataUrl = "/Vrindopnishad%20Web/class/json/collections_data.json";

// Popup Modal functionality
function initializePopup() {
    const modal = document.getElementById('popup-modal');
    const closeBtn = document.getElementById('popup-close');
    const popupHero = document.getElementById('popup-hero');
    const popupInfo = document.querySelector('.popup-info');

    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close on button click
    closeBtn.addEventListener('click', closeModal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Show modal with collection data
    window.showCollectionPopup = function (collection) {
        popupHero.style.backgroundImage = `url(${collection.image})`;

        // Generate popup content with Netflix-like styling
        popupInfo.innerHTML = `
            <div class="popup-header">
                <h2 class="popup-title">${collection.title}</h2>
                ${collection.rating ? `
                    <div class="popup-rating">
                        <i class="fas fa-star"></i>
                        <span>${collection.rating.toFixed(1)}</span>
                    </div>
                ` : ''}
            </div>

            <div class="popup-meta">
                <span class="popup-year">2026</span>
                <span class="popup-count">${collection.count} Items</span>
                <span class="popup-category">${collection.category}</span>
            </div>

            <p class="popup-description">${collection.description}</p>

            <div class="popup-actions">
                <button class="popup-btn popup-btn-primary">
                    <i class="fas fa-play"></i>
                    View Collection
                </button>
                <button class="popup-btn popup-btn-secondary">
                    <i class="fas fa-plus"></i>
                    Add to My List
                </button>
                <button class="popup-btn popup-btn-outline">
                    <i class="fas fa-info-circle"></i>
                    More Info
                </button>
            </div>

            <div class="popup-stats">
                <div class="stat-item">
                    <span class="stat-number">${collection.count}</span>
                    <span class="stat-label">Items</span>
                </div>
                ${collection.views ? `
                    <div class="stat-item">
                        <span class="stat-number">${(collection.views / 1000).toFixed(1)}K</span>
                        <span class="stat-label">Views</span>
                    </div>
                ` : ''}
                ${collection.rating ? `
                    <div class="stat-item">
                        <span class="stat-number">${collection.rating}</span>
                        <span class="stat-label">Rating</span>
                    </div>
                ` : ''}
            </div>

            <div class="popup-tags">
                <span class="popup-tag">${collection.category}</span>
                <span class="popup-tag">Featured</span>
                <span class="popup-tag">HD</span>
            </div>

            <div class="related-section">
                <h3 class="related-title">More Like This</h3>
                <div class="related-grid">
                    ${generateRelatedItems(collection.category)}
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
}

// Generate related items based on category
function generateRelatedItems(category) {
    const allItems = [
        ...collectionsData.featured?.items || [],
        ...collectionsData.popular?.items || [],
        ...collectionsData.nature?.items || [],
        ...collectionsData.anime?.items || [],
        ...collectionsData.architecture?.items || []
    ];

    const relatedItems = allItems
        .filter(item => item.category === category)
        .slice(0, 4);

    return relatedItems.map(item => `
        <div class="related-item" onclick="showCollectionPopup(${JSON.stringify(item)})">
            <div class="related-image" style="background-image: url('${item.image}')"></div>
            <div class="related-info">
                <h4 class="related-name">${item.title}</h4>
                <span class="related-count">${item.count} items</span>
            </div>
        </div>
    `).join('');
}

// Enhance collection item generation to include popup trigger
function generateCollectionItems(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container || !items?.length) return;

    container.innerHTML = '';

    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'collection-item loading';
        itemElement.setAttribute('data-category', item.category || '');
        itemElement.setAttribute('data-id', item.id || '');
        itemElement.style.backgroundImage = `url(${item.image})`;

        itemElement.innerHTML = `
            <div class="item-content">
                <h3 class="item-title">${item.title}</h3>
                <p class="item-description">${item.description}</p>
                <div class="item-stats">
                    <span class="item-count">
                        <i class="fas fa-images"></i>
                        ${item.count || item.itemCount || 0} images
                    </span>
                    ${item.rating ? `
                        <span class="item-rating">
                            <i class="fas fa-star"></i>
                            ${item.rating.toFixed(1)}
                        </span>
                    ` : ''}
                    ${item.views ? `
                        <span class="item-views">
                            <i class="fas fa-eye"></i>
                            ${item.views.toLocaleString()}
                        </span>
                    ` : ''}
                </div>
                ${containerId === 'featured-slider' && item.category ? `<span class="category-tag">${item.category}</span>` : ''}
            </div>
        `;

        // Add Netflix-style hover effect and popup trigger
        itemElement.addEventListener('mouseenter', () => {
            setTimeout(() => {
                itemElement.classList.add('expanded');
            }, 300);
        });

        itemElement.addEventListener('mouseleave', () => {
            itemElement.classList.remove('expanded');
        });

        // Add click handler for popup
        itemElement.addEventListener('click', () => {
            showCollectionPopup(item);
        });

        container.appendChild(itemElement);

        // Preload image
        const img = new Image();
        img.src = item.image;
        img.onload = () => {
            itemElement.classList.remove('loading');
        };
        img.onerror = () => {
            itemElement.classList.remove('loading');
            itemElement.classList.add('error');
        };

        // Fallback for loading state
        setTimeout(() => {
            itemElement.classList.remove('loading');
        }, 3000);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(dataUrl);
        const data = await response.json();
        collectionsData = data.collections;

        initializePopup();
        if (collectionsData.featured) generateCollectionItems('featured-slider', collectionsData.featured.items);
        if (collectionsData.popular) generateCollectionItems('popular-slider', collectionsData.popular.items);
        if (collectionsData.nature) generateCollectionItems('nature-slider', collectionsData.nature.items);
        if (collectionsData.anime) generateCollectionItems('anime-slider', collectionsData.anime.items);
        if (collectionsData.architecture) generateCollectionItems('architecture-slider', collectionsData.architecture.items);
    } catch (error) {
        console.error('Error loading collections:', error);
    }
});