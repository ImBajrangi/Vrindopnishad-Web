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
                    mediaContent = '<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">' +
                        '<iframe src="https://www.youtube.com/embed/' + videoId + '" ' +
                        'frameborder="0" ' +
                        'allowfullscreen ' +
                        'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" ' +
                        'loading="lazy">' +
                        '</iframe>' +
                    '</div>';
                } else {
                    throw new Error('Invalid YouTube URL');
                }
            } else if (this.isVimeoUrl(videoUrl)) {
                const vimeoId = this.extractVimeoId(videoUrl);
                if (vimeoId) {
                    mediaContent = '<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">' +
                        '<iframe src="https://player.vimeo.com/video/' + vimeoId + '" ' +
                        'frameborder="0" ' +
                        'allowfullscreen ' +
                        'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" ' +
                        'loading="lazy">' +
                        '</iframe>' +
                    '</div>';
                } else {
                    throw new Error('Invalid Vimeo URL');
                }
            } else {
                // Direct video file
                const videoExtension = this.getVideoExtension(videoUrl);
                mediaContent = '<video controls style="width: 100%; max-width: 100%;" preload="metadata">' +
                    '<source src="' + this.sanitizeUrl(videoUrl) + '" type="video/' + videoExtension + '">' +
                    '<p>Your browser does not support the video tag. <a href="' + this.sanitizeUrl(videoUrl) + '" target="_blank">Download video</a></p>' +
                '</video>';
            }

            if (videoCaption && videoCaption.trim()) {
                mediaContent += '<div class="media-caption" style="padding: 1rem; text-align: center; color: var(--text-secondary);">' + this.sanitizeText(videoCaption) + '</div>';
            }
            
            mediaElement.innerHTML = mediaContent + 
                '<div class="drag-handle" title="Drag to reorder">' +
                    '<i class="fas fa-grip-vertical"></i>' +
                '</div>' +
                '<button class="delete-btn" onclick="contentEditor.deleteItem(this)">' +
                    '<i class="fas fa-times"></i>' +
                '</button>';
            
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

    // Enhanced addAudio function with better validation
    addAudio() {
        try {
            const audioUrl = document.getElementById('audio-url').value;
            const audioTitle = document.getElementById('audio-title').value;
            
            this.validateMediaUrl(audioUrl, 'audio');
            
            const contentBody = document.getElementById('content-body');
            const mediaElement = document.createElement('div');
            mediaElement.className = 'media-item editable-item';
            
            const audioExtension = this.getAudioExtension(audioUrl);
            
            let mediaContent = '<audio controls preload="metadata" style="width: 100%;">' +
                '<source src="' + this.sanitizeUrl(audioUrl) + '" type="audio/' + audioExtension + '">' +
                '<p>Your browser does not support the audio element. <a href="' + this.sanitizeUrl(audioUrl) + '" target="_blank">Download audio</a></p>' +
            '</audio>';
            
            if (audioTitle && audioTitle.trim()) {
                mediaContent += '<div class="media-caption" style="padding: 1rem; text-align: center; color: var(--text-secondary);">' + this.sanitizeText(audioTitle) + '</div>';
            }
            
            mediaElement.innerHTML = mediaContent + 
                '<div class="drag-handle" title="Drag to reorder">' +
                    '<i class="fas fa-grip-vertical"></i>' +
                '</div>' +
                '<button class="delete-btn" onclick="contentEditor.deleteItem(this)">' +
                    '<i class="fas fa-times"></i>' +
                '</button>';
            
            contentBody.appendChild(mediaElement);
            this.closeModal();
            this.updateContentList();
            this.setupSortable();
            this.showNotification('Audio added successfully');
            
        } catch (error) {
            console.error('Audio processing error:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // Enhanced addImage function with validation
    addImage() {
        try {
            const imageUrl = document.getElementById('image-url').value;
            const imageAlt = document.getElementById('image-alt').value;
            const imageCaption = document.getElementById('image-caption').value;
            
            if (!imageUrl || !imageUrl.trim()) {
                throw new Error('Please enter an image URL or upload an image');
            }
            
            // Allow data URLs for uploaded images
            if (!imageUrl.startsWith('data:') && !this.isValidUrl(imageUrl)) {
                throw new Error('Please enter a valid image URL');
            }
            
            const contentBody = document.getElementById('content-body');
            const mediaElement = document.createElement('div');
            mediaElement.className = 'media-item editable-item';
            
            let mediaContent = '<img src="' + this.sanitizeUrl(imageUrl) + '" ' +
                                'alt="' + this.sanitizeText(imageAlt || 'Image') + '" ' +
                                'loading="lazy" ' +
                                'onerror="this.onerror=null; this.alt=\'Image failed to load: ' + this.sanitizeText(imageUrl) + '\'; this.style.border=\'2px dashed #ff6b6b\'; this.style.padding=\'1rem\';" />';
            
            if (imageCaption && imageCaption.trim()) {
                mediaContent += '<div class="media-caption">' + this.sanitizeText(imageCaption) + '</div>';
            }
            
            mediaElement.innerHTML = mediaContent + 
                '<div class="drag-handle" title="Drag to reorder">' +
                    '<i class="fas fa-grip-vertical"></i>' +
                '</div>' +
                '<button class="delete-btn" onclick="contentEditor.deleteItem(this)">' +
                    '<i class="fas fa-times"></i>' +
                '</button>';
            
            contentBody.appendChild(mediaElement);
            this.closeModal();
            this.updateContentList();
            this.setupSortable();
            this.showNotification('Image added successfully');
            
        } catch (error) {
            console.error('Image processing error:', error);
            this.showNotification(error.message, 'error');
        }
    }

    addTextContent() {
        const textContent = document.getElementById('text-content').value;
        const textAlign = document.getElementById('text-align').value;
        const textStyle = document.getElementById('text-style').value;
        const isLyrics = document.getElementById('is-lyrics').checked;
        
        if (!textContent.trim()) {
            this.showNotification('Please enter some text content', 'error');
            return;
        }
        
        const contentBody = document.getElementById('content-body');
        const textElement = document.createElement('p');
        textElement.className = 'editable-item';
        
        // Apply styling
        if (isLyrics) {
            textElement.classList.add('lyrics');
        }
        
        if (textAlign !== 'left') {
            textElement.setAttribute('data-align', textAlign);
        }
        
        if (textStyle !== 'default') {
            textElement.setAttribute('data-style', textStyle);
        }
        
        textElement.textContent = textContent;
        textElement.innerHTML += 
            '<div class="drag-handle" title="Drag to reorder">' +
                '<i class="fas fa-grip-vertical"></i>' +
            '</div>' +
            '<button class="delete-btn" onclick="contentEditor.deleteItem(this)">' +
                '<i class="fas fa-times"></i>' +
            '</button>';
        
        contentBody.appendChild(textElement);
        this.closeModal();
        this.updateContentList();
        this.setupSortable();
        this.showNotification('Text added successfully');
    }

    addHeading() {
        const headingLevel = document.getElementById('heading-level').value;
        const headingText = document.getElementById('heading-text').value;
        
        if (!headingText.trim()) {
            this.showNotification('Please enter heading text', 'error');
            return;
        }
        
        const contentBody = document.getElementById('content-body');
        const headingElement = document.createElement(headingLevel);
        headingElement.className = 'editable-item';
        headingElement.textContent = headingText;
        headingElement.innerHTML += 
            '<div class="drag-handle" title="Drag to reorder">' +
                '<i class="fas fa-grip-vertical"></i>' +
            '</div>' +
            '<button class="delete-btn" onclick="contentEditor.deleteItem(this)">' +
                '<i class="fas fa-times"></i>' +
            '</button>';
        
        contentBody.appendChild(headingElement);
        this.closeModal();
        this.updateContentList();
        this.setupSortable();
        this.showNotification('Heading added successfully');
    }

    addQuote() {
        const quoteText = document.getElementById('quote-text').value;
        const quoteAuthor = document.getElementById('quote-author').value;
        
        if (!quoteText.trim()) {
            this.showNotification('Please enter quote text', 'error');
            return;
        }
        
        const contentBody = document.getElementById('content-body');
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-block editable-item';
        
        let quoteContent = this.sanitizeText(quoteText);
        if (quoteAuthor && quoteAuthor.trim()) {
            quoteContent += '<br><br><strong>â€" ' + this.sanitizeText(quoteAuthor) + '</strong>';
        }
        
        quoteElement.innerHTML = quoteContent + 
            '<div class="drag-handle" title="Drag to reorder">' +
                '<i class="fas fa-grip-vertical"></i>' +
            '</div>' +
            '<button class="delete-btn" onclick="contentEditor.deleteItem(this)">' +
                '<i class="fas fa-times"></i>' +
            '</button>';
        
        contentBody.appendChild(quoteElement);
        this.closeModal();
        this.updateContentList();
        this.setupSortable();
        this.showNotification('Quote added successfully');
    }

    // Enhanced file handling with better error management
    handleFiles(files) {
        if (!files || files.length === 0) {
            this.showNotification('No files selected', 'error');
            return;
        }
        
        const maxFileSize = 10 * 1024 * 1024; // 10MB limit
        let processedCount = 0;
        let errorCount = 0;
        
        Array.from(files).forEach((file, index) => {
            try {
                // Validate file size
                if (file.size > maxFileSize) {
                    throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`);
                }
                
                // Validate file type
                if (!file.type.startsWith('image/') && 
                    !file.type.startsWith('video/') && 
                    !file.type.startsWith('audio/')) {
                    throw new Error(`File "${file.name}" is not a supported media type.`);
                }
                
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                        const contentBody = document.getElementById('content-body');
                        const mediaElement = document.createElement('div');
                        mediaElement.className = 'media-item editable-item';
                        
                        let mediaContent = '';
                        let mediaType = '';
                        
                        if (file.type.startsWith('image/')) {
                            mediaType = 'Image';
                            mediaContent = '<img src="' + e.target.result + '" ' +
                                            'alt="' + this.sanitizeText(file.name) + '" ' +
                                            'loading="lazy" />';
                        } else if (file.type.startsWith('video/')) {
                            mediaType = 'Video';
                            mediaContent = '<video controls preload="metadata" style="width: 100%;">' +
                                            '<source src="' + e.target.result + '" type="' + file.type + '">' +
                                            '<p>Your browser does not support the video tag.</p>' +
                                        '</video>';
                        } else if (file.type.startsWith('audio/')) {
                            mediaType = 'Audio';
                            mediaContent = '<audio controls preload="metadata" style="width: 100%;">' +
                                            '<source src="' + e.target.result + '" type="' + file.type + '">' +
                                            '<p>Your browser does not support the audio element.</p>' +
                                        '</audio>';
                        }
                        
                        mediaContent += '<div class="media-caption">' + this.sanitizeText(file.name) + '</div>';
                        
                        mediaElement.innerHTML = mediaContent + 
                            '<div class="drag-handle" title="Drag to reorder">' +
                                '<i class="fas fa-grip-vertical"></i>' +
                            '</div>' +
                            '<button class="delete-btn" onclick="contentEditor.deleteItem(this)">' +
                                '<i class="fas fa-times"></i>' +
                            '</button>';
                        
                        contentBody.appendChild(mediaElement);
                        processedCount++;
                        
                        // Update UI after each file
                        this.updateContentList();
                        this.setupSortable();
                        
                        // Show final notification when all files are processed
                        if (processedCount + errorCount === files.length) {
                            const successMsg = processedCount > 0 ? `${processedCount} file(s) added successfully` : '';
                            const errorMsg = errorCount > 0 ? `${errorCount} file(s) failed to process` : '';
                            const finalMsg = [successMsg, errorMsg].filter(Boolean).join(', ');
                            this.showNotification(finalMsg || 'File processing completed');
                        }
                        
                    } catch (fileError) {
                        console.error('File processing error:', fileError);
                        errorCount++;
                        this.showNotification(`Error processing ${file.name}: ${fileError.message}`, 'error');
                    }
                };
                
                reader.onerror = () => {
                    errorCount++;
                    this.showNotification(`Failed to read file: ${file.name}`, 'error');
                };
                
                // Read file based on type
                if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                    reader.readAsDataURL(file);
                } else {
                    throw new Error(`Unsupported file type: ${file.type}`);
                }
                
            } catch (error) {
                console.error('File validation error:', error);
                errorCount++;
                this.showNotification(error.message, 'error');
            }
        });
    }

    updateContentList() {
        const contentList = document.getElementById('content-list');
        const contentBody = document.getElementById('content-body');
        const items = Array.from(contentBody.children);
        
        contentList.innerHTML = '';
        
        items.forEach((item, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'content-list-item';
            listItem.dataset.index = index;
            
            let itemType = 'Text';
            let itemTitle = 'Content Item';
            
            if (item.tagName === 'H1' || item.tagName === 'H2' || item.tagName === 'H3') {
                itemType = 'Heading';
                itemTitle = item.textContent.substring(0, 50) + '...';
            } else if (item.classList.contains('media-item')) {
                itemType = 'Media';
                itemTitle = item.querySelector('.media-caption')?.textContent || 'Media Item';
            } else if (item.classList.contains('quote-block')) {
                itemType = 'Quote';
                itemTitle = item.textContent.substring(0, 50) + '...';
            } else if (item.tagName === 'P') {
                itemType = 'Text';
                itemTitle = item.textContent.substring(0, 50) + '...';
            }
            
            const isSelected = this.selectedItems.has(index);
            if (isSelected) {
                listItem.classList.add('selected');
                listItem.style.background = 'rgba(0, 212, 255, 0.2)';
            }
            
            listItem.innerHTML = 
                '<div class="item-info">' +
                    '<div class="item-title">' + itemTitle + '</div>' +
                    '<div class="item-type">' + itemType + '</div>' +
                '</div>' +
                '<div class="item-actions">' +
                    '<button class="item-action-btn" onclick="contentEditor.toggleItemSelection(' + index + ')" title="Select">' +
                        '<i class="fas fa-' + (isSelected ? 'check-square' : 'square') + '"></i>' +
                    '</button>' +
                    '<button class="item-action-btn" onclick="contentEditor.editItem(' + index + ')" title="Edit">' +
                        '<i class="fas fa-edit"></i>' +
                    '</button>' +
                    '<button class="item-action-btn" onclick="contentEditor.deleteItemByIndex(' + index + ')" title="Delete">' +
                        '<i class="fas fa-trash"></i>' +
                    '</button>' +
                '</div>';
            
            contentList.appendChild(listItem);
        });
    }

    toggleItemSelection(index) {
        if (this.selectedItems.has(index)) {
            this.selectedItems.delete(index);
        } else {
            this.selectedItems.add(index);
        }
        this.updateContentList();
    }

    selectAllItems() {
        const contentBody = document.getElementById('content-body');
        const items = Array.from(contentBody.children);
        this.selectedItems.clear();
        items.forEach((_, index) => this.selectedItems.add(index));
        this.updateContentList();
        this.showNotification(`Selected ${items.length} items`);
    }

    deselectAllItems() {
        this.selectedItems.clear();
        this.updateContentList();
        this.showNotification('Deselected all items');
    }

    duplicateSelected() {
        if (this.selectedItems.size === 0) {
            this.showNotification('No items selected', 'error');
            return;
        }

        const contentBody = document.getElementById('content-body');
        const items = Array.from(contentBody.children);
        const selectedIndices = Array.from(this.selectedItems).sort((a, b) => b - a);
        
        selectedIndices.forEach(index => {
            const originalItem = items[index];
            const duplicatedItem = originalItem.cloneNode(true);
            
            // Update IDs and references if needed
            const uniqueId = Date.now() + Math.random();
            if (duplicatedItem.id) {
                duplicatedItem.id = duplicatedItem.id + '_' + uniqueId;
            }
            
            contentBody.insertBefore(duplicatedItem, originalItem.nextSibling);
        });

        this.selectedItems.clear();
        this.updateContentList();
        this.setupSortable();
        this.showNotification(`Duplicated ${selectedIndices.length} items`);
    }

    deleteSelected() {
        if (this.selectedItems.size === 0) {
            this.showNotification('No items selected', 'error');
            return;
        }

        const contentBody = document.getElementById('content-body');
        const items = Array.from(contentBody.children);
        const selectedIndices = Array.from(this.selectedItems).sort((a, b) => b - a);
        
        selectedIndices.forEach(index => {
            items[index].classList.add('deleting');
            setTimeout(() => {
                if (items[index].parentNode) {
                    items[index].remove();
                }
            }, 500);
        });

        this.selectedItems.clear();
        setTimeout(() => {
            this.updateContentList();
            this.setupSortable();
        }, 600);
        
        this.showNotification(`Deleted ${selectedIndices.length} items`);
    }

    moveSelected(direction) {
        if (this.selectedItems.size === 0) {
            this.showNotification('No items selected', 'error');
            return;
        }

        const contentBody = document.getElementById('content-body');
        const items = Array.from(contentBody.children);
        const selectedIndices = Array.from(this.selectedItems);
        
        selectedIndices.forEach(index => {
            const item = items[index];
            
            switch(direction) {
                case 'up':
                    if (item.previousElementSibling) {
                        contentBody.insertBefore(item, item.previousElementSibling);
                    }
                    break;
                case 'down':
                    if (item.nextElementSibling) {
                        contentBody.insertBefore(item.nextElementSibling, item);
                    }
                    break;
                case 'top':
                    contentBody.insertBefore(item, contentBody.firstChild);
                    break;
                case 'bottom':
                    contentBody.appendChild(item);
                    break;
            }
        });

        this.selectedItems.clear();
        this.updateContentList();
        this.showNotification(`Moved items ${direction}`);
    }

    editItem(index) {
        const contentBody = document.getElementById('content-body');
        const items = Array.from(contentBody.children);
        const item = items[index];
        
        // Simple inline editing
        if (item.tagName === 'P' || item.tagName.match(/^H[1-6]$/)) {
            const currentText = item.textContent;
            const newText = prompt('Edit content:', currentText);
            if (newText !== null) {
                item.textContent = newText;
                this.updateContentList();
                this.showNotification('Content updated');
            }
        } else {
            this.showNotification('This item type cannot be edited inline', 'error');
        }
    }

    deleteItemByIndex(index) {
        const contentBody = document.getElementById('content-body');
        const items = Array.from(contentBody.children);
        const item = items[index];
        
        this.performDelete(item, 'Content item');
        setTimeout(() => {
            this.updateContentList();
        }, 600);
    }

    // Auto-recovery system
    initAutoRecovery() {
        // Check for unsaved changes on page load
        const savedContent = this.loadFromStorage('auto-save-backup');
        const lastSave = this.loadFromStorage('last-manual-save');
        
        if (savedContent && savedContent.timestamp) {
            const saveTime = new Date(savedContent.timestamp);
            const timeDiff = Date.now() - saveTime.getTime();
            
            // If auto-save is newer than manual save and less than 24 hours old
            if (timeDiff < 24 * 60 * 60 * 1000 && 
                (!lastSave || saveTime > new Date(lastSave))) {
                
                if (confirm('Unsaved changes detected. Would you like to recover your previous session?')) {
                    this.recoverContent(savedContent);
                }
            }
        }
        
        // Set up periodic auto-save
        setInterval(() => {
            if (this.isEditMode) {
                this.autoSave();
            }
        }, 30000); // Auto-save every 30 seconds
    }

    autoSave() {
        try {
            const content = {
                title: document.getElementById('display-title').textContent,
                author: document.getElementById('author-name').value,
                tags: document.getElementById('content-tags').value,
                body: document.getElementById('content-body').innerHTML,
                timestamp: new Date().toISOString(),
                isAutoSave: true
            };
            
            this.saveToStorage('auto-save-backup', content);
            
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    recoverContent(savedContent) {
        try {
            document.getElementById('display-title').textContent = savedContent.title || 'Recovered Content';
            document.getElementById('content-title').value = savedContent.title || '';
            document.getElementById('author-name').value = savedContent.author || '';
            document.getElementById('content-tags').value = savedContent.tags || '';
            document.getElementById('content-body').innerHTML = savedContent.body || '';
            
            this.updateContentList();
            this.setupSortable();
            this.showNotification('Content recovered successfully');
            
        } catch (error) {
            console.error('Recovery failed:', error);
            this.showNotification('Failed to recover content', 'error');
        }
    }

    // Enhanced save with validation
    saveContent() {
        try {
            const title = document.getElementById('display-title').textContent;
            const author = document.getElementById('author-name').value;
            const tags = document.getElementById('content-tags').value;
            const bodyElement = document.getElementById('content-body');
            
            if (!title || title.trim() === '' || title === 'Enhanced Content Management System') {
                throw new Error('Please set a title for your content');
            }
            
            if (!bodyElement.children.length) {
                throw new Error('Please add some content before saving');
            }
            
            const content = {
                title: title.trim(),
                author: author.trim(),
                tags: tags.trim(),
                body: bodyElement.innerHTML,
                timestamp: new Date().toISOString(),
                version: '1.0',
                itemCount: bodyElement.children.length
            };
            
            this.saveToStorage('saved-content', content);
            this.saveToStorage('auto-save-backup', content); // Create backup
            
            this.showNotification(`Content saved successfully (${content.itemCount} items)`);
            
        } catch (error) {
            console.error('Save error:', error);
            this.showNotification('Save failed: ' + error.message, 'error');
        }
    }

    // Enhanced preview with error handling
    previewContent() {
        try {
            const title = document.getElementById('display-title').textContent || 'Preview';
            const previewHTML = this.generatePreviewHTML();
            
            // Try to open preview window
            const previewWindow = window.open('', '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes');
            
            if (!previewWindow) {
                throw new Error('Popup blocked. Please allow popups for this site and try again.');
            }
            
            previewWindow.document.write(previewHTML);
            previewWindow.document.close();
            
            // Add error handling to preview window
            previewWindow.addEventListener('error', (e) => {
                console.error('Preview window error:', e);
            });
            
            this.showNotification('Preview opened in new window');
            
        } catch (error) {
            console.error('Preview error:', error);
            this.showNotification('Preview failed: ' + error.message, 'error');
            
            // Fallback: show preview in modal
            this.showPreviewModal();
        }
    }

    // Fallback preview modal
    showPreviewModal() {
        const modal = document.getElementById('content-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = 'Content Preview';
        modalBody.innerHTML = 
            '<div style="max-height: 60vh; overflow-y: auto; background: #111; padding: 2rem; border-radius: 0.5rem; border: 1px solid #333;">' +
                '<h1 style="color: #fff; margin-bottom: 2rem;">' + document.getElementById('display-title').textContent + '</h1>' +
                '<div>' + document.getElementById('content-body').innerHTML.replace(/<div class="drag-handle"[^>]*>[\s\S]*?<\/div>/g, '').replace(/<button class="delete-btn"[^>]*>[\s\S]*?<\/button>/g, '') + '</div>' +
            '</div>' +
            '<button class="btn-secondary" onclick="contentEditor.closeModal()" style="margin-top: 1rem;">' +
                '<i class="fas fa-times"></i>' +
                'Close Preview' +
            '</button>';
        
        modal.classList.add('active');
    }

    generatePreviewHTML() {
        const title = document.getElementById('display-title').textContent || 'Preview';
        const author = document.getElementById('author-name').value || '';
        const tags = document.getElementById('content-tags').value || '';
        const body = document.getElementById('content-body').innerHTML
            .replace(/<div class="drag-handle"[^>]*>[\s\S]*?<\/div>/g, '')
            .replace(/<button class="delete-btn"[^>]*>[\s\S]*?<\/button>/g, '');
        
        return '<!DOCTYPE html>' +
        '<html lang="en">' +
        '<head>' +
            '<meta charset="utf-8">' +
            '<title>' + this.sanitizeText(title) + ' - Preview</title>' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">' +
            '<style>' +
                'body { font-family: Inter, sans-serif; background: #000; color: #fff; line-height: 1.6; padding: 2rem; }' +
                '.container { max-width: 900px; margin: 0 auto; background: #1e1e1e; padding: 3rem; border-radius: 1rem; }' +
                'h1 { color: #00d4ff; font-size: 3rem; margin-bottom: 2rem; }' +
                'p { margin-bottom: 2rem; padding: 2rem; background: rgba(0,0,0,0.2); border-radius: 12px; }' +
                '.media-item { margin: 3rem 0; border-radius: 1rem; overflow: hidden; }' +
                'img, video { width: 100%; height: auto; }' +
                '.quote-block { background: rgba(0,212,255,0.1); border-left: 6px solid #00d4ff; padding: 2.5rem; margin: 3rem 0; font-style: italic; }' +
            '</style>' +
        '</head>' +
        '<body>' +
            '<div class="container">' +
                '<h1>' + this.sanitizeText(title) + '</h1>' +
                (author ? '<p><strong>Author:</strong> ' + this.sanitizeText(author) + '</p>' : '') +
                (tags ? '<p><strong>Tags:</strong> ' + this.sanitizeText(tags) + '</p>' : '') +
                '<div>' + body + '</div>' +
            '</div>' +
        '</body>' +
        '</html>';
    }

    // Enhanced export with better error handling and validation
    exportHTML() {
        try {
            const title = document.getElementById('display-title').textContent;
            const author = document.getElementById('author-name').value;
            const tags = document.getElementById('content-tags').value;
            
            if (!title || title.trim() === '' || title === 'Enhanced Content Management System') {
                throw new Error('Please set a title before exporting');
            }
            
            const bodyElement = document.getElementById('content-body');
            if (!bodyElement.children.length) {
                throw new Error('Please add some content before exporting');
            }
            
            const exportHTML = this.generateExportHTML();
            const filename = this.sanitizeFileName(title) + '.html';
            
            this.downloadFile(exportHTML, filename, 'text/html');
            this.showNotification('HTML exported successfully');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Export failed: ' + error.message, 'error');
        }
    }

    generateExportHTML() {
        const title = document.getElementById('display-title').textContent || 'Document';
        const author = document.getElementById('author-name').value || '';
        const tags = document.getElementById('content-tags').value || '';
        const body = document.getElementById('content-body').innerHTML
            .replace(/<div class="drag-handle"[^>]*>[\s\S]*?<\/div>/g, '')
            .replace(/<button class="delete-btn"[^>]*>[\s\S]*?<\/button>/g, '');
        
        return '<!DOCTYPE html>' +
        '<html lang="en">' +
        '<head>' +
            '<meta charset="utf-8">' +
            '<title>' + this.sanitizeText(title) + '</title>' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">' +
            '<meta name="description" content="' + this.sanitizeText(title) + '">' +
            (author ? '<meta name="author" content="' + this.sanitizeText(author) + '">' : '') +
            (tags ? '<meta name="keywords" content="' + this.sanitizeText(tags) + '">' : '') +
            '<style>' +
                'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: #000; color: #fff; line-height: 1.6; margin: 0; padding: 2rem; }' +
                '.document-container { max-width: 900px; margin: 0 auto; background: #1e1e1e; padding: 3rem; border-radius: 1rem; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }' +
                '.document-header { border-bottom: 2px solid #333; padding-bottom: 2rem; margin-bottom: 3rem; }' +
                '.document-title { color: #00d4ff; font-size: 3rem; font-weight: 700; margin: 0 0 1rem 0; }' +
                '.document-meta { color: #999; font-size: 1.1rem; }' +
                '.document-tags { margin-top: 1rem; }' +
                '.tag { background: rgba(0,212,255,0.2); color: #00d4ff; padding: 0.3rem 0.8rem; margin: 0 0.5rem 0.5rem 0; border-radius: 20px; font-size: 0.9rem; display: inline-block; }' +
                '.editable-item { margin: 2rem 0; }' +
                'h1, h2, h3, h4, h5, h6 { color: #00d4ff; font-weight: 600; margin: 2rem 0 1rem 0; }' +
                'h2 { font-size: 2.5rem; }' +
                'h3 { font-size: 2rem; }' +
                'h4 { font-size: 1.5rem; }' +
                'p { margin: 1.5rem 0; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 12px; line-height: 1.7; }' +
                '.lyrics { background: rgba(0,212,255,0.1); border-left: 4px solid #00d4ff; font-style: italic; }' +
                '.media-item { margin: 3rem 0; border-radius: 1rem; overflow: hidden; background: rgba(255,255,255,0.05); }' +
                'img, video, audio { width: 100%; max-width: 100%; height: auto; border-radius: 0.5rem; }' +
                '.media-caption { padding: 1rem; text-align: center; color: #ccc; font-style: italic; }' +
                '.quote-block { background: rgba(0,212,255,0.1); border-left: 6px solid #00d4ff; padding: 2.5rem; margin: 3rem 0; font-style: italic; font-size: 1.2rem; border-radius: 0.5rem; }' +
                '.video-container { position: relative; width: 100%; height: 0; padding-bottom: 56.25%; }' +
                '.video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 0.5rem; }' +
                '@media print { body { background: #fff; color: #000; } .document-container { background: #fff; box-shadow: none; } .document-title, h1, h2, h3, h4, h5, h6 { color: #000; } p { background: #f5f5f5; } }' +
            '</style>' +
        '</head>' +
        '<body>' +
            '<div class="document-container">' +
                '<div class="document-header">' +
                    '<h1 class="document-title">' + this.sanitizeText(title) + '</h1>' +
                    '<div class="document-meta">' +
                        (author ? '<div><strong>Author:</strong> ' + this.sanitizeText(author) + '</div>' : '') +
                        '<div><strong>Created:</strong> ' + new Date().toLocaleDateString() + '</div>' +
                    '</div>' +
                    (tags ? '<div class="document-tags">' + this.sanitizeText(tags).split(',').map(tag => '<span class="tag">' + tag.trim() + '</span>').join('') + '</div>' : '') +
                '</div>' +
                '<div class="document-content">' + body + '</div>' +
            '</div>' +
        '</body>' +
        '</html>';
    }

    // Enhanced file download with better error handling
    downloadFile(content, filename, mimeType) {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = filename;
            downloadLink.style.display = 'none';
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Clean up the URL object
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
        } catch (error) {
            console.error('File download error:', error);
            throw new Error('Failed to download file. Please try again.');
        }
    }

    // Enhanced delete functionality
    deleteItem(button) {
        const item = button.closest('.editable-item');
        if (!item) return;
        
        this.performDelete(item, 'Content item');
    }

    performDelete(element, itemType) {
        if (!element) return;
        
        element.classList.add('deleting');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.remove();
                this.updateContentList();
                this.showNotification(`${itemType} deleted`);
            }
        }, 500);
    }

    // Enhanced drag and drop setup
    setupDragAndDrop() {
        const contentBody = document.getElementById('content-body');
        
        if (!contentBody) return;
        
        // File drop handling
        contentBody.addEventListener('dragover', (e) => {
            e.preventDefault();
            contentBody.classList.add('drag-over');
        });
        
        contentBody.addEventListener('dragleave', (e) => {
            if (!contentBody.contains(e.relatedTarget)) {
                contentBody.classList.remove('drag-over');
            }
        });
        
        contentBody.addEventListener('drop', (e) => {
            e.preventDefault();
            contentBody.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFiles(files);
            }
        });
        
        // Setup sortable after initial setup
        setTimeout(() => this.setupSortable(), 100);
    }

    // Enhanced sortable setup with better error handling
    setupSortable() {
        try {
            const contentBody = document.getElementById('content-body');
            if (!contentBody) return;
            
            // Destroy existing sortable instance
            if (this.sortable) {
                this.sortable.destroy();
            }
            
            // Check if Sortable is available
            if (typeof Sortable === 'undefined') {
                console.warn('Sortable library not loaded');
                return;
            }
            
            this.sortable = Sortable.create(contentBody, {
                animation: 200,
                handle: '.drag-handle',
                ghostClass: 'ghost',
                chosenClass: 'chosen',
                dragClass: 'drag',
                
                onStart: () => {
                    document.body.classList.add('dragging');
                },
                
                onEnd: (evt) => {
                    document.body.classList.remove('dragging');
                    if (evt.oldIndex !== evt.newIndex) {
                        this.updateContentList();
                        this.showNotification('Items reordered');
                    }
                }
            });
            
        } catch (error) {
            console.error('Sortable setup error:', error);
        }
    }

    // Animation setup
    setupAnimations() {
        // Add CSS classes for animations if not already present
        if (!document.querySelector('#animation-styles')) {
            const style = document.createElement('style');
            style.id = 'animation-styles';
            style.textContent = `
                .editable-item {
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                
                .editable-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
                }
                
                .deleting {
                    animation: deleteItem 0.5s ease-in-out forwards;
                    pointer-events: none;
                }
                
                @keyframes deleteItem {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8) rotate(5deg); }
                    100% { opacity: 0; transform: scale(0.3) rotate(10deg); height: 0; margin: 0; padding: 0; }
                }
                
                .ghost {
                    opacity: 0.5;
                    transform: rotate(5deg);
                }
                
                .chosen {
                    box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
                }
                
                .drag {
                    transform: rotate(5deg);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }
                
                .drag-over {
                    background: rgba(0, 212, 255, 0.1);
                    border: 2px dashed #00d4ff;
                }
                
                .notification {
                    animation: slideInRight 0.3s ease-out;
                }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Enhanced notification system
    showNotification(message, type = 'success', duration = 3000) {
        const container = document.getElementById('notification-container') || this.createNotificationContainer();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info';
        
        notification.innerHTML = 
            '<i class="fas fa-' + icon + '"></i>' +
            '<span>' + message + '</span>' +
            '<button class="close-notification" onclick="this.parentElement.remove()">' +
                '<i class="fas fa-times"></i>' +
            '</button>';
        
        container.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
        
        // Limit number of notifications
        const notifications = container.children;
        if (notifications.length > 5) {
            notifications[0].remove();
        }
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }

    // Font size cycling
    cycleFontSize() {
        const sizes = ['small', 'medium', 'large'];
        const currentIndex = sizes.indexOf(this.fontSize);
        const nextIndex = (currentIndex + 1) % sizes.length;
        
        // Remove old class
        document.body.classList.remove(`font-size-${this.fontSize}`);
        
        // Set new size
        this.fontSize = sizes[nextIndex];
        document.body.classList.add(`font-size-${this.fontSize}`);
        
        // Update button state
        const fontSizeBtn = document.getElementById('font-size');
        fontSizeBtn.className = fontSizeBtn.className.replace(/size-\w+/, `size-${this.fontSize}`);
        
        // Save preference
        this.saveToStorage('preferred-font-size', this.fontSize);
        
        this.showNotification(`Font size: ${this.fontSize}`);
    }

    // Fullscreen toggle
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                this.showNotification('Failed to enter fullscreen', 'error');
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Edit mode toggle
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        document.body.classList.toggle('edit-mode', this.isEditMode);
        
        const modeBtn = document.getElementById('mode-toggle');
        const editorControls = document.getElementById('editor-controls');
        
        if (this.isEditMode) {
            modeBtn.innerHTML = '<i class="fas fa-eye"></i> View Mode';
            editorControls.style.display = 'flex';
            this.showNotification('Edit mode enabled');
        } else {
            modeBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Mode';
            editorControls.style.display = 'none';
            this.showNotification('View mode enabled');
        }
    }

    // Reset order functionality
    resetOrder() {
        if (this.originalOrder.length === 0) {
            this.showNotification('No original order to restore', 'error');
            return;
        }
        
        const contentBody = document.getElementById('content-body');
        contentBody.innerHTML = '';
        
        this.originalOrder.forEach(item => {
            contentBody.appendChild(item.element.cloneNode(true));
        });
        
        this.updateContentList();
        this.setupSortable();
        this.showNotification('Order reset to original');
    }

    // Quick add functionality
    showQuickAdd() {
        const fabMenu = document.createElement('div');
        fabMenu.className = 'fab-menu';
        fabMenu.innerHTML = 
            '<button class="quick-add-btn" onclick="contentEditor.openContentModal(\'text\')">' +
                '<i class="fas fa-font"></i>' +
                '<span>Text</span>' +
            '</button>' +
            '<button class="quick-add-btn" onclick="contentEditor.openContentModal(\'heading\')">' +
                '<i class="fas fa-heading"></i>' +
                '<span>Heading</span>' +
            '</button>' +
            '<button class="quick-add-btn" onclick="contentEditor.openContentModal(\'image\')">' +
                '<i class="fas fa-image"></i>' +
                '<span>Image</span>' +
            '</button>' +
            '<button class="quick-add-btn" onclick="contentEditor.openContentModal(\'video\')">' +
                '<i class="fas fa-video"></i>' +
                '<span>Video</span>' +
            '</button>';
        
        document.body.appendChild(fabMenu);
        
        // Position near FAB
        const fab = document.getElementById('add-content-fab');
        const rect = fab.getBoundingClientRect();
        fabMenu.style.position = 'fixed';
        fabMenu.style.right = '6rem';
        fabMenu.style.bottom = '2rem';
        fabMenu.style.zIndex = '1001';
        
        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!fabMenu.contains(e.target) && e.target !== fab) {
                fabMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => document.addEventListener('click', closeMenu), 100);
    }

    // Keyboard shortcuts handler
    handleKeyboardShortcuts(e) {
        if (!this.isEditMode) return;
        
        // Ctrl/Cmd + shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    this.saveContent();
                    break;
                case 'p':
                    e.preventDefault();
                    this.previewContent();
                    break;
                case 'a':
                    e.preventDefault();
                    this.selectAllItems();
                    break;
                case 'd':
                    e.preventDefault();
                    this.duplicateSelected();
                    break;
            }
        }
        
        // Delete key for selected items
        if (e.key === 'Delete' && this.selectedItems.size > 0) {
            e.preventDefault();
            this.deleteSelected();
        }
        
        // Escape key to close modal
        if (e.key === 'Escape') {
            this.closeModal();
        }
    }

    // Export content in different formats
    exportContent(format) {
        try {
            switch(format) {
                case 'pdf':
                    this.exportPDF();
                    break;
                case 'json':
                    this.exportJSON();
                    break;
                case 'markdown':
                    this.exportMarkdown();
                    break;
                default:
                    this.exportHTML();
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification(`Failed to export as ${format}`, 'error');
        }
    }

    exportPDF() {
        // Since we don't have access to PDF libraries, we'll open print dialog
        const previewHTML = this.generatePreviewHTML();
        const printWindow = window.open('', '_blank');
        
        if (!printWindow) {
            this.showNotification('Please allow popups to export PDF', 'error');
            return;
        }
        
        printWindow.document.write(previewHTML);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            this.showNotification('Use browser print dialog to save as PDF');
        }, 500);
    }

    exportJSON() {
        const title = document.getElementById('display-title').textContent;
        const author = document.getElementById('author-name').value;
        const tags = document.getElementById('content-tags').value;
        const bodyElement = document.getElementById('content-body');
        
        const exportData = {
            title: title,
            author: author,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            content: Array.from(bodyElement.children).map((item, index) => ({
                type: item.tagName.toLowerCase(),
                classes: Array.from(item.classList),
                content: item.textContent || item.innerHTML,
                order: index
            })),
            metadata: {
                created: new Date().toISOString(),
                itemCount: bodyElement.children.length,
                version: '1.0'
            }
        };
        
        const filename = this.sanitizeFileName(title) + '.json';
        this.downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json');
        this.showNotification('JSON exported successfully');
    }

    exportMarkdown() {
        const title = document.getElementById('display-title').textContent;
        const author = document.getElementById('author-name').value;
        const tags = document.getElementById('content-tags').value;
        const bodyElement = document.getElementById('content-body');
        
        let markdown = '# ' + title + '\n\n';
        
        if (author) {
            markdown += '**Author:** ' + author + '\n\n';
        }
        
        if (tags) {
            markdown += '**Tags:** ' + tags + '\n\n';
        }
        
        markdown += '---\n\n';
        
        Array.from(bodyElement.children).forEach(item => {
            if (item.tagName.match(/^H[2-6]$/)) {
                const level = '#'.repeat(parseInt(item.tagName.charAt(1)));
                markdown += level + ' ' + item.textContent + '\n\n';
            } else if (item.tagName === 'P') {
                markdown += item.textContent + '\n\n';
            } else if (item.classList.contains('quote-block')) {
                markdown += '> ' + item.textContent + '\n\n';
            } else if (item.classList.contains('media-item')) {
                const img = item.querySelector('img');
                const video = item.querySelector('video');
                const audio = item.querySelector('audio');
                const caption = item.querySelector('.media-caption');
                
                if (img) {
                    markdown += '![' + (img.alt || 'Image') + '](' + img.src + ')';
                } else if (video || audio) {
                    markdown += '[Media file]';
                }
                
                if (caption) {
                    markdown += '\n*' + caption.textContent + '*';
                }
                
                markdown += '\n\n';
            }
        });
        
        const filename = this.sanitizeFileName(title) + '.md';
        this.downloadFile(markdown, filename, 'text/markdown');
        this.showNotification('Markdown exported successfully');
    }
}

// Initialize the content editor
let contentEditor;
document.addEventListener('DOMContentLoaded', () => {
    contentEditor = new ContentEditor();
});