// Media functionality that builds on top of book.js
document.addEventListener('DOMContentLoaded', function() {
  // Don't re-initialize scroll sections if book.js is handling it
  // Instead, focus on customizations for media elements
  initYouTubeAPI();
  initCanvaEmbeds();
  initMixedMediaToggle();
  initSplitView();
  
  // Setup universal media containers
  initUniversalMediaContainers();
  
  // Enable smooth scrolling
  enhanceScrollPerformance();
  
  // This helps ensure page visibility issues are fixed
  setTimeout(() => {
    // Force refresh of ScrollTrigger to fix any scroll issues
    ScrollTrigger.refresh();
  }, 1000);
});

// Enhance scroll performance
function enhanceScrollPerformance() {
  // Set default ScrollTrigger settings for smoother animations
  gsap.config({
    autoSleep: 60,
    force3D: true,
    nullTargetWarn: false
  });
  
  // Configure ScrollTrigger defaults
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize"
  });
  
  // Add smooth scroll effect to page navigation
  const navButtons = document.querySelectorAll('.nav-btn, .toc-item');
  navButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      // The actual navigation is handled by book.js, 
      // this just adds a smoother feel to the transitions
      gsap.to(window, {
        duration: 0.1,
        ease: "power2.out",
        onComplete: () => {
          // Let default navigation happen
        }
      });
    });
  });
  
  // Optimize all scroll sections
  optimizeScrollSections();
}

// Optimize scroll sections for smoother performance
function optimizeScrollSections() {
  const scrollSections = document.querySelectorAll('.scroll-section');
  
  scrollSections.forEach(section => {
    // Add hardware acceleration
    gsap.set(section, {
      willChange: "transform",
      force3D: true
    });
    
    // Add hardware acceleration to items
    const items = section.querySelectorAll('.item');
    gsap.set(items, {
      willChange: "transform, opacity",
      force3D: true
    });
    
    // Preload images and videos for smoother transitions
    const mediaElements = section.querySelectorAll('img, video, iframe');
    mediaElements.forEach(media => {
      if (media.tagName === 'IMG' && !media.complete) {
        media.setAttribute('loading', 'eager');
      } else if (media.tagName === 'VIDEO') {
        media.setAttribute('preload', 'auto');
      }
    });
  });
}

// Store YouTube players
let ytPlayers = {};

// Initialize YouTube API
function initYouTubeAPI() {
  // Make sure function isn't redefined if already set by another script
  if (window.onYouTubeIframeAPIReady) {
    const originalYTReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
      originalYTReady();
      console.log('YouTube API Ready - Media Book');
      initYouTubePlayers();
    };
  } else {
    window.onYouTubeIframeAPIReady = function() {
      console.log('YouTube API Ready');
      initYouTubePlayers();
    };
  }
  
  // Setup play/pause buttons
  setupMediaControls();
}

// Initialize all YouTube players
function initYouTubePlayers() {
  const youtubeIframes = document.querySelectorAll('.youtube-iframe');
  
  youtubeIframes.forEach((iframe, index) => {
    const videoId = extractYouTubeVideoId(iframe.src);
    const playerId = 'youtube-player-' + index;
    
    // Set an ID on the iframe to reference it
    iframe.id = playerId;
    
    // Create YouTube player when API is ready
    ytPlayers[index] = new YT.Player(playerId, {
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onError': onPlayerError
      }
    });
    
    // Add loaded class to container
    const container = iframe.closest('.youtube-container, .youtube-wrapper');
    if (container) {
      container.classList.add('loaded');
    }
  });
  
  // Force a ScrollTrigger refresh after players are initialized
  if (window.ScrollTrigger) {
    setTimeout(() => {
      ScrollTrigger.refresh();
      console.log("ScrollTrigger refreshed after YouTube players initialized");
    }, 500);
  }
}

// Extract YouTube video ID from URL
function extractYouTubeVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// YouTube player ready event
function onPlayerReady(event) {
  // Optional: Mute videos initially
  event.target.mute();
  
  // Update the play/pause button state
  updatePlayButtonState(event.target);
}

// YouTube player state change event
function onPlayerStateChange(event) {
  // Update the play/pause button state based on player state
  updatePlayButtonState(event.target);
}

// YouTube player error event
function onPlayerError(event) {
  console.error('YouTube Player Error:', event.data);
  
  // Show error message in player
  const playerElement = event.target.getIframe();
  const container = playerElement.closest('.youtube-container, .youtube-wrapper');
  
  if (container) {
    // Create error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'youtube-error';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <p>Sorry, this video cannot be played. It may be unavailable or restricted.</p>
      <button class="retry-btn">Try Again</button>
    `;
    
    container.appendChild(errorDiv);
    
    // Add retry button functionality
    const retryBtn = errorDiv.querySelector('.retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', function() {
        errorDiv.remove();
        event.target.loadVideoById(extractYouTubeVideoId(playerElement.src));
      });
    }
  }
}

// Update play/pause button based on player state
function updatePlayButtonState(player) {
  // Find the iframe element
  const iframe = player.getIframe();
  
  // Find index from iframe id
  const idMatch = iframe.id.match(/youtube-player-(\d+)/);
  if (!idMatch) return;
  
  const index = idMatch[1];
  
  // Find corresponding play button
  const playButton = document.querySelector(`.play-pause-btn[data-index="${index}"]`);
  if (!playButton) return;
  
  // Update button based on player state
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
    playButton.classList.add('active');
  } else {
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    playButton.classList.remove('active');
  }
}

// Setup play/pause and mute buttons
function setupMediaControls() {
  // Play/Pause buttons
  const playButtons = document.querySelectorAll('.play-pause-btn');
  playButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const index = this.getAttribute('data-index');
      const player = ytPlayers[index];
      
      if (player) {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
          player.pauseVideo();
        } else {
          player.playVideo();
        }
      }
    });
  });
  
  // Mute buttons
  const muteButtons = document.querySelectorAll('.mute-btn');
  muteButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const index = this.getAttribute('data-index');
      const player = ytPlayers[index];
      
      if (player) {
        if (player.isMuted()) {
          player.unMute();
          this.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
          player.mute();
          this.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
      }
    });
  });
}

// Initialize Canva embeds
function initCanvaEmbeds() {
  const canvaIframes = document.querySelectorAll('.canva-iframe');
  
  canvaIframes.forEach(iframe => {
    // Mark as loaded when iframe loads
    iframe.addEventListener('load', function() {
      const container = this.closest('.canva-container');
      if (container) {
        container.classList.add('loaded');
      }
    });
    
    // Add error handling
    iframe.addEventListener('error', function() {
      console.error('Canva embed failed to load');
      const container = this.closest('.canva-container');
      if (container) {
        container.innerHTML = `
          <div class="canva-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Sorry, the Canva design could not be loaded.</p>
            <button class="retry-btn">Reload</button>
          </div>
        `;
        
        const retryBtn = container.querySelector('.retry-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', function() {
            // Reload the iframe
            const src = iframe.src;
            iframe.src = '';
            setTimeout(() => {
              iframe.src = src;
            }, 100);
          });
        }
      }
    });
  });
  
  // Add fullscreen toggle to Canva embeds
  const canvaContainers = document.querySelectorAll('.canva-container');
  canvaContainers.forEach(container => {
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'fullscreen-toggle';
    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    
    fullscreenBtn.addEventListener('click', function() {
      const iframe = container.querySelector('.canva-iframe');
      
      if (!document.fullscreenElement) {
        // Open Canva lightbox
        openCanvaLightbox(iframe.src);
      }
    });
    
    container.appendChild(fullscreenBtn);
  });
}

// Open Canva design in lightbox
function openCanvaLightbox(src) {
  // Create lightbox if it doesn't exist
  let lightbox = document.querySelector('.canva-lightbox');
  
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'canva-lightbox';
    lightbox.innerHTML = `
      <div class="canva-lightbox-content">
        <button class="canva-lightbox-close"><i class="fas fa-times"></i></button>
        <iframe class="canva-lightbox-iframe" allowfullscreen></iframe>
      </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Setup close button
    const closeBtn = lightbox.querySelector('.canva-lightbox-close');
    closeBtn.addEventListener('click', function() {
      lightbox.classList.remove('active');
    });
    
    // Close on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
      }
    });
  }
  
  // Set iframe source
  const iframe = lightbox.querySelector('.canva-lightbox-iframe');
  iframe.src = src;
  
  // Show lightbox
  lightbox.classList.add('active');
}

// Initialize mixed media toggle (YouTube/Canva)
function initMixedMediaToggle() {
  const toggleButtons = document.querySelectorAll('.media-toggle-btn');
  
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Get parent item
      const mediaType = this.getAttribute('data-media');
      const mixedItem = this.closest('.mixed-item');
      
      if (!mixedItem) return;
      
      // Update toggle buttons
      const toggleGroup = this.parentElement;
      toggleGroup.querySelectorAll('.media-toggle-btn').forEach(el => {
        el.classList.remove('active');
      });
      this.classList.add('active');
      
      // Set active media type
      mixedItem.setAttribute('data-active-media', mediaType);
      
      // For YouTube: Find the wrapper and make it active if needed
      if (mediaType === 'youtube') {
        const youtubeWrapper = mixedItem.querySelector('.youtube-wrapper');
        if (youtubeWrapper) {
          youtubeWrapper.classList.add('active');
        }
        // Find player and pause/play if needed
        const iframe = youtubeWrapper.querySelector('.youtube-iframe');
        if (iframe) {
          const idMatch = iframe.id.match(/youtube-player-(\d+)/);
          if (idMatch && ytPlayers[idMatch[1]]) {
            ytPlayers[idMatch[1]].playVideo();
          }
        }
      } else {
        // If switching away from YouTube, pause any playing videos
        const youtubeWrapper = mixedItem.querySelector('.youtube-wrapper');
        if (youtubeWrapper) {
          youtubeWrapper.classList.remove('active');
          const iframe = youtubeWrapper.querySelector('.youtube-iframe');
          if (iframe) {
            const idMatch = iframe.id.match(/youtube-player-(\d+)/);
            if (idMatch && ytPlayers[idMatch[1]]) {
              ytPlayers[idMatch[1]].pauseVideo();
            }
          }
        }
      }
    });
  });
}

// Initialize split view functionality
function initSplitView() {
  // Nothing special needed for now - layout handled by CSS
  // Future enhancement could include dynamic resizing
}

// Share functionality
function sharePage(title, text, url) {
  if (navigator.share) {
    navigator.share({
      title: title,
      text: text,
      url: url || window.location.href
    })
    .then(() => showNotification('Successfully shared!', 'success'))
    .catch(error => {
      console.error('Error sharing:', error);
      // Fallback to clipboard
      copyToClipboard(url || window.location.href);
    });
  } else {
    // Fallback for browsers that don't support Web Share API
    copyToClipboard(url || window.location.href);
  }
}

// Copy URL to clipboard
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => showNotification('Link copied to clipboard!', 'success'))
      .catch(err => {
        console.error('Could not copy text: ', err);
        showNotification('Could not copy link', 'error');
      });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      showNotification(successful ? 'Link copied to clipboard!' : 'Copy failed', successful ? 'success' : 'error');
    } catch (err) {
      console.error('Fallback: Could not copy text: ', err);
      showNotification('Could not copy link', 'error');
    }
    
    document.body.removeChild(textArea);
  }
}

// Pause all videos when page is hidden
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Pause all YouTube videos
    for (const index in ytPlayers) {
      if (ytPlayers[index] && ytPlayers[index].pauseVideo) {
        ytPlayers[index].pauseVideo();
      }
    }
  }
});

// Fix any ScrollTrigger issues
function fixScrollTriggerIssues() {
  // Check if any items have incorrect positioning
  const scrollSections = document.querySelectorAll('.scroll-section');
  
  scrollSections.forEach(section => {
    const items = section.querySelectorAll('.item');
    
    // Skip if no items found
    if (!items.length) return;
    
    // Fix vertical/horizontal section items if needed
    const isHorizontal = section.classList.contains('horizontal-section');
    const isVertical = section.classList.contains('vertical-section');
    
    // Check if we need to fix positions
    let needsFix = false;
    
    items.forEach((item, index) => {
      if (index > 0) {
        const style = window.getComputedStyle(item);
        const transform = style.transform;
        
        // Check if transform is missing or incorrect
        if (!transform || transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)') {
          needsFix = true;
        }
      }
    });
    
    // Apply fix if needed
    if (needsFix) {
      console.log(`Fixing scroll section: ${section.id}`);
      
      // Set initial state for items
      items.forEach((item, index) => {
        if (index !== 0) {
          if (isHorizontal) {
            gsap.set(item, { xPercent: 100 });
          } else {
            gsap.set(item, { yPercent: 100 });
          }
        }
      });
      
      // Kill existing ScrollTrigger if any
      const existingInstance = ScrollTrigger.getById(section.id);
      if (existingInstance) {
        existingInstance.kill();
      }
      
      // Create new timeline
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: "top top",
          end: () => `+=${items.length * 100}%`,
          scrub: 1,
          id: section.id,
          invalidateOnRefresh: true,
          onUpdate: function(self) {
            // Update page indicator with core book.js function if available
            if (window.updatePageIndicator) {
              window.updatePageIndicator(self, section, items);
            }
          }
        },
        defaults: { ease: "none" },
      });
      
      // Add animations
      items.forEach((item, index) => {
        timeline.to(item, {
          scale: 0.9,
          borderRadius: "10px",
        });
        
        if (isHorizontal) {
          timeline.to(
            items[index + 1],
            {
              xPercent: 0,
            },
            "<"
          );
        } else {
          timeline.to(
            items[index + 1],
            {
              yPercent: 0,
            },
            "<"
          );
        }
      });
    }
  });
}

// Call this function after a delay to let everything initialize
setTimeout(fixScrollTriggerIssues, 1500);

// Also call it on window load to ensure everything is ready
window.addEventListener('load', function() {
  setTimeout(fixScrollTriggerIssues, 2000);
}); 