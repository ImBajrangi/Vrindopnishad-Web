/**
 * Unified Notification Manager
 * 
 * This manager handles all notifications across the application,
 * prevents duplicates, and provides debouncing capabilities.
 * It integrates with the modern-notifications system.
 */

// Store active notifications to prevent duplicates
const activeNotifications = {
  messages: new Set(),        // Track message content
  timeouts: {},               // Track notification timeouts by ID
  counter: 0,                 // Unique ID counter
  categories: {},             // Track notifications by category
  elements: new WeakMap(),    // Map notification elements to their metadata
  silentSuccess: true,       // Global setting to suppress success notifications by default
  audioEnabled: false,       // Global setting to disable sounds by default
  audioContext: null,         // Audio context for notification sounds
  userInteracted: false,      // Flag to track if user has interacted with the page
  lastNotificationTime: 0     // Track last notification time to prevent spam
};

// Debounce settings (in milliseconds)
const DEBOUNCE_DEFAULT = 1000;  // Increased debounce time to 1 second
const DUPLICATE_TIMEOUT = 5000; // Increased duplicate timeout to 5 seconds

// Audio files for notifications
const AUDIO_FILES = {
  success: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=interface-124464.mp3',
  error: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_c8530484fd.mp3?filename=interface-124465.mp3',
  info: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_88447803bd.mp3?filename=interface-124467.mp3'
};

// Track user interaction
document.addEventListener('click', function() {
  activeNotifications.userInteracted = true;
  
  // Initialize audio context on first interaction if not already done
  if (activeNotifications.audioEnabled && !activeNotifications.audioContext) {
    initAudioContext();
  }
}, { once: false, capture: true });

/**
 * Initialize Web Audio API context
 */
function initAudioContext() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      activeNotifications.audioContext = new AudioContext();
      console.log('Audio context initialized successfully');
    }
  } catch (e) {
    console.error('Failed to initialize audio context:', e);
    activeNotifications.audioContext = null;
  }
}

/**
 * Play notification sound with fallbacks
 * @param {string} type - The notification type ('success', 'error', 'info')
 */
function playNotificationSound(type) {
  if (!activeNotifications.audioEnabled) return;

  // Try using Web Audio API first
  if (activeNotifications.audioContext && activeNotifications.userInteracted) {
    playWebAudioSound(type);
  } else {
    // Fall back to HTML5 Audio API
    playHtmlAudioSound(type);
  }
}

/**
 * Play sound using Web Audio API
 * @param {string} type - The notification type
 */
function playWebAudioSound(type) {
  try {
    const context = activeNotifications.audioContext;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    // Configure sound based on notification type
    switch(type) {
      case 'success':
        // Success: Pleasant high-pitched ding
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        break;
      case 'error':
        // Error: Two-tone alert sound
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, context.currentTime);
        oscillator.frequency.setValueAtTime(350, context.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        break;
      default: // info
        // Info: Soft ping sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, context.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    }
    
    // Connect the nodes and start
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(context.currentTime);
    
    // Stop the sound after duration
    oscillator.stop(context.currentTime + 0.3);
    
    // Add vibration for mobile devices
    if (window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(50);
      } catch (e) {
        // Silently fail if vibration API not supported
      }
    }
  } catch (e) {
    console.warn('Web Audio API error:', e);
    // Fall back to HTML5 Audio
    playHtmlAudioSound(type);
  }
}

/**
 * Play sound using HTML5 Audio API
 * @param {string} type - The notification type
 */
function playHtmlAudioSound(type) {
  if (!activeNotifications.userInteracted) {
    console.log('User hasn\'t interacted with page yet, cannot play sound due to browser restrictions');
    return;
  }
  
  try {
    // Get or create audio element for this sound type
    let audio = document.getElementById(`notification-sound-${type}`);
    
    if (!audio) {
      // Create and cache the audio element
      audio = document.createElement('audio');
      audio.id = `notification-sound-${type}`;
      audio.preload = 'auto';
      audio.volume = 0.3;
      audio.style.display = 'none';
      
      // Set source based on type
      if (AUDIO_FILES[type]) {
        const source = document.createElement('source');
        source.src = AUDIO_FILES[type];
        source.type = 'audio/mp3';
        audio.appendChild(source);
      }
      
      // Add to document
      document.body.appendChild(audio);
    }
    
    // Reset and play
    audio.currentTime = 0;
    
    // Play with promise handling for modern browsers
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('HTML5 audio playback error:', error);
        
        // If it's a user interaction error, we'll remember this for future
        if (error.name === 'NotAllowedError') {
          console.log('Audio playback requires user interaction first');
        }
      });
    }
  } catch (e) {
    console.warn('HTML5 Audio fallback error:', e);
  }
}

/**
 * Show a notification with duplicate prevention and debouncing
 * @param {string} message - The message to display
 * @param {string} type - The type of notification: 'success', 'error', or 'info'
 * @param {Object} options - Additional options
 * @param {string} options.appName - Custom app name (used for categorization)
 * @param {string} options.icon - Custom icon HTML
 * @param {number} options.duration - Custom duration in ms (default: 3000ms)
 * @param {boolean} options.enableSwipe - Enable swipe to dismiss (default: true)
 * @param {number} options.debounce - Debounce time in ms (default: 300ms)
 * @param {boolean} options.allowDuplicates - Whether to allow duplicate notifications (default: false)
 * @param {boolean} options.combineByCategory - Whether to combine notifications by category (default: true)
 * @param {boolean} options.silent - Whether to suppress this notification if it's not an error (default: uses global setting)
 * @returns {Promise<HTMLElement|null>} The notification element or null if debounced/duplicate
 */
function showNotification(message, type = 'info', options = {}) {
  return new Promise((resolve) => {
    // Clean up old messages from the tracking set
    cleanupOldMessages();
    
    // Default options with stricter settings
    const mergedOptions = {
      allowDuplicates: false,
      debounce: DEBOUNCE_DEFAULT,
      combineByCategory: true,
      appName: getCategoryFromType(type),
      silent: activeNotifications.silentSuccess,
      minTimeBetweenNotifications: 2000, // Minimum 2 seconds between notifications
      ...options
    };
    
    // Check if enough time has passed since last notification
    const now = Date.now();
    if (now - activeNotifications.lastNotificationTime < mergedOptions.minTimeBetweenNotifications) {
      console.log('Notification throttled - too soon after last notification');
      resolve(null);
      return;
    }
    
    // Check if we should suppress this notification
    if (mergedOptions.silent && type !== 'error') {
      console.log(`[Silent Notification] ${type.toUpperCase()}: ${message}`);
      resolve(null);
      return;
    }
    
    // Create a unique ID for this notification request
    const notificationId = `notification-${++activeNotifications.counter}`;
    
    // Check for duplicates if not explicitly allowed
    if (!mergedOptions.allowDuplicates && activeNotifications.messages.has(message)) {
      console.log('Duplicate notification prevented:', message);
      resolve(null);
      return;
    }
    
    // Check if we should combine by category
    if (mergedOptions.combineByCategory && mergedOptions.appName) {
      const category = mergedOptions.appName;
      
      // Check if this category already has active notifications
      if (activeNotifications.categories[category]) {
        // Try to combine with existing notification
        const existingNotif = combineWithCategoryNotification(
          category, message, type, mergedOptions
        );
        
        if (existingNotif) {
          console.log('Combined notification in category:', category);
          
          // Play sound for combined notification
          playNotificationSound(type);
          
          resolve(existingNotif);
          return;
        }
      }
    }
    
    // Debounce the notification
    if (mergedOptions.debounce > 0) {
      // Store the timeout ID
      activeNotifications.timeouts[notificationId] = setTimeout(() => {
        // Actually show the notification after debounce period
        const notification = showActualNotification(message, type, mergedOptions);
        
        // Add message to active set with timeout to auto-remove
        trackNotification(notification, message, type, mergedOptions);
        
        // Clean up the timeout reference
        delete activeNotifications.timeouts[notificationId];
        
        // Play notification sound
        playNotificationSound(type);
        
        // Resolve with the notification element
        resolve(notification);
      }, mergedOptions.debounce);
    } else {
      // Show immediately if no debounce
      const notification = showActualNotification(message, type, mergedOptions);
      
      // Add message to active set with timeout to auto-remove
      trackNotification(notification, message, type, mergedOptions);
      
      // Play notification sound
      playNotificationSound(type);
      
      // Resolve with the notification element
      resolve(notification);
    }
  });
}

/**
 * Set the global silent success mode
 * @param {boolean} silent - Whether to suppress success notifications globally
 */
function setSilentMode(silent) {
  activeNotifications.silentSuccess = !!silent;
  console.log(`Notification silent mode ${silent ? 'enabled' : 'disabled'}`);
  return activeNotifications.silentSuccess;
}

/**
 * Enable or disable notification sounds
 * @param {boolean} enabled - Whether sounds should be enabled
 */
function setAudioEnabled(enabled) {
  activeNotifications.audioEnabled = !!enabled;
  console.log(`Notification sounds ${enabled ? 'enabled' : 'disabled'}`);
  
  // Initialize audio context if enabling and user has interacted
  if (enabled && activeNotifications.userInteracted && !activeNotifications.audioContext) {
    initAudioContext();
  }
  
  return activeNotifications.audioEnabled;
}

/**
 * Track a notification for management
 * @private
 */
function trackNotification(notification, message, type, options) {
  // Add message to set
  activeNotifications.messages.add(message);
  
  // Track by category if applicable
  if (options.appName) {
    if (!activeNotifications.categories[options.appName]) {
      activeNotifications.categories[options.appName] = new Set();
    }
    activeNotifications.categories[options.appName].add(notification);
    
    // Store metadata in WeakMap for later reference
    activeNotifications.elements.set(notification, {
      message,
      type,
      options,
      count: 1,
      messages: [message],
      category: options.appName
    });
    
    // Add notification ID data attribute for tracking
    notification.dataset.category = options.appName;
    notification.dataset.notificationId = `notif-${activeNotifications.counter}`;
    
    // Set cleanup timeout for this notification
    setTimeout(() => {
      activeNotifications.messages.delete(message);
      if (activeNotifications.categories[options.appName]) {
        activeNotifications.categories[options.appName].delete(notification);
        if (activeNotifications.categories[options.appName].size === 0) {
          delete activeNotifications.categories[options.appName];
        }
      }
    }, options.duration || 3000);
  } else {
    // Just set the basic cleanup timeout
    setTimeout(() => {
      activeNotifications.messages.delete(message);
    }, options.duration || 3000);
  }
}

/**
 * Try to combine a notification with an existing one in the same category
 * @private
 */
function combineWithCategoryNotification(category, message, type, options) {
  if (!activeNotifications.categories[category]) return null;
  
  // Get the first notification in this category
  const existingNotifications = Array.from(activeNotifications.categories[category]);
  if (existingNotifications.length === 0) return null;
  
  const existingNotif = existingNotifications[0];
  const metadata = activeNotifications.elements.get(existingNotif);
  
  if (!metadata) return null;
  
  // Don't combine different types of notifications
  if (metadata.type !== type) return null;
  
  // We found a notification to combine with
  metadata.count++;
  metadata.messages.push(message);
  
  // Update the counter display
  let counter = existingNotif.querySelector('.notification-counter');
  
  if (!counter) {
    // Create counter if it doesn't exist
    counter = document.createElement('span');
    counter.className = 'notification-counter';
    
    // Find the content span to add the counter to
    const contentSpan = existingNotif.querySelector('.notification-content span');
    if (contentSpan) {
      contentSpan.appendChild(document.createTextNode(' '));
      contentSpan.appendChild(counter);
    } else {
      // If no span exists, add to the content div
      const contentDiv = existingNotif.querySelector('.notification-content');
      if (contentDiv) {
        contentDiv.appendChild(counter);
      }
    }
  }
  
  // Update counter text
  counter.textContent = `(${metadata.count})`;
  counter.dataset.count = metadata.count.toString();
  
  // Add animation to make the counter pulse
  counter.classList.remove('pulse-animation');
  void counter.offsetWidth; // Force reflow to restart animation
  counter.classList.add('pulse-animation');
  
  // If there's a category list in the notification, update it
  let categoryList = existingNotif.querySelector('.notification-category-list');
  if (!categoryList && metadata.messages.length > 1) {
    // Create a category list if we have multiple messages
    categoryList = document.createElement('div');
    categoryList.className = 'notification-category-list';
    
    // Add to notification
    const contentDiv = existingNotif.querySelector('.notification-content');
    if (contentDiv) {
      contentDiv.appendChild(categoryList);
    }
  }
  
  // Update the category list content if it exists
  if (categoryList && metadata.messages.length > 2) {
    // Only show the category list if we have more than 2 messages
    categoryList.innerHTML = `
      <div class="category-list-toggle">
        <small>Show all ${metadata.count} notifications</small>
      </div>
      <div class="category-list-items" style="display:none;">
        ${metadata.messages.map(msg => `<div class="category-list-item">${msg}</div>`).join('')}
      </div>
    `;
    
    // Add toggle functionality
    const toggle = categoryList.querySelector('.category-list-toggle');
    const items = categoryList.querySelector('.category-list-items');
    
    if (toggle && items) {
      toggle.onclick = function() {
        const isVisible = items.style.display !== 'none';
        items.style.display = isVisible ? 'none' : 'block';
        toggle.querySelector('small').textContent = isVisible 
          ? `Show all ${metadata.count} notifications` 
          : 'Hide details';
      };
    }
  }
  
  // Reset the dismissal timer
  resetNotificationTimer(existingNotif, options.duration || 3000);
  
  return existingNotif;
}

/**
 * Reset the auto-dismiss timer for a notification
 * @private
 */
function resetNotificationTimer(notification, duration) {
  const notifId = notification.dataset.notificationId;
  
  // Clear existing timeout
  if (notifId && activeNotifications.timeouts[`dismiss-${notifId}`]) {
    clearTimeout(activeNotifications.timeouts[`dismiss-${notifId}`]);
  }
  
  // Set a new timeout
  activeNotifications.timeouts[`dismiss-${notifId}`] = setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      notification.remove();
      
      // Clean up references
      if (notifId) {
        delete activeNotifications.timeouts[`dismiss-${notifId}`];
      }
      
      // Remove from category tracking
      const category = notification.dataset.category;
      if (category && activeNotifications.categories[category]) {
        activeNotifications.categories[category].delete(notification);
        if (activeNotifications.categories[category].size === 0) {
          delete activeNotifications.categories[category];
        }
      }
    }, 300);
  }, duration);
}

/**
 * Get a default category name from notification type
 * @private
 */
function getCategoryFromType(type) {
  switch (type) {
    case 'success': return 'Success';
    case 'error': return 'Alert';
    case 'info': default: return 'Info';
  }
}

/**
 * Actually show the notification, calling the underlying notification system
 * @private
 */
function showActualNotification(message, type, options) {
  // Check if modern notification system is available
  if (window.showNotification && 
      typeof window.showNotification === 'function' && 
      window.showNotification !== showNotification) {
    return window.showNotification(message, type, options);
  }
  
  // Fallback to a simple notification if modern system isn't available
  console.warn('Modern notification system not available, using fallback');
  
  // Get or create notifications container
  let notifications = document.getElementById('notifications');
  if (!notifications) {
    notifications = document.createElement('div');
    notifications.id = 'notifications';
    notifications.className = 'notifications';
    document.body.appendChild(notifications);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
    </div>
  `;
  
  // Append and auto-remove
  notifications.appendChild(notification);
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, options.duration || 3000);
  
  return notification;
}

/**
 * Clean up old messages from the tracking set
 * @private
 */
function cleanupOldMessages() {
  if (activeNotifications.messages.size > 50) {
    // If we have too many messages stored, clear older ones
    console.log('Cleaning up notification message cache');
    activeNotifications.messages.clear();
    
    // Also clean up categories
    activeNotifications.categories = {};
  }
}

/**
 * Cancel a pending notification before it's shown
 * @param {string} notificationId - The ID of the notification to cancel
 * @returns {boolean} Whether a notification was cancelled
 */
function cancelNotification(notificationId) {
  if (activeNotifications.timeouts[notificationId]) {
    clearTimeout(activeNotifications.timeouts[notificationId]);
    delete activeNotifications.timeouts[notificationId];
    return true;
  }
  return false;
}

/**
 * Group similar notifications into a single notification with a count
 * @param {string} message - The base message
 * @param {string} type - The notification type
 * @param {Object} options - Notification options
 * @returns {Promise<HTMLElement|null>} The notification element or null
 */
function groupNotification(message, type = 'info', options = {}) {
  // Use the category-based notification system with default combineByCategory=true
  return showNotification(message, type, {
    combineByCategory: true,
    ...options
  });
}

/**
 * Show notification only if it's an error
 * @param {string} message - The message to display
 * @param {string} type - The type of notification
 * @param {Object} options - Notification options
 * @returns {Promise<HTMLElement|null>} The notification element or null
 */
function showErrorOnly(message, type = 'info', options = {}) {
  return showNotification(message, type, {
    silent: true,
    ...options
  });
}

/**
 * Clear all notifications of a specific category
 * @param {string} category - The category name to clear
 * @returns {number} Number of notifications cleared
 */
function clearCategoryNotifications(category) {
  if (!activeNotifications.categories[category]) {
    return 0;
  }
  
  let count = 0;
  for (const notification of activeNotifications.categories[category]) {
    notification.classList.add('hide');
    setTimeout(() => notification.remove(), 300);
    count++;
  }
  
  // Clean up category
  delete activeNotifications.categories[category];
  return count;
}

/**
 * Clear all active notifications
 */
function clearAllNotifications() {
  const notifications = document.querySelectorAll('.notification');
  
  notifications.forEach(notification => {
    notification.classList.add('hide');
    setTimeout(() => notification.remove(), 300);
  });
  
  // Reset tracking data
  activeNotifications.messages.clear();
  activeNotifications.categories = {};
  
  // Keep timeouts for pending notifications
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Pre-load audio files to have them ready
  if (activeNotifications.audioEnabled) {
    for (const type in AUDIO_FILES) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = AUDIO_FILES[type];
      audio.volume = 0;
      audio.muted = true;
      
      // Try to load the audio in the background
      try {
        const loadPromise = audio.load();
        if (loadPromise !== undefined) {
          loadPromise.catch(err => {
            console.warn(`Could not preload notification sound: ${type}`, err);
          });
        }
      } catch (e) {
        console.warn(`Error preloading audio: ${type}`, e);
      }
    }
  }
});

// Export the functions (for ESM modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showNotification,
    cancelNotification,
    groupNotification,
    clearCategoryNotifications,
    clearAllNotifications,
    showErrorOnly,
    setSilentMode,
    setAudioEnabled
  };
}

// Make functions globally available
window.NotificationManager = {
  show: showNotification,
  cancel: cancelNotification,
  group: groupNotification,
  clearCategory: clearCategoryNotifications,
  clearAll: clearAllNotifications,
  errorOnly: showErrorOnly,
  setSilent: setSilentMode,
  setAudio: setAudioEnabled,
  playSound: playNotificationSound
}; 