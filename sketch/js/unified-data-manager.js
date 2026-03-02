// unified-data-manager.js - Handles both book and poem data formats

class UnifiedDataManager {
    constructor() {
        this.data = {
            books: [],
            collections: [],
            entries: []
        };
        this.loadedFiles = new Set();
        this.baseDataPath = './data/';
        this.stackDataPath = './';
        
        // Auto-detect current page context
        this.isStackPage = window.location.pathname.includes('stack') || window.location.pathname.includes('Stack');
        this.isReaderPage = window.location.pathname.includes('read-me') || window.location.pathname.includes('sketch');
    }

    // Initialize data loading based on current page
    async init() {
        try {
            if (this.isStackPage) {
                await this.loadStackData();
            } else if (this.isReaderPage) {
                await this.loadReaderData();
            }
            return true;
        } catch (error) {
            console.error('Failed to initialize data manager:', error);
            return false;
        }
    }

    // Load data for stack page (books format)
    async loadStackData() {
        try {
            // Try to load books-data.json first
            const booksData = await this.loadJSONFile('books-data.json');
            if (booksData && booksData.books) {
                this.data.books = booksData.books;
            }

            // Load any additional collection files and convert them to book format
            const collectionFiles = await this.discoverCollectionFiles();
            for (const file of collectionFiles) {
                await this.loadCollectionAsBooks(file);
            }

            return this.data.books;
        } catch (error) {
            console.error('Error loading stack data:', error);
            return [];
        }
    }

    // Load data for reader page (poems/entries format)
    async loadReaderData() {
        try {
            // Check if we're in connector mode first
            const bookId = this.getBookIdFromUrl();
            const storedBookData = sessionStorage.getItem('selectedBookData');
            
            if (bookId || storedBookData) {
                // Load specific book/entry content
                return await this.loadSpecificContent(bookId, storedBookData);
            }

            // Load default poems.json or collections
            const poemsData = await this.loadJSONFile('poems.json');
            if (poemsData && poemsData.collection) {
                return poemsData;
            }

            // Fallback: load the first available collection
            const collectionFiles = await this.discoverCollectionFiles();
            if (collectionFiles.length > 0) {
                return await this.loadJSONFile(collectionFiles[0]);
            }

            return this.createDefaultCollection();
        } catch (error) {
            console.error('Error loading reader data:', error);
            return this.createDefaultCollection();
        }
    }

    // Load a specific JSON file
    async loadJSONFile(filename) {
        const possiblePaths = [
            `${this.baseDataPath}${filename}`,
            `${this.stackDataPath}${filename}`,
            `./data/${filename}`,
            `./${filename}`,
            `../${filename}`,
            `../data/${filename}`
        ];

        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Loaded ${filename} from ${path}`);
                    this.loadedFiles.add(filename);
                    return data;
                }
            } catch (error) {
                // Continue to next path
            }
        }

        throw new Error(`Could not load ${filename} from any path`);
    }

    // Discover available collection files
    async discoverCollectionFiles() {
        const commonFiles = [
            'Shri Harivansh Chandr-2026-09-21T12-02-46.json',
            'poems.json',
            'collection.json',
            'content.json'
        ];

        const availableFiles = [];
        for (const file of commonFiles) {
            try {
                const data = await this.loadJSONFile(file);
                if (data && (data.collection || data.books)) {
                    availableFiles.push(file);
                }
            } catch (error) {
                // File doesn't exist or can't be loaded
            }
        }

        return availableFiles;
    }

    // Convert collection format to books format for stack page
    async loadCollectionAsBooks(filename) {
        try {
            const collectionData = await this.loadJSONFile(filename);
            if (collectionData && collectionData.collection && collectionData.collection.entries) {
                const convertedBooks = this.convertCollectionToBooks(collectionData);
                this.data.books.push(...convertedBooks);
            }
        } catch (error) {
            console.error(`Error loading collection ${filename}:`, error);
        }
    }

    // Convert collection entries to book format
    convertCollectionToBooks(collectionData) {
        const collection = collectionData.collection;
        const books = [];

        collection.entries.forEach((entry, index) => {
            const book = {
                id: this.generateBookId(entry),
                title: entry.title || entry.content?.title || 'Untitled',
                description: entry.description || entry.content?.excerpt || 'No description available',
                author: this.extractAuthor(entry, collection),
                year: this.extractYear(entry),
                category: this.mapCategory(entry.category || entry.content?.tags?.[0] || 'spiritual'),
                language: this.detectLanguage(entry),
                format: ['digital', 'text'],
                cover: this.extractCoverImage(entry),
                readingProgress: 0,
                // Store original entry data for reader
                originalEntry: entry,
                collectionName: collection.name,
                collectionFile: filename
            };

            books.push(book);
        });

        return books;
    }

    // Generate a unique book ID from entry
    generateBookId(entry) {
        if (entry.id) {
            // Extract numeric part from entry ID or use hash
            const numericMatch = entry.id.toString().match(/\d+/);
            if (numericMatch) {
                return parseInt(numericMatch[0]);
            }
        }
        
        // Fallback: create hash from title
        const title = entry.title || entry.content?.title || 'untitled';
        return this.simpleHash(title);
    }

    // Simple hash function for generating IDs
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    // Extract author from entry or collection
    extractAuthor(entry, collection) {
        return entry.description || 
               entry.content?.excerpt || 
               collection.name || 
               'श्री हरिवंश';
    }

    // Extract year from entry
    extractYear(entry) {
        if (entry.created) {
            return new Date(entry.created).getFullYear();
        }
        if (entry.content?.created) {
            return new Date(entry.content.created).getFullYear();
        }
        return new Date().getFullYear();
    }

    // Map category to standard format
    mapCategory(category) {
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
    detectLanguage(entry) {
        const content = entry.content?.content || entry.title || '';
        
        // Check for Sanskrit/Hindi characters
        if (/[\u0900-\u097F]/.test(content)) {
            return 'sanskrit';
        }
        
        return 'english';
    }

    // Extract cover image from entry
    extractCoverImage(entry) {
        if (entry.images && entry.images.length > 0) {
            return entry.images[0].url;
        }
        
        // Default cover based on category
        const defaultCovers = {
            'devotional': '../image/books/radhe-cover.jpg',
            'spiritual': '../image/books/spiritual-cover.jpg',
            'vedic': '../image/books/vedic-cover.jpg',
            'puranas': '../image/books/puranas-cover.jpg'
        };

        const category = this.mapCategory(entry.category || '');
        return defaultCovers[category] || '../image/books/default-cover.jpg';
    }

    // Load specific content for reader (connector mode)
    async loadSpecificContent(bookId, storedBookData) {
        try {
            let targetEntry = null;

            // First try to get from stored data
            if (storedBookData) {
                const bookData = JSON.parse(storedBookData);
                if (bookData.originalEntry) {
                    targetEntry = bookData.originalEntry;
                } else {
                    // Create entry from book data
                    targetEntry = this.convertBookToEntry(bookData);
                }
            }

            // If no stored data, search through collections
            if (!targetEntry && bookId) {
                targetEntry = await this.findEntryById(bookId);
            }

            if (targetEntry) {
                return this.createCollectionFromEntry(targetEntry);
            }

            // Fallback to default
            return this.createDefaultCollection();
        } catch (error) {
            console.error('Error loading specific content:', error);
            return this.createDefaultCollection();
        }
    }

    // Find entry by book ID across all collections
    async findEntryById(bookId) {
        const collectionFiles = await this.discoverCollectionFiles();
        
        for (const file of collectionFiles) {
            try {
                const data = await this.loadJSONFile(file);
                if (data.collection && data.collection.entries) {
                    for (const entry of data.collection.entries) {
                        const entryBookId = this.generateBookId(entry);
                        if (entryBookId == bookId) {
                            return entry;
                        }
                    }
                }
            } catch (error) {
                continue;
            }
        }

        return null;
    }

    // Convert book format back to entry format
    convertBookToEntry(bookData) {
        return {
            id: `entry-${bookData.id}`,
            title: bookData.title,
            description: bookData.author,
            category: bookData.category,
            tags: bookData.tags || [bookData.category],
            content: {
                id: bookData.id,
                title: bookData.title,
                type: 'page',
                status: 'published',
                excerpt: bookData.author,
                content: this.generateContentFromBook(bookData),
                tags: bookData.tags || [bookData.category]
            },
            images: bookData.gallery_images ? 
                bookData.gallery_images.map((url, idx) => ({
                    id: `img-${bookData.id}-${idx}`,
                    title: bookData.title,
                    url: url,
                    type: 'image'
                })) : [],
            videos: [],
            links: bookData.links ? 
                bookData.links.map((link, idx) => ({
                    id: `link-${bookData.id}-${idx}`,
                    title: link.title,
                    url: link.url,
                    type: 'link'
                })) : []
        };
    }

    // Generate content from book data
    generateContentFromBook(bookData) {
        let content = `${bookData.title}\n\n`;
        content += `Author: ${bookData.author}\n`;
        content += `Category: ${bookData.category}\n`;
        content += `Year: ${bookData.year}\n\n`;
        content += `${bookData.description}\n\n`;
        
        // Add spiritual content
        content += this.generateSpiritualContent(bookData.category);
        
        return content;
    }

    // Generate spiritual content based on category
    generateSpiritualContent(category) {
        const spiritualTexts = {
            'devotional': `राधे राधे राधे राधे राधे राधे राधे राधे
राधे राधे राधे राधे राधे राधे राधे राधे
राधे राधे राधे राधे राधे राधे राधे राधे

हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे
हरे राम हरे राम राम राम हरे हरे

जय श्री राधे!`,
            
            'spiritual': `ॐ श्री गुरवे नमः
ॐ नमो भगवते वासुदेवाय

This sacred text offers profound insights into spiritual realization and divine love.

Through contemplation and devotion, we approach the ultimate truth of existence.`,
            
            'vedic': `वेदो नित्यो अपौरुषेयः
The Vedas are eternal and of divine origin.

This text contains the timeless wisdom of the ancient rishis, guiding us toward moksha.`,
            
            'puranas': `इदं पुराणमिश्वरस्य वाणी
This Purana is the voice of the Supreme Lord.

Through divine stories and sacred narratives, we understand the play of consciousness.`
        };

        return spiritualTexts[category] || spiritualTexts['spiritual'];
    }

    // Create collection format from single entry
    createCollectionFromEntry(entry) {
        return {
            collection: {
                name: entry.title || 'Selected Content',
                entries: [entry]
            }
        };
    }

    // Create default collection when no data is available
    createDefaultCollection() {
        return {
            collection: {
                name: 'वृन्दोपनिषद्',
                entries: [{
                    id: 'default-entry',
                    title: 'वृन्दोपनिषद्',
                    description: 'श्री हरिवंश',
                    category: 'spiritual',
                    tags: ['spiritual', 'wisdom'],
                    content: {
                        id: 1,
                        title: 'वृन्दोपनिषद्',
                        type: 'page',
                        status: 'published',
                        excerpt: 'Divine Wisdom Collection',
                        content: `Welcome to Vrindopnishad - A Sacred Digital Sanctuary

राधे राधे राधे राधे राधे राधे राधे राधे
राधे राधे राधे राधे राधे राधे राधे राधे

हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे
हरे राम हरे राम राम राम हरे हरे

श्री हरिवंश महाप्रभो!
जय श्री राधे!`,
                        tags: ['spiritual', 'wisdom', 'radhe', 'krishna']
                    },
                    images: [],
                    videos: [],
                    links: []
                }]
            }
        };
    }

    // Get book ID from URL
    getBookIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('book');
    }

    // Get books for stack page
    getBooks() {
        return this.data.books;
    }

    // Get collection for reader page
    getCollection() {
        return this.data.collection || this.createDefaultCollection();
    }

    // Find book by ID
    findBookById(id) {
        return this.data.books.find(book => book.id == id);
    }

    // Static factory method
    static async create() {
        const manager = new UnifiedDataManager();
        await manager.init();
        return manager;
    }
}

// Global instance
window.UnifiedDataManager = UnifiedDataManager;

// Auto-initialize when script loads
(async function() {
    try {
        window.dataManager = await UnifiedDataManager.create();
        console.log('Unified Data Manager initialized successfully');
        
        // Dispatch custom event to notify other scripts
        const event = new CustomEvent('dataManagerReady', {
            detail: { manager: window.dataManager }
        });
        document.dispatchEvent(event);
    } catch (error) {
        console.error('Failed to initialize Unified Data Manager:', error);
    }
})();