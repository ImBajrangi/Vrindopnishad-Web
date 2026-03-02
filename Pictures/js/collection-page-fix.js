// Collection data - will be populated from JSON
let collectionsData = {};
// Using relative path to avoid CORS issues when accessed from custom domain (vrindopnishad.in)
// const dataUrl = "https://imbajrangi.github.io/Company/Vrindopnishad Web/class/json/collections_data.json";
const dataUrl = "../../class/json/collection_data_price.json";

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
                    // *** FIXED: Search item.tags directly from the JSON data
                    (item.tags?.some(tag => tag.toLowerCase().includes(query)))
                )
                .slice(0, 10);

            searchResults.innerHTML = '';

            if (results.length > 0) {
                results.forEach(item => {
                    const resultElement = document.createElement('div');
                    resultElement.className = 'search-result-item';
                    resultElement.setAttribute('data-category', item.category || '');

                    resultElement.innerHTML = `
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <span class="category-tag">${item.category || 'Collection'}</span>
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
    // Initialize My List first
    refreshMyListUI();

    if (collectionsData.featured) generateCollectionItems('featured-slider', collectionsData.featured.items || collectionsData.featured);
    if (collectionsData.popular) generateCollectionItems('popular-slider', collectionsData.popular.items || collectionsData.popular);
    if (collectionsData.rapper) generateCollectionItems('rapper-slider', collectionsData.rapper.items || collectionsData.rapper);
    if (collectionsData.anime) generateCollectionItems('anime-slider', collectionsData.anime.items || collectionsData.anime);
    if (collectionsData.dark) generateCollectionItems('dark-slider', collectionsData.dark.items || collectionsData.dark);
    if (collectionsData.warrior) generateCollectionItems('warrior-slider', collectionsData.warrior.items || collectionsData.warrior);
    if (collectionsData.chhibi) generateCollectionItems('chhibi-slider', collectionsData.chhibi.items || collectionsData.chhibi);
}

// My List Functionality
function getMyList() {
    return JSON.parse(localStorage.getItem('myCollectionList') || '[]');
}

function toggleMyList(item) {
    let myList = getMyList();
    const index = myList.findIndex(i => i.id === item.id);

    if (index === -1) {
        myList.push(item);
        if (window.showNotification) showNotification(`Added ${item.title} to My List`, 'success');
    } else {
        myList.splice(index, 1);
        if (window.showNotification) showNotification(`Removed ${item.title} from My List`, 'info');
    }

    localStorage.setItem('myCollectionList', JSON.stringify(myList));

    // Sync to Firebase
    if (window.AuthService) {
        window.AuthService.saveFavorites(myList);
    }

    refreshMyListUI();
    return index === -1; // returns true if added
}

function refreshMyListUI() {
    const myList = getMyList();
    const myListSection = document.getElementById('my-list-section');
    const myListSlider = document.getElementById('mylist-slider');

    if (!myListSection || !myListSlider) return;

    if (myList.length > 0) {
        myListSection.classList.add('active');
        generateCollectionItems('mylist-slider', myList);
        // Re-initialize slider specifically for My List if it was previously empty
        initializeSliders();
    } else {
        myListSection.classList.remove('active');
        myListSlider.innerHTML = '';
    }
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
        // Use data-vault for security
        itemElement.setAttribute('data-vault', item.image);

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

        // Set background image immediately for faster perceived loading
        itemElement.style.backgroundImage = `url('${item.image}')`;

        const img = new Image();
        img.src = item.image;
        if (index < 5) img.fetchPriority = 'high'; // Prioritize visible items

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

// Load collections data from JSON or Supabase
async function loadCollectionsData() {
    try {
        // --- NEW: Try fetching from Supabase first ---
        if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
            console.log('Fetching collections from Supabase...');
            const { data, error } = await window.supabaseClient
                .from('collections')
                .select('*');

            if (!error && data && data.length > 0) {
                console.log(`Loaded ${data.length} collections from Supabase`);

                // Group the flat Supabase data into the structured format the UI expects
                const structuredData = {
                    featured: { title: "Featured Collections", items: [] },
                    popular: { title: "Popular Right Now", items: [] },
                    rapper: { title: "Rapper Style", items: [] },
                    anime: { title: "Anime Style", items: [] },
                    dark: { title: "Dark Aesthetic", items: [] },
                    warrior: { title: "Warrior Styles", items: [] },
                    chhibi: { title: "Chhibi Styles", items: [] }
                };

                data.forEach(item => {
                    const section = item.cat_section || 'featured';
                    if (structuredData[section]) {
                        structuredData[section].items.push(item);
                    } else {
                        // If section doesn't exist, put in featured as fallback or create new
                        if (!structuredData[section]) {
                            structuredData[section] = { title: item.cat_section, items: [] };
                        }
                        structuredData[section].items.push(item);
                    }
                });

                collectionsData = structuredData;
                sessionStorage.setItem('allCollectionsData', JSON.stringify(structuredData));
                return true;
            } else if (error) {
                console.warn('Supabase fetch error:', error.message);
            }
        }

        // --- FALLBACK: Load from local JSON ---
        console.log('Falling back to local collections JSON...');
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        collectionsData = data.collections || data;

        if (data.collections) {
            sessionStorage.setItem('allCollectionsData', JSON.stringify(data.collections));
        }

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
        // Apply secondary security via data-vault if possible, otherwise use standard
        heroSection.setAttribute('data-vault', heroData.backgroundImage);
    }
    if (heroTitle) heroTitle.textContent = heroData.title;
    if (heroDescription) heroDescription.textContent = heroData.description;
}

function initializeHeroButtons() {
    console.log('initializeHeroButtons called');

    const browseBtn = document.querySelector('.hero-buttons .ripple-btn.orange');
    const infoBtn = document.querySelector('.hero-buttons .ripple-btn.dark');

    console.log('browseBtn found:', browseBtn);
    console.log('infoBtn found:', infoBtn);

    if (browseBtn) {
        // Remove any existing handlers first
        browseBtn.onclick = null;

        browseBtn.addEventListener('click', (e) => {
            console.log('Browse button clicked!');
            e.preventDefault();
            e.stopPropagation();
            const featuredSection = document.querySelector('.featured-collections');
            if (featuredSection) {
                window.scrollTo({
                    top: featuredSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });

        // Ensure button is clickable
        browseBtn.style.pointerEvents = 'auto';
        browseBtn.style.cursor = 'pointer';
    }

    if (infoBtn) {
        // Remove any existing handlers first
        infoBtn.onclick = null;

        infoBtn.addEventListener('click', (e) => {
            console.log('Info button clicked!');
            e.preventDefault();
            e.stopPropagation();
            const footer = document.getElementById('contact');
            if (footer) {
                window.scrollTo({
                    top: footer.offsetTop,
                    behavior: 'smooth'
                });
            }
        });

        // Ensure button is clickable
        infoBtn.style.pointerEvents = 'auto';
        infoBtn.style.cursor = 'pointer';
    }
}

function updateSiteConfig(config) {
    const siteName = document.querySelector('.logo h1');
    const siteIcon = document.querySelector('.logo i');

    if (siteName) siteName.textContent = config.siteName;
    if (siteIcon) siteIcon.className = config.siteIcon;
    if (config.siteName) document.title = config.siteName + ' - Collection';
}

function updateNavigation(navItems) {
    // DISABLED: Preserve the clean minimal header from HTML
    // The navigation is now defined directly in the HTML file
    return;

    navItems.forEach(item => {
        if (item.name === 'Browse by Category') {
            const dropdown = document.createElement('div');
            dropdown.className = 'nav-item nav-dropdown';
            dropdown.innerHTML = `
                <span>${item.name} <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 5px;"></i></span>
                <div class="dropdown-menu">
                    <a href="#featured-slider" class="dropdown-item">Featured</a>
                    <a href="#popular-slider" class="dropdown-item">Popular</a>
                    <a href="#rapper-slider" class="dropdown-item">Rapper Style</a>
                    <a href="#anime-slider" class="dropdown-item">Anime & Art</a>
                    <a href="#dark-slider" class="dropdown-item">Dark Aesthetic</a>
                    <a href="#warrior-slider" class="dropdown-item">Warrior Styles</a>
                    <a href="#chhibi-slider" class="dropdown-item">Chhibi Styles</a>
                </div>
            `;
            navMenu.appendChild(dropdown);

            // Add scroll behavior to dropdown items
            dropdown.querySelectorAll('.dropdown-item').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetSection = document.getElementById(targetId)?.closest('.content-row');
                    if (targetSection) {
                        window.scrollTo({
                            top: targetSection.offsetTop - 100,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        } else if (item.name === 'My List') {
            const link = document.createElement('a');
            link.className = `nav-item ${item.active ? 'active' : ''}`;
            link.href = '#';
            link.textContent = item.name;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const myListSection = document.getElementById('my-list-section');
                if (myListSection) {
                    window.scrollTo({
                        top: myListSection.offsetTop - 100,
                        behavior: 'smooth'
                    });
                } else {
                    if (window.showNotification) showNotification("Your list is empty", 'info');
                }
            });
            navMenu.appendChild(link);
        } else {
            const link = document.createElement('a');
            link.className = `nav-item ${item.active ? 'active' : ''}`;
            link.href = item.href;
            link.textContent = item.name;
            navMenu.appendChild(link);
        }
    });
}

// Enhanced Popup with proper data passing
function openPopup(item) {
    const modal = document.getElementById('popup-modal');
    const hero = document.getElementById('popup-hero');

    if (!modal || !hero) {
        console.error('Popup elements not found');
        return;
    }

    hero.setAttribute('data-vault', item.image);
    hero.style.backgroundImage = `url('${item.image}')`;

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

    // ENHANCED: Add to My List functionality
    const myListBtn = modal.querySelector('.popup-btn-secondary');
    if (myListBtn) {
        const myList = getMyList();
        const isInList = myList.some(i => i.id === item.id);

        myListBtn.innerHTML = isInList ?
            '<i class="fas fa-check"></i> In My List' :
            '<i class="fas fa-plus"></i> Add to My List';

        const newMyListBtn = myListBtn.cloneNode(true);
        myListBtn.parentNode.replaceChild(newMyListBtn, myListBtn);

        newMyListBtn.addEventListener('click', () => {
            const added = toggleMyList(item);
            newMyListBtn.innerHTML = added ?
                '<i class="fas fa-check"></i> In My List' :
                '<i class="fas fa-plus"></i> Add to My List';
        });
    }

    // ENHANCED: Store complete collection data and navigate
    if (viewCollectionBtn) {
        const newBtn = viewCollectionBtn.cloneNode(true);
        viewCollectionBtn.parentNode.replaceChild(newBtn, viewCollectionBtn);

        newBtn.addEventListener('click', () => {
            if (item && item.id) {
                // *** FIXED: Prepare complete collection data directly from the 'item' (from JSON)
                const detailsData = {
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    category: item.category,
                    count: item.count || item.itemCount || 0,
                    rating: item.rating || 4.5,
                    views: item.views || 0,
                    year: item.year || '2024',
                    image: item.image,
                    // *** Use data from the 'item' object (from JSON)
                    images: item.images || [item.image],
                    price: item.price, // <-- *** USING item.price DIRECTLY FROM JSON
                    tags: item.tags || []
                };

                // Store in sessionStorage for the details page
                sessionStorage.setItem('collectionData', JSON.stringify(detailsData));
                console.log('Navigating to collection details:', item.id);
                console.log('Stored data:', detailsData);

                // Navigate to collection details page
                const detailsPageUrl = `collection-details.html?id=${item.id}`;
                window.location.href = detailsPageUrl;
            } else {
                console.error("Cannot navigate: collection item ID is missing.");
                alert("Unable to load collection details. Please try again.");
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
    console.log('Initializing collection page...');

    // Initialize UI components immediately so they work without waiting for data
    initializeSearch();
    initializeHeaderScroll();
    initializeHeaderBackground();
    initializeHeroButtons(); // Fix: Initialize hero buttons immediately
    initPopup(); // Fix: Initialize popup events immediately

    // Load data
    const dataLoaded = await loadCollectionsData();

    // Initialize data-dependent components
    if (dataLoaded && Object.keys(collectionsData).length > 0) {
        initializeCollections();
        initializeSliders(); // Sliders depend on content being generated
        console.log('Collections loaded successfully');
    } else {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h2>Unable to load collections</h2>
                    <p>Please check your internet connection and try again.</p>
                </div>
            `;
        }
    }

    // Hide loader when everything is ready (data + resources)
    const hideLoader = () => {
        if (window.VrindaLoader) {
            setTimeout(() => {
                window.VrindaLoader.hide();
            }, 500);
        }
    };

    // --- NEW: Sync Favorites on login ---
    if (window.AuthService) {
        window.AuthService.onAuthStateChange(async (event, user) => {
            if (user) {
                console.log('User logged in, syncing favorites...');
                try {
                    const cloudFavs = await window.AuthService.getFavorites();
                    if (cloudFavs && cloudFavs.length > 0) {
                        localStorage.setItem('myCollectionList', JSON.stringify(cloudFavs));
                        refreshMyListUI();
                    }
                } catch (err) {
                    console.error('Error syncing favorites:', err);
                }
            }
        });
    }

    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
        // Fallback safety timeout (max 10s)
        setTimeout(hideLoader, 10000);
    }
});
