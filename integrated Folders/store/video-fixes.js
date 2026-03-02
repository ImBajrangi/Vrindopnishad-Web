// Replace the existing addVideo() function with this enhanced version
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