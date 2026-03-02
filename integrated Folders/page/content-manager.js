// Content Management functionality
document.addEventListener('DOMContentLoaded', function() {
    const contentEditor = document.getElementById('content-editor');
    const autoSaveToggle = document.getElementById('auto-save');
    let autoSaveInterval;

    // Initialize auto-save
    if (autoSaveToggle && contentEditor) {
        autoSaveToggle.addEventListener('change', function() {
            if (this.checked) {
                autoSaveInterval = setInterval(saveContent, 30000); // Save every 30 seconds
                showNotification('Auto-save enabled', 'success');
            } else {
                clearInterval(autoSaveInterval);
                showNotification('Auto-save disabled', 'info');
            }
        });

        // Start auto-save if enabled
        if (autoSaveToggle.checked) {
            autoSaveInterval = setInterval(saveContent, 30000);
        }
    }

    // Save content function
    function saveContent() {
        const title = document.querySelector('.content-title').value;
        const content = contentEditor.innerHTML;
        const tags = document.querySelector('.content-tags').value;
        const pageTitle = document.getElementById('page-title').value;
        const pageSlug = document.getElementById('page-slug').value;
        const pageStatus = document.getElementById('page-status').value;
        const seoTitle = document.getElementById('seo-title').value;
        const metaDescription = document.getElementById('meta-description').value;

        const pageData = {
            title,
            content,
            tags,
            pageTitle,
            pageSlug,
            pageStatus,
            seoTitle,
            metaDescription,
            lastModified: new Date().toISOString()
        };

        localStorage.setItem('pageData', JSON.stringify(pageData));
        showNotification('Content saved', 'success');
    }

    // Manual save
    const saveButton = document.getElementById('save-content');
    if (saveButton) {
        saveButton.addEventListener('click', saveContent);
    }

    // Publish content
    const publishButton = document.getElementById('publish-content');
    if (publishButton) {
        publishButton.addEventListener('click', function() {
            saveContent();
            showNotification('Content published successfully', 'success');
        });
    }

    // Preview content
    const previewButton = document.getElementById('preview-content');
    if (previewButton) {
        previewButton.addEventListener('click', function() {
            saveContent();
            window.open('content.html?preview=true', '_blank');
        });
    }

    // Image upload handling
    const imageUpload = document.getElementById('image-upload');
    if (imageUpload) {
        imageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'content-image';
                    contentEditor.appendChild(img);
                    showNotification('Image added', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Format buttons
    const formatButtons = document.querySelectorAll('.format-btn');
    formatButtons.forEach(button => {
        button.addEventListener('click', function() {
            const format = this.dataset.format;
            document.execCommand(format, false, null);
            this.classList.toggle('active');
        });
    });

    // Character count for SEO fields
    const seoTitle = document.getElementById('seo-title');
    const metaDescription = document.getElementById('meta-description');
    const seoTitleCount = seoTitle.nextElementSibling;
    const metaDescCount = metaDescription.nextElementSibling;

    seoTitle.addEventListener('input', function() {
        seoTitleCount.textContent = `${this.value.length}/60`;
    });

    metaDescription.addEventListener('input', function() {
        metaDescCount.textContent = `${this.value.length}/160`;
    });

    // Keywords handling
    const keywordsInput = document.getElementById('seo-keywords');
    const keywordTags = document.querySelector('.keyword-tags');

    keywordsInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const keyword = this.value.trim();
            if (keyword) {
                addKeywordTag(keyword);
                this.value = '';
            }
        }
    });

    function addKeywordTag(keyword) {
        const tag = document.createElement('span');
        tag.className = 'keyword-tag';
        tag.textContent = keyword;
        tag.innerHTML += '<i class="fas fa-times"></i>';
        tag.querySelector('i').addEventListener('click', function() {
            tag.remove();
        });
        keywordTags.appendChild(tag);
    }

    // Notification helper function
    function showNotification(message, type) {
        if (window.NotificationManager) {
            window.NotificationManager.show(message, type);
        } else {
            alert(message);
        }
    }
}); 

document.addEventListener('DOMContentLoaded', function() {
            // Get page data from localStorage
            const pageData = JSON.parse(localStorage.getItem('pageData')) || {};
            const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';

            // Update page title
            document.title = pageData.pageTitle || 'Content Display - Vrindopnishad';

            // Update content
            if (pageData.title) {
                document.getElementById('content-title').textContent = pageData.title;
            }

            if (pageData.content) {
                const contentBody = document.getElementById('content-body');
                contentBody.innerHTML = pageData.content;

                // Initialize media controls
                initializeMediaControls(contentBody);
            }

            // Update publish date
            if (pageData.lastModified) {
                const date = new Date(pageData.lastModified);
                document.getElementById('publish-date').textContent = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            // Update tags
            if (pageData.tags) {
                const tagsContainer = document.getElementById('content-tags');
                const tags = pageData.tags.split(',').map(tag => tag.trim());
                tagsContainer.innerHTML = ''; // Clear existing tags
                tags.forEach(tag => {
                    if (tag) { // Only add non-empty tags
                        const tagElement = document.createElement('span');
                        tagElement.className = 'tag';
                        tagElement.textContent = tag;
                        tagsContainer.appendChild(tagElement);
                    }
                });
            }

            // Calculate read time
            const contentText = document.getElementById('content-body').textContent;
            const wordCount = contentText.trim().split(/\s+/).length;
            const readTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
            document.getElementById('read-time').textContent = `${readTime} min`;

            // Initialize view count
            let viewCount = parseInt(localStorage.getItem(`viewCount_${window.location.href}`)) || 0;
            viewCount++;
            localStorage.setItem(`viewCount_${window.location.href}`, viewCount);
            document.getElementById('view-count').textContent = viewCount;

            // Initialize like count
            let likeCount = parseInt(localStorage.getItem(`likeCount_${window.location.href}`)) || 0;
            document.getElementById('like-count').textContent = likeCount;

            // Like button functionality
            const likeBtn = document.getElementById('like-btn');
            likeBtn.addEventListener('click', function() {
                likeCount++;
                document.getElementById('like-count').textContent = likeCount;
                localStorage.setItem(`likeCount_${window.location.href}`, likeCount);
                this.classList.add('liked');
                showNotification('Content liked!', 'success');
            });

            // Share button functionality
            const shareBtn = document.getElementById('share-btn');
            shareBtn.addEventListener('click', function() {
                if (navigator.share) {
                    navigator.share({
                        title: pageData.title,
                        text: pageData.metaDescription,
                        url: window.location.href
                    }).catch(() => {
                        showNotification('Sharing cancelled', 'info');
                    });
                } else {
                    // Fallback for browsers that don't support Web Share API
                    const dummy = document.createElement('input');
                    document.body.appendChild(dummy);
                    dummy.value = window.location.href;
                    dummy.select();
                    document.execCommand('copy');
                    document.body.removeChild(dummy);
                    showNotification('Link copied to clipboard!', 'success');
                }
            });

            // Bookmark button functionality
            const bookmarkBtn = document.getElementById('bookmark-btn');
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
            const isBookmarked = bookmarks.some(b => b.url === window.location.href);
            if (isBookmarked) {
                bookmarkBtn.classList.add('bookmarked');
            }

            bookmarkBtn.addEventListener('click', function() {
                this.classList.toggle('bookmarked');
                const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
                
                if (this.classList.contains('bookmarked')) {
                    // Add to bookmarks
                    bookmarks.push({
                        title: pageData.title,
                        url: window.location.href,
                        date: new Date().toISOString()
                    });
                    showNotification('Content bookmarked!', 'success');
                } else {
                    // Remove from bookmarks
                    const index = bookmarks.findIndex(b => b.url === window.location.href);
                    if (index > -1) {
                        bookmarks.splice(index, 1);
                        showNotification('Bookmark removed', 'info');
                    }
                }
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            });

            // Load related content
            loadRelatedContent();
        });

        // Initialize media controls
        function initializeMediaControls(container) {
            // Handle image lazy loading
            const images = container.querySelectorAll('img[loading="lazy"]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                        }
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));

            // Handle video lazy loading
            const videos = container.querySelectorAll('video');
            const videoObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const video = entry.target;
                        if (video.dataset.src) {
                            const source = video.querySelector('source');
                            if (source) {
                                source.src = video.dataset.src;
                                video.load();
                            }
                        }
                        observer.unobserve(video);
                    }
                });
            });

            videos.forEach(video => videoObserver.observe(video));
        }

        // Load related content
        function loadRelatedContent() {
            const relatedItems = document.getElementById('related-items');
            const publishedContent = JSON.parse(localStorage.getItem('publishedContent')) || [];
            const currentUrl = window.location.href;
            
            // Filter out current content and get 3 random items
            const otherContent = publishedContent.filter(content => content.url !== currentUrl);
            const randomContent = otherContent.sort(() => 0.5 - Math.random()).slice(0, 3);
            
            relatedItems.innerHTML = randomContent.map(content => `
                <div class="related-item">
                    <h3>${content.title}</h3>
                    <p>${content.metaDescription || ''}</p>
                    <a href="${content.url}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            `).join('');
        }

        // Show notification
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            
            const icon = type === 'success' ? '✓' : 
                        type === 'error' ? '✕' : 
                        type === 'warning' ? '⚠' : 'ℹ';
            
            notification.innerHTML = `
                <div class="notification-header">
                    <div class="notification-app-icon">${icon}</div>
                    <div class="notification-app-name">Content Display</div>
                    <div class="notification-time">${new Date().toLocaleTimeString()}</div>
                </div>
                <div class="notification-content">${message}</div>
                <button class="notification-close">&times;</button>
            `;

            const container = document.querySelector('.notifications');
            container.appendChild(notification);

            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.classList.add('hide');
                setTimeout(() => notification.remove(), 300);
            }, 5000);

            // Close button
            notification.querySelector('.notification-close').onclick = () => {
                notification.classList.add('hide');
                setTimeout(() => notification.remove(), 300);
            };
        }
