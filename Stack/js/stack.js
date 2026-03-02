// Complete stack.js file with unified data integration
// Use ApiService from global window object
// Old import: import ApiService from './api-service.js';

// Initialize loading overlay immediately
(function initLoadingOverlay() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '1';
        loadingOverlay.style.visibility = 'visible';
        loadingOverlay.classList.add('active');
        
        // Set loading state in global state
        if (window.state) {
            window.state.isLoading = true;
            // Track when the animation started
            window.state.loadingStartTime = Date.now();
        }
        
        // Prevent scrolling while loading
        document.body.style.overflow = 'hidden';
    }
})();

// Initialize custom cursor
function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    if (!cursor || !follower) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let followerX = 0;
    let followerY = 0;
    
    // Smoother animation with requestAnimationFrame
    function animate() {
        // Smooth movement for cursor
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
        
        // Smoother movement for follower
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
        
        requestAnimationFrame(animate);
    }
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Handle cursor hover states
    const hoverElements = document.querySelectorAll('a, button, .btn, .magnetic, .book-card');
    
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(1.5)`;
            follower.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(1.5)`;
            cursor.style.background = 'rgba(255, 255, 255, 0.5)';
            follower.style.border = '1px solid rgba(255, 255, 255, 0.8)';
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(1)`;
            follower.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(1)`;
            cursor.style.background = 'rgba(255, 255, 255, 0.8)';
            follower.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        });
    });
    
    // Start animation loop
    animate();
    
    // Show cursors after initialization
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    // Handle cursor visibility when leaving/entering window
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        follower.style.opacity = '0';
    });
}

// Book data (fallback if API fails)
// let fallbackBooks = [];

// // Function to load fallback books with unified data manager integration
// async function loadFallbackBooks() {
//     try {
//         // Use the unified data manager if available
//         if (window.dataManager) {
//             const books = window.dataManager.getBooks();
//             if (books && books.length > 0) {
//                 console.log('Books loaded from unified data manager:', books.length);
//                 return books;
//             }
//         }

//         // Fallback to original JSON loading
//         const response = await fetch('/class/json/Shri Harivansh Chandr-2026-09-21T12-02-46.json');
//         if (!response.ok) {
//             throw new Error('Failed to load fallback books data');
//         }
//         const data = await response.json();
//         fallbackBooks = data.books;
//         console.log('Fallback books loaded from JSON file');
//         return fallbackBooks;
//     } catch (error) {
//         console.error('Error loading fallback books:', error);
//         // Return empty array to prevent crashes
//         return [];
//     }
// }

// State management
const state = {
    activeFilters: {
        categories: [],
        languages: [],
        formats: []
    },
    searchQuery: "",
    activeBook: null,
    readingProgress: {},
    books: [],
    isLoading: false,
    apiConnected: false
};

// DOM Elements
const bookGrid = document.querySelector('.book-grid');
const searchInput = document.querySelector('.search-input');
const searchOverlay = document.querySelector('.search-overlay');
const searchToggle = document.querySelector('#searchIcon');
const filterSidebar = document.querySelector('.filter-sidebar');
const filterToggle = document.querySelector('.filter-toggle');
const filterClose = document.querySelector('.filter-close');
const bookModal = document.querySelector('.book-modal');
const readingProgress = document.querySelector('.reading-progress');
const notificationContainer = document.querySelector('.notification-container');
const loadingOverlay = document.querySelector('.loading-overlay');
const searchBar = document.querySelector('.search-bar');

// Initialize the application with unified data manager integration
// async function init() {
//     // Set initialization flag to prevent duplicate initialization
//     window.stackJsInitialized = true;
    
//     // Show loading overlay
//     showLoadingOverlay(true);
    
//     // Initialize custom cursor
//     initCustomCursor();
    
//     // Wait for data manager to be ready if it exists
//     if (!window.dataManager) {
//         console.log('Waiting for unified data manager...');
//         await new Promise((resolve) => {
//             const checkDataManager = () => {
//                 if (window.dataManager) {
//                     console.log('Unified data manager is ready');
//                     resolve();
//                 } else {
//                     setTimeout(checkDataManager, 100);
//                 }
//             };
//             // Start checking immediately
//             checkDataManager();
//             // But don't wait forever - timeout after 5 seconds
//             setTimeout(() => {
//                 console.log('Proceeding without unified data manager');
//                 resolve();
//             }, 5000);
//         });
//     }
    
//     // Load and process data
//     await Promise.all([
//         loadFallbackBooks(),
//         new Promise(resolve => {
//             // Initialize UI components in parallel
//             initializeNavigation();
//             initializeMagneticEffect();
//             initScrollAnimations();
//             initializeSiteParticles();
//             initializeFooterParticles();
//             initializeSiteWave();
//             initializeBookGridParticles();
//             initializeBackToTop();
//             resolve();
//         })
//     ]);
    
//     // Process data
//     try {
//         // Use unified data manager books first
//         if (window.dataManager) {
//             const books = window.dataManager.getBooks();
//             if (books && books.length > 0) {
//                 state.books = books;
//                 console.log(`Loaded ${books.length} books from unified data manager`);
//             } else {
//                 state.books = [...fallbackBooks];
//                 console.log('Using fallback books as unified data manager returned no books');
//             }
//         } else {
//             // Check API status and fallback logic
//             try {
//                 const apiStatus = await ApiService.checkApiStatus();
//                 state.apiConnected = apiStatus.server === 'running';
                
//                 if (state.apiConnected) {
//                     const response = await ApiService.getBooks();
//                     if (response.success && response.data) {
//                         state.books = response.data;
//                     } else {
//                         state.books = [...fallbackBooks];
//                     }
//                 } else {
//                     state.books = [...fallbackBooks];
//                 }
//             } catch (apiError) {
//                 console.log('API service not available, using fallback books');
//                 state.books = [...fallbackBooks];
//             }
//         }
//     } catch (error) {
//         console.error('Error initializing app:', error);
//         state.books = [...fallbackBooks];
//     }
    
//     // Normalize book data
//     normalizeBookData();
    
//     // Initialize event listeners
//     initializeEventListeners();
    
//     // Check URL parameters
//     checkUrlParameters();
    
//     // Load reading progress
//     loadReadingProgress();
    
//     // Render books
//     renderBooks(state.books);
    
//     // Initialize book cards with reader integration
//     initializeBookCards();
    
//     // Hide loading overlay after initialization is complete
//     showLoadingOverlay(false);
// }

// Normalize book data structure to ensure consistency
function normalizeBookData() {
    state.books.forEach(book => {
        // Convert meta structure to direct properties if needed
        if (book.meta) {
            book.author = book.meta.author;
            book.year = book.meta.year;
            book.category = book.meta.category;
            book.language = book.meta.language;
            book.format = book.meta.formats;
            delete book.meta;
        }
        
        // Ensure readingProgress property exists
        if (book.progress !== undefined && book.readingProgress === undefined) {
            book.readingProgress = book.progress;
            delete book.progress;
        }
        
        // Ensure format is always an array
        if (!Array.isArray(book.format)) {
            book.format = [book.format].filter(Boolean);
        }
        
        // Ensure required properties exist
        book.author = book.author || 'Unknown Author';
        book.year = book.year || new Date().getFullYear();
        book.category = book.category || 'spiritual';
        book.language = book.language || 'english';
        book.format = book.format.length ? book.format : ['digital'];
    });
}

// Navigation function to reader page
function navigateToReader(bookId) {
    const book = state.books.find(b => b.id == bookId);
    if (!book) {
        console.error('Book not found:', bookId);
        return;
    }

    // Store book data for the reader page
    sessionStorage.setItem('selectedBookId', bookId);
    sessionStorage.setItem('selectedBookData', JSON.stringify(book));

    // Navigate to reader page
    const readerUrl = '/Vrindopnishad Web/sketch/main/read-me.html';
    window.location.href = `${readerUrl}?book=${bookId}`;
}

// Event Listeners
function initializeEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        
        // Clear search when ESC key is pressed
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                renderSearchResults([]);
                toggleSearch();
            }
        });
    }
    
    // Also add event listener to search bar input
    const searchBarInput = document.querySelector('.search-bar input');
    if (searchBarInput) {
        searchBarInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Filter functionality
    const filterToggle = document.querySelector('.filter-toggle');
    const filterClose = document.querySelector('.filter-close');
    const filterBackBtn = document.querySelector('.filter-back-btn');
    
    filterToggle?.addEventListener('click', toggleFilter);
    filterClose?.addEventListener('click', toggleFilter);
    filterBackBtn?.addEventListener('click', toggleFilter);
    
    document.querySelectorAll('.filter-group input').forEach(input => {
        input.addEventListener('change', handleFilterChange);
    });

    // Apply and reset filters
    document.querySelector('.apply-filters')?.addEventListener('click', applyFilters);
    document.querySelector('.btn-apply')?.addEventListener('click', function() {
        applyFilters();
        showNotification('Filters applied successfully!', 'success');
        toggleFilter();
    });
    
    document.querySelector('.reset-filters')?.addEventListener('click', resetFilters);
    document.querySelector('.btn-reset')?.addEventListener('click', function() {
        resetFilters();
    });
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
}

// Initialize navigation
function initializeNavigation() {
    const searchToggle = document.querySelector('#searchToggle');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchInput = document.querySelector('.search-input');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.navigation ul');
    const menuOverlay = document.querySelector('.menu-overlay');
    const navLinks = document.querySelectorAll('.navigation ul li a');
    const navItems = document.querySelectorAll('.navigation ul li');
    const menuCloseBtn = document.querySelector('.menu-close-btn');
    
    // Set animation delay for menu items
    navItems.forEach((item, index) => {
        item.style.setProperty('--item-index', index);
    });
    
    // Toggle search overlay
    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.toggle('active');
            if (searchOverlay.classList.contains('active')) {
                setTimeout(() => searchInput.focus(), 100);
            }
        });
    }
    
    // Close search overlay when clicking outside
    document.addEventListener('click', (e) => {
        if (searchOverlay && searchOverlay.classList.contains('active') && 
            !e.target.closest('.search-container') && 
            !e.target.closest('#searchToggle')) {
            searchOverlay.classList.remove('active');
        }
    });
    
    // Toggle mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            // Prevent scrolling when menu is open
            if (document.body.classList.contains('menu-open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
    
    // Close menu with close button
    if (menuCloseBtn) {
        menuCloseBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
        });
    }
    
    // Close menu when clicking on overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
        });
    }
    
    // Close menu when clicking on a link (mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close menu on resize if window becomes larger than mobile breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
        }
    });
    
    // Add active class to current page link
    const currentPage = window.location.pathname.split('/').pop();
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'home.html') ||
            (currentPage === 'photo.html' && linkPage === '#')) {
            link.parentElement.classList.add('active');
        }
    });
    
    // Make logo and navigation items magnetic on desktop
    const magneticElements = document.querySelectorAll('.navigation .magnetic');
    magneticElements.forEach(el => {
        const strength = el.getAttribute('data-magnetic-strength') || 0.5;
        
        if (window.innerWidth > 768) {
            el.addEventListener('mousemove', (e) => {
                const position = el.getBoundingClientRect();
                const x = e.clientX - position.left - position.width / 2;
                const y = e.clientY - position.top - position.height / 2;
                
                el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0px, 0px)';
            });
        }
    });
    
    // Handle swipe to close menu on mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (navMenu) {
        navMenu.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        navMenu.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
    }
    
    function handleSwipe() {
        if (touchStartX - touchEndX > 70 && window.innerWidth <= 768) {
            // Swiped left
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
        }
    }
}

// Toggle search overlay
function toggleSearch() {
    const searchOverlay = document.querySelector('.search-overlay');
    const searchInput = document.querySelector('.search-input');
    
    if (!searchOverlay) return;
    
    searchOverlay.classList.toggle('active');
    
    if (searchOverlay.classList.contains('active')) {
        // Prevent scrolling when search is open
        document.body.style.overflow = 'hidden';
        document.body.style.boxSizing = 'border-box';
        
        setTimeout(() => searchInput.focus(), 100);
    } else {
        // Restore scrolling
        document.body.style.overflow = '';
    }
}

// Book rendering
// function renderBooks(booksToRender) {
//     if (!bookGrid) return;

//     bookGrid.innerHTML = '';
//     const categories = groupBooksByCategory(booksToRender);

//     Object.entries(categories).forEach(([category, books]) => {
//         const categorySection = document.createElement('div');
//         categorySection.className = 'category-section';
//         categorySection.innerHTML = `
//             <h2 class="category-title reveal-element">${formatCategoryTitle(category)}</h2>
//             <div class="books-container">
//                 ${books.map(book => createBookCard(book)).join('')}
//             </div>
//         `;
//         bookGrid.appendChild(categorySection);
//     });

//     initializeBookCards();
// }

function createBookCard(book) {
    return `
        <div class="book-card magnetic" data-magnetic-strength="0.1" data-book-id="${book.id}">
            <div class="book-cover">
                <img src="${book.cover}" alt="${book.title}" loading="lazy">
            </div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <p>${truncateText(book.description, 100)}</p>
                <button class="btn view-book">Learn More</button>
            </div>
            ${book.readingProgress ? `
                <div class="reading-indicator" style="width: ${book.readingProgress}%"></div>
            ` : ''}
        </div>
    `;
}

// Enhanced book card initialization with reader integration
function initializeBookCards() {
    document.querySelectorAll('.book-card').forEach(card => {
        // Add click event for opening modal when clicking on the card (not on buttons)
        card.addEventListener('click', (e) => {
            // Only open modal if not clicking on a button
            if (!e.target.matches('.btn') && !e.target.closest('.btn')) {
                const bookId = parseInt(card.dataset.bookId);
                openBookModal(bookId);
            }
        });

        // Keep the original "Learn More" button (view-book) for opening modal
        const viewBookBtn = card.querySelector('.view-book');
        if (viewBookBtn) {
            viewBookBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click event
                const bookId = parseInt(card.dataset.bookId);
                openBookModal(bookId);
            });
        }

        // Add the "Open Content" button with special styling that goes directly to reader
        if (!card.querySelector('.read-content-btn')) {
            const bookInfo = card.querySelector('.book-info');
            if (bookInfo) {
                const readContentBtn = document.createElement('button');
                readContentBtn.className = 'btn magnetic read-content-btn';
                readContentBtn.setAttribute('data-magnetic-strength', '0.3');
                readContentBtn.innerHTML = '<i class="fas fa-book-open"></i> Open';
                readContentBtn.style.marginTop = '8px';
                readContentBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                readContentBtn.style.color = 'white';
                readContentBtn.style.fontSize = '0.9rem';
                readContentBtn.style.display = 'inline-flex';
                readContentBtn.style.alignItems = 'center';
                readContentBtn.style.gap = '6px';
                readContentBtn.style.transition = 'all 0.3s ease';
                
                readContentBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const bookId = parseInt(card.dataset.bookId);
                    navigateToReader(bookId);
                });

                // Add hover effect
                readContentBtn.addEventListener('mouseenter', () => {
                    readContentBtn.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
                    readContentBtn.style.transform = 'translateY(-2px)';
                    readContentBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                });

                readContentBtn.addEventListener('mouseleave', () => {
                    readContentBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    readContentBtn.style.transform = 'translateY(0)';
                    readContentBtn.style.boxShadow = 'none';
                });

                bookInfo.appendChild(readContentBtn);
            }
        }

        // Make title and cover clickable for modal (not direct navigation)
        const bookTitle = card.querySelector('h3');
        const bookCover = card.querySelector('.book-cover');
        
        [bookTitle, bookCover].forEach(element => {
            if (element) {
                element.style.cursor = 'pointer';
                // These will trigger the card click event which opens the modal
            }
        });

        // Add loading animation for images
        const img = card.querySelector('img');
        if (img) {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        }
    });

    // Initialize magnetic effect
    initializeMagneticEffect();
}

// Enhanced modal functionality with reader integration
function openBookModal(bookId) {
    const book = state.books.find(b => b.id == bookId);
    if (!book || !bookModal) return;

    // Properly freeze the body
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.overflow = 'hidden';
    document.body.style.boxSizing = 'border-box';
    document.body.dataset.scrollY = scrollY;
    
    state.activeBook = book;
    
    // Create gallery images HTML if book has gallery images
    let galleryHTML = '';
    if (book.gallery_images && book.gallery_images.length > 0) {
        galleryHTML = `
            <div class="book-gallery">
                <h3>Gallery Images</h3>
                <div class="gallery-container">
                    ${book.gallery_images.map(img => `
                        <div class="gallery-item">
                            <img src="${img}" alt="${book.title} gallery image" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    const modalContent = bookModal.querySelector('.modal-content');
    modalContent.innerHTML = `
        <button class="modal-close magnetic" data-magnetic-strength="0.5">&times;</button>
        <div class="book-preview">
            <div class="book-3d">
                <div class="book-cover-3d">
                    <img src="${book.cover}" alt="${book.title}" loading="lazy">
                </div>
            </div>
            <div class="book-details">
                <h2 class="book-title">${book.title}</h2>
                <p class="book-description">${book.description}</p>
                <div class="book-meta">
                    <span class="book-author">By ${book.author}</span>
                    <span class="book-year">${book.year}</span>
                </div>
                <div class="book-formats">
                    <span>Available formats: ${book.format.map(f => f.toUpperCase()).join(', ')}</span>
                </div>
                <div class="book-actions">
                    <button class="btn magnetic read-btn" data-magnetic-strength="0.3">
                        <i class="fas fa-book-open"></i> Read Now
                    </button>
                    <button class="btn magnetic download-btn" data-magnetic-strength="0.3">Download PDF</button>
                    <button class="btn magnetic share-btn" data-magnetic-strength="0.3">Share</button>
                </div>
                ${galleryHTML}
            </div>
        </div>
    `;

    bookModal.classList.add('active');

    // Add event listener to close button
    const closeBtn = modalContent.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeBookModal);
    }

    // Make the "Read Now" button navigate to reader with special styling
    const readBtn = modalContent.querySelector('.read-btn');
    if (readBtn) {
        // Apply the same special styling as the read-content button
        readBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        readBtn.style.color = 'white';
        readBtn.style.transition = 'all 0.3s ease';
        
        readBtn.addEventListener('click', () => {
            closeBookModal();
            navigateToReader(bookId);
        });

        // Add hover effect
        readBtn.addEventListener('mouseenter', () => {
            readBtn.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
            readBtn.style.transform = 'translateY(-2px)';
            readBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        });

        readBtn.addEventListener('mouseleave', () => {
            readBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            readBtn.style.transform = 'translateY(0)';
            readBtn.style.boxShadow = 'none';
        });
    }

    // Close modal when clicking outside content
    bookModal.addEventListener('click', function(e) {
        if (e.target === bookModal) {
            closeBookModal();
        }
    });

    // Reinitialize magnetic effect for new buttons
    initializeMagneticEffect();
    
    // Initialize gallery items with lightbox
    initializeGalleryItems();
}

function closeBookModal() {
    if (!bookModal) return;
    
    bookModal.classList.remove('active');
    
    // Properly restore body state
    const scrollY = parseInt(document.body.dataset.scrollY || '0');
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    document.body.style.overflow = '';
    window.scrollTo(0, scrollY);
    
    state.activeBook = null;
}

// Handle search input
function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length < 2) {
        renderSearchResults([]);
        return;
    }
    
    // Filter books based on search query
    const results = state.books.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query) || 
        book.description.toLowerCase().includes(query) ||
        (book.category && book.category.toLowerCase().includes(query))
    );
    
    // Sort results by relevance (title match first)
    results.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        
        // Title starts with query (highest priority)
        if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
        if (!aTitle.startsWith(query) && bTitle.startsWith(query)) return 1;
        
        // Title contains query (medium priority)
        if (aTitle.includes(query) && !bTitle.includes(query)) return -1;
        if (!aTitle.includes(query) && bTitle.includes(query)) return 1;
        
        // Default to alphabetical
        return aTitle.localeCompare(bTitle);
    });
    
    // Limit to 10 results for performance
    renderSearchResults(results.slice(0, 10));
    
    // Show search overlay if not already visible
    const searchOverlay = document.querySelector('.search-overlay');
    if (searchOverlay && !searchOverlay.classList.contains('active')) {
        searchOverlay.classList.add('active');
    }
}

// Render search results
function renderSearchResults(results) {
    const searchResults = document.querySelector('.search-results');
    if (!searchResults) return;
    
    // Clear previous results
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <p>No books found. Try a different search term.</p>
            </div>
        `;
        return;
    }
    
    // Create result items
    results.forEach(book => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.dataset.bookId = book.id;
        
        resultItem.innerHTML = `
            <div class="search-result-cover">
                <img src="${book.cover || '../image/books/default-cover.jpg'}" alt="${book.title}" loading="lazy">
            </div>
            <div class="search-result-info">
                <div class="search-result-title">${book.title}</div>
                <div class="search-result-author">by ${book.author}</div>
                <div class="search-result-description">${truncateText(book.description, 100)}</div>
            </div>
        `;
        
        // Add click event to open book modal
        resultItem.addEventListener('click', () => {
            openBookModal(book.id);
            toggleSearch();
        });
        
        searchResults.appendChild(resultItem);
    });
}

// Filter functionality
function handleFilterChange() {
    const categories = Array.from(document.querySelectorAll('input[type="checkbox"][value^="categories-"]'))
        .filter(input => input.checked)
        .map(input => input.value.replace('categories-', ''));

    const languages = Array.from(document.querySelectorAll('input[type="checkbox"][value="sanskrit"], input[type="checkbox"][value="english"], input[type="checkbox"][value="hindi"]'))
        .filter(input => input.checked)
        .map(input => input.value);

    const formats = Array.from(document.querySelectorAll('input[type="checkbox"][value="pdf"], input[type="checkbox"][value="epub"], input[type="checkbox"][value="audio"]'))
        .filter(input => input.checked)
        .map(input => input.value);

    state.activeFilters = { categories, languages, formats };
    applyFilters();
}

function applyFilters() {
    const { categories, languages, formats } = state.activeFilters;
    
    const filteredBooks = state.books.filter(book => {
        const categoryMatch = categories.length === 0 || categories.includes(book.category);
        const languageMatch = languages.length === 0 || languages.includes(book.language);
        const formatMatch = formats.length === 0 || book.format.some(f => formats.includes(f));
        
        return categoryMatch && languageMatch && formatMatch;
    });

    renderBooks(filteredBooks);
    
    // Show notification about filter results
    if (filteredBooks.length === 0) {
        showNotification('No books match your filters', 'warning');
    } else if (filteredBooks.length < state.books.length) {
        showNotification(`Found ${filteredBooks.length} books matching your filters`, 'info');
    }
    
    // Close filter sidebar after applying filters on mobile
    if (window.innerWidth <= 768) {
        toggleFilter();
    }
}

// Reset filters function
function resetFilters() {
    // Reset filter logic here
    const checkboxes = document.querySelectorAll('.filter-content input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset active filters
    state.activeFilters = {
        categories: [],
        languages: [],
        formats: []
    };
    
    // Apply the reset
    applyFilters();
    
    // Show notification
    showNotification('Filters have been reset', 'info');
}

// Toggle filter sidebar
function toggleFilter() {
    const filterSidebar = document.querySelector('.filter-sidebar');
    
    if (!filterSidebar) return;
    
    filterSidebar.classList.toggle('active');
    document.body.classList.toggle('filter-open');
    
    // Handle body scrolling
    if (document.body.classList.contains('filter-open')) {
        document.body.style.overflow = 'hidden';
        document.body.style.boxSizing = 'border-box';
    } else {
        document.body.style.overflow = '';
    }
    
    // Create filter overlay if it doesn't exist
    let filterOverlay = document.querySelector('.filter-overlay');
    if (!filterOverlay) {
        filterOverlay = document.createElement('div');
        filterOverlay.className = 'filter-overlay';
        document.body.appendChild(filterOverlay);
        
        // Close filter when overlay is clicked
        filterOverlay.addEventListener('click', function() {
            toggleFilter();
        });
    }
    
    // Create back button for mobile if it doesn't exist and sidebar is active
    if (filterSidebar.classList.contains('active') && window.innerWidth <= 768) {
        let backBtn = filterSidebar.querySelector('.filter-back-btn');
        if (!backBtn) {
            backBtn = document.createElement('button');
            backBtn.className = 'filter-back-btn';
            backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Books';
            backBtn.addEventListener('click', toggleFilter);
            filterSidebar.insertBefore(backBtn, filterSidebar.firstChild);
        }
    }
}

// Reading progress
function loadReadingProgress() {
    const savedProgress = localStorage.getItem('readingProgress');
    if (savedProgress) {
        state.readingProgress = JSON.parse(savedProgress);
        updateReadingProgress();
    }
}

function updateReadingProgress() {
    state.books.forEach(book => {
        book.readingProgress = state.readingProgress[book.id] || 0;
    });
    
    // Update reading progress UI
    updateReadingProgressUI();
}

function updateReadingProgressUI() {
    const progressItems = document.querySelector('.progress-items');
    if (!progressItems) return;
    
    const booksWithProgress = state.books.filter(book => state.readingProgress[book.id] > 0);
    
    if (booksWithProgress.length === 0) {
        progressItems.innerHTML = '<p>You haven\'t started reading any books yet.</p>';
        return;
    }
    
    progressItems.innerHTML = booksWithProgress
        .sort((a, b) => state.readingProgress[b.id] - state.readingProgress[a.id])
        .map(book => `
            <div class="progress-item" data-book-id="${book.id}">
                <div class="progress-book-info">
                    <h4>${book.title}</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${state.readingProgress[book.id]}%"></div>
                    </div>
                    <span>${state.readingProgress[book.id]}% complete</span>
                </div>
                <button class="btn continue-reading">Continue</button>
            </div>
        `).join('');
    
    // Add click events to continue reading buttons
    progressItems.querySelectorAll('.continue-reading').forEach(button => {
        button.addEventListener('click', () => {
            const bookId = parseInt(button.closest('.progress-item').dataset.bookId);
            const book = state.books.find(b => b.id === bookId);
            if (book) {
                navigateToReader(bookId);
            }
        });
    });
    
    // Show reading progress panel if there are books with progress
    if (booksWithProgress.length > 0) {
        readingProgress?.classList.add('active');
    }
}

function saveReadingProgress(bookId, progress) {
    state.readingProgress[bookId] = progress;
    localStorage.setItem('readingProgress', JSON.stringify(state.readingProgress));
    updateReadingProgress();
}

// Newsletter
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate API call
    showLoadingOverlay(true);
    setTimeout(() => {
        showLoadingOverlay(false);
        showNotification('Thank you for subscribing!', 'success');
        e.target.reset();
    }, 1500);
}

// Play notification sound based on type
function playNotificationSound(type) {
    // Create audio context only when needed to comply with autoplay policies
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    try {
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        // Configure sound based on notification type
        switch(type) {
            case 'success':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(660, context.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.15, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
                break;
            case 'error':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(320, context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(180, context.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.15, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
                break;
            default:
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(520, context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(480, context.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.7);
    } catch (e) {
        console.log('Audio notification error:', e);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    let notifications = document.getElementById('notifications');
    
    if (!notifications) {
        notifications = document.createElement('div');
        notifications.id = 'notifications';
        notifications.className = 'notifications';
        document.body.appendChild(notifications);
    }
    
    playNotificationSound(type);
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
    
    let appName = '';
    let icon = '';
    if (type === 'success') {
        appName = 'Success';
        icon = '<i class="fas fa-check"></i>';
    } else if (type === 'error') {
        appName = 'Alert';
        icon = '<i class="fas fa-exclamation"></i>';
    } else {
        appName = 'Info';
        icon = '<i class="fas fa-info"></i>';
    }
    
    const header = document.createElement('div');
    header.className = 'notification-header';
    header.innerHTML = `
        <div class="notification-app-icon">${icon}</div>
        <div class="notification-app-name">${appName}</div>
        <div class="notification-time">${formattedTime}</div>
    `;
    
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.innerHTML = `<span>${message}</span>`;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.addEventListener('click', () => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    notification.appendChild(header);
    notification.appendChild(content);
    notification.appendChild(closeBtn);
    notifications.appendChild(notification);
    
    if (window.navigator && window.navigator.vibrate) {
        try {
            window.navigator.vibrate(50);
        } catch (e) {
            // Silently fail if vibration API not supported
        }
    }
    
    const timeoutId = setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
    
    notification.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
    });
    
    notification.addEventListener('mouseleave', () => {
        const newTimeoutId = setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 1500);
        
        notification.dataset.timeoutId = newTimeoutId;
    });
    
    return notification;
}

function showLoadingOverlay(show) {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (!loadingOverlay) return;
    
    if (show) {
        window.state.isLoading = true;
        window.state.loadingStartTime = Date.now();
        loadingOverlay.style.display = 'flex';
        
        loadingOverlay.offsetWidth;
        
        const textLoaderChars = loadingOverlay.querySelectorAll('.text-loader span');
        if (textLoaderChars) {
            textLoaderChars.forEach(char => {
                char.style.animation = 'none';
                char.offsetHeight;
                char.style.animation = '';
            });
        }
        
        loadingOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        const minDisplayTime = 1600;
        const timeShown = Date.now() - (window.state.loadingStartTime || 0);
        const remainingTime = Math.max(0, minDisplayTime - timeShown);
        
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
            document.body.style.overflow = '';
            window.state.isLoading = false;
            
            setTimeout(() => {
                if (!window.state.isLoading) {
                    loadingOverlay.style.display = 'none';
                }
            }, 400);
        }, remainingTime);
    }
}

function showReadingProgress() {
    readingProgress?.classList.add('active');
}

// Scroll animations
function initScrollAnimations() {
    let ticking = false;
    let scrollY = window.scrollY;
    
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                if (entry.target.classList.contains('image-gallery-head')) {
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.opacity = '1';
                } else if (entry.target.classList.contains('image-gallery-des')) {
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.opacity = '1';
                } else if (entry.target.classList.contains('the-end-span')) {
                    entry.target.style.transform = 'scale(1)';
                    entry.target.style.opacity = '1';
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, options);

    const imageGalleryHead = document.querySelector('.image-gallery .head');
    if (imageGalleryHead) {
        imageGalleryHead.classList.add('image-gallery-head');
        imageGalleryHead.style.transform = 'translateY(100px)';
        imageGalleryHead.style.opacity = '0';
        imageGalleryHead.style.transition = 'transform 1s ease, opacity 1s ease';
    }
    
    const imageGalleryDes = document.querySelector('.image-gallery .des');
    if (imageGalleryDes) {
        imageGalleryDes.classList.add('image-gallery-des');
        imageGalleryDes.style.transform = 'translateY(50px)';
        imageGalleryDes.style.opacity = '0';
        imageGalleryDes.style.transition = 'transform 1s ease, opacity 1s ease';
    }
    
    const theEndSpan = document.querySelector('.the-end span');
    if (theEndSpan) {
        theEndSpan.classList.add('the-end-span');
        theEndSpan.style.transform = 'scale(0.5)';
        theEndSpan.style.opacity = '0';
        theEndSpan.style.transition = 'transform 1s ease, opacity 1s ease';
    }

    document.querySelectorAll('.fade-up, .reveal-element, .scale-in, .image-gallery-head, .image-gallery-des, .the-end-span').forEach(el => {
        observer.observe(el);
    });
    
    function updateParallax() {
        const heroBackground = document.querySelector('.hero-background');
        
        if (heroBackground) {
            const translateY = scrollY * 0.2;
            heroBackground.style.transform = `translate3d(0, ${translateY}px, 0)`;
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        scrollY = window.scrollY;
        
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
    
    updateParallax();
}

// Utility functions
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

function formatCategoryTitle(category) {
    return category.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function groupBooksByCategory(books) {
    return books.reduce((acc, book) => {
        if (!acc[book.category]) {
            acc[book.category] = [];
        }
        acc[book.category].push(book);
        return acc;
    }, {});
}

function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Initialize magnetic effect with reduced strength for book cards
function initializeMagneticEffect() {
    if (window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches) {
        return;
    }
    
    const magneticElements = document.querySelectorAll('.magnetic:not(.navigation .magnetic)');
    
    const throttledMouseMove = throttle((e, el, strength) => {
        const position = el.getBoundingClientRect();
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;
        
        requestAnimationFrame(() => {
            el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });
    }, 10);
    
    magneticElements.forEach(el => {
        const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.5;
        
        el.addEventListener('mousemove', (e) => {
            throttledMouseMove(e, el, strength);
        });
        
        el.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                el.style.transform = 'translate(0px, 0px)';
            });
        });
        
        el.addEventListener('touchstart', () => {
            el.classList.add('active');
        });
        
        el.addEventListener('touchend', () => {
            setTimeout(() => {
                el.classList.remove('active');
            }, 300);
        });
    });
}

// Function to initialize gallery items with lightbox effect
function initializeGalleryItems() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const img = item.querySelector('img');
            if (!img) return;
            
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <button class="lightbox-close">&times;</button>
                    <img src="${img.src}" alt="${img.alt}" class="lightbox-image">
                </div>
            `;
            
            document.body.appendChild(lightbox);
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                lightbox.classList.add('active');
            }, 10);
            
            const closeBtn = lightbox.querySelector('.lightbox-close');
            closeBtn.addEventListener('click', () => {
                closeLightbox(lightbox);
            });
            
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    closeLightbox(lightbox);
                }
            });
            
            document.addEventListener('keydown', function escapeListener(e) {
                if (e.key === 'Escape') {
                    closeLightbox(lightbox);
                    document.removeEventListener('keydown', escapeListener);
                }
            });
        });
    });
}

function closeLightbox(lightbox) {
    lightbox.classList.remove('active');
    setTimeout(() => {
        lightbox.remove();
        document.body.style.overflow = '';
    }, 300);
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('book');
    
    if (bookId) {
        const id = parseInt(bookId);
        const book = state.books.find(b => b.id === id);
        if (book) {
            setTimeout(() => {
                openBookModal(id);
            }, 1000);
        }
    }
}

// Footer particles
function initializeFooterParticles() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    const canvas = document.createElement('canvas');
    canvas.className = 'footer-particles';
    footer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
        canvas.width = footer.offsetWidth;
        canvas.height = footer.offsetHeight;
    }
    
    function createParticles() {
        particles = [];
        const particleCount = Math.floor(canvas.width / 20);
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                color: `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25
            });
        }
    }
    
    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
        });
        
        requestAnimationFrame(drawParticles);
    }
    
    resizeCanvas();
    createParticles();
    drawParticles();
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        createParticles();
    });
}

function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize book grid particles
function initializeBookGridParticles() {
    const bookGrid = document.querySelector('.book-grid');
    if (!bookGrid) return;
    
    const canvas = document.createElement('canvas');
    canvas.className = 'book-grid-particles';
    
    bookGrid.insertBefore(canvas, bookGrid.firstChild);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let isAnimating = true;
    
    function resizeCanvas() {
        canvas.width = bookGrid.offsetWidth;
        canvas.height = bookGrid.scrollHeight || bookGrid.offsetHeight;
    }
    
    function createParticles() {
        particles = [];
        const particleCount = Math.floor(canvas.width / 15);
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2.5 + 0.5,
                color: `rgba(255, 255, 255, ${Math.random() * 0.15 + 0.05})`,
                speedX: Math.random() * 0.4 - 0.2,
                speedY: Math.random() * 0.4 - 0.2
            });
        }
    }
    
    function drawParticles() {
        if (!ctx || !isAnimating) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
        });
        
        if (isAnimating) {
            requestAnimationFrame(drawParticles);
        }
    }
    
    function checkVisibility() {
        const rect = bookGrid.getBoundingClientRect();
        const isVisible = (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
        
        isAnimating = isVisible;
        
        if (isVisible && !requestId) {
            requestId = requestAnimationFrame(drawParticles);
        }
    }
    
    let requestId = null;
    
    resizeCanvas();
    createParticles();
    requestId = requestAnimationFrame(drawParticles);
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        createParticles();
    }, { passive: true });
    
    window.addEventListener('scroll', checkVisibility, { passive: true });
    
    setInterval(checkVisibility, 1000);
    
    const observer = new MutationObserver(() => {
        setTimeout(() => {
            resizeCanvas();
            createParticles();
        }, 300);
    });
    
    observer.observe(bookGrid, { 
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
}

// Initialize site-wide wave effect
function initializeSiteWave() {
    const siteWave = document.querySelector('.site-wave');
    if (!siteWave) return;
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const parallaxFactor = 0.05;
        
        if (siteWave.querySelector('svg')) {
            const translateY = 20 + (scrollPosition * parallaxFactor);
            siteWave.querySelector('svg').style.transform = `scaleY(4) translateY(${translateY}%)`;
        }
    }, { passive: true });
    
    function updateWaveColor() {
        const root = document.documentElement;
        const accentColor = getComputedStyle(root).getPropertyValue('--accent-color').trim();
        
        let r, g, b;
        if (accentColor.startsWith('rgb')) {
            const rgbMatch = accentColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (rgbMatch) {
                [, r, g, b] = rgbMatch.map(Number);
            }
        } else if (accentColor.startsWith('#')) {
            const hex = accentColor.replace('#', '');
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
        }
        
        if (r !== undefined && g !== undefined && b !== undefined) {
            const variation = 15;
            const newR = Math.max(0, Math.min(255, r + (Math.random() * variation * 2 - variation)));
            const newG = Math.max(0, Math.min(255, g + (Math.random() * variation * 2 - variation)));
            const newB = Math.max(0, Math.min(255, b + (Math.random() * variation * 2 - variation)));
            
            siteWave.style.setProperty('--wave-color', `rgb(${newR}, ${newG}, ${newB})`);
            siteWave.querySelector('svg').style.color = `rgb(${newR}, ${newG}, ${newB})`;
        }
    }
    
    updateWaveColor();
    setInterval(updateWaveColor, 10000);
}

// Initialize site-wide particles
function initializeSiteParticles() {
    const siteParticlesContainer = document.querySelector('.site-particles');
    if (!siteParticlesContainer) return;
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        (window.innerWidth <= 768 && navigator.userAgent.match(/Android|iPhone|iPad|iPod/i))) {
        console.log('Skipping site particles on low-powered device or reduced motion setting');
        return;
    }
    
    const canvas = document.createElement('canvas');
    siteParticlesContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let isAnimating = true;
    
    let mouseX = null;
    let mouseY = null;
    const mouseRadius = 100;
    
    const getAccentColor = () => {
        const root = document.documentElement;
        const accentColor = getComputedStyle(root).getPropertyValue('--accent-color').trim();
        
        let r = 255, g = 255, b = 255;
        
        if (accentColor.startsWith('rgb')) {
            const rgbMatch = accentColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (rgbMatch) {
                [, r, g, b] = rgbMatch.map(Number);
            }
        } else if (accentColor.startsWith('#')) {
            const hex = accentColor.replace('#', '');
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
        }
        
        return { r, g, b };
    };
    
    const accentColor = getAccentColor();
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function createParticles() {
        particles = [];
        let particleCount;
        
        if (window.innerWidth > 1200) {
            particleCount = Math.floor(canvas.width / 10);
        } else if (window.innerWidth > 768) {
            particleCount = Math.floor(canvas.width / 15);
        } else {
            particleCount = Math.floor(canvas.width / 20);
        }
        
        particleCount = Math.min(particleCount, 200);
        
        for (let i = 0; i < particleCount; i++) {
            const baseOpacity = Math.random() * 0.1 + 0.02;
            const colorMix = Math.random() * 0.3;
            const r = Math.floor(255 * (1 - colorMix) + accentColor.r * colorMix);
            const g = Math.floor(255 * (1 - colorMix) + accentColor.g * colorMix);
            const b = Math.floor(255 * (1 - colorMix) + accentColor.b * colorMix);
            
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 0.5,
                r, g, b,
                baseSpeedX: Math.random() * 0.3 - 0.15,
                baseSpeedY: Math.random() * 0.3 - 0.15,
                speedX: Math.random() * 0.3 - 0.15,
                speedY: Math.random() * 0.3 - 0.15,
                baseOpacity: baseOpacity
            });
        }
    }
    
    let lastDrawTime = 0;
    const targetFPS = 30;
    const frameDelay = 1000 / targetFPS;
    
    function drawParticles(timestamp) {
        if (!ctx || !isAnimating) return;
        
        if (timestamp - lastDrawTime < frameDelay) {
            requestAnimationFrame(drawParticles);
            return;
        }
        
        lastDrawTime = timestamp;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            let distX = 0;
            let distY = 0;
            let dist = 0;
            let opacity = particle.baseOpacity;
            
            if (mouseX !== null && mouseY !== null) {
                distX = mouseX - particle.x;
                distY = mouseY - particle.y;
                dist = Math.sqrt(distX * distX + distY * distY);
                
                if (dist < mouseRadius) {
                    const influence = (1 - dist / mouseRadius) * 0.5;
                    
                    particle.speedX = particle.baseSpeedX - (distX * influence * 0.02);
                    particle.speedY = particle.baseSpeedY - (distY * influence * 0.02);
                    
                    opacity = particle.baseOpacity + (influence * 0.3);
                } else {
                    particle.speedX = particle.baseSpeedX;
                    particle.speedY = particle.baseSpeedY;
                }
            } else {
                particle.speedX = particle.baseSpeedX;
                particle.speedY = particle.baseSpeedY;
            }
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${opacity})`;
            ctx.fill();
            
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
        });
        
        if (isAnimating) {
            requestAnimationFrame(drawParticles);
        }
    }
    
    let isThrottled = false;
    const throttleDelay = 30;
    
    document.addEventListener('mousemove', (e) => {
        if (!isThrottled) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            isThrottled = true;
            setTimeout(() => {
                isThrottled = false;
            }, throttleDelay);
        }
    }, { passive: true });
    
    document.addEventListener('mouseleave', () => {
        mouseX = null;
        mouseY = null;
    }, { passive: true });
    
    function handleVisibilityChange() {
        if (document.hidden) {
            isAnimating = false;
        } else {
            isAnimating = true;
            requestAnimationFrame(drawParticles);
        }
    }
    
    resizeCanvas();
    createParticles();
    requestAnimationFrame(drawParticles);
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            createParticles();
        }, 200);
    }, { passive: true });
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Listen for data manager ready event
document.addEventListener('dataManagerReady', (event) => {
    console.log('Data manager is ready, books available:', event.detail.manager.getBooks().length);
    
    // Re-render books if page is already loaded
    if (window.stackJsInitialized && state.books.length === 0) {
        const books = event.detail.manager.getBooks();
        if (books.length > 0) {
            state.books = books;
            normalizeBookData();
            renderBooks(state.books);
            initializeBookCards();
        }
    }
});

// Scroll to books functionality
document.addEventListener('DOMContentLoaded', () => {
    const exploreButton = document.querySelector('.scroll-to-books');
    
    if (exploreButton) {
        exploreButton.addEventListener('click', () => {
            const bookGrid = document.querySelector('.book-grid');
            
            if (bookGrid) {
                const headerHeight = document.querySelector('.navigation')?.offsetHeight || 0;
                const offset = headerHeight + 30;
                const targetPosition = bookGrid.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                bookGrid.classList.add('focus-highlight');
                
                setTimeout(() => {
                    bookGrid.classList.remove('focus-highlight');
                }, 1500);
            }
        });
    }
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if all required elements exist
    if (!bookGrid) {
        console.warn('Book grid element not found');
    }
    
    if (!searchInput) {
        console.warn('Search input element not found');
    }
    
    if (!bookModal) {
        console.warn('Book modal element not found');
    }
    
    // This is the single point of initialization for the application
    init();
    
    // Allow URL parameter processing after initialization
    checkUrlParameters();
});

// Additional CSS injection for enhanced styling
const additionalStyles = `
<style>
.read-content-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: #fff !important;
    margin-top: 8px !important;
    font-size: 0.9rem !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    transition: all 0.3s ease !important;
}

.read-content-btn:hover {
    background: linear-gradient(135deg, #ffffffff 0%, #c3cdfbff 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    color: #000 !important;
}

.book-card h3:hover,
.book-card .book-cover:hover {
    color: #ffffffff;
    transition: color 0.3s ease;
}

.book-card .book-cover:hover img {
    transform: scale(1.05);
    transition: transform 0.3s ease;
}

.focus-highlight {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
    transition: box-shadow 1.5s ease;
    color: #000a38ff !important;
}

.lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.lightbox.active {
    opacity: 1;
    visibility: visible;
}

.lightbox-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
}

.lightbox-image {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 10px;
}

.lightbox-close {
    position: absolute;
    top: -40px;
    right: 0;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    font-size: 2rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
}
</style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Enhanced stack.js with debugging and better data loading
// Add this section to your existing stack.js file, replacing the loadFallbackBooks function

// Enhanced function to load books with better debugging and JSON format support
async function loadFallbackBooks() {
    console.log('Starting loadFallbackBooks...');
    
    try {
        // First try unified data manager
        if (window.dataManager) {
            const books = window.dataManager.getBooks();
            console.log('Unified data manager books:', books);
            if (books && books.length > 0) {
                console.log('Books loaded from unified data manager:', books.length);
                return books;
            }
        }

        // Try to load multiple JSON file formats
        const possibleFiles = [
            '/Vrindopnishad Web/class/json/books-data.json',
            '/Vrindopnishad Web/class/json/books-data.json', 
            '/Vrindopnishad Web/class/json/Shri Harivansh Chandr-2026-09-21T12-02-46.json',
            '/Vrindopnishad Web/class/json/poems.json'
        ];

        let loadedData = null;
        let loadedFrom = '';

        for (const filePath of possibleFiles) {
            try {
                console.log(`Attempting to load: ${filePath}`);
                const response = await fetch(filePath);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Successfully loaded ${filePath}:`, data);
                    loadedData = data;
                    loadedFrom = filePath;
                    break;
                }
            } catch (error) {
                console.log(`Failed to load ${filePath}:`, error.message);
            }
        }

        if (!loadedData) {
            console.error('No JSON files could be loaded');
            return createFallbackBooks();
        }

        // Process different JSON formats
        let books = [];

        // Check if it's a collection format (like your Shri Harivansh file)
        if (loadedData.collection && loadedData.collection.entries) {
            console.log('Processing collection format data');
            books = convertCollectionToBooks(loadedData);
        } 
        // Check if it's a traditional books format
        else if (loadedData.books) {
            console.log('Processing traditional books format');
            books = loadedData.books;
        }
        // Check if it's a poems format
        else if (loadedData.collection && loadedData.collection.entries) {
            console.log('Processing poems format');
            books = convertPoemsToBooks(loadedData);
        }
        else {
            console.error('Unknown JSON format:', loadedData);
            return createFallbackBooks();
        }

        console.log(`Processed ${books.length} books from ${loadedFrom}`);
        fallbackBooks = books;
        return books;

    } catch (error) {
        console.error('Error in loadFallbackBooks:', error);
        return createFallbackBooks();
    }
}

// Convert collection format to books format
function convertCollectionToBooks(collectionData) {
    console.log('Converting collection to books:', collectionData);
    
    const collection = collectionData.collection;
    const books = [];

    collection.entries.forEach((entry, index) => {
        console.log(`Processing entry ${index}:`, entry);
        
        const book = {
            id: generateBookId(entry, index),
            title: entry.title || entry.content?.title || `Entry ${index + 1}`,
            description: entry.description || entry.content?.excerpt || entry.content?.content?.substring(0, 200) + '...' || 'Sacred content',
            author: extractAuthor(entry, collection),
            year: extractYear(entry),
            category: mapCategory(entry.category || 'spiritual'),
            language: detectLanguage(entry),
            format: ['digital', 'text'],
            cover: extractCoverImage(entry, index),
            readingProgress: 0,
            // Store original entry data for reader
            originalEntry: entry,
            collectionName: collection.name
        };

        console.log(`Created book:`, book);
        books.push(book);
    });

    return books;
}

// Generate a unique book ID
function generateBookId(entry, index) {
    if (entry.id) {
        // Extract numeric part from entry ID
        const numericMatch = entry.id.toString().match(/\d+/);
        if (numericMatch) {
            return parseInt(numericMatch[0]);
        }
    }
    
    // Use index-based ID as fallback
    return 1000 + index;
}

// Extract author information
function extractAuthor(entry, collection) {
    return entry.description || 
           collection.name || 
           'श्री हरिवंश';
}

// Extract year from entry
function extractYear(entry) {
    if (entry.created) {
        return new Date(entry.created).getFullYear();
    }
    if (entry.content?.created) {
        return new Date(entry.content.created).getFullYear();
    }
    return new Date().getFullYear();
}

// Map category to standard format
function mapCategory(category) {
    if (!category) return 'spiritual';
    
    const categoryMap = {
        'radhe radhe': 'devotional',
        'spiritual': 'spiritual',
        'vedic': 'vedic',
        'puranas': 'puranas',
        'modern': 'modern',
        'devotional': 'devotional',
        'bhakti': 'devotional',
        'krishna': 'devotional',
        'radha': 'devotional'
    };

    const normalized = category.toLowerCase();
    return categoryMap[normalized] || 'spiritual';
}

// Detect language from content
function detectLanguage(entry) {
    const content = entry.content?.content || entry.title || '';
    
    // Check for Sanskrit/Hindi characters
    if (/[\u0900-\u097F]/.test(content)) {
        return 'sanskrit';
    }
    
    return 'english';
}

// Extract cover image from entry
function extractCoverImage(entry, index) {
    if (entry.images && entry.images.length > 0) {
        return entry.images[0].url;
    }
    
    // Default covers based on category or index
    const defaultCovers = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=400&fit=crop&crop=center'
    ];

    return defaultCovers[index % defaultCovers.length];
}

// Create fallback books when no data is available
function createFallbackBooks() {
    console.log('Creating fallback books');
    
    return [
        {
            id: 1,
            title: "वृन्दोपनिषद्",
            description: "A sacred collection of spiritual wisdom and divine knowledge for seekers on the path of self-realization.",
            author: "श्री हरिवंश",
            year: 2024,
            category: "spiritual",
            language: "sanskrit",
            format: ["digital"],
            cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=center",
            readingProgress: 0
        },
        {
            id: 2,
            title: "Shri Radhe",
            description: "Divine chanting and devotional expressions dedicated to Shri Radhe, the eternal consort of Krishna.",
            author: "श्री हरिवंश",
            year: 2024,
            category: "devotional",
            language: "sanskrit",
            format: ["digital"],
            cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&crop=center",
            readingProgress: 0
        }
    ];
}

// Enhanced initialization with better error handling
async function init() {
    console.log('Initializing stack.js...');
    
    // Set initialization flag
    window.stackJsInitialized = true;
    
    // Show loading overlay
    showLoadingOverlay(true);
    
    // Initialize custom cursor
    initCustomCursor();
    
    // Wait for data manager with timeout
    let dataManagerWaitTime = 0;
    const maxWaitTime = 3000; // 3 seconds max
    
    while (!window.dataManager && dataManagerWaitTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 100));
        dataManagerWaitTime += 100;
    }
    
    if (window.dataManager) {
        console.log('Unified data manager found after', dataManagerWaitTime, 'ms');
    } else {
        console.log('Proceeding without unified data manager after', dataManagerWaitTime, 'ms');
    }
    
    // Load and process data
    console.log('Loading books data...');
    
    try {
        // Load books data
        const books = await loadFallbackBooks();
        console.log('Loaded books:', books);
        
        if (!books || books.length === 0) {
            console.error('No books loaded, creating fallback');
            state.books = createFallbackBooks();
        } else {
            state.books = books;
        }
        
        console.log('Final books in state:', state.books);
        
    } catch (error) {
        console.error('Error loading books:', error);
        state.books = createFallbackBooks();
    }
    
    // Initialize UI components
    try {
        initializeNavigation();
        initializeMagneticEffect();
        initScrollAnimations();
        initializeSiteParticles();
        initializeFooterParticles();
        initializeSiteWave();
        initializeBookGridParticles();
        initializeBackToTop();
        console.log('UI components initialized');
    } catch (error) {
        console.error('Error initializing UI components:', error);
    }
    
    // Normalize book data
    normalizeBookData();
    console.log('Books after normalization:', state.books);
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Check URL parameters
    checkUrlParameters();
    
    // Load reading progress
    loadReadingProgress();
    
    // Render books
    console.log('Rendering books...');
    renderBooks(state.books);
    
    // Initialize book cards
    initializeBookCards();
    
    // Hide loading overlay
    showLoadingOverlay(false);
    
    console.log('Initialization complete');
}

// Enhanced renderBooks function with debugging
function renderBooks(booksToRender) {
    console.log('renderBooks called with:', booksToRender);
    
    if (!bookGrid) {
        console.error('Book grid element not found!');
        return;
    }

    if (!booksToRender || booksToRender.length === 0) {
        console.log('No books to render, showing message');
        bookGrid.innerHTML = `
            <div class="no-books-message" style="text-align: center; padding: 40px; color: white;">
                <h2>No books available</h2>
                <p>Please check that your JSON files are properly placed and formatted.</p>
                <button onclick="location.reload()" class="btn">Reload Page</button>
            </div>
        `;
        return;
    }

    bookGrid.innerHTML = '';
    const categories = groupBooksByCategory(booksToRender);
    console.log('Grouped categories:', categories);

    Object.entries(categories).forEach(([category, books]) => {
        console.log(`Rendering category: ${category} with ${books.length} books`);
        
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.innerHTML = `
            <h2 class="category-title reveal-element">${formatCategoryTitle(category)}</h2>
            <div class="books-container">
                ${books.map(book => createBookCard(book)).join('')}
            </div>
        `;
        bookGrid.appendChild(categorySection);
    });

    console.log('Books rendered, initializing book cards...');
    initializeBookCards();
}

// Add debugging to the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting initialization...');
    
    // Debug DOM elements
    const bookGrid = document.querySelector('.book-grid');
    const searchInput = document.querySelector('.search-input');
    const bookModal = document.querySelector('.book-modal');
    
    console.log('DOM elements found:', {
        bookGrid: !!bookGrid,
        searchInput: !!searchInput,
        bookModal: !!bookModal
    });
    
    if (!bookGrid) {
        console.error('CRITICAL: .book-grid element not found in DOM!');
        // Try to find alternative selectors
        console.log('Available elements with "book" in class:', 
            Array.from(document.querySelectorAll('[class*="book"]')).map(el => ({
                tagName: el.tagName,
                className: el.className,
                id: el.id
            }))
        );
    }
    
    // Initialize the application
    init().catch(error => {
        console.error('Initialization failed:', error);
    });
});

// Add a manual initialization function for debugging
window.debugStackInit = function() {
    console.log('Manual initialization called');
    init().catch(error => {
        console.error('Manual initialization failed:', error);
    });
};

// Add a function to check current state
window.debugStackState = function() {
    console.log('Current state:', {
        books: state.books,
        bookGrid: document.querySelector('.book-grid'),
        dataManager: window.dataManager,
        stackJsInitialized: window.stackJsInitialized
    });
};

const bookCardStyles = `
<style>
.book-card:hover {
    cursor: pointer;
    transform: translateY(-5px);
    transition: transform 0.3s ease;
}

.book-card h3:hover,
.book-card .book-cover:hover {
    color: #ffffffff;
    transition: color 0.3s ease;
}

.read-content-btn {
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
}

/* Hide any read-content-btn that might appear in modals */
.book-modal .read-content-btn {
    display: none !important;
}
</style>
`;

if (!document.querySelector('#book-card-interaction-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'book-card-interaction-styles';
    styleSheet.textContent = bookCardStyles.replace(/<\/?style>/g, '');
    document.head.appendChild(styleSheet);
}
