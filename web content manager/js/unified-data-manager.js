// unified-content-manager.js - Centralized content management system

class UnifiedContentManager {
    constructor() {
        this.contentSources = new Map();
        this.allContent = new Map();
        this.categories = new Set();
        this.contentTypes = new Set(['book', 'poetry', 'article', 'spiritual-text']);
        this.isInitialized = false;
    }

    // Configuration for all content sources
    getContentSources() {
        return [
            {
                id: 'main_books',
                name: 'Main Book Collection',
                file: '/Stack/data/books-data.json',
                type: 'books',
                category: 'spiritual',
                enabled: true
            },
            {
                id: 'harivansh_collection',
                name: 'Shri Harivansh Collection',
                file: '/class/json/Shri-Harivansh-Chandr-2026-09-21T12-02-46.json',
                type: 'collection',
                category: 'spiritual',
                enabled: true
            },
            {
                id: 'vedic_texts',
                name: 'Vedic Scriptures',
                file: '/class/json/vedic-collection.json',
                type: 'books',
                category: 'vedic',
                enabled: true
            },
            {
                id: 'puranas_collection',
                name: 'Puranas & Itihasas',
                file: '/class/json/puranas-collection.json',
                type: 'books',
                category: 'puranas',
                enabled: true
            },
            {
                id: 'modern_spiritual',
                name: 'Modern Spiritual Texts',
                file: '/class/json/modern-spiritual.json',
                type: 'books',
                category: 'modern',
                enabled: true
            },
            {
                id: 'poetry_collection',
                name: 'Spiritual Poetry',
                file: '/class/json/poetry-collection.json',
                type: 'poetry',
                category: 'poetry',
                enabled: true
            }
        ];
    }

    // Initialize the content manager
    async initialize() {
        if (this.isInitialized) {
            return { success: true, message: 'Already initialized' };
        }

        try {
            console.log('🔄 Initializing Unified Content Manager...');
            
            const loadResults = await this.loadAllContentSources();
            
            if (loadResults.success) {
                this.processAllContent();
                this.isInitialized = true;
                
                console.log(`✅ Content Manager initialized: ${this.allContent.size} items loaded`);
                
                return {
                    success: true,
                    totalItems: this.allContent.size,
                    categories: Array.from(this.categories),
                    contentTypes: Array.from(this.contentTypes),
                    loadedSources: loadResults.loaded
                };
            } else {
                throw new Error('Failed to load content sources');
            }
            
        } catch (error) {
            console.error('❌ Error initializing content manager:', error);
            return { success: false, error: error.message };
        }
    }

    // Load all configured content sources
    async loadAllContentSources() {
        const sources = this.getContentSources().filter(source => source.enabled);
        const loadPromises = sources.map(source => this.loadContentSource(source));
        
        try {
            const results = await Promise.allSettled(loadPromises);
            const successful = results
                .filter(result => result.status === 'fulfilled' && result.value.success)
                .map(result => result.value);
            const failed = results
                .filter(result => result.status === 'rejected' || !result.value.success);
            
            console.log(`📊 Loaded ${successful.length}/${results.length} content sources`);
            
            if (failed.length > 0) {
                console.warn('⚠️ Some sources failed to load:', failed.length);
            }
            
            return {
                success: successful.length > 0,
                loaded: successful.length,
                failed: failed.length,
                results: successful
            };
            
        } catch (error) {
            console.error('Error loading content sources:', error);
            return { success: false, error: error.message };
        }
    }

    // Load individual content source
    async loadContentSource(source) {
        try {
            console.log(`📥 Loading: ${source.name}`);
            
            const response = await fetch(source.file);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Store raw data
            this.contentSources.set(source.id, {
                source,
                data,
                loadedAt: new Date()
            });
            
            console.log(`✅ Successfully loaded: ${source.name}`);
            return { success: true, source, data };
            
        } catch (error) {
            console.error(`❌ Failed to load ${source.name}:`, error);
            return { success: false, source, error: error.message };
        }
    }

    // Process and normalize all loaded content
    processAllContent() {
        this.allContent.clear();
        this.categories.clear();
        
        for (const [sourceId, sourceData] of this.contentSources.entries()) {
            try {
                const { source, data } = sourceData;
                const normalizedItems = this.normalizeContentItems(data, source);
                
                normalizedItems.forEach(item => {
                    this.allContent.set(item.id, item);
                    this.categories.add(item.category);
                    this.contentTypes.add(item.contentType);
                });
                
                console.log(`📋 Processed ${normalizedItems.length} items from ${source.name}`);
                
            } catch (error) {
                console.error(`Error processing source ${sourceId}:`, error);
            }
        }
    }

    // Normalize content items from different source structures
    normalizeContentItems(data, source) {
        let items = [];
        
        try {
            // Handle different JSON structures
            if (data.books && Array.isArray(data.books)) {
                // books-data.json structure
                items = data.books.map(book => this.normalizeBookItem(book, source));
            } else if (data.collection && data.collection.entries) {
                // Shri-Harivansh-Chandr structure
                items = data.collection.entries.map(entry => this.normalizeCollectionEntry(entry, source));
            } else if (data.entries && Array.isArray(data.entries)) {
                // Direct entries array
                items = data.entries.map(entry => this.normalizeEntry(entry, source));
            } else if (data.poetry && Array.isArray(data.poetry)) {
                // Poetry collection structure
                items = data.poetry.map(poem => this.normalizePoetryItem(poem, source));
            } else if (Array.isArray(data)) {
                // Direct array
                items = data.map(item => this.normalizeGenericItem(item, source));
            }
        } catch (error) {
            console.error(`Error normalizing items from ${source.name}:`, error);
        }
        
        return items;
    }

    // Normalize book item
    normalizeBookItem(book, source) {
        return {
            id: book.id || this.generateId(),
            title: book.title || 'Untitled',
            description: book.description || '',
            content: book.content || book.description || '',
            author: book.author || 'Unknown Author',
            year: book.year || new Date().getFullYear(),
            category: book.category || source.category,
            contentType: 'book',
            language: book.language || 'sanskrit',
            format: Array.isArray(book.format) ? book.format : [book.format || 'digital'],
            tags: Array.isArray(book.tags) ? book.tags : [],
            
            // Media
            cover: book.cover || this.getDefaultCover(book.category || source.category),
            images: book.gallery_images || book.images || [],
            videos: book.videos || [],
            links: book.links || [],
            
            // Reading data
            readingProgress: book.readingProgress || 0,
            
            // Metadata
            source: source.id,
            sourceName: source.name,
            created: book.created || new Date().toISOString(),
            modified: book.modified || new Date().toISOString(),
            
            // For read-me.html integration
            readingUrl: `/Stack/read-me.html?type=book&id=${book.id}`,
            isReadable: true
        };
    }

    // Normalize collection entry (like Harivansh)
    normalizeCollectionEntry(entry, source) {
        const content = entry.content || {};
        
        return {
            id: entry.id || this.generateId(),
            title: entry.title || content.title || 'Untitled',
            description: entry.description || content.excerpt || '',
            content: content.content || entry.description || '',
            author: source.name.includes('Harivansh') ? 'Shri Harivansh Chandr' : 'Unknown Author',
            year: entry.created ? new Date(entry.created).getFullYear() : new Date().getFullYear(),
            category: entry.category || source.category,
            contentType: content.type || 'spiritual-text',
            language: 'hindi',
            format: ['digital'],
            tags: [...(entry.tags || []), ...(content.tags || [])],
            
            // Media
            cover: entry.images?.[0]?.url || this.getDefaultCover(source.category),
            images: entry.images || [],
            videos: entry.videos || [],
            links: entry.links || [],
            
            // Reading data
            readingProgress: 0,
            
            // Metadata
            source: source.id,
            sourceName: source.name,
            created: entry.created || new Date().toISOString(),
            modified: entry.modified || new Date().toISOString(),
            
            // For read-me.html integration
            readingUrl: `/Stack/read-me.html?type=spiritual&id=${entry.id}`,
            isReadable: true
        };
    }

    // Normalize poetry item
    normalizePoetryItem(poem, source) {
        return {
            id: poem.id || this.generateId(),
            title: poem.title || 'Untitled Poem',
            description: poem.description || poem.excerpt || '',
            content: poem.verses ? poem.verses.join('\n\n') : poem.content || '',
            author: poem.author || poem.poet || 'Unknown Poet',
            year: poem.year || poem.written || new Date().getFullYear(),
            category: 'poetry',
            contentType: 'poetry',
            language: poem.language || 'hindi',
            format: ['digital'],
            tags: [...(poem.tags || []), 'poetry', 'spiritual'],
            
            // Media
            cover: poem.cover || this.getDefaultCover('poetry'),
            images: poem.images || [],
            videos: [],
            links: [],
            
            // Reading data
            readingProgress: 0,
            
            // Poetry specific
            verses: poem.verses || poem.content?.split('\n\n') || [],
            meter: poem.meter || '',
            mood: poem.mood || poem.rasa || '',
            
            // Metadata
            source: source.id,
            sourceName: source.name,
            created: poem.created || new Date().toISOString(),
            modified: poem.modified || new Date().toISOString(),
            
            // For read-me.html integration
            readingUrl: `/Stack/read-me.html?type=poetry&id=${poem.id}`,
            isReadable: true
        };
    }

    // Normalize generic item
    normalizeGenericItem(item, source) {
        return {
            id: item.id || this.generateId(),
            title: item.title || item.name || 'Untitled',
            description: item.description || item.summary || '',
            content: item.content || item.text || item.body || '',
            author: item.author || item.creator || 'Unknown',
            year: item.year || new Date().getFullYear(),
            category: item.category || source.category,
            contentType: item.type || 'article',
            language: item.language || 'hindi',
            format: item.format ? (Array.isArray(item.format) ? item.format : [item.format]) : ['digital'],
            tags: Array.isArray(item.tags) ? item.tags : [],
            
            // Media
            cover: item.cover || item.image || this.getDefaultCover(source.category),
            images: item.images || [],
            videos: item.videos || [],
            links: item.links || [],
            
            // Reading data
            readingProgress: 0,
            
            // Metadata
            source: source.id,
            sourceName: source.name,
            created: item.created || new Date().toISOString(),
            modified: item.modified || new Date().toISOString(),
            
            // For read-me.html integration
            readingUrl: `/Stack/read-me.html?type=generic&id=${item.id}`,
            isReadable: Boolean(item.content || item.text || item.body)
        };
    }

    // Generate unique ID
    generateId() {
        return `unified-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get default cover based on category
    getDefaultCover(category) {
        const defaultCovers = {
            'vedic': '../image/books/vedic-default.jpg',
            'puranas': '../image/books/puranas-default.jpg',
            'modern': '../image/books/modern-default.jpg',
            'spiritual': '../image/books/spiritual-default.jpg',
            'poetry': '../image/books/poetry-default.jpg'
        };
        return defaultCovers[category] || '../image/books/default-cover.jpg';
    }

    // Get all content
    getAllContent() {
        return Array.from(this.allContent.values());
    }

    // Get content by type
    getContentByType(contentType) {
        return this.getAllContent().filter(item => item.contentType === contentType);
    }

    // Get content by category
    getContentByCategory(category) {
        return this.getAllContent().filter(item => item.category === category);
    }

    // Get content by ID
    getContentById(id) {
        return this.allContent.get(id);
    }

    // Search content
    searchContent(query, options = {}) {
        if (!query || query.length < 2) {
            return [];
        }

        const {
            types = [],
            categories = [],
            searchInContent = true,
            limit = 50
        } = options;

        let searchableItems = this.getAllContent();

        // Filter by types
        if (types.length > 0) {
            searchableItems = searchableItems.filter(item => types.includes(item.contentType));
        }

        // Filter by categories
        if (categories.length > 0) {
            searchableItems = searchableItems.filter(item => categories.includes(item.category));
        }

        const searchQuery = query.toLowerCase();
        
        // Perform search
        const results = searchableItems.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(searchQuery);
            const descriptionMatch = item.description.toLowerCase().includes(searchQuery);
            const authorMatch = item.author.toLowerCase().includes(searchQuery);
            const tagsMatch = item.tags.some(tag => tag.toLowerCase().includes(searchQuery));
            
            let contentMatch = false;
            if (searchInContent && item.content) {
                contentMatch = item.content.toLowerCase().includes(searchQuery);
            }

            return titleMatch || descriptionMatch || authorMatch || tagsMatch || contentMatch;
        });

        // Sort by relevance
        results.sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
            
            if (aTitle === searchQuery && bTitle !== searchQuery) return -1;
            if (aTitle !== searchQuery && bTitle === searchQuery) return 1;
            if (aTitle.startsWith(searchQuery) && !bTitle.startsWith(searchQuery)) return -1;
            if (!aTitle.startsWith(searchQuery) && bTitle.startsWith(searchQuery)) return 1;
            if (aTitle.includes(searchQuery) && !bTitle.includes(searchQuery)) return -1;
            if (!aTitle.includes(searchQuery) && bTitle.includes(searchQuery)) return 1;
            
            return aTitle.localeCompare(bTitle);
        });

        return results.slice(0, limit);
    }

    // Export unified content data
    exportUnifiedData() {
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                version: '2.0',
                contentManager: 'unified',
                totalItems: this.allContent.size,
                categories: Array.from(this.categories),
                contentTypes: Array.from(this.contentTypes)
            },
            sources: Array.from(this.contentSources.keys()),
            content: Array.from(this.allContent.values())
        };

        return exportData;
    }

    // Get reading data for read-me.html
    getReadingData(id) {
        const content = this.getContentById(id);
        if (!content || !content.isReadable) {
            return null;
        }

        return {
            id: content.id,
            title: content.title,
            author: content.author,
            content: content.content,
            contentType: content.contentType,
            category: content.category,
            year: content.year,
            language: content.language,
            images: content.images,
            videos: content.videos,
            links: content.links,
            verses: content.verses || null, // For poetry
            tags: content.tags,
            readingProgress: content.readingProgress || 0
        };
    }

    // Update reading progress
    updateReadingProgress(id, progress) {
        const content = this.allContent.get(id);
        if (content) {
            content.readingProgress = progress;
            content.modified = new Date().toISOString();
            
            // Save to localStorage
            const savedProgress = JSON.parse(localStorage.getItem('unifiedReadingProgress') || '{}');
            savedProgress[id] = progress;
            localStorage.setItem('unifiedReadingProgress', JSON.stringify(savedProgress));
            
            return true;
        }
        return false;
    }

    // Load reading progress from localStorage
    loadReadingProgress() {
        try {
            const savedProgress = JSON.parse(localStorage.getItem('unifiedReadingProgress') || '{}');
            
            for (const [id, progress] of Object.entries(savedProgress)) {
                const content = this.allContent.get(id);
                if (content) {
                    content.readingProgress = progress;
                }
            }
            
            console.log(`📖 Loaded reading progress for ${Object.keys(savedProgress).length} items`);
        } catch (error) {
            console.error('Error loading reading progress:', error);
        }
    }

    // Get status information
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            totalSources: this.contentSources.size,
            totalContent: this.allContent.size,
            categories: Array.from(this.categories),
            contentTypes: Array.from(this.contentTypes),
            lastUpdated: new Date().toISOString()
        };
    }
}

// Create global instance
window.unifiedContentManager = new UnifiedContentManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedContentManager;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing Unified Content Manager...');
    
    const result = await window.unifiedContentManager.initialize();
    
    if (result.success) {
        console.log('✅ Unified Content Manager ready!');
        
        // Dispatch custom event for other scripts
        document.dispatchEvent(new CustomEvent('unifiedContentReady', {
            detail: result
        }));
    } else {
        console.error('❌ Failed to initialize Unified Content Manager:', result.error);
    }
});