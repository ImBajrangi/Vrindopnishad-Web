/**
 * Modern Notification System
 * A reusable notification component with sound effects that can be easily
 * integrated into any web project. Provides a clean, modern Apple/Samsung style
 * notification design with sound alerts.
 * 
 * Features:
 * - Modern, minimalist design
 * - Sound notifications based on type (success, error, info)
 * - Automatically disappears after timeout
 * - Pause timeout on hover
 * - Mobile haptic feedback
 * - Dark mode support
 * 
 * Usage:
 * 1. Include this file in your project
 * 2. Add the CSS file
 * 3. Add a div with id="notifications" to your HTML
 * 4. Call showNotification("Your message", "success") to show a notification
 */

// Play notification sound based on type
function playNotificationSound(type) {
  // Create audio context only when needed to comply with autoplay policies
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    // Configure sound based on notification type
    switch(type) {
      case 'success':
        // Success: Gentle chime sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(660, context.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.15, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
        break;
      case 'error':
        // Error: Double low tone
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(320, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(180, context.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.15, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
        break;
      default: // info
        // Info: Soft ping
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(520, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(480, context.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
    }
    
    // Connect the nodes and start
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start();
    
    // Stop the sound after duration
    oscillator.stop(context.currentTime + 0.7);
  } catch (e) {
    console.log('Audio notification error:', e);
    // Silently fail if browser doesn't support audio
  }
}

/**
 * Shows a notification with the specified message and type
 * @param {string} message - The message to display
 * @param {string} type - The type of notification: 'success', 'error', or 'info'
 * @param {Object} options - Additional options
 * @param {string} options.appName - Custom app name (defaults based on notification type)
 * @param {string} options.icon - Custom icon HTML (defaults based on notification type)
 * @param {number} options.duration - Custom duration in ms (default: 3000ms)
 * @param {boolean} options.enableSwipe - Enable swipe to dismiss (default: true)
 * @param {number} options.minSwipeDistance - Minimum swipe distance to dismiss (default: 50px)
 * @returns {HTMLElement} The notification element
 */
function showNotification(message, type = 'info', options = {}) {
  // Get or create notifications container
  let notifications = document.getElementById('notifications');
  
  if (!notifications) {
    // Create notifications container if it doesn't exist
    notifications = document.createElement('div');
    notifications.id = 'notifications';
    notifications.className = 'notifications';
    document.body.appendChild(notifications);
  }
  
  // Play notification sound
  playNotificationSound(type);
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // Get current time
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
  
  // Use default or custom app name and icon
  let appName = options.appName || '';
  let icon = options.icon || '';
  
  if (!appName || !icon) {
    if (type === 'success') {
      appName = options.appName || 'Success';
      icon = options.icon || '<i class="fas fa-check"></i>';
    } else if (type === 'error') {
      appName = options.appName || 'Alert';
      icon = options.icon || '<i class="fas fa-exclamation"></i>';
    } else {
      appName = options.appName || 'Info';
      icon = options.icon || '<i class="fas fa-info"></i>';
    }
  }
  
  // Create notification header
  const header = document.createElement('div');
  header.className = 'notification-header';
  header.innerHTML = `
    <div class="notification-app-icon">${icon}</div>
    <div class="notification-app-name">${appName}</div>
    <div class="notification-time">${formattedTime}</div>
  `;
  
  // Create notification content
  const content = document.createElement('div');
  content.className = 'notification-content';
  content.innerHTML = `<span>${message}</span>`;
  
  // Add close button to notification
  const closeBtn = document.createElement('button');
  closeBtn.className = 'notification-close';
  closeBtn.innerHTML = '<i class="fas fa-times"></i>';
  closeBtn.addEventListener('click', () => {
    notification.classList.add('hide');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  notification.appendChild(header);
  notification.appendChild(content);
  notification.appendChild(closeBtn);
  notifications.appendChild(notification);
  
  // Mobile device haptic feedback (if available)
  if (window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(50);
    } catch (e) {
      // Silently fail if vibration API not supported
    }
  }
  
  // Get custom duration or use default
  const duration = options.duration || 3000;
  
  // Auto remove after delay
  const timeoutId = setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, duration);
  
  // If user hovers, pause the auto-removal
  notification.addEventListener('mouseenter', () => {
    clearTimeout(timeoutId);
  });
  
  // Resume auto-removal on mouse leave
  notification.addEventListener('mouseleave', () => {
    const newTimeoutId = setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 1500);
    
    // Store the new timeout ID
    notification.dataset.timeoutId = newTimeoutId;
  });
  
  // Add swipe functionality (enabled by default)
  const enableSwipe = options.enableSwipe !== undefined ? options.enableSwipe : true;
  
  if (enableSwipe) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const minSwipeDistance = options.minSwipeDistance || 50;
    
    notification.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
      
      // Clear any existing timeout to prevent auto-dismissal during swipe
      if (notification.dataset.timeoutId) {
        clearTimeout(parseInt(notification.dataset.timeoutId));
      }
      
      // Add class to indicate touch in progress and optimize for animation
      notification.classList.add('swiping');
    }, { passive: true });
    
    notification.addEventListener('touchmove', e => {
      // Get current touch position
      const currentX = e.changedTouches[0].clientX;
      const currentY = e.changedTouches[0].clientY;
      
      // Calculate distance moved
      const deltaX = currentX - touchStartX;
      const deltaY = currentY - touchStartY;
      
      // Apply transform based on movement (horizontal movement takes precedence)
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        notification.style.transform = `translateX(${deltaX}px)`;
      } else {
        notification.style.transform = `translateY(${deltaY}px)`;
      }
      
      // Decrease opacity as it's moved
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 150;
      const opacity = Math.max(0, 1 - distance / maxDistance);
      notification.style.opacity = opacity;
    }, { passive: true });
    
    notification.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      
      // Remove swiping class
      notification.classList.remove('swiping');
      
      // Calculate distance
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance >= minSwipeDistance) {
        // Determine direction for animation class
        let direction;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }
        
        // Add appropriate direction class
        notification.classList.add(`swipe-${direction}`);
        
        // Vibrate if supported
        if (window.navigator && window.navigator.vibrate) {
          try {
            window.navigator.vibrate(20);
          } catch (e) {
            // Silently fail
          }
        }
        
        // Remove after animation
        setTimeout(() => {
          notification.remove();
        }, 300);
      } else {
        // Reset transform and opacity if not swiped far enough
        notification.style.transform = '';
        notification.style.opacity = '';
        
        // Restart the auto-dismiss timeout
        const newTimeoutId = setTimeout(() => {
          notification.classList.add('hide');
          setTimeout(() => {
            notification.remove();
          }, 300);
        }, 1500);
        
        notification.dataset.timeoutId = newTimeoutId;
      }
    }, { passive: true });
    
    notification.addEventListener('touchcancel', () => {
      // Reset transform and opacity on touch cancel
      notification.classList.remove('swiping');
      notification.style.transform = '';
      notification.style.opacity = '';
      
      // Restart the auto-dismiss timeout
      const newTimeoutId = setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 1500);
      
      notification.dataset.timeoutId = newTimeoutId;
    }, { passive: true });
  }
  
  return notification;
}

// Export functions if using modules
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    showNotification,
    playNotificationSound
  };
} 