// Enhanced JSON Data Loader System for Multiple Categorized Files
// Add this to your stack.js file or create a new data-loader.js file

class JSONDataLoader {
    constructor() {
        this.dataCache = new Map();
        this.loadedFiles = new Set();
        this.categories = new Map();
        this.allEntries = [];
    }

    // Configuration for different JSON file sources
    getDataSources() {
        return [
            {
                id: 'harivansh_collection',
                name: 'Shri Harivansh Collection',
                file: '/class/json/Shri-Harivansh-Chandr-2026-09-21T12-02-46.json',
                category: 'spiritual',
                enabled: true
            },
            {
                id: 'bhagavad_gita',
                name: 'Bhagavad Gita Collection',
                file: '/class/json/bhagavad-gita-collection.json',
                category: 'vedic',
                enabled: true
            },
            {
                id: 'upanishads',
                name: 'Upanishads Collection',
                file: '/class/json/upanishads-collection.json',
                category: 'vedic',
                enabled: true
            },
            {
                id: 'puranas',
                name: 'Puranas Collection',
                file: '/class/json/puranas-collection.json',
                category: 'puranas',
                enabled: true
            },
            {
                id: 'modern_spiritual',
                name: 'Modern Spiritual Texts',
                file: '/class/json/modern-spiritual-collection.json',
                category: 'modern',
                enabled: true
            }
            // Add more data sources as needed
        ];
    }

    // Load a single JSON file
    async loadJSONFile(source) {
        try {
            console.log(`Loading JSON file: ${source.file}`);
            
            const response = await fetch(source.file);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Store in cache
            this.dataCache.set(source.id, {
                source,
                data,
                loadedAt: new Date()
            });
            
            this.loadedFiles.add(source.id);
            
            console.log(`Successfully loaded ${source.name}`);
            return { success: true, data, source };
            
        } catch (error) {
            console.error(`Error loading ${source.name}:`, error);
            return { success: false, error: error.message, source };
        }
    }

    // Load all configured JSON files
    async loadAllDataSources() {
        const sources = this.getDataSources().filter(source => source.enabled);
        const loadPromises = sources.map(source => this.loadJSONFile(source));
        
        try {
            const results = await Promise.all(loadPromises);
            const successful = results.filter(result => result.success);
            const failed = results.filter(result => !result.success);
            
            console.log(`Loaded ${successful.length}/${results.length} data sources successfully`);
            
            if (failed.length > 0) {
                console.warn('Failed to load some data sources:', failed.map(f => f.source.name));
            }
            
            // Process and combine all successful loads
            this.processLoadedData(successful);
            
            return {
                success: successful.length > 0,
                loaded: successful.length,
                failed: failed.length,
                totalEntries: this.allEntries.length,
                categories: Array.from(this.categories.keys())
            };
            
        } catch (error) {
            console.error('Error loading data sources:', error);
            return { success: false, error: error.message };
        }
    }

    // Process and normalize loaded data
    processLoadedData(loadedResults) {
        this.allEntries = [];
        this.categories.clear();

        loadedResults.forEach(({ data, source }) => {
            try {
                // Handle different JSON file structures
                let entries = [];
                
                if (data.collection && data.collection.entries) {
                    // Structure like Shri-Harivansh-Chandr file
                    entries = data.collection.entries;
                } else if (data.entries) {
                    // Direct entries array
                    entries = data.entries;
                } else if (data.books) {
                    // Books array structure
                    entries = data.books;
                } else if (Array.isArray(data)) {
                    // Direct array
                    entries = data;
                }

                // Normalize and process entries
                entries.forEach(entry => {
                    const normalizedEntry = this.normalizeEntry(entry, source);
                    this.allEntries.push(normalizedEntry);
                    
                    // Track categories
                    const category = normalizedEntry.category || source.category;
                    if (!this.categories.has(category)) {
                        this.categories.set(category, []);
                    }
                    this.categories.get(category).push(normalizedEntry);
                });
                
            } catch (error) {
                console.error(`Error processing data from ${source.name}:`, error);
            }
        });

        console.log(`Processed ${this.allEntries.length} total entries across ${this.categories.size} categories`);
    }

    // Normalize entry structure to consistent format
    normalizeEntry(entry, source) {
        const normalized = {
            id: entry.id || `${source.id}-${Date.now()}-${Math.random().toString(36)}`,
            title: entry.title || 'Untitled',
            description: entry.description || entry.excerpt || '',
            category: entry.category || source.category,
            source: source.id,
            sourceName: source.name,
            
            // Content handling
            content: this.extractContent(entry),
            
            // Metadata
            author: entry.author || 'Unknown',
            year: entry.year || entry.created || new Date().getFullYear(),
            language: entry.language || 'sanskrit',
            format: entry.format || ['digital'],
            tags: entry.tags || [],
            
            // Media
            cover: entry.cover || entry.image || this.getDefaultCover(source.category),
            images: entry.images || [],
            videos: entry.videos || [],
            links: entry.links || [],
            
            // Reading progress
            readingProgress: entry.readingProgress || 0,
            
            // Timestamps
            created: entry.created || new Date().toISOString(),
            modified: entry.modified || new Date().toISOString()
        };

        return normalized;
    }

    // Extract content from various entry structures
    extractContent(entry) {
        if (typeof entry.content === 'string') {
            return entry.content;
        } else if (entry.content && entry.content.content) {
            return entry.content.content;
        } else if (entry.text) {
            return entry.text;
        } else if (entry.body) {
            return entry.body;
        }
        return entry.description || '';
    }

    // Get default cover image based on category
    getDefaultCover(category) {
        const defaultCovers = {
            'vedic': '../image/books/vedic-default.jpg',
            'puranas': '../image/books/puranas-default.jpg',
            'modern': '../image/books/modern-default.jpg',
            'spiritual': '../image/books/spiritual-default.jpg'
        };
        return defaultCovers[category] || '../image/books/default-cover.jpg';
    }

    // Get all entries
    getAllEntries() {
        return this.allEntries;
    }

    // Get entries by category
    getEntriesByCategory(category) {
        return this.categories.get(category) || [];
    }

    // Get all categories
    getCategories() {
        return Array.from(this.categories.keys());
    }

    // Search entries
    searchEntries(query, options = {}) {
        if (!query || query.length < 2) {
            return [];
        }

        const searchQuery = query.toLowerCase();
        const {
            categories = [],
            searchInContent = false,
            limit = 50
        } = options;

        let searchableEntries = this.allEntries;

        // Filter by categories if specified
        if (categories.length > 0) {
            searchableEntries = searchableEntries.filter(entry => 
                categories.includes(entry.category)
            );
        }

        // Perform search
        const results = searchableEntries.filter(entry => {
            const titleMatch = entry.title.toLowerCase().includes(searchQuery);
            const descriptionMatch = entry.description.toLowerCase().includes(searchQuery);
            const authorMatch = entry.author.toLowerCase().includes(searchQuery);
            const tagsMatch = entry.tags.some(tag => 
                tag.toLowerCase().includes(searchQuery)
            );
            
            let contentMatch = false;
            if (searchInContent && entry.content) {
                contentMatch = entry.content.toLowerCase().includes(searchQuery);
            }

            return titleMatch || descriptionMatch || authorMatch || tagsMatch || contentMatch;
        });

        // Sort results by relevance
        results.sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
            
            // Title exact match (highest priority)
            if (aTitle === searchQuery && bTitle !== searchQuery) return -1;
            if (aTitle !== searchQuery && bTitle === searchQuery) return 1;
            
            // Title starts with query
            if (aTitle.startsWith(searchQuery) && !bTitle.startsWith(searchQuery)) return -1;
            if (!aTitle.startsWith(searchQuery) && bTitle.startsWith(searchQuery)) return 1;
            
            // Title contains query
            if (aTitle.includes(searchQuery) && !bTitle.includes(searchQuery)) return -1;
            if (!aTitle.includes(searchQuery) && bTitle.includes(searchQuery)) return 1;
            
            // Default to alphabetical
            return aTitle.localeCompare(bTitle);
        });

        return results.slice(0, limit);
    }

    // Get entry by ID
    getEntryById(id) {
        return this.allEntries.find(entry => entry.id === id);
    }

    // Refresh data (reload all sources)
    async refreshData() {
        console.log('Refreshing all data sources...');
        this.dataCache.clear();
        this.loadedFiles.clear();
        this.categories.clear();
        this.allEntries = [];
        
        return await this.loadAllDataSources();
    }

    // Get loading status
    getLoadingStatus() {
        return {
            totalSources: this.getDataSources().filter(s => s.enabled).length,
            loadedSources: this.loadedFiles.size,
            totalEntries: this.allEntries.length,
            categories: this.getCategories(),
            lastUpdated: Math.max(...Array.from(this.dataCache.values())
                .map(cache => cache.loadedAt.getTime()))
        };
    }
}

// Integration with existing stack.js system
class EnhancedBookManager {
    constructor() {
        this.dataLoader = new JSONDataLoader();
        this.isInitialized = false;
    }

    // Initialize the enhanced system
    async initialize() {
        if (this.isInitialized) {
            return { success: true, message: 'Already initialized' };
        }

        try {
            showNotification('Loading book collections...', 'info');
            
            const result = await this.dataLoader.loadAllDataSources();
            
            if (result.success) {
                // Update global state
                if (window.state) {
                    window.state.books = this.dataLoader.getAllEntries();
                    window.state.categories = this.dataLoader.getCategories();
                }
                
                this.isInitialized = true;
                
                showNotification(
                    `Loaded ${result.totalEntries} books from ${result.loaded} collections`, 
                    'success'
                );
                
                return result;
            } else {
                throw new Error('Failed to load book collections');
            }
            
        } catch (error) {
            console.error('Error initializing enhanced book manager:', error);
            showNotification('Error loading book collections', 'error');
            return { success: false, error: error.message };
        }
    }

    // Get books with filtering
    getBooks(filters = {}) {
        const { category, search, limit } = filters;
        
        let books = this.dataLoader.getAllEntries();
        
        // Apply category filter
        if (category && category !== 'all') {
            books = this.dataLoader.getEntriesByCategory(category);
        }
        
        // Apply search filter
        if (search) {
            books = this.dataLoader.searchEntries(search, { 
                categories: category ? [category] : [],
                limit: limit || 50 
            });
        }
        
        // Apply limit
        if (limit && !search) {
            books = books.slice(0, limit);
        }
        
        return books;
    }

    // Get categories
    getCategories() {
        return this.dataLoader.getCategories();
    }

    // Get book by ID
    getBookById(id) {
        return this.dataLoader.getEntryById(id);
    }

    // Search books
    searchBooks(query, options = {}) {
        return this.dataLoader.searchEntries(query, options);
    }

    // Get loading status
    getStatus() {
        return this.dataLoader.getLoadingStatus();
    }

    // Refresh data
    async refresh() {
        showNotification('Refreshing book collections...', 'info');
        
        try {
            const result = await this.dataLoader.refreshData();
            
            if (result.success) {
                // Update global state
                if (window.state) {
                    window.state.books = this.dataLoader.getAllEntries();
                    window.state.categories = this.dataLoader.getCategories();
                }
                
                showNotification('Book collections refreshed successfully', 'success');
                
                // Re-render books if on books page
                if (typeof renderBooks === 'function') {
                    renderBooks(this.dataLoader.getAllEntries());
                }
                
                return result;
            } else {
                throw new Error('Failed to refresh collections');
            }
            
        } catch (error) {
            console.error('Error refreshing:', error);
            showNotification('Error refreshing collections', 'error');
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
window.bookManager = new EnhancedBookManager();

// Enhanced initialization function to replace the existing one
async function initializeEnhancedDataSystem() {
    try {
        // Initialize the enhanced book manager
        const result = await window.bookManager.initialize();
        
        if (result.success) {
            console.log('Enhanced data system initialized successfully');
            
            // Update the books rendering
            if (typeof renderBooks === 'function') {
                const books = window.bookManager.getBooks();
                renderBooks(books);
            }
            
            // Update category filters in UI
            updateCategoryFilters(window.bookManager.getCategories());
            
            return result;
        } else {
            throw new Error('Failed to initialize enhanced data system');
        }
        
    } catch (error) {
        console.error('Error in enhanced data system:', error);
        
        // Fallback to existing system
        if (typeof loadFallbackBooks === 'function') {
            await loadFallbackBooks();
        }
        
        return { success: false, error: error.message };
    }
}

// Helper function to update category filters in UI
function updateCategoryFilters(categories) {
    const categoryFilterContainer = document.querySelector('.filter-group');
    
    if (categoryFilterContainer && categories.length > 0) {
        // Find the categories section
        const categoriesSection = Array.from(categoryFilterContainer.querySelectorAll('h4'))
            .find(h4 => h4.textContent.includes('Categories'));
        
        if (categoriesSection) {
            const categoryLabels = categoriesSection.parentElement.querySelectorAll('label');
            
            // Clear existing category filters except the parent h4
            categoryLabels.forEach(label => label.remove());
            
            // Add new category filters based on loaded data
            categories.forEach(category => {
                const label = document.createElement('label');
                label.innerHTML = `
                    <input type="checkbox" value="categories-${category}"> 
                    ${formatCategoryTitle(category)}
                `;
                categoriesSection.parentElement.appendChild(label);
            });
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JSONDataLoader, EnhancedBookManager };
}