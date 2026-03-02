// --- Unified Link Manager ---
// This file defines all project paths (PROJECT_PATHS) and contains the logic
// to automatically apply those links to any element with a 'data-link' attribute.

const PROJECT_PATHS = {
  // --- Internal Page Links ---
  'home': 'index.html',
  'about': 'Vrindopnishad Web/about code/main/about.html',
  'gallery': 'Vrindopnishad Web/Pictures/main/Gallery.html',
  'pictures': 'Vrindopnishad Web/Pictures/main/photos.html',
  'pdf': 'Vrindopnishad Web/pdf/main/pdf-viewer.html',
  'book': 'Vrindopnishad Web/sketch/main/new-read-me.html',
  'articles': 'Vrindopnishad Web/sketch/main/new-read-me.html', // Fixed filename
  'stack': 'Vrindopnishad Web/Pictures/main/Gallery.html',

  // --- Tool Links ---
  'login-page': 'Projects/LoginPage/loginew.html',
  'cloud-kitchen': 'Projects/Cloud-Kitchen/kitchen.html', // Fixed path
  'vrinda-foods': 'Projects/Cloud-Kitchen/kitchen.html',
  'kitchen-picture': 'Projects/Cloud-Kitchen/kitchen.html',
  'kitchen-staff': 'Projects/Cloud-Kitchen/kitchen.html',
  'kitchen-old': 'Projects/Cloud-Kitchen/kitchen.html',
  'kitchen-modern': 'Projects/Cloud-Kitchen/kitchen.html',
  'dark-reader': 'Vrindopnishad Web/श्री_हरिवंश.html',
  'tourism-map': 'Projects/Vrinda-Tours/vrinda-tours.html', // Redirected to existing tour page
  'chat-animated': 'Projects/Vrinda Chat/vrindaChat.html',
  'chat-embedded': 'Projects/Vrinda Chat/vrindaChat.html',
  'trials-brij-1': 'Projects/Trials/rejected/brij-pilgrimage-web/index.html',
  'trials-brij-2': 'Projects/Trials/rejected/brij-tourism-site/index.html',
  'trials-hotel': 'Projects/Trials/Hotels Booking/index.html',
  'trials-tours': 'Projects/Trials/tours.html',
  'video-player': 'Projects/Video/video-player.html',
  'zen-search': 'Projects/Video/zen-mode.html',
  'service-chat': 'Projects/Vrinda Chat/vrindaChat.html', // Fixed filename
  'web-dev': 'Projects/Web dev/vrinda web dev.html',

  // --- Social Media Links ---
  'instagram': 'https://www.instagram.com/vrindopnishad/',
  'facebook': 'https://www.facebook.com/vrindopnishad/',
  'youtube': 'https://www.youtube.com/@vrindopnishad/',
  'whatsapp_channel': 'https://whatsapp.com/channel/0029Vb6UR3Z9mrGcDXbHzA1Q',
  'pinterest': 'https://www.pinterest.com/vrindopnishad/'
};

// --- Link Application Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const linkElements = document.querySelectorAll('[data-link]');

  console.log(`link-manager.js: Found ${linkElements.length} elements with [data-link].`);

  linkElements.forEach(element => {
    const linkKey = element.getAttribute('data-link');
    const destinationUrl = PROJECT_PATHS[linkKey];

    if (destinationUrl) {
      if (element.tagName === 'A') {
        element.href = destinationUrl;

        // Handle target="_blank" for external links outside the GitHub domain
        if (destinationUrl.startsWith('http://') || destinationUrl.startsWith('https://')) {
          if (!destinationUrl.includes('imbajrangi.github.io/Company/')) {
            element.target = '_blank';
            element.rel = 'noopener noreferrer';
          }
        }
      } else {
        // Handle navigation for non-anchor tags (like buttons or divs)
        element.addEventListener('click', () => {
          if (destinationUrl.startsWith('http://') || destinationUrl.startsWith('https://')) {
            if (!destinationUrl.includes('imbajrangi.github.io/Company/')) {
              window.open(destinationUrl, '_blank');
              return;
            }
          }
          window.location.href = destinationUrl;
        });
      }
    } else {
      console.warn(`link-manager.js: No path found for data-link key: "${linkKey}"`);
    }
  });
});