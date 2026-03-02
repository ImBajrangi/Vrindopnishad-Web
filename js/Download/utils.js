/**
 * Download file with progress tracking
 * @param {string} url - URL of the file to download
 * @param {string} filename - Name to save the file as
 * @param {Function} onProgress - Progress callback (optional)
 * @param {Function} onComplete - Completion callback (optional)
 * @param {Function} onError - Error callback (optional)
 */
async function downloadFile(url, filename, onProgress, onComplete, onError) {
    try {
        // Create notification
        showNotification('info', `Starting download: ${filename}...`);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        // Get file size
        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10);
        
        // Create stream reader
        const reader = response.body.getReader();
        const chunks = [];
        let received = 0;

        // Read stream
        while(true) {
            const {done, value} = await reader.read();
            
            if (done) break;
            
            chunks.push(value);
            received += value.length;

            // Calculate progress
            const progress = (received / total) * 100;
            
            // Call progress callback if provided
            if (onProgress) {
                onProgress(progress);
            }

            // Update notification every 10%
            if (progress % 10 < 1) {
                showNotification('info', `Downloading: ${Math.round(progress)}%`);
            }
        }

        // Combine chunks
        const blob = new Blob(chunks);
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);

        // Show success notification
        showNotification('success', `Download complete: ${filename}`);
        
        // Call complete callback if provided
        if (onComplete) {
            onComplete();
        }

    } catch (error) {
        console.error('Download error:', error);
        showNotification('error', `Download failed: ${error.message}`);
        
        // Call error callback if provided
        if (onError) {
            onError(error);
        }
    }
}

/**
 * Show notification
 * @param {string} type - 'success', 'error', or 'info'
 * @param {string} message - Notification message
 */
function showNotification(type, message) {
    const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create notification content
    const content = `
        <div class="notification-header">
            <div class="notification-app-icon">
                <i class="${getIconForType(type)}"></i>
            </div>
            <span class="notification-app-name">Download Manager</span>
            <span class="notification-time">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="notification-content">
            <span>${message}</span>
        </div>
    `;
    
    notification.innerHTML = content;

    // Add to container
    notificationsContainer.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notificationsContainer.removeChild(notification);
        }, 300);
    }, 5000);
}

// Helper function to get icon based on notification type
function getIconForType(type) {
    switch(type) {
        case 'success': return 'fas fa-check';
        case 'error': return 'fas fa-exclamation-circle';
        case 'info': return 'fas fa-info-circle';
        default: return 'fas fa-bell';
    }
}

// Export functions
window.downloadFile = downloadFile;
window.showNotification = showNotification;
