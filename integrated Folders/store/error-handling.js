// Enhanced error handling and media validation - Add these functions to your class

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

isDirectVideoUrl(url) {
    const videoExtensions = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?|$)/i;
    return videoExtensions.test(url);
}

isDirectAudioUrl(url) {
    const audioExtensions = /\.(mp3|wav|ogg|m4a|aac|flac|wma)(\?|$)/i;
    return audioExtensions.test(url);
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
        
        let mediaContent = `<audio controls preload="metadata" style="width: 100%;">
            <source src="${this.sanitizeUrl(audioUrl)}" type="audio/${audioExtension}">
            <p>Your browser does not support the audio element. <a href="${this.sanitizeUrl(audioUrl)}" target="_blank">Download audio</a></p>
        </audio>`;
        
        if (audioTitle && audioTitle.trim()) {
            mediaContent += `<div class="media-caption" style="padding: 1rem; text-align: center; color: var(--text-secondary);">${this.sanitizeText(audioTitle)}</div>`;
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
        this.showNotification('Audio added successfully');
        
    } catch (error) {
        console.error('Audio processing error:', error);
        this.showNotification(error.message, 'error');
    }
}

getAudioExtension(url) {
    const extension = url.split('.').pop().split(/\#|\?/)[0].toLowerCase();
    const validExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];
    return validExtensions.includes(extension) ? extension : 'mp3';
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
        
        let mediaContent = `<img src="${this.sanitizeUrl(imageUrl)}" 
                                alt="${this.sanitizeText(imageAlt || 'Image')}" 
                                loading="lazy"
                                onerror="this.onerror=null; this.alt='Image failed to load: ${this.sanitizeText(imageUrl)}'; this.style.border='2px dashed #ff6b6b'; this.style.padding='1rem';" />`;
        
        if (imageCaption && imageCaption.trim()) {
            mediaContent += `<div class="media-caption">${this.sanitizeText(imageCaption)}</div>`;
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
        this.showNotification('Image added successfully');
        
    } catch (error) {
        console.error('Image processing error:', error);
        this.showNotification(error.message, 'error');
    }
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
                        mediaContent = `<img src="${e.target.result}" 
                                           alt="${this.sanitizeText(file.name)}" 
                                           loading="lazy" />`;
                    } else if (file.type.startsWith('video/')) {
                        mediaType = 'Video';
                        mediaContent = `<video controls preload="metadata" style="width: 100%;">
                                           <source src="${e.target.result}" type="${file.type}">
                                           <p>Your browser does not support the video tag.</p>
                                       </video>`;
                    } else if (file.type.startsWith('audio/')) {
                        mediaType = 'Audio';
                        mediaContent = `<audio controls preload="metadata" style="width: 100%;">
                                           <source src="${e.target.result}" type="${file.type}">
                                           <p>Your browser does not support the audio element.</p>
                                       </audio>`;
                    }
                    
                    mediaContent += `<div class="media-caption">${this.sanitizeText(file.name)}</div>`;
                    
                    mediaElement.innerHTML = mediaContent + `
                        <div class="drag-handle" title="Drag to reorder">
                            <i class="fas fa-grip-vertical"></i>
                        </div>
                        <button class="delete-btn" onclick="contentEditor.deleteItem(this)">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    
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
    modalBody.innerHTML = `
        <div style="max-height: 60vh; overflow-y: auto; background: #111; padding: 2rem; border-radius: 0.5rem; border: 1px solid #333;">
            <h1 style="color: #fff; margin-bottom: 2rem;">${document.getElementById('display-title').textContent}</h1>
            <div>${document.getElementById('content-body').innerHTML.replace(/<div class="drag-handle"[^>]*>[\s\S]*?<\/div>/g, '').replace(/<button class="delete-btn"[^>]*>[\s\S]*?<\/button>/g, '')}</div>
        </div>
        <button class="btn-secondary" onclick="contentEditor.closeModal()" style="margin-top: 1rem;">
            <i class="fas fa-times"></i>
            Close Preview
        </button>
    `;
    
    modal.classList.add('active');
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