/**
 * Enhanced Dark CMS - Content Editor Implementation
 * Version: 2.0.0
 * This file contains the main ContentEditor class that handles all CMS functionality
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the editor
    window.contentEditor = new ContentEditor();
});

class ContentEditor {
            constructor() {
                this.isEditMode = false;
                this.fontSize = 'medium';
                this.contentItems = [];
                
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.setupDragAndDrop();
                this.setupAnimations();

                // Restore saved font size preference
                const savedFontSize = localStorage.getItem('preferred-font-size');
                if (savedFontSize) {
                    this.fontSize = savedFontSize;
                    document.body.classList.add(`font-size-${this.fontSize}`);
                    const fontSizeBtn = document.getElementById('font-size');
                    fontSizeBtn.classList.add(`size-${this.fontSize}`);
                } else {
                    // Set default size
                    document.body.classList.add('font-size-medium');
                }
            }

            setupEventListeners() {
                // Header controls
                document.getElementById('font-size').addEventListener('click', () => this.cycleFontSize());
                document.getElementById('fullscreen').addEventListener('click', () => this.toggleFullscreen());
                document.getElementById('mode-toggle').addEventListener('click', () => this.toggleEditMode());

                // Editor controls
                document.getElementById('save-content').addEventListener('click', () => this.saveContent());
                document.getElementById('preview-content').addEventListener('click', () => this.previewContent());
                document.getElementById('export-content').addEventListener('click', () => this.exportContent());

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

            setupDragAndDrop() {
                const contentBody = document.getElementById('content-body');
                
                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    contentBody.addEventListener(eventName, this.preventDefaults, false);
                });

                ['dragenter', 'dragover'].forEach(eventName => {
                    contentBody.addEventListener(eventName, () => {
                        contentBody.classList.add('dragover');
                    }, false);
                });

                ['dragleave', 'drop'].forEach(eventName => {
                    contentBody.addEventListener(eventName, () => {
                        contentBody.classList.remove('dragover');
                    }, false);
                });

                contentBody.addEventListener('drop', (e) => this.handleDrop(e), false);
            }

            preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }

            handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;

                [...files].forEach(file => this.handleFile(file));
            }

            handleFile(file) {
                const fileType = file.type.split('/')[0];
                const reader = new FileReader();

                reader.onload = (e) => {
                    const result = e.target.result;
                    
                    switch(fileType) {
                        case 'image':
                            this.addImageContent(result, file.name);
                            break;
                        case 'video':
                            this.addVideoContent(result, file.name);
                            break;
                        case 'audio':
                            this.addAudioContent(result, file.name);
                            break;
                        default:
                            this.showNotification('Unsupported file type', 'error');
                    }
                };

                reader.readAsDataURL(file);
            }

            // Simplified Delete Functions
            deleteItem(button) {
                const item = button.closest('.editable-item');
                this.performDelete(item, 'Content item');
            }

            deleteTitle(button) {
                const titleInput = document.getElementById('content-title');
                titleInput.value = '';
                document.getElementById('display-title').textContent = 'Untitled';
                this.showNotification('Title cleared successfully');
            }

            performDelete(element, itemType = 'Item') {
                // Add delete animation
                element.classList.add('deleting');
                
                // Remove element after animation
                setTimeout(() => {
                    element.remove();
                    this.showNotification(`${itemType} deleted successfully`);
                }, 500);
            }

            toggleEditMode() {
                this.isEditMode = !this.isEditMode;
                const sidebar = document.getElementById('editor-sidebar');
                const contentArea = document.getElementById('content-area');
                const modeToggle = document.getElementById('mode-toggle');
                const body = document.body;

                if (this.isEditMode) {
                    sidebar.classList.add('active');
                    contentArea.classList.add('editor-mode');
                    body.classList.add('edit-mode');
                    modeToggle.innerHTML = '<i class="fas fa-eye"></i><span>View Mode</span>';
                } else {
                    sidebar.classList.remove('active');
                    contentArea.classList.remove('editor-mode');
                    body.classList.remove('edit-mode');
                    modeToggle.innerHTML = '<i class="fas fa-edit"></i><span>Edit Mode</span>';
                }

                this.showNotification(`${this.isEditMode ? 'Edit' : 'View'} mode activated`);
            }

            cycleFontSize() {
                const sizes = ['small', 'medium', 'large'];
                const currentIndex = sizes.indexOf(this.fontSize);
                this.fontSize = sizes[(currentIndex + 1) % sizes.length];
                
                // Remove all font size classes
                document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
                
                // Add the new font size class
                document.body.classList.add(`font-size-${this.fontSize}`);
                
                // Update button state
                const fontSizeBtn = document.getElementById('font-size');
                fontSizeBtn.classList.remove('size-small', 'size-medium', 'size-large');
                fontSizeBtn.classList.add(`size-${this.fontSize}`);
                
                // Save preference to localStorage
                localStorage.setItem('preferred-font-size', this.fontSize);
                
                this.showNotification(`Font size: ${this.fontSize}`);
            }

            toggleFullscreen() {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                    document.querySelector('#fullscreen i').className = 'fas fa-compress';
                } else {
                    document.exitFullscreen();
                    document.querySelector('#fullscreen i').className = 'fas fa-expand';
                }
            }

            openContentModal(type) {
                const modal = document.getElementById('content-modal');
                const modalTitle = document.getElementById('modal-title');
                const modalBody = document.getElementById('modal-body');

                modalTitle.textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
                modalBody.innerHTML = this.getModalContent(type);
                modal.classList.add('active');

                this.setupModalListeners(type);
            }

            getModalContent(type) {
                switch(type) {
                    case 'text':
                        return `
                            <div class="form-group">
                                <label class="form-label">Text Content</label>
                                <textarea class="form-textarea" id="modal-text" placeholder="Enter your text content..."></textarea>
                            </div>
                            <button class="btn-primary" onclick="contentEditor.addTextContent()">
                                <i class="fas fa-plus"></i> Add Text
                            </button>
                        `;
                    case 'heading':
                        return `
                            <div class="form-group">
                                <label class="form-label">Heading Text</label>
                                <input type="text" class="form-input" id="modal-heading" placeholder="Enter heading...">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Heading Level</label>
                                <select class="form-select" id="modal-heading-level">
                                    <option value="h2">H2 - Large</option>
                                    <option value="h3">H3 - Medium</option>
                                    <option value="h4">H4 - Small</option>
                                </select>
                            </div>
                            <button class="btn-primary" onclick="contentEditor.addHeadingContent()">
                                <i class="fas fa-plus"></i> Add Heading
                            </button>
                        `;
                    case 'image':
                        return `
                            <div class="file-upload-area" onclick="document.getElementById('image-upload').click()">
                                <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                                <p style="color: var(--text-color); font-size: 1.2rem;">Click to upload or drag & drop image</p>
                                <input type="file" id="image-upload" class="file-input" accept="image/*">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Image Caption</label>
                                <input type="text" class="form-input" id="modal-image-caption" placeholder="Enter caption...">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Alt Text</label>
                                <input type="text" class="form-input" id="modal-image-alt" placeholder="Describe the image...">
                            </div>
                        `;
                    case 'video':
                        return `
                            <div class="file-upload-area" onclick="document.getElementById('video-upload').click()">
                                <i class="fas fa-video" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                                <p style="color: var(--text-color); font-size: 1.2rem;">Click to upload or drag & drop video</p>
                                <input type="file" id="video-upload" class="file-input" accept="video/*">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Video Caption</label>
                                <input type="text" class="form-input" id="modal-video-caption" placeholder="Enter caption...">
                            </div>
                        `;
                    case 'audio':
                        return `
                            <div class="file-upload-area" onclick="document.getElementById('audio-upload').click()">
                                <i class="fas fa-music" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                                <p style="color: var(--text-color); font-size: 1.2rem;">Click to upload or drag & drop audio</p>
                                <input type="file" id="audio-upload" class="file-input" accept="audio/*">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Audio Title</label>
                                <input type="text" class="form-input" id="modal-audio-title" placeholder="Audio title...">
                            </div>
                        `;
                    case 'quote':
                        return `
                            <div class="form-group">
                                <label class="form-label">Quote Text</label>
                                <textarea class="form-textarea" id="modal-quote-text" placeholder="Enter the quote..."></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Author</label>
                                <input type="text" class="form-input" id="modal-quote-author" placeholder="Quote author...">
                            </div>
                            <button class="btn-primary" onclick="contentEditor.addQuoteContent()">
                                <i class="fas fa-plus"></i> Add Quote
                            </button>
                        `;
                    default:
                        return '<p style="color: var(--text-color);">Content type not supported</p>';
                }
            }

            setupModalListeners(type) {
                if (type === 'image') {
                    document.getElementById('image-upload').addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) this.handleImageUpload(file);
                    });
                } else if (type === 'video') {
                    document.getElementById('video-upload').addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) this.handleVideoUpload(file);
                    });
                } else if (type === 'audio') {
                    document.getElementById('audio-upload').addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) this.handleAudioUpload(file);
                    });
                }
            }

            handleImageUpload(file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const caption = document.getElementById('modal-image-caption').value;
                    const altText = document.getElementById('modal-image-alt').value;
                    this.addImageContent(e.target.result, altText, caption);
                    this.closeModal();
                };
                reader.readAsDataURL(file);
            }

            handleVideoUpload(file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const caption = document.getElementById('modal-video-caption').value;
                    this.addVideoContent(e.target.result, file.name, caption);
                    this.closeModal();
                };
                reader.readAsDataURL(file);
            }

            handleAudioUpload(file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const title = document.getElementById('modal-audio-title').value;
                    this.addAudioContent(e.target.result, title);
                    this.closeModal();
                };
                reader.readAsDataURL(file);
            }

            addTextContent() {
                const text = document.getElementById('modal-text').value;
                if (!text.trim()) {
                    this.showNotification('Please enter some text', 'error');
                    return;
                }

                const contentBody = document.getElementById('content-body');
                const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
                
                paragraphs.forEach(paragraph => {
                    const textElement = document.createElement('p');
                    textElement.className = 'editable-item fade-in';
                    textElement.style.color = 'var(--text-secondary)';
                    textElement.innerHTML = `
                        ${paragraph.trim()}
                        <button class="delete-btn" onclick="contentEditor.deleteItem(this)">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    contentBody.appendChild(textElement);
                });

                contentBody.appendChild(textElement);
                this.closeModal();
                this.showNotification('Text content added successfully');
            }

            addHeadingContent() {
                const heading = document.getElementById('modal-heading').value;
                const level = document.getElementById('modal-heading-level').value;
                
                if (!heading.trim()) {
                    this.showNotification('Please enter heading text', 'error');
                    return;
                }

                const contentBody = document.getElementById('content-body');
                const headingElement = document.createElement(level);
                headingElement.className = 'editable-item fade-in';
                headingElement.style.color = 'var(--text-color)';
                headingElement.style.fontWeight = '800';
                headingElement.innerHTML = `
                    ${heading}
                    <button class="delete-btn" onclick="contentEditor.deleteItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                contentBody.appendChild(headingElement);
                this.closeModal();
                this.showNotification('Heading added successfully');
            }

            addImageContent(src, alt = '', caption = '') {
                const contentBody = document.getElementById('content-body');
                const imageElement = document.createElement('div');
                imageElement.className = 'media-item editable-item fade-in';
                imageElement.innerHTML = `
                    <img src="${src}" alt="${alt}" loading="lazy">
                    ${caption ? `<div class="media-caption" style="color: var(--text-secondary);">${caption}</div>` : ''}
                    <button class="delete-btn" onclick="contentEditor.deleteItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                contentBody.appendChild(imageElement);
                this.showNotification('Image added successfully');
            }

            addVideoContent(src, name = '', caption = '') {
                const contentBody = document.getElementById('content-body');
                const videoElement = document.createElement('div');
                videoElement.className = 'media-item editable-item fade-in';
                videoElement.innerHTML = `
                    <video controls style="background: var(--bg-secondary);">
                        <source src="${src}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    ${caption ? `<div class="media-caption" style="color: var(--text-secondary);">${caption}</div>` : ''}
                    <button class="delete-btn" onclick="contentEditor.deleteItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                contentBody.appendChild(videoElement);
                this.showNotification('Video added successfully');
            }

            addAudioContent(src, title = '') {
                const contentBody = document.getElementById('content-body');
                const audioElement = document.createElement('div');
                audioElement.className = 'editable-item fade-in';
                audioElement.style.cssText = `
                    background: var(--card-bg);
                    border-radius: var(--radius-lg);
                    padding: 2rem;
                    margin: 2rem 0;
                    box-shadow: var(--shadow-md);
                    border: 1px solid var(--border-color);
                `;
                audioElement.innerHTML = `
                    ${title ? `<h4 style="color: var(--text-color); margin-bottom: 1rem;">${title}</h4>` : ''}
                    <audio controls style="width: 100%;">
                        <source src="${src}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                    <button class="delete-btn" onclick="contentEditor.deleteItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                contentBody.appendChild(audioElement);
                this.showNotification('Audio added successfully');
            }

            addQuoteContent() {
                const quoteText = document.getElementById('modal-quote-text').value;
                const author = document.getElementById('modal-quote-author').value;
                
                if (!quoteText.trim()) {
                    this.showNotification('Please enter quote text', 'error');
                    return;
                }

                const contentBody = document.getElementById('content-body');
                const quoteElement = document.createElement('div');
                quoteElement.className = 'quote-block editable-item fade-in';
                quoteElement.innerHTML = `
                    "${quoteText}"
                    ${author ? `<div style="text-align: right; margin-top: 1.5rem; font-weight: 700; color: var(--primary-color);">— ${author}</div>` : ''}
                    <button class="delete-btn" onclick="contentEditor.deleteItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                contentBody.appendChild(quoteElement);
                this.closeModal();
                this.showNotification('Quote added successfully');
            }

            closeModal() {
                document.getElementById('content-modal').classList.remove('active');
            }

            showQuickAdd() {
                const types = ['text', 'image', 'video', 'audio', 'quote', 'heading'];
                const randomType = types[Math.floor(Math.random() * types.length)];
                this.openContentModal(randomType);
            }

            saveContent() {
                const contentData = {
                    title: document.getElementById('display-title').textContent,
                    content: document.getElementById('content-body').innerHTML,
                    timestamp: new Date().toISOString()
                };

                // Note: In production, you would send this to a server
                console.log('Content saved:', contentData);
                this.showNotification('Content saved successfully');
            }

            previewContent() {
                if (this.isEditMode) {
                    this.toggleEditMode();
                }
                this.showNotification('Preview mode activated');
            }

            exportContent() {
                const content = document.getElementById('content-wrapper').innerHTML;
                const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${document.getElementById('display-title').textContent}</title>
                    <style>
                        body { 
                            font-family: 'Inter', Arial, sans-serif; 
                            max-width: 900px; 
                            margin: 0 auto; 
                            padding: 2rem;
                            background: #000000;
                            color: #ffffff;
                            line-height: 1.6;
                        }
                        .content-wrapper { 
                            background: #1e1e1e; 
                            border-radius: 1rem; 
                            padding: 3rem; 
                            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
                            border: 1px solid #333333;
                        }
                        .media-item { 
                            margin: 2rem 0; 
                            border-radius: 0.75rem; 
                            overflow: hidden; 
                        }
                        .media-item img, .media-item video { 
                            width: 100%; 
                            height: auto; 
                        }
                        .delete-btn { 
                            display: none; 
                        }
                        h1, h2, h3, h4 {
                            color: #ffffff;
                            font-weight: 800;
                        }
                        .quote-block {
                            background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(14, 165, 233, 0.1));
                            border-left: 6px solid #00d4ff;
                            border-radius: 1rem;
                            padding: 2.5rem;
                            margin: 3rem 0;
                            font-style: italic;
                            font-size: 1.5rem;
                        }
                    </style>
                </head>
                <body>
                    ${content.replace(/delete-btn[^>]*>.*?<\/button>/g, '')}
                </body>
                </html>
                `;

                const blob = new Blob([html], { type: 'text/html' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `${document.getElementById('display-title').textContent}.html`;
                a.click();

                URL.revokeObjectURL(url);
                this.showNotification('Content exported as HTML');
            }

            handleKeyboardShortcuts(e) {
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key) {
                        case 's':
                            e.preventDefault();
                            this.saveContent();
                            break;
                        case 'e':
                            e.preventDefault();
                            this.toggleEditMode();
                            break;
                        case 'p':
                            e.preventDefault();
                            this.previewContent();
                            break;
                    }
                }
                
                // Delete key for selected items
                if (e.key === 'Delete' && this.isEditMode) {
                    const activeElement = document.activeElement;
                    if (activeElement.classList.contains('editable-item')) {
                        this.performDelete(activeElement);
                    }
                }
            }

            setupAnimations() {
                // Register ScrollTrigger plugin
                gsap.registerPlugin(ScrollTrigger);

                // Animate content items
                gsap.utils.toArray('.fade-in').forEach((item, index) => {
                    gsap.fromTo(item, 
                        { y: 50, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.8,
                            delay: index * 0.1,
                            ease: "power2.out"
                        }
                    );
                });
            }

            showNotification(message, type = 'success') {
                const notification = document.getElementById('notification');
                const notificationText = document.getElementById('notification-text');

                notificationText.textContent = message;
                notification.className = `notification show ${type}`;

                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
        }