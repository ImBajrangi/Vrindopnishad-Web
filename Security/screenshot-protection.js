/**
 * Screenshot Protection Module
 * 
 * Detects and prevents screenshot attempts in modern browsers
 * and provides visual deterrents for content protection.
 */

// Self-executing function for encapsulation
(function() {
  // Configuration
  const config = {
    enabled: true,
    watermarkEnabled: true,
    blurOnInactivity: false,
    detectionEnabled: true,
    messages: {
      screenshot: "Screenshot detected! This content is protected.",
      screencapture: "Screen recording detected! This content is protected.",
      warning: "Please respect copyright. Taking screenshots is not allowed."
    },
    watermark: {
      text: "Protected Content",
      opacity: 0.15,
      fontSize: "16px",
      fontFamily: "Arial, sans-serif",
      color: "#000000",
      backgroundAlpha: 0.0
    },
    inactivityTimeout: 100000 // 100 seconds of inactivity before blur
  };

  // State tracking
  let state = {
    watermarkElement: null,
    blurTimeout: null,
    lastActivityTime: Date.now(),
    screenshotCount: 0
  };

  /**
   * Display a notification about screenshot detection
   * @param {string} message - The message to display
   */
  function showNotification(message) {
    // Use notification manager if available
    if (window.NotificationManager && typeof window.NotificationManager.show === 'function') {
      window.NotificationManager.show(message, 'error', {
        appName: 'Protection',
        duration: 5000
      });
    } else {
      // Fallback to alert with rate limiting (max once per 10 seconds)
      const now = Date.now();
      if (window.lastScreenshotAlert === undefined || (now - window.lastScreenshotAlert > 10000)) {
        window.lastScreenshotAlert = now;
        alert(message);
      }
    }
  }

  /**
   * Create a dynamic watermark across the page
   */
  function createWatermark() {
    if (!config.enabled || !config.watermarkEnabled || state.watermarkElement) return;
    
    // Remove existing watermark if any
    removeWatermark();
    
    // Create watermark container
    const watermark = document.createElement('div');
    watermark.className = 'content-watermark';
    watermark.setAttribute('aria-hidden', 'true');
    
    // Apply watermark styling
    watermark.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2147483646;
      pointer-events: none;
      user-select: none;
      background: rgba(0, 0, 0, ${config.watermark.backgroundAlpha});
      transition: opacity 0.5s ease;
    `;
    
    // Create repeating pattern with watermark text
    const pattern = document.createElement('div');
    pattern.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 100px,
        rgba(200, 200, 200, 0.02) 100px,
        rgba(200, 200, 200, 0.02) 200px
      );
    `;
    
    // Add watermark text elements in a grid pattern
    const numRows = Math.ceil(window.innerHeight / 300);
    const numCols = Math.ceil(window.innerWidth / 400);
    
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        const text = document.createElement('div');
        text.textContent = config.watermark.text;
        text.style.cssText = `
          position: absolute;
          top: ${100 + i * 300}px;
          left: ${150 + j * 400}px;
          font-family: ${config.watermark.fontFamily};
          font-size: ${config.watermark.fontSize};
          color: ${config.watermark.color};
          opacity: ${config.watermark.opacity};
          transform: rotate(-30deg);
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
        `;
        pattern.appendChild(text);
      }
    }
    
    watermark.appendChild(pattern);
    document.body.appendChild(watermark);
    
    // Store reference to watermark
    state.watermarkElement = watermark;
  }

  /**
   * Remove the watermark from the page
   */
  function removeWatermark() {
    if (state.watermarkElement && document.body.contains(state.watermarkElement)) {
      document.body.removeChild(state.watermarkElement);
      state.watermarkElement = null;
    }
  }

  /**
   * Handle screenshot events
   */
  function handleScreenshot() {
    if (!config.enabled || !config.detectionEnabled) return;
    
    // Increment counter
    state.screenshotCount++;
    
    // Show notification
    showNotification(config.messages.screenshot);
    
    // If screenshot count is high, show more persistent watermark
    if (state.screenshotCount > 2) {
      config.watermark.opacity = 0.35; // Make watermark more visible
      createWatermark();
    }
  }

  /**
   * Apply blur to content when inactive
   */
  function applyInactivityBlur() {
    if (!config.enabled || !config.blurOnInactivity) return;
    
    // Check if content should be blurred
    const timeInactive = Date.now() - state.lastActivityTime;
    
    if (timeInactive > config.inactivityTimeout) {
      document.body.classList.add('screenshot-protection-blur');
    }
  }

  /**
   * Remove blur when user is active
   */
  function clearInactivityBlur() {
    state.lastActivityTime = Date.now();
    document.body.classList.remove('screenshot-protection-blur');
    
    // Reset timeout
    if (state.blurTimeout) {
      clearTimeout(state.blurTimeout);
    }
    
    if (config.enabled && config.blurOnInactivity) {
      state.blurTimeout = setTimeout(applyInactivityBlur, config.inactivityTimeout);
    }
  }

  /**
   * Add CSS styles for protection features
   */
  function addProtectionStyles() {
    const style = document.createElement('style');
    style.id = 'screenshot-protection-styles';
    style.textContent = `
      .screenshot-protection-blur {
        filter: blur(8px);
        transition: filter 0.3s ease;
      }
      
      @media print {
        body {
          display: none;
        }
        
        html::before {
          content: "${config.messages.warning}";
          display: block;
          padding: 50px;
          text-align: center;
          font-size: 24px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize screenshot detection
   */
  function initScreenshotDetection() {
    // Try to use the Clipboard API for screenshot detection in Chrome/Edge
    if (navigator.clipboard && window.ClipboardItem) {
      // This doesn't directly detect screenshots but can help with copy detection
      document.addEventListener('copy', function(e) {
        if (!config.enabled || !config.detectionEnabled) return;
        
        const selection = window.getSelection().toString();
        if (!selection || selection.length < 100) {
          // If no significant text is selected, this might be a screenshot attempt
          handleScreenshot();
        }
      });
    }
    
    // Use visibility change for possible screenshot detection
    document.addEventListener('visibilitychange', function() {
      if (!config.enabled || !config.detectionEnabled) return;
      
      if (document.visibilityState === 'hidden') {
        // Potential screenshot (especially on Mac with Cmd+Shift+4)
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
            handleScreenshot();
          }
        }, 300);
      }
    });
    
    // WebKit-specific screenshot detection (Safari)
    window.addEventListener('beforeprint', function() {
      if (config.enabled && config.detectionEnabled) {
        handleScreenshot();
      }
    });

    // Track user activity
    window.addEventListener('mousemove', clearInactivityBlur);
    window.addEventListener('keydown', clearInactivityBlur);
    window.addEventListener('scroll', clearInactivityBlur);
    window.addEventListener('click', clearInactivityBlur);
    window.addEventListener('touchstart', clearInactivityBlur);
    
    // Mobile device orientation change (might indicate screenshot)
    window.addEventListener('deviceorientation', function() {
      if (config.enabled && config.detectionEnabled) {
        handleScreenshot();
      }
    });
  }

  /**
   * Toggle protection features
   * @param {boolean} enabled - Whether protection should be enabled
   */
  function toggleProtection(enabled) {
    config.enabled = enabled;
    
    // Save setting to localStorage if available
    try {
      localStorage.setItem('screenshot_protection_enabled', enabled ? 'true' : 'false');
    } catch (e) {
      console.warn('Could not save protection setting to localStorage');
    }
    
    // Apply or remove watermark
    if (enabled && config.watermarkEnabled) {
      createWatermark();
    } else {
      removeWatermark();
    }
    
    // Apply or clear inactivity blur
    if (enabled && config.blurOnInactivity) {
      if (state.blurTimeout) {
        clearTimeout(state.blurTimeout);
      }
      state.blurTimeout = setTimeout(applyInactivityBlur, config.inactivityTimeout);
    } else {
      if (state.blurTimeout) {
        clearTimeout(state.blurTimeout);
      }
      document.body.classList.remove('screenshot-protection-blur');
    }
    
    // Notify user of change
    if (window.NotificationManager && typeof window.NotificationManager.show === 'function') {
      window.NotificationManager.show(
        enabled ? 'Screenshot protection enabled' : 'Screenshot protection disabled',
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
      const savedSetting = localStorage.getItem('screenshot_protection_enabled');
      if (savedSetting !== null) {
        config.enabled = savedSetting === 'true';
      }
    } catch (e) {
      console.warn('Could not read protection setting from localStorage');
    }
    
    // Add protection styles
    addProtectionStyles();
    
    // Initialize watermark if enabled
    if (config.enabled && config.watermarkEnabled) {
      createWatermark();
    }
    
    // Initialize screenshot detection
    initScreenshotDetection();
    
    // Initialize inactivity blur if enabled
    if (config.enabled && config.blurOnInactivity) {
      state.blurTimeout = setTimeout(applyInactivityBlur, config.inactivityTimeout);
    }
    
    console.log('Screenshot protection ' + (config.enabled ? 'enabled' : 'disabled'));
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  // Expose public methods
  window.ScreenshotProtection = {
    toggle: toggleProtection,
    isEnabled: () => config.enabled,
    configure: (options) => {
      if (options && typeof options === 'object') {
        // Merge settings
        if (options.watermark) {
          Object.assign(config.watermark, options.watermark);
        }
        if (options.messages) {
          Object.assign(config.messages, options.messages);
        }
        
        // Set specific boolean options
        if (options.watermarkEnabled !== undefined) {
          config.watermarkEnabled = !!options.watermarkEnabled;
        }
        if (options.blurOnInactivity !== undefined) {
          config.blurOnInactivity = !!options.blurOnInactivity;
        }
        if (options.detectionEnabled !== undefined) {
          config.detectionEnabled = !!options.detectionEnabled;
        }
        
        // Apply changes if needed
        if (config.enabled) {
          if (config.watermarkEnabled) {
            createWatermark();
          } else {
            removeWatermark();
          }
        }
      }
    }
  };
})(); 