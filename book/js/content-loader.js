/**
 * Content Loader Utility
 * This module provides functions for loading animations and indicators
 */

// Keep track of active loaders
const activeLoaders = {};
let loaderCounter = 0;

/**
 * ContentLoader - Namespace for content loading utilities
 */
const ContentLoader = {
  /**
   * Show a loader in a container
   * @param {HTMLElement} container - The container to show the loader in
   * @param {Object} options - Configuration options
   * @param {string} options.loaderText - Short text label for the loader (e.g., "YouTube")
   * @param {string} options.text - Description text to display (e.g., "Loading content...")
   * @param {number} options.minDisplayTime - Minimum time to display loader in ms
   * @returns {string} loaderId - An ID to reference this loader
   */
  show: function(container, options = {}) {
    // Default options
    const defaults = {
      loaderText: "Loading",
      text: "Loading content...",
      minDisplayTime: 700
    };
    
    const settings = { ...defaults, ...options };
    const loaderId = `loader-${++loaderCounter}`;
    
    // Create loader element
    const loader = document.createElement('div');
    loader.className = 'simple-loader';
    loader.id = loaderId;
    loader.innerHTML = `
      <div class="loader-spinner"></div>
      <div class="loader-text">
        <strong>${settings.loaderText}</strong>
        <span>${settings.text}</span>
      </div>
    `;
    
    // Add to container
    if (container instanceof HTMLElement) {
      // Check position styling of container
      const position = window.getComputedStyle(container).position;
      if (position === 'static') {
        container.style.position = 'relative';
      }
      
      container.appendChild(loader);
      
      // Store the loader info
      activeLoaders[loaderId] = {
        element: loader,
        startTime: Date.now(),
        minDisplayTime: settings.minDisplayTime
      };
      
      return loaderId;
    } else {
      console.error('Container is not a valid HTML element');
      return null;
    }
  },
  
  /**
   * Hide a loader by ID
   * @param {string} loaderId - The ID of the loader to hide
   */
  hide: function(loaderId) {
    const loaderInfo = activeLoaders[loaderId];
    
    if (!loaderInfo) {
      console.warn(`Loader ${loaderId} not found or already removed`);
      return;
    }
    
    const { element, startTime, minDisplayTime } = loaderInfo;
    const elapsedTime = Date.now() - startTime;
    
    // Ensure the loader is displayed for at least the minimum time
    if (elapsedTime < minDisplayTime) {
      setTimeout(() => {
        this.removeLoader(loaderId, element);
      }, minDisplayTime - elapsedTime);
    } else {
      this.removeLoader(loaderId, element);
    }
  },
  
  /**
   * Remove loader from DOM and clean up
   * @private
   */
  removeLoader: function(loaderId, element) {
    // Fade out animation
    element.style.opacity = '0';
    
    // Remove after animation
    setTimeout(() => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
      delete activeLoaders[loaderId];
    }, 300);
  },
  
  /**
   * Show empty content message
   * @param {HTMLElement} container - The container to show the message in
   * @param {string} message - The message to display
   * @param {string} icon - FontAwesome icon class
   */
  showEmptyMessage: function(container, message, icon = 'fas fa-info-circle') {
    if (!(container instanceof HTMLElement)) {
      console.error('Container is not a valid HTML element');
      return;
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'empty-content-message';
    messageElement.innerHTML = `
      <div class="empty-icon"><i class="${icon}"></i></div>
      <p>${message}</p>
    `;
    
    // Clear container and add message
    container.innerHTML = '';
    container.appendChild(messageElement);
  }
};

// Make ContentLoader available globally
window.ContentLoader = ContentLoader; 