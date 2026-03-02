/**
 * Unified Data API Library
 * A centralized data management system for all your web pages
 * 
 * Usage:
 * 1. Include this script in your web pages: <script src="unified-data-api.js"></script>
 * 2. Use the API: const books = UnifiedAPI.getBooks();
 */

class UnifiedAPI {
    constructor() {
        this.storageKey = 'unifiedWebData';
        this.data = this.loadData();
    }

    // ================== DATA LOADING & SAVING ==================
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Error loading unified data:', error);
        }

        // Return default structure if no data exists
        return {
            books: [],
            images: [],
            audio: [],
            collections: {
                featured: { title: "Featured Collections", items: [] },
                popular: { title: "Popular Right Now", items: [] },
                nature: { title: "Nature & Landscapes", items: [] },
                anime: { title: "Anime & Art", items: [] },
                architecture: { title: "Architecture & Urban", items: [] }
            },
            content: [],
            siteConfig: {
                siteName: "Vrindopnishad",
                siteIcon: "fas fa-image",
                tagline: "Spiritual & Divine Collection",
                description: "Discover sacred images and divine artworks that inspire the soul."
            },
            backgroundMusic: {
                notesPanel: {
                    title: "Ambient Piano & Strings",
                    audioSrc: "",
                    loop: true,
                    volume: 0.3
                }
            }
        };
    }

    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Error saving unified data:', error);
            return false;
        }
    }

    // ================== BOOKS API ==================
    getBooks(category = null, language = null) {
        let books = this.data.books || [];
        
        if (category) {
            books = books.filter(book => book.category === category);
        }
        
        if (language) {
            books = books.filter(book => book.language === language);
        }
        
        return books;
    }

    getBookById(id) {
        return this.data.books.find(book => book.id == id) || null;
    }

    addBook(book) {
        book.id = book.id || Date.now();
        book.readingProgress = book.readingProgress || 0;
        book.created = book.created || new Date().toISOString();
        
        this.data.books.push(book);
        this.saveData();
        return book;
    }

    updateBook(id, updates) {
        const bookIndex = this.data.books.findIndex(book => book.id == id);
        if (bookIndex !== -1) {
            this.data.books[bookIndex] = { ...this.data.books[bookIndex], ...updates };
            this.saveData();
            return this.data.books[bookIndex];
        }
        return null;
    }

    deleteBook(id) {
        const initialLength = this.data.books.length;
        this.data.books = this.data.books.filter(book => book.id != id);
        const deleted = this.data.books.length < initialLength;
        if (deleted) this.saveData();
        return deleted;
    }

    // ================== IMAGES API ==================
    getImages(category = null) {
        let images = this.data.images || [];
        
        if (category && category !== 'all') {
            images = images.filter(image => image.category === category);
        }
        
        return images;
    }

    getImageById(id) {
        return this.data.images.find(image => image.id == id) || null;
    }

    addImage(image) {
        image.id = image.id || Date.now().toString();
        image.created = image.created || new Date().toISOString();
        
        this.data.images.push(image);
        this.saveData();
        return image;
    }

    updateImage(id, updates) {
        const imageIndex = this.data.images.findIndex(image => image.id == id);
        if (imageIndex !== -1) {
            this.data.images[imageIndex] = { ...this.data.images[imageIndex], ...updates };
            this.saveData();
            return this.data.images[imageIndex];
        }
        return null;
    }

    deleteImage(id) {
        const initialLength = this.data.images.length;
        this.data.images = this.data.images.filter(image => image.id != id);
        const deleted = this.data.images.length < initialLength;
        if (deleted) this.saveData();
        return deleted;
    }

    // Get image categories with counts
    getImageCategories() {
        const categories = [
            { id: "all", name: "All", count: 0 },
            { id: "anime", name: "Anime", count: 0 },
            { id: "landscape", name: "Landscape", count: 0 },
            { id: "nature", name: "Nature", count: 0 },
            { id: "spiritual", name: "Spiritual", count: 0 }
        ];

        // Count images per category
        this.data.images.forEach(image => {
            const category = categories.find(cat => cat.id === image.category);
            if (category) category.count++;
        });

        // Set total count for 'all'
        categories[0].count = this.data.images.length;

        return categories;
    }

    // ================== AUDIO API ==================
    getAudio(category = null, type = null) {
        let audio = this.data.audio || [];
        
        if (category) {
            audio = audio.filter(track => track.category === category);
        }
        
        if (type) {
            audio = audio.filter(track => track.type === type);
        }
        
        return audio;
    }

    getAudioById(id) {
        return this.data.audio.find(track => track.id == id) || null;
    }

    addAudio(audio) {
        audio.id = audio.id || Date.now().toString();
        audio.created = audio.created || new Date().toISOString();
        
        this.data.audio.push(audio);
        this.saveData();
        return audio;
    }

    updateAudio(id, updates) {
        const audioIndex = this.data.audio.findIndex(track => track.id == id);
        if (audioIndex !== -1) {
            this.data.audio[audioIndex] = { ...this.data.audio[audioIndex], ...updates };
            this.saveData();
            return this.data.audio[audioIndex];
        }
        return null;
    }

    deleteAudio(id) {
        const initialLength = this.data.audio.length;
        this.data.audio = this.data.audio.filter(track => track.id != id);
        const deleted = this.data.audio.length < initialLength;
        if (deleted) this.saveData();
        return deleted;
    }

    // Get formatted audio data for different page structures
    getAudioBlocks() {
        const blocks = {};
        this.data.audio.forEach((track, index) => {
            const blockKey = `block-${index}`;
            blocks[blockKey] = {
                title: track.title,
                audioSrc: track.audioSrc,
                audioType: track.audioType || "audio/mp3",
                description: track.description,
                duration: track.duration,
                artist: track.artist,
                visualizer: true,
                id: `block-audio-${index}`
            };
        });
        return blocks;
    }

    // ================== COLLECTIONS API ==================
    getCollections(type = null) {
        if (type) {
            return this.data.collections[type] || null;
        }
        return this.data.collections;
    }

    addCollection(key, collection) {
        this.data.collections[key] = collection;
        this.saveData();
        return collection;
    }

    updateCollection(key, updates) {
        if (this.data.collections[key]) {
            this.data.collections[key] = { ...this.data.collections[key], ...updates };
            this.saveData();
            return this.data.collections[key];
        }
        return null;
    }

    deleteCollection(key) {
        if (this.data.collections[key]) {
            delete this.data.collections[key];
            this.saveData();
            return true;
        }
        return false;
    }

    // Add item to a collection
    addToCollection(collectionKey, item) {
        if (this.data.collections[collectionKey]) {
            if (!this.data.collections[collectionKey].items) {
                this.data.collections[collectionKey].items = [];
            }
            item.id = item.id || Date.now().toString();
            this.data.collections[collectionKey].items.push(item);
            this.saveData();
            return item;
        }
        return null;
    }

    // ================== CONTENT API ==================
    getContent(type = null, status = null) {
        let content = this.data.content || [];
        
        if (type) {
            content = content.filter(item => item.type === type);
        }
        
        if (status) {
            content = content.filter(item => item.status === status);
        }
        
        return content;
    }

    getContentById(id) {
        return this.data.content.find(item => item.id == id) || null;
    }

    addContent(content) {
        content.id = content.id || Date.now();
        content.created = content.created || new Date().toISOString();
        content.modified = new Date().toISOString();
        
        this.data.content.push(content);
        this.saveData();
        return content;
    }

    updateContent(id, updates) {
        const contentIndex = this.data.content.findIndex(item => item.id == id);
        if (contentIndex !== -1) {
            this.data.content[contentIndex] = { 
                ...this.data.content[contentIndex], 
                ...updates,
                modified: new Date().toISOString()
            };
            this.saveData();
            return this.data.content[contentIndex];
        }
        return null;
    }

    deleteContent(id) {
        const initialLength = this.data.content.length;
        this.data.content = this.data.content.filter(item => item.id != id);
        const deleted = this.data.content.length < initialLength;
        if (deleted) this.saveData();
        return deleted;
    }

    // ================== SITE CONFIG API ==================
    getSiteConfig() {
        return this.data.siteConfig;
    }

    updateSiteConfig(config) {
        this.data.siteConfig = { ...this.data.siteConfig, ...config };
        this.saveData();
        return this.data.siteConfig;
    }

    // ================== UTILITY METHODS ==================
    
    // Search across all content types
    search(query, types = ['books', 'images', 'audio', 'content']) {
        const results = {
            books: [],
            images: [],
            audio: [],
            content: []
        };

        const searchTerm = query.toLowerCase();

        if (types.includes('books')) {
            results.books = this.data.books.filter(book => 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.description.toLowerCase().includes(searchTerm)
            );
        }

        if (types.includes('images')) {
            results.images = this.data.images.filter(image => 
                image.title.toLowerCase().includes(searchTerm) ||
                image.alt.toLowerCase().includes(searchTerm) ||
                image.description.toLowerCase().includes(searchTerm)
            );
        }

        if (types.includes('audio')) {
            results.audio = this.data.audio.filter(track => 
                track.title.toLowerCase().includes(searchTerm) ||
                track.artist.toLowerCase().includes(searchTerm) ||
                track.description.toLowerCase().includes(searchTerm)
            );
        }

        if (types.includes('content')) {
            results.content = this.data.content.filter(item => 
                item.title.toLowerCase().includes(searchTerm) ||
                item.content.toLowerCase().includes(searchTerm) ||
                item.excerpt.toLowerCase().includes(searchTerm)
            );
        }

        return results;
    }

    // Get statistics
    getStats() {
        return {
            totalBooks: this.data.books.length,
            totalImages: this.data.images.length,
            totalAudio: this.data.audio.length,
            totalContent: this.data.content.length,
            publishedContent: this.data.content.filter(item => item.status === 'published').length,
            draftContent: this.data.content.filter(item => item.status === 'draft').length,
            categories: {
                books: [...new Set(this.data.books.map(book => book.category))],
                images: [...new Set(this.data.images.map(image => image.category))],
                audio: [...new Set(this.data.audio.map(track => track.category))]
            }
        };
    }

    // Export data in different formats
    exportData(type = 'all', format = 'json') {
        let exportData;

        switch (type) {
            case 'books':
                exportData = { books: this.data.books };
                break;
            case 'images':
                exportData = { categories: this.getImageCategories(), images: this.data.images };
                break;
            case 'audio':
                exportData = { 
                    blocks: this.getAudioBlocks(),
                    backgroundMusic: this.data.backgroundMusic,
                    additionalTracks: this.data.audio 
                };
                break;
            case 'collections':
                exportData = this.data.collections;
                break;
            case 'content':
                exportData = this.data.content;
                break;
            default:
                exportData = this.data;
        }

        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        }
        
        return exportData;
    }

    // Import data from external sources
    importData(importedData, merge = true) {
        try {
            if (merge) {
                // Merge with existing data
                if (importedData.books) {
                    this.data.books = [...this.data.books, ...importedData.books];
                }
                if (importedData.images) {
                    this.data.images = [...this.data.images, ...importedData.images];
                }
                if (importedData.audio) {
                    this.data.audio = [...this.data.audio, ...importedData.audio];
                }
                if (importedData.content) {
                    this.data.content = [...this.data.content, ...importedData.content];
                }
                if (importedData.collections) {
                    this.data.collections = { ...this.data.collections, ...importedData.collections };
                }
            } else {
                // Replace existing data
                this.data = { ...this.data, ...importedData };
            }
            
            this.saveData();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data
    clearAllData() {
        this.data = this.loadData();
        this.data.books = [];
        this.data.images = [];
        this.data.audio = [];
        this.data.content = [];
        this.saveData();
        return true;
    }

    // Get all data
    getAllData() {
        return this.data;
    }

    // ================== COMPATIBILITY METHODS ==================
    
    // Legacy support for existing JSON structures
    getBooksData() {
        return { books: this.data.books };
    }

    getImagesData() {
        return {
            categories: this.getImageCategories(),
            images: this.data.images
        };
    }

    getAudioData() {
        return {
            blocks: this.getAudioBlocks(),
            backgroundMusic: this.data.backgroundMusic || {},
            additionalTracks: this.data.audio
        };
    }

    getCollectionsData() {
        return {
            siteConfig: this.data.siteConfig,
            collections: this.data.collections,
            socialLinks: this.data.socialLinks || [],
            footer: this.data.footer || {}
        };
    }

    getContentData() {
        return this.data.content;
    }
}

// Create global instance
const UnifiedAPI = new UnifiedAPI();

// Make it available globally
if (typeof window !== 'undefined') {
    window.UnifiedAPI = UnifiedAPI;
    window.UnifiedDataManager = UnifiedAPI; // Alias for backward compatibility
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedAPI;
}

// ================== USAGE EXAMPLES ==================
/*

// Get all books
const allBooks = UnifiedAPI.getBooks();

// Get books by category
const vedicBooks = UnifiedAPI.getBooks('vedic');

// Get images by category
const animeImages = UnifiedAPI.getImages('anime');

// Add new book
UnifiedAPI.addBook({
    title: "New Spiritual Book",
    author: "Author Name",
    category: "modern",
    language: "english",
    description: "A beautiful spiritual guide"
});

// Search across all content
const searchResults = UnifiedAPI.search('spiritual');

// Get site statistics
const stats = UnifiedAPI.getStats();

// Export specific data type
const booksJSON = UnifiedAPI.exportData('books');

// Import data from another source
UnifiedAPI.importData(externalData, true); // true for merge

*/