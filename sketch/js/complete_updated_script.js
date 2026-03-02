class ContentEditor {
constructor() {
    this.isEditMode = false;
    this.fontSize = 'medium';
    this.contentItems = [];
    this.originalOrder = [];
    this.selectedItems = new Set();
    this.sortable = null;
    this.contentCounter = 0;
    this.performanceMetrics = null;
    
    this.init();
}

// Enhanced init function
init() {
    this.setupEventListeners();
    this.setupDragAndDrop();
    this.setupAnimations();
    this.updateContentList();
    this.initAutoRecovery(); // Add auto-recovery
    this.initializeErrorBoundaries(); // Add error boundaries
    
    // Restore saved font size preference
    const savedFontSize = this.loadFromStorage('preferred-font-size', 'medium');
    this.fontSize = savedFontSize;
    document.body.classList.add(`font-size-${this.fontSize}`);
    const fontSizeBtn = document.getElementById('font-size');
    fontSizeBtn.classList.add(`size-${this.fontSize}`);

    // Store original order
    this.storeOriginalOrder();
    
    // Initialize performance monitoring
    this.initPerformanceMonitoring();
}

// Enhanced storage methods with fallbacks
saveToStorage(key, value) {
    try {
        if (typeof Storage !== "undefined") {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            // Fallback to memory storage
            if (!window.memoryStorage) window.memoryStorage = {};
            window.memoryStorage[key] = value;
        }
    } catch (e) {
        // Fallback to memory storage
        if (!window.memoryStorage) window.memoryStorage = {};
        window.memoryStorage[key] = value;
    }
}

loadFromStorage(key, defaultValue = null) {
    try {
        if (typeof Storage !== "undefined") {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } else {
            // Fallback to memory storage
            return window.memoryStorage?.[key] || defaultValue;
        }
    } catch (e) {
        // Fallback to memory storage
        return window.memoryStorage?.[key] || defaultValue;
    }
}

// Enhanced error boundaries
initializeErrorBoundaries() {
    // Global error handler
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        this.handleGlobalError(e.error, e.filename, e.lineno);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        this.handlePromiseRejection(e.reason);
    });
    
    // Custom error boundary for critical operations
    this.wrapCriticalFunctions();
}

handleGlobalError(error, filename, lineno) {
    const errorInfo = {
        message: error?.message || 'Unknown error',
        filename: filename || 'Unknown file',
        line: lineno || 'Unknown line',
        timestamp: new Date().toISOString()
    };
    
    // Save error for debugging
    this.saveToStorage('last-error', errorInfo);
    
    // Show user-friendly message
    this.showNotification('Something went wrong. The error has been logged.', 'error');
    
    // Attempt recovery if possible
    this.attemptRecovery();
}

handlePromiseRejection(reason) {
    const errorMsg = reason?.message || reason?.toString() || 'Unknown promise rejection';
    
    // Handle specific error types
    if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        this.showNotification('Network error. Please check your connection and try again.', 'error');
    } else if (errorMsg.includes('quota') || errorMsg.includes('storage')) {
        this.showNotification('Storage quota exceeded. Please clear some data and try again.', 'error');
    } else {
        this.showNotification('An unexpected error occurred. Please try again.', 'error');
    }
}

attemptRecovery() {
    try {
        // Try to restore last known good state
        const lastGoodState = this.loadFromStorage('auto-save-backup');
        if (lastGoodState) {
            // Only auto-recover if the error seems serious and recent save exists
            console.log('Recovery state available, but requiring user confirmation');
        }
        
        // Reset any problematic UI state
        this.closeModal();
        this.deselectAllItems();
        
        // Re-initialize critical components
        setTimeout(() => {
            this.setupSortable();
            this.updateContentList();
        }, 1000);
        
    } catch (recoveryError) {
        console.error('Recovery failed:', recoveryError);
    }
}

// Wrap critical functions with error handling
wrapCriticalFunctions() {
    const criticalMethods = ['exportHTML', 'saveContent', 'addVideo', 'addImage', 'addAudio'];
    
    criticalMethods.forEach(methodName => {
        if (this[methodName]) {
            const originalMethod = this[methodName].bind(this);
            this[methodName] = (...args) => {
                try {
                    return originalMethod(...args);
                } catch (error) {
                    console.error(`Error in ${methodName}:`, error);
                    this.showNotification(`Failed to ${methodName.replace(/([A-Z])/g, ' $1').toLowerCase()}. Please try again.`, 'error');
                    return null;
                }
            };
        }
    });
}

// Performance monitoring
initPerformanceMonitoring() {
    this.performanceMetrics = {
        startTime: performance.now(),
        operationTimes: {},
        
        startOperation: function(name) {
            this.operationTimes[name] = performance.now();
        },
        
        endOperation: function(name) {
            if (this.operationTimes[name]) {
                const duration = performance.now() - this.operationTimes[name];
                console.log(`${name} completed in ${duration.toFixed(2)}ms`);
                delete this.operationTimes[name];
                return duration;
            }
            return 0;
        }
    };
}

storeOriginalOrder() {
    const contentBody = document.getElementById('content-body');
    this.originalOrder = Array.from(contentBody.children).map((item, index) => ({
        element: item.cloneNode(true),
        index: index
    }));
}

setupEventListeners() {
    // Header controls
    document.getElementById('font-size').addEventListener('click', () => this.cycleFontSize());
    document.getElementById('fullscreen').addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('mode-toggle').addEventListener('click', () => this.toggleEditMode());

    // Editor controls
    document.getElementById('save-content').addEventListener('click', () => this.saveContent());
    document.getElementById('preview-content').addEventListener('click', () => this.previewContent());
    document.getElementById('export-html').addEventListener('click', () => this.exportHTML());
    document.getElementById('export-pdf').addEventListener('click', () => this.exportContent('pdf'));
    document.getElementById('reset-order').addEventListener('click', () => this.resetOrder());

    // Content management
    document.getElementById('select-all').addEventListener('click', () => this.selectAllItems());
    document.getElementById('deselect-all').addEventListener('click', () => this.deselectAllItems());
    document.getElementById('duplicate-selected').addEventListener('click', () => this.duplicateSelected());
    document.getElementById('delete-selected').addEventListener('click', () => this.deleteSelected());

    // Reorder controls
    document.getElementById('move-up').addEventListener('click', () => this.moveSelected('up'));
    document.getElementById('move-down').addEventListener('click', () => this.moveSelected('down'));
    document.getElementById('move-to-top').addEventListener('click', () => this.moveSelected('top'));
    document.getElementById('move-to-bottom').addEventListener('click', () => this.moveSelected('bottom'));

    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.type;
            this.openContentModal(type);
        });
    });

    // Modal controls
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('content-modal').addEventListener('click', (e) => {
        if (e.target.id === 'content-modal') this.closeModal();
    });

    // FAB
    document.getElementById('add-content-fab').addEventListener('click', () => this.showQuickAdd());

    // Input listeners
    document.getElementById('content-title').addEventListener('input', (e) => {
        document.getElementById('display-title').textContent = e.target.value || 'Untitled';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
}

// Enhanced modal system with better error handling
openContentModal(type) {
    try {
        this.performanceMetrics.startOperation('openModal');
        
        const modal = document.getElementById('content-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) {
            throw new Error('Modal elements not found');
        }
        
        modalTitle.textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        const modalContent = this.generateModalContent(type);
        modalBody.innerHTML = modalContent;
        
        // Setup type-specific event listeners
        this.setupModalEventListeners(type);
        
        modal.classList.add('active');
        
        // Focus management for accessibility
        const firstInput = modalBody.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        this.performanceMetrics.endOperation('openModal');
        
    } catch (error) {
        console.error('Modal opening error:', error);
        this.showNotification('Failed to open content editor. Please try again.', 'error');
    }
}

generateModalContent(type) {
    const templates = {
        text: () => `
            <div class="text-formatting-toolbar">
                <div class="text-style-buttons">
                    <button type="button" class="style-btn" data-style="bold" title="Bold">
                        <i class="fas fa-bold"></i>
                    </button>
                    <button type="button" class="style-btn" data-style="italic" title="Italic">
                        <i class="fas fa-italic"></i>
                    </button>
                    <button type="button" class="style-btn" data-style="underline" title="Underline">
                        <i class="fas fa-underline"></i>
                    </button>
                </div>
                <select class="form-select" id="text-align" style="width: auto;">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                </select>
                <select class="form-select" id="text-style" style="width: auto;">
                    <option value="default">Default</option>
                    <option value="flat">Flat</option>
                    <option value="elevated">Elevated</option>
                    <option value="bordered">Bordered</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Text Content</label>
                <textarea class="form-textarea" id="text-content" placeholder="Enter your text here..." rows="8" required></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">
                    <input type="checkbox" id="is-lyrics" style="margin-right: 0.5rem;">
                    Format as lyrics/poetry
                </label>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn-primary" onclick="contentEditor.addTextContent()">
                    <i class="fas fa-plus"></i>
                    Add Text
                </button>
                <button type="button" class="btn-secondary" onclick="contentEditor.closeModal()">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
            </div>
        `,
        
        heading: () => `
            <div class="form-group">
                <label class="form-label">Heading Level</label>
                <select class="form-select" id="heading-level" required>
                    <option value="h2">Heading 2 (Large)</option>
                    <option value="h3">Heading 3 (Medium)</option>
                    <option value="h4">Heading 4 (Small)</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Heading Text</label>
                <input type="text" class="form-input" id="heading-text" placeholder="Enter heading text..." required>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn-primary" onclick="contentEditor.addHeading()">
                    <i class="fas fa-plus"></i>
                    Add Heading
                </button>
                <button type="button" class="btn-secondary" onclick="contentEditor.closeModal()">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
            </div>
        `,
        
        image: () => `
            <div class="form-group">
                <label class="form-label">Image Source</label>
                <input type="url" class="form-input" id="image-url" placeholder="https://example.com/image.jpg">
            </div>
            <div class="form-group">
                <label class="form-label">Alternative Text</label>
                <input type="text" class="form-input" id="image-alt" placeholder="Describe the image for accessibility...">
            </div>
            <div class="form-group">
                <label class="form-label">Caption (Optional)</label>
                <input type="text" class="form-input" id="image-caption" placeholder="Image caption...">
            </div>
            <div class="file-upload-area" onclick="document.getElementById('image-file').click()">
                <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                <p>Click to upload or drag image here</p>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Supported: JPG, PNG, GIF, WebP (Max 10MB)</p>
                <input type="file" id="image-file" accept="image/*" style="display: none;">
            </div>
            <div class="modal-actions">
                <button type="button" class="btn-primary" onclick="contentEditor.addImage()">
                    <i class="fas fa-plus"></i>
                    Add Image
                </button>
                <button type="button" class="btn-secondary" onclick="contentEditor.closeModal()">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
            </div>
        `,
        
        video: () => `
            <div class="form-group">
                <label class="form-label">Video URL</label>
                <input type="url" class="form-input" id="video-url" placeholder="YouTube, Vimeo, or direct video URL..." required>
                <small style="color: var(--text-muted);">Supports: YouTube, Vimeo, MP4, WebM, OGG</small>
            </div>
            <div class="form-group">
                <label class="form-label">Caption (Optional)</label>
                <input type="text" class="form-input" id="video-caption" placeholder="Video caption...">
            </div>
            <div class="modal-actions">
                <button type="button" class="btn-primary" onclick="contentEditor.addVideo()">
                    <i class="fas fa-plus"></i>
                    Add Video
                </button>
                <button type="button" class="btn-secondary" onclick="contentEditor.closeModal()">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
            </div>
        `,
        
        audio: () => `
            <div class="form-group">
                <label class="form-label">Audio URL</label>
                <input type="url" class="form-input" id="audio-url" placeholder="Direct audio file URL..." required>
                <small style="color: var(--text-muted);">Supports: MP3, WAV, OGG, M4A</small>
            </div>
            <div class="form-group">
                <label class="form-label">Title (Optional)</label>
                <input type="text" class="form-input" id="audio-title" placeholder="Audio title...">
            </div>
            <div class="modal-actions">
                <button type="button" class="btn-primary" onclick="contentEditor.addAudio()">
                    <i class="fas fa-plus"></i>
                    Add Audio
                </button>
                <button type="button" class="btn-secondary" onclick="contentEditor.closeModal()">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
            </div>
        `,
        
        quote: () => `
            <div class="form-group">
                <label class="form-label">Quote Text</label>
                <textarea class="form-textarea" id="quote-text" placeholder="Enter quote here..." rows="4" required></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Author (Optional)</label>
                <input type="text" class="form-input" id="quote-author" placeholder="Quote author...">
            </div>
            <div class="modal-actions">
                <button type="button" class="btn-primary" onclick="contentEditor.addQuote()">
                    <i class="fas fa-plus"></i>
                    Add Quote
                </button>
                <button type="button" class="btn-secondary" onclick="contentEditor.closeModal()">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
            </div>
        `
    };
    
    const template = templates[type];
    if (!template) {
        throw new Error(`Unknown content type: ${type}`);
    }
    
    return template();
}

setupModalEventListeners(type) {
    try {
        // Common modal event listeners
        const modal = document.getElementById('content-modal');
        
        // Escape key handler
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        };
        
        document.addEventListener('keydown', escapeHandler);
        
        // Store handler for cleanup
        modal._escapeHandler = escapeHandler;
        
        // Type-specific setup
        if (type === 'image') {
            this.setupImageModalListeners();
        } else if (type === 'video') {
            this.setupVideoModalListeners();
        }
        
        // Form validation
        this.setupFormValidation(type);
        
    } catch (error) {
        console.error('Error setting up modal listeners:', error);
    }
}

setupImageModalListeners() {
    const fileInput = document.getElementById('image-file');
    const urlInput = document.getElementById('image-url');
    const uploadArea = document.querySelector('.file-upload-area');
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) {
                    this.showNotification('Image file too large. Maximum size is 10MB.', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    urlInput.value = e.target.result;
                    uploadArea.style.borderColor = 'var(--success-color)';
                    uploadArea.querySelector('p').textContent = `File selected: ${file.name}`;
                };
                reader.onerror = () => {
                    this.showNotification('Failed to read file', 'error');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

setupVideoModalListeners() {
    const urlInput = document.getElementById('video-url');
    
    if (urlInput) {
        urlInput.addEventListener('blur', () => {
            const url = urlInput.value.trim();
            if (url) {
                try {
                    this.validateMediaUrl(url, 'video');
                    urlInput.style.borderColor = 'var(--success-color)';
                } catch (error) {
                    urlInput.style.borderColor = 'var(--danger-color)';
                    this.showNotification(error.message, 'error');
                }
            }
        });
    }
}

setupFormValidation(type) {
    const requiredFields = document.querySelectorAll('#content-modal [required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('invalid', (e) => {
            e.preventDefault();
            const fieldName = field.placeholder || field.id || 'This field';
            this.showNotification(`${fieldName} is required`, 'error');
            field.focus();
        });
        
        field.addEventListener('input', () => {
            if (field.validity.valid) {
                field.style.borderColor = 'var(--success-color)';
            } else {
                field.style.borderColor = 'var(--danger-color)';
            }
        });
    });
}

closeModal() {
    try {
        const modal = document.getElementById('content-modal');
        modal.classList.remove('active');
        
        // Cleanup event listeners
        if (modal._escapeHandler) {
            document.removeEventListener('keydown', modal._escapeHandler);
            delete modal._escapeHandler;
        }
        
        // Reset form styles
        const formFields = modal.querySelectorAll('.form-input, .form-textarea, .form-select');
        formFields.forEach(field => {
            field.style.borderColor = '';
        });
        
    } catch (error) {
        console.error('Error closing modal:', error);
    }
}

// Enhanced URL validation and processing helpers
isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

isYouTubeUrl(url) {
    return /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/.test(url);
}

isVimeoUrl(url) {
    return /(?:vimeo\.com\/)([0-9]+)/.test(url);
}

extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

extractVimeoId(url) {
    const regExp = /(?:vimeo\.com\/)([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

getVideoExtension(url) {
    const extension = url.split('.').pop().split(/\#|\?/)[0].toLowerCase();
    const validExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
    return validExtensions.includes(extension) ? extension : 'mp4';
}

isDirectVideoUrl(url) {
    const videoExtensions = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?|$)/i;
    return videoExtensions.test(url);
}

isDirectAudioUrl(url) {
    const audioExtensions = /\.(mp3|wav|ogg|m4a|aac|flac|wma)(\?|$)/i;
    return audioExtensions.test(url);
}

getAudioExtension(url) {
    const extension = url.split('.').pop().split(/\#|\?/)[0].toLowerCase();
    const validExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];
    return validExtensions.includes(extension) ? extension : 'mp3';
}

sanitizeUrl(url) {
    return url.replace(/[<>"']/g, '');
}

sanitizeText(text) {
    return text.replace(/[<>&"']/g, function(match) {
        const escape = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return escape[match];
    });
}

sanitizeFileName(filename) {
    return filename
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
        .replace(/\s+/g, '_')
        .toLowerCase()
        .substring(0, 100);
}

// Comprehensive media validation
validateMediaUrl(url, type) {
    if (!url || !url.trim()) {
        throw new Error(`${type} URL is required`);
    }
    
    if (!this.isValidUrl(url)) {
        throw new Error(`Invalid ${type} URL format`);
    }
    
    // Check for supported formats
    if (type === 'video') {
        const isSupported = this.isYouTubeUrl(url) || 
                            this.isVimeoUrl(url) || 
                            this.isDirectVideoUrl(url);
        if (!isSupported) {
            throw new Error('Unsupported video format. Please use YouTube, Vimeo, or direct video file URLs (.mp4, .webm, .ogg)');
        }
    }
    
    if (type === 'audio') {
        if (!this.isDirectAudioUrl(url)) {
            throw new Error('Please use direct audio file URLs (.mp3, .wav, .ogg, .m4a)');
        }
    }
    
    return true;
}

// Enhanced addVideo function
addVideo() {
    const videoUrl = document.getElementById('video-url').value;
    const videoCaption = document.getElementById('video-caption').value;
    
    if (!videoUrl.trim()) {
        this.showNotification('Please enter a video URL', 'error');
        return;
    }
    
    // Enhanced URL validation
    if (!this.isValidUrl(videoUrl)) {
        this.showNotification('Please enter a valid video URL', 'error');
        return;
    }
    
    const contentBody = document.getElementById('content-body');
    const mediaElement = document.createElement('div');
    mediaElement.className = 'media-item editable-item';
    
    let mediaContent;
    
    try {
        if (this.isYouTubeUrl(videoUrl)) {
            const videoId = this.extractYouTubeId(videoUrl);
            if (videoId) {
                mediaContent = `<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                    <iframe src="https://www.youtube.com/embed/${videoId}" 
                            frameborder="0" 
                            allowfullscreen 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                            loading="lazy">
                    </iframe>
                </div>`;
            } else {
                throw new Error('Invalid YouTube URL');
            }
        } else if (this.isVimeoUrl(videoUrl)) {
            const vimeoId = this.extractVimeoId(videoUrl);
            if (vimeoId) {
                mediaContent = `<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                    <iframe src="https://player.vimeo.com/video/${vimeoId}" 
                            frameborder="0" 
                            allowfullscreen 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                            loading="lazy">
                    </iframe>
                </div>`;
            } else {
                throw new Error('Invalid Vimeo URL');
            }
        } else {
            // Direct video file
            const videoExtension = this.getVideoExtension(videoUrl);
            mediaContent = `<video controls style="width: 100%; max-width: 100%;" preload="metadata">
    <source src="${this.sanitizeUrl(videoUrl)}" type="video/${videoExtension}">
    <p>Your browser does not support the video tag. <a href="${this.sanitizeUrl(videoUrl)}" target="_blank">Download video</a></p>
</video>`;
}

if (videoCaption && videoCaption.trim()) {
mediaContent += `<div class="media-caption" style="padding: 1rem; text-align: center; color: var(--text-secondary);">${this.sanitizeText(videoCaption)}</div>`;
}

mediaElement.innerHTML = mediaContent + `
<div class="drag-handle" title="Drag to reorder">
    <i class="fas fa-grip-vertical"></i>
</div>
<button class="delete-btn" onclick="contentEditor.deleteItem(this)">
    <i class="fas fa-times"></i>
</button>
`;

contentBody.appendChild(mediaElement);
this.closeModal();
this.updateContentList();
this.setupSortable();
this.showNotification('Video added successfully');

} catch (error) {
console.error('Video processing error:', error);
this.showNotification('Error processing video URL. Please check the URL and try again.', 'error');
}
}
}