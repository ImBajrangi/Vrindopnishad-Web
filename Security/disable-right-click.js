/**
 * Disable Right Click Protection
 * Prevents context menu and other right-click actions
 * while allowing legitimate functionality
 */

// Create a self-executing function to avoid global namespace pollution
(function() {
  // Configuration
  const config = {
    enabled: true,
    exceptions: {
      // Elements that should still have right-click functionality
      selectors: [
        '.allow-right-click',
        'input',
        'textarea',
        'select',
        'option',
        '[contenteditable=true]'
      ],
      // Classes of parent elements that should keep right-click functionality
      parentClasses: [
        'code-block',
        'editor',
        'form-control'
      ]
    },
    messages: {
      default: "Right-click is disabled to protect content.",
      image: "Right-clicking on images is disabled for copyright protection.",
      link: "Please use the copy link button instead of right-clicking."
    },
    settings: {
      showNotification: true,
      preventDrag: true,
      preventSelect: true,
      preventCopy: true
    }
  };

  // Track if we've shown notification recently to avoid spam
  let lastNotificationTime = 0;
  const NOTIFICATION_COOLDOWN = 3000; // 3 seconds

  /**
   * Check if an element or its parents match any exceptions
   * @param {HTMLElement} element - The element to check
   * @returns {boolean} - Whether the element is excepted
   */
  function isExceptedElement(element) {
    if (!element) return false;
    
    // Check if the element matches any exception selectors
    if (config.exceptions.selectors.some(selector => 
      element.matches && element.matches(selector)
    )) {
      return true;
    }
    
    // Check if any parent element has an excepted class
    let parent = element;
    while (parent) {
      if (config.exceptions.parentClasses.some(className => 
        parent.classList && parent.classList.contains(className))
      ) {
        return true;
      }
      parent = parent.parentElement;
    }
    
    return false;
  }

  /**
   * Show notification if enabled and cooldown has passed
   * @param {string} message - The message to show
   */
  function showProtectionNotification(message) {
    if (!config.settings.showNotification) return;
    
    const now = Date.now();
    if (now - lastNotificationTime < NOTIFICATION_COOLDOWN) return;
    
    lastNotificationTime = now;
    
    // Use NotificationManager if available
    if (window.NotificationManager && typeof window.NotificationManager.show === 'function') {
      window.NotificationManager.show(message, 'info', {
        appName: 'Content Protection',
        duration: 3000
      });
    } else {
      // Fallback to alert only if no notification system (but with rate limiting)
      if (window.lastAlertTime === undefined || (now - window.lastAlertTime > 10000)) {
        window.lastAlertTime = now;
        alert(message);
      }
    }
  }

  /**
   * Handle context menu events
   * @param {Event} e - The event object
   */
  function handleContextMenu(e) {
    if (!config.enabled) return;
    
    // Check for exceptions
    if (isExceptedElement(e.target)) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Determine message based on element type
    let message = config.messages.default;
    if (e.target.tagName === 'IMG') {
      message = config.messages.image;
    } else if (e.target.tagName === 'A') {
      message = config.messages.link;
    }
    
    showProtectionNotification(message);
    return false;
  }

  /**
   * Handle keydown events to prevent keyboard shortcuts for copy/paste
   * @param {KeyboardEvent} e - The event object
   */
  function handleKeyDown(e) {
    if (!config.enabled || !config.settings.preventCopy) return;
    
    // Check for exceptions
    if (isExceptedElement(e.target)) return;
    
    // Prevent Ctrl+C, Ctrl+S, Ctrl+U, F12
    if (
      (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 83 || e.keyCode === 85)) || 
      e.keyCode === 123
    ) {
      e.preventDefault();
      showProtectionNotification("Keyboard shortcut disabled for content protection.");
      return false;
    }
  }

  /**
   * Handle selection events
   * @param {Event} e - The event object
   */
  function handleSelectStart(e) {
    if (!config.enabled || !config.settings.preventSelect) return;
    
    // Check for exceptions
    if (isExceptedElement(e.target)) return;
    
    e.preventDefault();
    return false;
  }

  /**
   * Handle drag start events
   * @param {DragEvent} e - The event object
   */
  function handleDragStart(e) {
    if (!config.enabled || !config.settings.preventDrag) return;
    
    // Only prevent dragging images and links
    if (e.target.tagName === 'IMG' || e.target.tagName === 'A') {
      e.preventDefault();
      return false;
    }
  }

  /**
   * Enable or disable protection
   * @param {boolean} enabled - Whether protection should be enabled
   */
  function toggleProtection(enabled) {
    config.enabled = enabled;
    
    // Save setting to localStorage if available
    try {
      localStorage.setItem('protection_enabled', enabled ? 'true' : 'false');
    } catch (e) {
      console.warn('Could not save protection setting to localStorage');
    }
    
    // Notify user of change
    if (window.NotificationManager && typeof window.NotificationManager.show === 'function') {
      window.NotificationManager.show(
        enabled ? 'Content protection enabled' : 'Content protection disabled',
        enabled ? 'success' : 'info',
        { appName: 'Protection', duration: 2000 }
      );
    }
  }

  /**
   * Initialize protection
   */
  function init() {
    // Check for saved setting
    try {
      const savedSetting = localStorage.getItem('protection_enabled');
      if (savedSetting !== null) {
        config.enabled = savedSetting === 'true';
      }
    } catch (e) {
      console.warn('Could not read protection setting from localStorage');
    }
    
    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    
    if (config.settings.preventSelect) {
      document.addEventListener('selectstart', handleSelectStart);
    }
    
    console.log('Right-click protection ' + (config.enabled ? 'enabled' : 'disabled'));
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  // Expose public methods
  window.DisableRightClick = {
    toggle: toggleProtection,
    isEnabled: () => config.enabled,
    configure: (options) => {
      if (options && typeof options === 'object') {
        // Merge settings
        if (options.settings) {
          Object.assign(config.settings, options.settings);
        }
        // Merge messages
        if (options.messages) {
          Object.assign(config.messages, options.messages);
        }
        // Add exceptions
        if (options.exceptions && options.exceptions.selectors) {
          config.exceptions.selectors = [
            ...config.exceptions.selectors,
            ...options.exceptions.selectors
          ];
        }
      }
    }
  };
})(); 