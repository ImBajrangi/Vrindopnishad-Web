// content-connector.js - Bridges stack.html and read-me.html

class ContentConnector {
    constructor() {
        this.baseUrl = window.location.origin;
        this.readerUrl = '/sketch/read-me.html';
        this.stackUrl = '/Stack/main/stack.html';
        
        this.init();
    }

    init() {
        // Initialize based on current page
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('stack.html') || currentPage.includes('Stack')) {
            this.initializeStackPage();
        } else if (currentPage.includes('read-me.html') || currentPage.includes('sketch')) {
            this.initializeReaderPage();
        }
    }

    // Initialize functionality for stack.html
    initializeStackPage() {
        // Wait for books to be loaded
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                this.attachBookClickHandlers();
            }, 1000); // Give time for books to render
        });
    }

    // Attach click handlers to book cards in stack.html
    attachBookClickHandlers() {
        const bookCards = document.querySelectorAll('.book-card');
        
        bookCards.forEach(card => {
            // Create a "Read Content" button for each book
            const readContentBtn = this.createReadContentButton();
            
            // Add the button to book actions if they exist
            const bookActions = card.querySelector('.book-actions') || 
                               card.querySelector('.book-info');
            
            if (bookActions) {
                bookActions.appendChild(readContentBtn);
            }

            // Add click handler to the new button
            readContentBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookId = card.dataset.bookId;
                this.navigateToReader(bookId);
            });

            // Also handle clicks on the book title or cover for direct navigation
            const bookTitle = card.querySelector('h3');
            const bookCover = card.querySelector('.book-cover');
            
            [bookTitle, bookCover].forEach(element => {
                if (element) {
                    element.style.cursor = 'pointer';
                    element.addEventListener('click', (e) => {
                        if (!e.target.closest('.btn')) {
                            const bookId = card.dataset.bookId;
                            this.navigateToReader(bookId);
                        }
                    });
                }
            });
        });
    }

    // Create "Read Content" button
    createReadContentButton() {
        const button = document.createElement('button');
        button.className = 'btn magnetic read-content-btn';
        button.setAttribute('data-magnetic-strength', '0.3');
        button.innerHTML = '<i class="fas fa-book-open"></i> Read Content';
        button.style.marginTop = '10px';
        return button;
    }

    // Navigate to reader with specific book content
    navigateToReader(bookId) {
        // Store the selected book ID in sessionStorage
        sessionStorage.setItem('selectedBookId', bookId);
        
        // Get book data from the current page
        const bookData = this.getBookDataById(bookId);
        if (bookData) {
            sessionStorage.setItem('selectedBookData', JSON.stringify(bookData));
        }

        // Navigate to reader page
        window.location.href = this.readerUrl + `?book=${bookId}`;
    }

    // Get book data by ID from the current page's state
    getBookDataById(bookId) {
        // Try to get from global state first
        if (window.state && window.state.books) {
            return window.state.books.find(book => book.id == bookId);
        }

        // Fallback: extract from DOM
        const bookCard = document.querySelector(`[data-book-id="${bookId}"]`);
        if (bookCard) {
            return {
                id: bookId,
                title: bookCard.querySelector('h3')?.textContent || 'Unknown Title',
                description: bookCard.querySelector('p')?.textContent || 'No description available',
                cover: bookCard.querySelector('img')?.src || '',
                author: 'Unknown Author', // You might want to extract this differently
                category: this.extractCategoryFromCard(bookCard)
            };
        }

        return null;
    }

    // Extract category from book card's parent section
    extractCategoryFromCard(bookCard) {
        const categorySection = bookCard.closest('.category-section');
        if (categorySection) {
            const categoryTitle = categorySection.querySelector('.category-title');
            return categoryTitle ? categoryTitle.textContent.toLowerCase().replace(/\s+/g, '-') : 'unknown';
        }
        return 'unknown';
    }

    // Initialize functionality for read-me.html
    initializeReaderPage() {
        // Override the original poem loading with dynamic book content
        this.overrideReaderLoading();
    }

    // Override the reader's loading mechanism
    overrideReaderLoading() {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            // Get selected book data
            const bookId = this.getBookIdFromUrl() || sessionStorage.getItem('selectedBookId');
            const bookData = this.getStoredBookData();

            if (bookId || bookData) {
                this.loadBookContent(bookId, bookData);
            } else {
                this.loadDefaultContent();
            }
        });
    }

    // Get book ID from URL parameters
    getBookIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('book');
    }

    // Get stored book data from sessionStorage
    getStoredBookData() {
        const storedData = sessionStorage.getItem('selectedBookData');
        return storedData ? JSON.parse(storedData) : null;
    }

    // Load specific book content into the reader
    loadBookContent(bookId, bookData) {
        // Create dynamic content based on book data
        const dynamicContent = this.createBookContent(bookData);
        
        // Override the global poems array and JSON data
        if (window.poems !== undefined) {
            window.poems = [dynamicContent];
            window.jsonData = {
                collection: {
                    name: bookData?.title || 'Selected Book',
                    entries: [dynamicContent]
                }
            };
            window.currentIndex = 0;
            
            // Call the display function if it exists
            if (typeof window.displayPoem === 'function') {
                window.displayPoem();
            }
        }

        // Update page title
        document.title = `${bookData?.title || 'Book Reader'} - Vrindopnishad`;
        
        // Show navigation back to stack
        this.addBackToStackNavigation();
    }

    // Create book content in the format expected by read-me.js
    createBookContent(bookData) {
        if (!bookData) {
            return this.getDefaultContent();
        }

        return {
            title: bookData.title,
            excerpt: `By ${bookData.author || 'Unknown Author'}`,
            type: this.formatCategory(bookData.category),
            status: 'published',
            content: {
                title: bookData.title,
                excerpt: `By ${bookData.author || 'Unknown Author'}`,
                tags: this.generateTags(bookData),
                content: this.generateBookContent(bookData)
            },
            images: bookData.gallery_images ? 
                bookData.gallery_images.map(img => ({ url: img, title: bookData.title })) : [],
            videos: [],
            links: this.generateRelatedLinks(bookData)
        };
    }

    // Generate book content text
    generateBookContent(bookData) {
        let content = `${bookData.title}\n\n`;
        content += `Author: ${bookData.author || 'Unknown Author'}\n`;
        content += `Category: ${this.formatCategory(bookData.category)}\n`;
        content += `Year: ${bookData.year || 'Unknown'}\n\n`;
        content += `Description:\n${bookData.description || 'No description available.'}\n\n`;
        
        // Add some spiritual content based on category
        content += this.generateCategorySpecificContent(bookData.category, bookData.title);
        
        return content;
    }

    // Generate category-specific content
    generateCategorySpecificContent(category, title) {
        const spiritualContent = {
            'vedic': `
This sacred text belongs to the Vedic tradition, representing the eternal wisdom of the ancient seers.

वेदो नित्यो अपौरुषेयः
The Vedas are eternal and of divine origin.

These timeless teachings guide us toward self-realization and the ultimate truth of existence. Through the study of such sacred literature, we connect with the profound wisdom that has illuminated countless souls across millennia.

राधे राधे राधे राधे राधे राधे राधे राधे
राधे राधे राधे राधे राधे राधे राधे राधे

हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे
हरे राम हरे राम राम राम हरे हरे

श्री हरिवंश श्री हरिवंश श्री हरिवंश श्री हरिवंश
            `,
            'puranas': `
The Puranic literature contains the stories and teachings that bring divine wisdom to life through narrative.

इदं पुराणमिश्वरस्य वाणी
This Purana is the voice of the Supreme Lord.

Through these sacred stories, we learn not just history, but the eternal principles that govern existence itself. Each tale contains layers of meaning, from the literal to the deeply metaphysical.

राधे राधे राधे राधे राधे राधे राधे राधे
राधे राधे राधे राधे राधे राधे राधे राधे

जय श्री राधे जय श्री राधे जय श्री राधे जय श्री राधे
            `,
            'modern': `
Modern spiritual literature bridges ancient wisdom with contemporary understanding.

The timeless truths found in classical texts find new expression through contemporary spiritual teachers and authors. This synthesis helps us apply eternal principles to modern life.

Through dedicated study and practice, we can integrate these teachings into our daily existence, transforming not just our understanding but our very being.

राधे राधे राधे राधे राधे राधे राधे राधे
राधे राधे राधे राधे राधे राधे राधे राधे

ॐ श्री गुरवे नमः
ॐ नमो भगवते वासुदेवाय
            `
        };

        return spiritualContent[category] || `
This sacred text offers profound insights into the nature of existence and our relationship with the divine.

Through contemplation and study of such works, we deepen our understanding of spiritual principles and their practical application in daily life.

राधे राधे राधे राधे राधे राधे राधे राधे
राधे राधे राधे राधे राधे राधे राधे राधे

हरि ॐ तत्सत्
        `;
    }

    // Format category for display
    formatCategory(category) {
        if (!category) return 'Sacred Text';
        
        const categoryMap = {
            'vedic': 'Vedic Scripture',
            'puranas': 'Puranic Literature', 
            'modern': 'Modern Spiritual Text',
            'scriptures': 'Sacred Scripture'
        };

        return categoryMap[category] || 
               category.split('-').map(word => 
                   word.charAt(0).toUpperCase() + word.slice(1)
               ).join(' ');
    }

    // Generate tags based on book data
    generateTags(bookData) {
        const tags = [];
        
        if (bookData.category) {
            tags.push(bookData.category);
        }
        
        if (bookData.language) {
            tags.push(bookData.language);
        }

        if (bookData.title) {
            // Add specific tags based on title content
            const title = bookData.title.toLowerCase();
            if (title.includes('gita')) tags.push('bhagavad-gita');
            if (title.includes('ramayana')) tags.push('ramayana');
            if (title.includes('krishna')) tags.push('krishna');
            if (title.includes('rama')) tags.push('rama');
            if (title.includes('vedic')) tags.push('vedic');
        }

        // Add some default spiritual tags
        tags.push('spiritual', 'wisdom', 'sacred');

        return tags;
    }

    // Generate related links
    generateRelatedLinks(bookData) {
        const links = [];

        if (bookData.title) {
            const title = bookData.title.toLowerCase();
            
            if (title.includes('gita')) {
                links.push({
                    title: 'Bhagavad Gita Online',
                    url: 'https://www.holy-bhagavad-gita.org/',
                    description: 'Complete text and commentary'
                });
            }
            
            if (title.includes('ramayana')) {
                links.push({
                    title: 'Valmiki Ramayana',
                    url: 'https://www.valmikiramayan.net/',
                    description: 'Original Sanskrit text with translations'
                });
            }
        }

        // Add general spiritual links
        links.push({
            title: 'Vrindavan Dham',
            url: 'https://en.wikipedia.org/wiki/Vrindavan',
            description: 'The sacred land of Krishna'
        });

        return links;
    }

    // Load default content when no specific book is selected
    loadDefaultContent() {
        const defaultContent = this.getDefaultContent();
        
        if (window.poems !== undefined) {
            window.poems = [defaultContent];
            window.jsonData = {
                collection: {
                    name: 'Vrindopnishad Collection',
                    entries: [defaultContent]
                }
            };
            window.currentIndex = 0;
            
            if (typeof window.displayPoem === 'function') {
                window.displayPoem();
            }
        }
    }

    // Get default content structure
    getDefaultContent() {
        return {
            title: 'वृन्दोपनिषद्',
            excerpt: 'श्री हरिवंश',
            type: 'Divine Wisdom',
            status: 'published',
            content: {
                title: 'वृन्दोपनिषद्',
                excerpt: 'A collection of sacred wisdom and spiritual insights',
                tags: ['spiritual', 'wisdom', 'vedic', 'krishna', 'radha'],
                content: `Welcome to Vrindopnishad - A Sacred Digital Sanctuary

This is a collection of spiritual wisdom, sacred texts, and divine knowledge compiled for seekers on the path of self-realization.

राधे राधे राधे राधे राधे राधे राधे राधे
राधे राधे राधे राधे राधे राधे राधे राधे
राधे राधे राधे राधे राधे राधे राधे राधे
राधे राधे राधे राधे राधे राधे राधे राधे

हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे
हरे राम हरे राम राम राम हरे हरे

वेदाहमेतं पुरुषं महान्तमादित्यवर्णं तमसः परस्तात्।
तमेव विदित्वाऽतिमृत्युमेति नान्यः पन्था विद्यतेऽयनाय॥

"I know this great Purusha, luminous like the sun, beyond darkness. 
Only by knowing Him does one transcend death; there is no other path to liberation."

श्री हरिवंश महाप्रभो!
जय श्री राधे!

Select a book from our collection to begin your spiritual journey.`
            },
            images: [],
            videos: [],
            links: [{
                title: 'Return to Book Collection',
                url: this.stackUrl,
                description: 'Browse our complete collection of sacred texts'
            }]
        };
    }

    // Add navigation back to stack page
    addBackToStackNavigation() {
        // Add a back button to the header if it doesn't exist
        const header = document.querySelector('header');
        if (header && !header.querySelector('.back-to-stack')) {
            const backButton = document.createElement('button');
            backButton.className = 'control-btn back-to-stack';
            backButton.innerHTML = '← Books';
            backButton.title = 'Back to Book Collection';
            backButton.style.marginRight = '10px';
            
            backButton.addEventListener('click', () => {
                window.location.href = this.stackUrl;
            });

            // Insert at the beginning of controls or header
            const controls = document.querySelector('.controls');
            if (controls) {
                controls.insertBefore(backButton, controls.firstChild);
            } else {
                header.appendChild(backButton);
            }
        }
    }

    // Static method to initialize the connector
    static initialize() {
        return new ContentConnector();
    }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
    window.ContentConnector = ContentConnector;
    
    // Initialize immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ContentConnector.initialize();
        });
    } else {
        ContentConnector.initialize();
    }
}