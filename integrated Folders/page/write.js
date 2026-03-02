// Initialize GSAP animations
gsap.registerPlugin(ScrollTrigger);

// Content structure
const contentStructure = {
    title: '',
    content: '',
    tags: [],
    metadata: {
        createdAt: '',
        updatedAt: '',
        author: '',
        keywords: [],
        description: '',
        category: '',
        slug: ''
    },
    seo: {
        title: '',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        canonicalUrl: ''
    }
};

// Initialize the editor
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded, initializing...');
    // Initialize login first
    initLogin();
    
    // Only initialize other features if logged in
    if (localStorage.getItem('adminToken')) {
        loadSavedContent();
        initFormatTools();
        initMediaTools();
        initPreview();
        initMobileMenu();
        initSEOTools();
    }
});

// Load saved content from localStorage
function loadSavedContent() {
    const savedContent = localStorage.getItem('content_data');
    if (savedContent) {
        const content = JSON.parse(savedContent);
        document.querySelector('.content-title').value = content.title || '';
        document.getElementById('content-editor').innerHTML = content.content || '';
        document.querySelector('.content-tags').value = content.tags.join(', ') || '';
        
        // Load SEO data if exists
        if (content.seo) {
            document.getElementById('seo-title').value = content.seo.title || '';
            document.getElementById('meta-description').value = content.seo.metaDescription || '';
            document.getElementById('og-title').value = content.seo.ogTitle || '';
            document.getElementById('og-description').value = content.seo.ogDescription || '';
            document.getElementById('canonical-url').value = content.seo.canonicalUrl || '';
        }
    }
}

// Save content as JSON
function saveContent() {
    const title = document.querySelector('.content-title').value;
    const content = document.getElementById('content-editor').innerHTML;
    const tags = document.querySelector('.content-tags').value.split(',').map(tag => tag.trim());
    
    // Generate slug from title
    const slug = generateSlug(title);
    
    // Get SEO data
    const seoData = {
        title: document.getElementById('seo-title').value,
        metaDescription: document.getElementById('meta-description').value,
        ogTitle: document.getElementById('og-title').value,
        ogDescription: document.getElementById('og-description').value,
        canonicalUrl: document.getElementById('canonical-url').value
    };
    
    // Create content object
    const contentData = {
        ...contentStructure,
        title,
        content,
        tags,
        metadata: {
            ...contentStructure.metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            slug,
            keywords: extractKeywords(content)
        },
        seo: seoData
    };
    
    // Save to localStorage
    localStorage.setItem('content_data', JSON.stringify(contentData));
    
    // Save to server (you would implement this)
    saveToServer(contentData);
    
    if (window.NotificationManager) {
        window.NotificationManager.show('Content saved successfully', 'success');
    }
}

// Generate SEO-friendly slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Extract keywords from content
function extractKeywords(content) {
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    
    // Split into words
    const words = text.toLowerCase().split(/\W+/);
    
    // Count word frequency
    const wordFreq = {};
    words.forEach(word => {
        if (word.length > 3) { // Ignore short words
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });
    
    // Sort by frequency
    const keywords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10) // Top 10 keywords
        .map(([word]) => word);
    
    return keywords;
}

// SEO Tools Functionality
function initSEOTools() {
    const titleInput = document.getElementById('seo-title');
    const descriptionInput = document.getElementById('meta-description');
    const keywordsInput = document.getElementById('seo-keywords');
    const previewTitle = document.querySelector('.preview-title');
    const previewDescription = document.querySelector('.preview-description');
    const keywordTags = document.querySelector('.keyword-tags');
    const contentStats = document.querySelector('.content-stats');

    // Load saved SEO data
    const savedSEO = JSON.parse(localStorage.getItem('seoData') || '{}');
    if (savedSEO.title) titleInput.value = savedSEO.title;
    if (savedSEO.description) descriptionInput.value = savedSEO.description;
    if (savedSEO.keywords) {
        savedSEO.keywords.forEach(keyword => addKeywordTag(keyword));
    }

    // Update preview on input
    titleInput.addEventListener('input', updatePreview);
    descriptionInput.addEventListener('input', updatePreview);

    // Handle keywords
    keywordsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const keyword = keywordsInput.value.trim();
            if (keyword) {
                addKeywordTag(keyword);
                keywordsInput.value = '';
                saveSEOData();
            }
        }
    });

    // Update content stats
    function updateContentStats() {
        const content = document.getElementById('content-editor').innerText;
        const wordCount = content.trim().split(/\s+/).length;
        const charCount = content.length;
        const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

        contentStats.innerHTML = `
            <h3>Content Statistics</h3>
            <div class="stat-item">
                <span class="stat-label">Words:</span>
                <span class="stat-value">${wordCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Characters:</span>
                <span class="stat-value">${charCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Reading Time:</span>
                <span class="stat-value">${readingTime} min</span>
            </div>
        `;
    }

    // Add keyword tag
    function addKeywordTag(keyword) {
        const tag = document.createElement('div');
        tag.className = 'keyword-tag';
        tag.innerHTML = `
            ${keyword}
            <span class="remove-keyword">×</span>
        `;

        tag.querySelector('.remove-keyword').addEventListener('click', () => {
            tag.remove();
            saveSEOData();
        });

        keywordTags.appendChild(tag);
        saveSEOData();
    }

    // Update preview
    function updatePreview() {
        const title = titleInput.value || 'Your Title Here';
        const description = descriptionInput.value || 'Your description here...';

        previewTitle.textContent = title;
        previewDescription.textContent = description;

        // Validate SEO
        validateSEO(title, description);
        saveSEOData();
    }

    // Validate SEO
    function validateSEO(title, description) {
        const titleLength = title.length;
        const descLength = description.length;

        if (titleLength < 30) {
            showNotification('Title is too short. Aim for 30-60 characters.', 'error');
        } else if (titleLength > 60) {
            showNotification('Title is too long. Keep it under 60 characters.', 'error');
        }

        if (descLength < 120) {
            showNotification('Description is too short. Aim for 120-160 characters.', 'error');
        } else if (descLength > 160) {
            showNotification('Description is too long. Keep it under 160 characters.', 'error');
        }
    }

    // Save SEO data
    function saveSEOData() {
        const keywords = Array.from(keywordTags.querySelectorAll('.keyword-tag'))
            .map(tag => tag.textContent.trim().replace('×', ''));

        const seoData = {
            title: titleInput.value,
            description: descriptionInput.value,
            keywords: keywords
        };

        localStorage.setItem('seoData', JSON.stringify(seoData));
    }

    // Update stats when content changes
    document.getElementById('content-editor').addEventListener('input', updateContentStats);
    updateContentStats();
}

// Save to server (implement this based on your backend)
async function saveToServer(contentData) {
    try {
        // Here you would implement the actual server save
        // Example:
        // const response = await fetch('/api/content', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(contentData)
        // });
        
        // For now, we'll just log it
        console.log('Content saved to server:', contentData);
    } catch (error) {
        console.error('Error saving to server:', error);
        if (window.NotificationManager) {
            window.NotificationManager.show('Error saving to server', 'error');
        }
    }
}

// Initialize formatting tools
function initFormatTools() {
    const formatButtons = document.querySelectorAll('.format-btn');
    
    formatButtons.forEach(button => {
        button.addEventListener('click', function() {
            const format = this.dataset.format;
            
            // Remove active class from all buttons
            formatButtons.forEach(btn => btn.classList.remove('active'));
            
            // Apply formatting
            switch(format) {
                case 'bold':
                    document.execCommand('bold', false, null);
                    break;
                case 'italic':
                    document.execCommand('italic', false, null);
                    break;
                case 'underline':
                    document.execCommand('underline', false, null);
                    break;
                case 'heading':
                    document.execCommand('formatBlock', false, 'h2');
                    break;
                case 'list':
                    document.execCommand('insertUnorderedList', false, null);
                    break;
            }
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show notification
            if (window.NotificationManager) {
                window.NotificationManager.show('Format applied', 'success');
            }
        });
    });
}

// Initialize media tools
function initMediaTools() {
    console.log('Initializing media tools...');
    
    const mediaInputs = {
        image: document.getElementById('imageUpload'),
        video: document.getElementById('videoUpload'),
        audio: document.getElementById('audioUpload'),
        file: document.getElementById('fileUpload')
    };

    const mediaButtons = {
        image: document.getElementById('uploadImage'),
        video: document.getElementById('uploadVideo'),
        audio: document.getElementById('uploadAudio'),
        file: document.getElementById('uploadFile')
    };

    // Debug check
    console.log('Media inputs:', mediaInputs);
    console.log('Media buttons:', mediaButtons);

    const modal = document.getElementById('mediaModal');
    const closeModal = modal.querySelector('.close-modal');
    const insertMediaBtn = document.getElementById('insertMedia');
    const cancelMediaBtn = document.getElementById('cancelMedia');
    const mediaPreview = modal.querySelector('.media-preview');
    let currentMedia = null;

    // Handle media button clicks
    Object.entries(mediaButtons).forEach(([type, button]) => {
        if (button) {
            button.addEventListener('click', () => {
                console.log(`Clicked ${type} upload button`);
                if (mediaInputs[type]) {
                    mediaInputs[type].click();
                } else {
                    console.error(`Media input for ${type} not found`);
                }
            });
        } else {
            console.error(`Media button for ${type} not found`);
        }
    });

    // Handle file selection
    Object.entries(mediaInputs).forEach(([type, input]) => {
        if (input) {
            input.addEventListener('change', async (e) => {
                console.log(`File selected for ${type}:`, e.target.files[0]);
                const file = e.target.files[0];
                if (file) {
                    try {
                        await handleMediaFile(file, type);
                    } catch (error) {
                        console.error('Error handling media file:', error);
                        showNotification(error.message, 'error');
                    }
                }
            });
        } else {
            console.error(`Media input for ${type} not found`);
        }
    });

    // Handle media file
    async function handleMediaFile(file, type) {
        console.log('Handling media file:', { file, type });
        
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('File size should be less than 10MB');
        }

        // Validate file type
        if (!validateFileType(file, type)) {
            throw new Error(`Invalid file type for ${type}`);
        }

        // Create a unique ID for the media
        const mediaId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('Generated media ID:', mediaId);

        // Create object URL
        const url = URL.createObjectURL(file);
        console.log('Created object URL:', url);

        currentMedia = {
            id: mediaId,
            file,
            type,
            url,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadedAt: new Date().toISOString()
        };

        console.log('Current media object:', currentMedia);

        // Show preview
        await showMediaPreview(currentMedia);
        
        // Show modal
        modal.classList.remove('hidden');
    }

    // Validate file type
    function validateFileType(file, type) {
        const validTypes = {
            image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
            video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
            audio: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4', 'audio/webm'],
            file: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip']
        };

        return validTypes[type].includes(file.type);
    }

    // Show media preview
    async function showMediaPreview(media) {
        mediaPreview.innerHTML = '';

        try {
            switch (media.type) {
                case 'image':
                    const img = document.createElement('img');
                    img.src = media.url;
                    img.alt = 'Preview';
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                    });
                    mediaPreview.appendChild(img);
                    break;

                case 'video':
                    const video = document.createElement('video');
                    video.src = media.url;
                    video.controls = true;
                    await new Promise((resolve, reject) => {
                        video.onloadeddata = resolve;
                        video.onerror = reject;
                    });
                    mediaPreview.appendChild(video);
                    break;

                case 'audio':
                    const audio = document.createElement('audio');
                    audio.src = media.url;
                    audio.controls = true;
                    await new Promise((resolve, reject) => {
                        audio.onloadeddata = resolve;
                        audio.onerror = reject;
                    });
                    mediaPreview.appendChild(audio);
                    break;

                case 'file':
                    const fileInfo = document.createElement('div');
                    fileInfo.className = 'file-info';
                    fileInfo.innerHTML = `
                        <i class="fas fa-file"></i>
                        <span>${media.fileName}</span>
                        <span>${formatFileSize(media.fileSize)}</span>
                    `;
                    mediaPreview.appendChild(fileInfo);
                    break;
            }
        } catch (error) {
            throw new Error('Error loading media preview');
        }
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Insert media into content
    function insertMedia() {
        if (!currentMedia) return;

        const title = document.getElementById('mediaTitle').value;
        const caption = document.getElementById('mediaCaption').value;
        const alt = document.getElementById('mediaAlt').value;

        const mediaElement = createMediaElement(currentMedia, title, caption, alt);
        
        // Insert at cursor position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.insertNode(mediaElement);

        // Save media data
        saveMediaData(currentMedia, title, caption, alt);

        // Close modal and reset
        closeModalAndReset();

        // Show success notification
        showNotification('Media inserted successfully', 'success');
    }

    // Create media element
    function createMediaElement(media, title, caption, alt) {
        const wrapper = document.createElement('div');
        wrapper.className = `media-wrapper ${media.type}-wrapper`;
        wrapper.dataset.mediaId = media.id;

        let element;
        switch (media.type) {
            case 'image':
                element = document.createElement('img');
                element.src = media.url;
                element.alt = alt || title || 'Image';
                element.loading = 'lazy';
                break;

            case 'video':
                element = document.createElement('video');
                element.src = media.url;
                element.controls = true;
                element.preload = 'metadata';
                break;

            case 'audio':
                element = document.createElement('audio');
                element.src = media.url;
                element.controls = true;
                element.preload = 'metadata';
                break;

            case 'file':
                element = document.createElement('a');
                element.href = media.url;
                element.download = media.fileName;
                element.className = 'file-link';
                element.innerHTML = `
                    <i class="fas fa-file"></i>
                    <span>${title || media.fileName}</span>
                `;
                break;
        }

        wrapper.appendChild(element);

        if (caption) {
            const captionElement = document.createElement('div');
            captionElement.className = 'media-caption';
            captionElement.textContent = caption;
            wrapper.appendChild(captionElement);
        }

        // Add media controls
        const controls = document.createElement('div');
        controls.className = 'media-controls';
        controls.innerHTML = `
            <button class="media-control" data-action="download">
                <i class="fas fa-download"></i>
            </button>
            <button class="media-control" data-action="fullscreen">
                <i class="fas fa-expand"></i>
            </button>
            <button class="media-control" data-action="remove">
                <i class="fas fa-trash"></i>
            </button>
        `;
        wrapper.appendChild(controls);

        return wrapper;
    }

    // Save media data
    function saveMediaData(media, title, caption, alt) {
        const mediaData = {
            ...media,
            title,
            caption,
            alt,
            insertedAt: new Date().toISOString()
        };

        // Save to localStorage
        const savedMedia = JSON.parse(localStorage.getItem('mediaData') || '[]');
        savedMedia.push(mediaData);
        localStorage.setItem('mediaData', JSON.stringify(savedMedia));

        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'mediaData',
            newValue: JSON.stringify(savedMedia)
        }));
    }

    // Close modal and reset
    function closeModalAndReset() {
        modal.classList.add('hidden');
        document.getElementById('mediaTitle').value = '';
        document.getElementById('mediaCaption').value = '';
        document.getElementById('mediaAlt').value = '';
        mediaPreview.innerHTML = '';
        currentMedia = null;

        // Reset file inputs
        Object.values(mediaInputs).forEach(input => {
            input.value = '';
        });
    }

    // Event listeners
    closeModal.addEventListener('click', closeModalAndReset);
    cancelMediaBtn.addEventListener('click', closeModalAndReset);
    insertMediaBtn.addEventListener('click', insertMedia);

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalAndReset();
        }
    });

    // Handle media controls
    document.addEventListener('click', (e) => {
        const control = e.target.closest('.media-control');
        if (!control) return;

        const wrapper = control.closest('.media-wrapper');
        const action = control.dataset.action;

        switch (action) {
            case 'download':
                const mediaId = wrapper.dataset.mediaId;
                const media = JSON.parse(localStorage.getItem('mediaData') || '[]')
                    .find(m => m.id === mediaId);
                if (media) {
                    downloadMedia(media);
                }
                break;

            case 'fullscreen':
                openFullscreen(wrapper);
                break;

            case 'remove':
                if (confirm('Are you sure you want to remove this media?')) {
                    wrapper.remove();
                    showNotification('Media removed', 'info');
                }
                break;
        }
    });
}

// Enhanced Preview Function
function initPreview() {
    const previewBtn = document.getElementById('previewContent');
    const publishBtn = document.getElementById('publishContent');
    const saveDraftBtn = document.getElementById('saveDraft');

    previewBtn.addEventListener('click', function() {
        const content = getContentData();
        if (!validateContent(content)) return;

        // Save to localStorage for preview
        localStorage.setItem('previewData', JSON.stringify(content));
        
        // Open preview in new window
        const previewWindow = window.open('content.html?preview=true', '_blank');
        if (!previewWindow) {
            showNotification('Please allow popups to preview content', 'warning');
        }
    });

    publishBtn.addEventListener('click', async function() {
        const content = getContentData();
        if (!validateContent(content)) return;

        try {
            // Save to published content
            const publishedContent = JSON.parse(localStorage.getItem('publishedContent') || '[]');
            const contentId = Date.now().toString();
            
            const publishedItem = {
                ...content,
                id: contentId,
                publishedAt: new Date().toISOString(),
                url: `content.html?id=${contentId}`,
                status: 'published',
                author: localStorage.getItem('adminUsername') || 'Admin'
            };

            publishedContent.push(publishedItem);
            localStorage.setItem('publishedContent', JSON.stringify(publishedContent));
            localStorage.setItem('pageData', JSON.stringify(publishedItem));

            showNotification('Content published successfully!', 'success');
            
            // Redirect to published content
            window.location.href = publishedItem.url;
        } catch (error) {
            console.error('Publish error:', error);
            showNotification('Error publishing content', 'error');
        }
    });

    saveDraftBtn.addEventListener('click', function() {
        const content = getContentData();
        localStorage.setItem('draftContent', JSON.stringify(content));
        showNotification('Draft saved successfully!', 'success');
    });
}

// Get content data
function getContentData() {
    return {
        title: document.querySelector('.content-title').value,
        content: document.getElementById('content-editor').innerHTML,
        tags: document.querySelector('.content-tags').value.split(',').map(tag => tag.trim()),
        seo: {
            title: document.getElementById('seo-title').value,
            description: document.getElementById('meta-description').value,
            keywords: document.getElementById('seo-keywords').value
        },
        status: document.getElementById('content-status').value,
        visibility: document.getElementById('content-visibility').value,
        template: document.getElementById('content-template').value,
        lastModified: new Date().toISOString()
    };
}

// Validate content
function validateContent(content) {
    if (!content.title.trim()) {
        showNotification('Please add a title', 'error');
        return false;
    }

    if (!content.content.trim()) {
        showNotification('Please add some content', 'error');
        return false;
    }

    if (content.tags.length === 0) {
        showNotification('Please add at least one tag', 'error');
        return false;
    }

    return true;
}

// Initialize mobile menu
function initMobileMenu() {
    const menuBtn = document.createElement('button');
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('.header-content').appendChild(menuBtn);
    
    menuBtn.addEventListener('click', function() {
        const controls = document.querySelector('.write-controls');
        controls.classList.toggle('active');
    });
}

// Handle image controls
document.addEventListener('click', function(e) {
    if (e.target.closest('.image-control')) {
        const control = e.target.closest('.image-control');
        const action = control.dataset.action;
        const wrapper = control.closest('.image-wrapper');
        
        switch(action) {
            case 'align-left':
                wrapper.style.textAlign = 'left';
                break;
            case 'align-center':
                wrapper.style.textAlign = 'center';
                break;
            case 'align-right':
                wrapper.style.textAlign = 'right';
                break;
            case 'remove':
                wrapper.remove();
                if (window.NotificationManager) {
                    window.NotificationManager.show('Image removed', 'info');
                }
                break;
        }
    }
});

// Login functionality
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const adminLogin = document.getElementById('adminLogin');
    const adminPanel = document.getElementById('adminPanel');
    const logoutBtn = document.getElementById('logoutBtn');

    // Check if already logged in
    if (localStorage.getItem('adminToken')) {
        adminLogin.classList.add('hidden');
        adminPanel.classList.remove('hidden');
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // In production, this should be an API call
            if (username === 'admin' && password === 'admin123') {
                const token = btoa(username + ':' + Date.now());
                localStorage.setItem('adminToken', token);
                localStorage.setItem('adminUsername', username);
                
                adminLogin.classList.add('hidden');
                adminPanel.classList.remove('hidden');
                showNotification('Login successful!', 'success');
            } else {
                showNotification('Invalid credentials!', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Login failed. Please try again.', 'error');
        }
    });

    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        adminLogin.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        showNotification('Logged out successfully!', 'info');
    });
} 