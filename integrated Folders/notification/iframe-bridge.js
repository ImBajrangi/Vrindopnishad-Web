/**
 * Iframe Notification Bridge
 * 
 * This script allows iframes to send notification requests to the parent window.
 * Include this script in any iframe content that needs to trigger notifications.
 */

(function() {
  // Global function to show notifications from inside an iframe
  window.showIframeNotification = function(message, type = 'info', options = {}) {
    try {
      // Send a message to the parent window
      window.parent.postMessage({
        action: 'showNotification',
        message: message,
        type: type,
        options: options
      }, '*'); // Using * for origin - in production, specify exact origin for security
      
      return true;
    } catch (error) {
      console.error('Error sending notification to parent window:', error);
      return false;
    }
  };
  
  // Let the parent know this iframe is ready to receive communication
  window.addEventListener('load', function() {
    try {
      window.parent.postMessage({
        action: 'iframeReady',
        source: window.location.href
      }, '*');
    } catch (error) {
      console.error('Error sending ready message to parent:', error);
    }
  });
})(); 