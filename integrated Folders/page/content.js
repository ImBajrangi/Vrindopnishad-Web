document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('toggle-theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use system preference
    const currentTheme = localStorage.getItem('theme') || 
        (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // Apply initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Font Size Controls
    const fontSizeBtn = document.getElementById('font-size');
    const fontSizes = ['small', 'medium', 'large'];
    let currentSizeIndex = 1; // Start with medium

    // Check for saved font size preference
    const savedSize = localStorage.getItem('fontSize');
    if (savedSize) {
        currentSizeIndex = fontSizes.indexOf(savedSize);
        document.body.className = savedSize;
    }

    fontSizeBtn.addEventListener('click', () => {
        currentSizeIndex = (currentSizeIndex + 1) % fontSizes.length;
        const newSize = fontSizes[currentSizeIndex];
        document.body.className = newSize;
        localStorage.setItem('fontSize', newSize);
    });

    // Lazy Loading Images
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add CSS classes for font sizes
    const style = document.createElement('style');
    style.textContent = `
        body.small {
            font-size: 14px;
        }
        body.medium {
            font-size: 16px;
        }
        body.large {
            font-size: 18px;
        }
    `;
    document.head.appendChild(style);

    // Initialize GSAP animations
    gsap.registerPlugin(ScrollTrigger);

    // Animate content sections on scroll
    gsap.utils.toArray('.content-section').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Animate related content items
    gsap.utils.toArray('.related-item').forEach((item, index) => {
        gsap.from(item, {
            opacity: 0,
            x: -50,
            duration: 0.8,
            delay: index * 0.2,
            scrollTrigger: {
                trigger: item,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // DOM Elements
    const contentTitle = document.getElementById('content-title');
    const contentBody = document.getElementById('content-body');
    const contentTags = document.getElementById('content-tags');
    const publishDate = document.getElementById('publish-date');
    const viewCount = document.getElementById('view-count');
    const readTime = document.getElementById('read-time');
    const likeCount = document.getElementById('like-count');
    const likeBtn = document.getElementById('like-btn');
    const shareBtn = document.getElementById('share-btn');
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const relatedItems = document.getElementById('related-items');

    // Initialize content display
    function initContentDisplay() {
        const contentContainer = document.getElementById('content-container');
        const mediaData = JSON.parse(localStorage.getItem('mediaData') || '[]');

        // Display content
        function displayContent() {
            const content = JSON.parse(localStorage.getItem('content') || '{}');
            
            if (!content || !content.content) {
                contentContainer.innerHTML = '<p class="no-content">No content available</p>';
                return;
            }

            // Create content wrapper
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'content-wrapper';

            // Add title
            const title = document.createElement('h1');
            title.className = 'content-title';
            title.textContent = content.title;
            contentWrapper.appendChild(title);

            // Add metadata
            const metadata = document.createElement('div');
            metadata.className = 'content-metadata';
            metadata.innerHTML = `
                <span class="author">By ${content.author || 'Admin'}</span>
                <span class="date">${formatDate(content.date || content.lastModified)}</span>
                <span class="category">${content.category || 'Uncategorized'}</span>
            `;
            contentWrapper.appendChild(metadata);

            // Add content
            const contentElement = document.createElement('div');
            contentElement.className = 'content-body';
            contentElement.innerHTML = content.content;

            // Process media in content
            processMediaInContent(contentElement, mediaData);
            contentWrapper.appendChild(contentElement);

            // Add tags
            if (content.tags && content.tags.length > 0) {
                const tags = document.createElement('div');
                tags.className = 'content-tags';
                content.tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'tag';
                    tagElement.textContent = tag;
                    tags.appendChild(tagElement);
                });
                contentWrapper.appendChild(tags);
            }

            // Clear and append
            contentContainer.innerHTML = '';
            contentContainer.appendChild(contentWrapper);

            // Initialize lazy loading
            initializeLazyLoading(contentWrapper);
        }

        // Process media in content
        function processMediaInContent(contentElement, mediaData) {
            const mediaWrappers = contentElement.querySelectorAll('.media-wrapper');
            
            mediaWrappers.forEach(wrapper => {
                const mediaId = wrapper.dataset.mediaId;
                const media = mediaData.find(m => m.id === mediaId);
                
                if (media) {
                    // Update media element
                    updateMediaElement(wrapper, media);

                    // Add media controls
                    addMediaControls(wrapper, media);
                } else {
                    // Handle missing media
                    handleMissingMedia(wrapper);
                }
            });
        }

        // Update media element
        function updateMediaElement(wrapper, media) {
            const element = wrapper.querySelector('img, video, audio, a');
            if (!element) return;

            switch (media.type) {
                case 'image':
                    if (element.tagName === 'IMG') {
                        element.src = media.url;
                        element.alt = media.alt || media.title || 'Image';
                        element.loading = 'lazy';
                    }
                    break;

                case 'video':
                    if (element.tagName === 'VIDEO') {
                        element.src = media.url;
                        element.controls = true;
                        element.preload = 'metadata';
                    }
                    break;

                case 'audio':
                    if (element.tagName === 'AUDIO') {
                        element.src = media.url;
                        element.controls = true;
                        element.preload = 'metadata';
                    }
                    break;

                case 'file':
                    if (element.tagName === 'A') {
                        element.href = media.url;
                        element.download = media.fileName;
                        element.innerHTML = `
                            <i class="fas fa-file"></i>
                            <span>${media.title || media.fileName}</span>
                        `;
                    }
                    break;
            }
        }

        // Add media controls
        function addMediaControls(wrapper, media) {
            // Remove existing controls
            const existingControls = wrapper.querySelector('.media-controls');
            if (existingControls) {
                existingControls.remove();
            }

            // Create new controls
            const controls = document.createElement('div');
            controls.className = 'media-controls';
            controls.innerHTML = `
                <button class="media-control" data-action="download" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="media-control" data-action="fullscreen" title="Fullscreen">
                    <i class="fas fa-expand"></i>
                </button>
            `;

            // Add event listeners
            controls.querySelector('[data-action="download"]').addEventListener('click', () => {
                downloadMedia(media);
            });

            controls.querySelector('[data-action="fullscreen"]').addEventListener('click', () => {
                openFullscreen(wrapper);
            });

            wrapper.appendChild(controls);
        }

        // Handle missing media
        function handleMissingMedia(wrapper) {
            wrapper.innerHTML = `
                <div class="media-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Media not found</span>
                </div>
            `;
        }

        // Download media
        function downloadMedia(media) {
            const link = document.createElement('a');
            link.href = media.url;
            link.download = media.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Open fullscreen
        function openFullscreen(element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }

        // Initialize lazy loading
        function initializeLazyLoading(container) {
            const images = container.querySelectorAll('img[loading="lazy"]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }

        // Format date
        function formatDate(dateString) {
            if (!dateString) return 'Unknown date';
            
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateString).toLocaleDateString(undefined, options);
        }

        // Initialize
        displayContent();

        // Listen for content updates
        window.addEventListener('storage', (e) => {
            if (e.key === 'content' || e.key === 'mediaData') {
                displayContent();
            }
        });
    }

    // Initialize when DOM is loaded
    initContentDisplay();

    // Initialize GSAP animations
    initializeAnimations();

    // Lazy load images
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}); 