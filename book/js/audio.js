import BlockContent from './BlockContent.js';

/**
 * Audio.js - Handles all audio functionality for the interactive book
 * Manages both notes panel background music and content block-specific audio
 */

// Global variable to store audio data
let audioData = null;
const blockContent = new BlockContent();

// Load audio data from blocks
async function loadAudioData() {
  try {
    const blocks = blockContent.getAllBlocks();
    audioData = {
      blocks: {},
      backgroundMusic: {
        default: '/audio/background/ambient-main.mp3',
        notes: '/audio/background/meditation-flow.mp3'
      }
    };

    // Convert block content to audio data format
    Object.entries(blocks).forEach(([section, sectionBlocks]) => {
      sectionBlocks.forEach(block => {
        const blockId = `${section}-${block.id}`;
        audioData.blocks[blockId] = {
          background: block.audioUrl
        };
      });
    });

    // Initialize audio elements
    Object.entries(audioData.blocks).forEach(([blockId, blockAudio]) => {
      if (blockAudio.background) {
        const audio = new Audio();
        audio.src = blockAudio.background;
        audio.preload = 'none';
        audio.id = `block-audio-${blockId}`;
        audio.loop = true;
        document.getElementById('audio-container').appendChild(audio);
      }
    });

    return audioData;
  } catch (error) {
    console.error('Error loading audio data:', error);
    return {
      blocks: {},
      backgroundMusic: {
        default: '/audio/background/fallback-ambient.mp3',
        notes: '/audio/background/fallback-meditation.mp3'
      }
    };
  }
}

// Initialize audio functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Load audio data first
  await loadAudioData();
  
  // Initialize audio controls for notes panel
  initNotesAudioControls();
  
  // Initialize audio controls for individual content blocks
  initBlockAudioControls();
  
  // Set up global audio control
  setupGlobalAudioControls();
});

/**
 * Initialize audio controls for the notes panel
 */
function initNotesAudioControls() {
  const notesPanel = document.getElementById('notes-panel');
  const audio = document.getElementById('notes-background-music');
  
  if (!notesPanel || !audio) return;
  
  // Check if the music-controls element exists, if not, create it
  let musicControls = notesPanel.querySelector('.music-controls');
  
  if (!musicControls) {
    // Create music controls if they don't exist
    const notesHeader = notesPanel.querySelector('.notes-header');
    if (!notesHeader) return;
    
    // Create notes controls container if it doesn't exist
    let notesControls = notesHeader.querySelector('.notes-controls');
    if (!notesControls) {
      notesControls = document.createElement('div');
      notesControls.className = 'notes-controls';
      
      // Insert before the close button
      const closeBtn = notesHeader.querySelector('.close-notes');
      if (closeBtn) {
        notesHeader.insertBefore(notesControls, closeBtn);
      } else {
        notesHeader.appendChild(notesControls);
      }
    }
    
    // Create music controls
    musicControls = document.createElement('div');
    musicControls.className = 'music-controls';
    musicControls.innerHTML = `
      <button id="toggle-music" class="music-toggle" title="Toggle background music">
        <i class="fas fa-music"></i>
      </button>
      <div class="volume-control">
        <i class="fas fa-volume-down"></i>
        <input type="range" id="music-volume" min="0" max="100" value="30">
        <i class="fas fa-volume-up"></i>
      </div>
    `;
    
    notesControls.appendChild(musicControls);
  }
  
  // Make sure expand notes button exists
  if (!document.getElementById('expand-notes')) {
    const expandBtn = document.createElement('button');
    expandBtn.id = 'expand-notes';
    expandBtn.className = 'expand-notes';
    expandBtn.title = 'Expand to fullscreen';
    expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
    
    const notesControls = notesPanel.querySelector('.notes-controls');
    if (notesControls) {
      notesControls.appendChild(expandBtn);
    } else {
      const notesHeader = notesPanel.querySelector('.notes-header');
      if (notesHeader) {
        const closeBtn = notesHeader.querySelector('.close-notes');
        if (closeBtn) {
          notesHeader.insertBefore(expandBtn, closeBtn);
        } else {
          notesHeader.appendChild(expandBtn);
        }
      }
    }
    
    // Add expand functionality
    expandBtn.addEventListener('click', function() {
      notesPanel.classList.toggle('fullscreen');
      
      // Change icon based on state
      const icon = this.querySelector('i');
      if (notesPanel.classList.contains('fullscreen')) {
        icon.classList.remove('fa-expand');
        icon.classList.add('fa-compress');
        this.title = 'Exit fullscreen';
      } else {
        icon.classList.remove('fa-compress');
        icon.classList.add('fa-expand');
        this.title = 'Expand to fullscreen';
      }
    });
  }
  
  const toggleMusicBtn = document.getElementById('toggle-music');
  const volumeSlider = document.getElementById('music-volume');
  
  if (!toggleMusicBtn || !volumeSlider) return;
  
  // Set initial values from localStorage if available
  const savedVolume = localStorage.getItem('notes_music_volume');
  const musicEnabled = localStorage.getItem('notes_music_enabled') === 'true';
  
  // Set initial volume
  if (savedVolume) {
    volumeSlider.value = savedVolume;
    audio.volume = parseFloat(savedVolume) / 100;
  } else {
    // Default volume
    audio.volume = 0.3;
    volumeSlider.value = 30;
  }
  
  // Initialize music state
  if (musicEnabled) {
    toggleMusicBtn.classList.add('active');
    // Only try to play if user has interacted with the page before
    setTimeout(() => {
      if (document.documentElement.classList.contains('user-interaction')) {
        playNotesBackgroundMusic();
      }
    }, 100);
  }
  
  // Remove any existing event listeners by cloning the button
  const newToggleBtn = toggleMusicBtn.cloneNode(true);
  toggleMusicBtn.parentNode.replaceChild(newToggleBtn, toggleMusicBtn);
  
  // Use the new button for event handling
  newToggleBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Mark that user has interacted
    document.documentElement.classList.add('user-interaction');
    
    // Try to play/pause the audio
    if (audio.paused) {
      // Show loading state
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      
      // Stop any currently playing block audio
      stopAllBlockAudio();
      
      // Try to play the audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Success - update UI
          this.innerHTML = '<i class="fas fa-music"></i>';
          this.classList.add('active');
          localStorage.setItem('notes_music_enabled', 'true');
        }).catch(error => {
          // Failed to play
          this.innerHTML = '<i class="fas fa-music"></i>';
          console.error('Error playing audio:', error);
          
          if (error.name === 'NotAllowedError') {
            showNotification('Click again to play background music. Browsers require user interaction before playing audio.', 'info');
          }
        });
      }
    } else {
      // Pause the audio
      audio.pause();
      this.classList.remove('active');
      localStorage.setItem('notes_music_enabled', 'false');
    }
  });
  
  // Volume control - clone to ensure no duplicate event listeners
  const newVolumeSlider = volumeSlider.cloneNode(true);
  volumeSlider.parentNode.replaceChild(newVolumeSlider, volumeSlider);
  
  newVolumeSlider.addEventListener('input', function() {
    const volume = this.value / 100;
    audio.volume = volume;
    localStorage.setItem('notes_music_volume', this.value);
    
    // If music button is active but audio is paused, try to play
    if (newToggleBtn.classList.contains('active') && audio.paused) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio after volume change:', error);
        });
      }
    }
  });
  
  // Track when notes panel is opened
  const noteButtons = document.querySelectorAll('.notes');
  
  // Play music when notes panel opens if enabled
  noteButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Add a data attribute to track user interaction
      document.documentElement.classList.add('user-interaction');
      
      // If music is enabled but not playing, try to play it
      if (newToggleBtn.classList.contains('active') && audio.paused) {
        // Add a short delay to ensure smooth transition
        setTimeout(() => {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Error playing audio when opening notes:', error);
            });
          }
        }, 300);
      }
    });
  });
  
  // Preload audio files to ensure quicker response
  audio.load();
}

/**
 * Initialize audio controls for individual content blocks
 */
function initBlockAudioControls() {
  const blockMusicButtons = document.querySelectorAll('.block-music');
  
  blockMusicButtons.forEach(btn => {
    // Clone button to remove existing listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Add event listener to new button
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Mark that user has interacted
      document.documentElement.classList.add('user-interaction');
      
      // Get section and index
      const section = this.getAttribute('data-section');
      const index = this.getAttribute('data-index');
      
      // Get the corresponding audio element
      const audioId = `block-audio-${section.split('-')[0]}-${index}`;
      const audio = document.getElementById(audioId);
      
      if (!audio) {
        showNotification('Audio track not found', 'error');
        return;
      }
      
      // Check if this audio is already playing
      if (!audio.paused) {
        // If it's playing, pause it
        audio.pause();
        this.classList.remove('active');
        showNotification('Music paused', 'info');
      } else {
        // If not playing, stop all other audio first
        stopAllAudio();
        
        // Show loading state
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Then play this audio
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // Success - update UI
            this.innerHTML = '<i class="fas fa-music"></i>';
            this.classList.add('active');
            showNotification('Playing background music', 'success');
            
            // Automatically set volume
            audio.volume = 0.3;
            
            // Save last played audio
            localStorage.setItem('last_played_audio_section', section);
            localStorage.setItem('last_played_audio_index', index);
            
            // Remove last-played class from all buttons
            document.querySelectorAll('.block-music.last-played').forEach(button => {
              button.classList.remove('last-played');
            });
            
            // Add last-played class to this button
            this.classList.add('last-played');
          }).catch(error => {
            // Failed to play
            this.innerHTML = '<i class="fas fa-music"></i>';
            console.error('Error playing block audio:', error);
            
            if (error.name === 'NotAllowedError') {
              showNotification('Click again to play music. Browsers require user interaction.', 'info');
            }
          });
        }
      }
    });
  });
  
  // Add ended event listener to all audio elements
  document.querySelectorAll('audio[id^="block-audio-"]').forEach(audio => {
    audio.addEventListener('ended', function() {
      // Extract section and index from the audio ID
      const idParts = this.id.split('-');
      if (idParts.length >= 3) {
        const section = `${idParts[1]}-section`;
        const index = idParts[2]; 
        const btn = document.querySelector(`.block-music[data-section="${section}"][data-index="${index}"]`);
        
        if (btn) {
          btn.classList.remove('active');
        }
      }
    });
  });
}

/**
 * Set up global audio control functionality
 */
function setupGlobalAudioControls() {
  // Restore last played audio if any
  const lastSection = localStorage.getItem('last_played_audio_section');
  const lastIndex = localStorage.getItem('last_played_audio_index');
  
  if (lastSection && lastIndex) {
    // Find the button that corresponds to the last played audio
    const btn = document.querySelector(`.block-music[data-section="${lastSection}"][data-index="${lastIndex}"]`);
    
    // Get the corresponding audio element
    const audioId = `block-audio-${lastSection.split('-')[0]}-${lastIndex}`;
    const audio = document.getElementById(audioId);
    
    if (btn && audio) {
      // Mark button as active
      btn.classList.add('last-played');
    }
  }
  
  // Pause all audio when user navigates away from page
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      pauseAllAudio();
    }
  });
  
  // Handle keyboard shortcut M to toggle last played audio
  document.addEventListener('keydown', function(e) {
    // Check if the user is not typing in an input field
    if (e.key === 'm' && !isUserTyping()) {
      // Toggle the last played audio
      const lastSection = localStorage.getItem('last_played_audio_section');
      const lastIndex = localStorage.getItem('last_played_audio_index');
      
      if (lastSection && lastIndex) {
        const btn = document.querySelector(`.block-music[data-section="${lastSection}"][data-index="${lastIndex}"]`);
        if (btn) {
          btn.click();
        }
      }
    }
  });
}

/**
 * Play notes panel background music
 */
function playNotesBackgroundMusic() {
  const audio = document.getElementById('notes-background-music');
  const toggleMusicBtn = document.getElementById('toggle-music');
  
  if (!audio || !toggleMusicBtn) return;
  
  // Only attempt to play if user has interacted with the page
  if (!document.documentElement.classList.contains('user-interaction')) {
    return;
  }
  
  // Try to play the audio
  const playPromise = audio.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      // Success - update UI
      toggleMusicBtn.innerHTML = '<i class="fas fa-music"></i>';
      toggleMusicBtn.classList.add('active');
    }).catch(error => {
      // Failed to play - normal behavior in browsers that restrict autoplay
      console.error('Error auto-playing notes background music:', error);
    });
  }
}

/**
 * Stop all audio elements
 */
function stopAllAudio() {
  // Stop notes background music
  const notesBackgroundMusic = document.getElementById('notes-background-music');
  if (notesBackgroundMusic) {
    notesBackgroundMusic.pause();
    notesBackgroundMusic.currentTime = 0;
    
    const musicToggle = document.getElementById('toggle-music');
    if (musicToggle) {
      musicToggle.classList.remove('active');
      localStorage.setItem('notes_music_enabled', 'false');
    }
  }
  
  // Stop all block audio
  stopAllBlockAudio();
}

/**
 * Pause all audio elements without resetting their playback position
 */
function pauseAllAudio() {
  // Pause notes background music if playing
  const notesBackgroundMusic = document.getElementById('notes-background-music');
  if (notesBackgroundMusic && !notesBackgroundMusic.paused) {
    notesBackgroundMusic.pause();
    // Do not update UI here - when the user comes back,
    // we might want to resume playback
  }
  
  // Pause all block audio
  document.querySelectorAll('audio[id^="block-audio-"]').forEach(audio => {
    if (!audio.paused) {
      audio.pause();
      
      // Update UI for the corresponding button
      const idParts = audio.id.split('-');
      if (idParts.length >= 3) {
        const section = `${idParts[1]}-section`;
        const index = idParts[2]; 
        const btn = document.querySelector(`.block-music[data-section="${section}"][data-index="${index}"]`);
        
        if (btn) {
          btn.classList.remove('active');
        }
      }
    }
  });
}

/**
 * Stop all block audio elements
 */
function stopAllBlockAudio() {
  document.querySelectorAll('audio[id^="block-audio-"]').forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
    
    // Update UI for the corresponding button
    const idParts = audio.id.split('-');
    if (idParts.length >= 3) {
      const section = `${idParts[1]}-section`;
      const index = idParts[2];
      const btn = document.querySelector(`.block-music[data-section="${section}"][data-index="${index}"]`);
      
      if (btn) {
        btn.classList.remove('active');
      }
    }
  });
}

/**
 * Check if the user is currently typing in an input field
 * @returns {boolean} - True if user is typing
 */
function isUserTyping() {
  const activeElement = document.activeElement;
  return activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.isContentEditable
  );
}

/**
 * Show notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, info)
 * @returns {HTMLElement} - The notification element
 */
function showNotification(message, type = 'info') {
  // Check if function exists in book.js first
  if (window.showNotification && typeof window.showNotification === 'function') {
    return window.showNotification(message, type);
  }
  
  // Otherwise implement a simple version here
  const notifications = document.getElementById('notifications');
  
  if (!notifications) return;
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-header">
      <div class="notification-app-icon"><i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}"></i></div>
      <div class="notification-app-name">${type === 'success' ? 'Success' : type === 'error' ? 'Alert' : 'Info'}</div>
      <div class="notification-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    </div>
    <div class="notification-content">
      <span>${message}</span>
    </div>
    <button class="notification-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Add close button functionality
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.classList.add('hide');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
  }
  
  // Add swipe functionality
  let touchStartX = 0;
  let touchStartY = 0;
  
  notification.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    notification.classList.add('swiping');
  }, { passive: true });
  
  notification.addEventListener('touchmove', e => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    notification.style.transform = `translateX(${deltaX}px)`;
    
    // Decrease opacity as it's swiped away
    const opacity = Math.max(0, 1 - Math.abs(deltaX) / 150);
    notification.style.opacity = opacity;
  }, { passive: true });
  
  notification.addEventListener('touchend', e => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    notification.classList.remove('swiping');
    
    if (Math.abs(deltaX) > 50) {
      // Swiped far enough to dismiss
      notification.classList.add(deltaX > 0 ? 'swipe-right' : 'swipe-left');
      setTimeout(() => {
        notification.remove();
      }, 300);
    } else {
      // Not swiped far enough, reset position
      notification.style.transform = '';
      notification.style.opacity = '';
    }
  }, { passive: true });
  
  notifications.appendChild(notification);
  
  // Auto remove after delay
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.add('hide');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, 3000);
  
  return notification;
}

/**
 * Adjusts the height of the textarea dynamically based on content
 * This function is called when text is entered
 */
function adjustTextareaHeight(textarea) {
  if (!textarea) return;
  
  // Store scroll position to prevent page jumping
  const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
  
  // Reset height to allow proper calculation (important for shrinking)
  textarea.style.height = 'auto';
  
  // Calculate required height based on content
  const contentHeight = textarea.scrollHeight;
  
  // Get minimum height from CSS or use default
  const computedStyle = window.getComputedStyle(textarea);
  const minHeightPx = computedStyle.getPropertyValue('min-height');
  const minHeight = parseInt(minHeightPx) || 200;
  
  // Set the height to the larger of content height or min height
  const newHeight = Math.max(contentHeight, minHeight);
  
  // Apply the new height
  textarea.style.height = newHeight + 'px';
  
  // Handle notes panel resizing
  const notesPanel = document.getElementById('notes-panel');
  if (notesPanel) {
    // Only adjust panel dimensions when not in fullscreen mode
    if (!notesPanel.classList.contains('fullscreen')) {
      // Get elements within the notes panel
      const notesHeader = notesPanel.querySelector('.notes-header');
      const notesContent = notesPanel.querySelector('.notes-content');
      const notesActions = notesPanel.querySelector('.notes-actions');
      
      // Calculate heights
      const headerHeight = notesHeader ? notesHeader.offsetHeight : 0;
      const actionsHeight = notesActions ? notesActions.offsetHeight : 0;
      
      // Get content padding (top + bottom)
      const contentStyle = window.getComputedStyle(notesContent);
      const contentPaddingTop = parseInt(contentStyle.paddingTop) || 0;
      const contentPaddingBottom = parseInt(contentStyle.paddingBottom) || 0;
      const contentPadding = contentPaddingTop + contentPaddingBottom;
      
      // Calculate viewport constraints
      const viewportHeight = window.innerHeight;
      const maxPanelHeight = Math.min(viewportHeight * 0.85, viewportHeight - 40);
      
      // Calculate total content height
      const totalHeight = headerHeight + newHeight + actionsHeight + contentPadding + 20; // Extra buffer
      
      if (totalHeight > maxPanelHeight) {
        // Content is too tall, limit panel height and enable scrolling on textarea
        notesPanel.style.height = maxPanelHeight + 'px';
        
        // Calculate available height for textarea
        const availableTextareaHeight = maxPanelHeight - headerHeight - actionsHeight - contentPadding - 20;
        
        // Enable scrolling on textarea if needed
        textarea.style.height = availableTextareaHeight + 'px';
        textarea.style.overflowY = 'auto';
      } else {
        // Content fits within maxPanelHeight, adjust panel to fit content
        notesPanel.style.height = totalHeight + 'px';
        textarea.style.overflowY = 'hidden';
      }
    } else {
      // In fullscreen mode
      const maxTextareaHeight = window.innerHeight * 0.7;
      
      if (newHeight > maxTextareaHeight) {
        textarea.style.height = maxTextareaHeight + 'px';
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }
  
  // Restore scroll position
  window.scrollTo(0, scrollPos);
}

// Add listener for textarea resizing on input
document.addEventListener('DOMContentLoaded', function() {
  const pageNotesTextarea = document.getElementById('page-notes');
  if (pageNotesTextarea) {
    // Set initial height immediately and again after a delay
    adjustTextareaHeight(pageNotesTextarea);
    setTimeout(() => adjustTextareaHeight(pageNotesTextarea), 100);
    
    // Add input listener for real-time adjustment
    pageNotesTextarea.addEventListener('input', function() {
      requestAnimationFrame(() => adjustTextareaHeight(this));
    });
    
    // Add paste event listener to handle pasted content
    pageNotesTextarea.addEventListener('paste', function() {
      // Adjust height after paste is processed
      setTimeout(() => adjustTextareaHeight(this), 0);
    });
    
    // Adjust when focus is received
    pageNotesTextarea.addEventListener('focus', function() {
      requestAnimationFrame(() => adjustTextareaHeight(this));
    });
    
    // Also adjust when the notes panel is opened
    const noteButtons = document.querySelectorAll('.notes');
    noteButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        // Try immediate adjustment
        adjustTextareaHeight(pageNotesTextarea);
        
        // And also after a delay to ensure panel is visible
        setTimeout(() => adjustTextareaHeight(pageNotesTextarea), 100);
        setTimeout(() => adjustTextareaHeight(pageNotesTextarea), 300);
      });
    });
    
    // Handle window resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
      // Do immediate adjustment
      adjustTextareaHeight(pageNotesTextarea);
      
      // Debounce full resize calculations
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        adjustTextareaHeight(pageNotesTextarea);
      }, 100);
    });
    
    // Adjust height when notesPanel changes fullscreen state
    const expandNotesBtn = document.getElementById('expand-notes');
    if (expandNotesBtn) {
      expandNotesBtn.addEventListener('click', function() {
        // Immediate initial adjustment
        adjustTextareaHeight(pageNotesTextarea);
        
        // And additional adjustments during/after transition
        setTimeout(() => adjustTextareaHeight(pageNotesTextarea), 50);
        setTimeout(() => adjustTextareaHeight(pageNotesTextarea), 150);
        setTimeout(() => adjustTextareaHeight(pageNotesTextarea), 300);
      });
    }
    
    // Adjust height when window loads to ensure all resources are computed
    window.addEventListener('load', function() {
      adjustTextareaHeight(pageNotesTextarea);
    });
  }
});

// Add function to play block-specific audio
function playBlockAudio(blockId) {
  if (!audioData || !audioData.blocks[blockId]) {
    console.warn(`No audio data found for block: ${blockId}`);
    return;
  }

  // Stop any currently playing block audio
  stopAllBlockAudio();

  const blockAudio = document.getElementById(`block-audio-${blockId}`);
  if (blockAudio) {
    blockAudio.play().catch(error => {
      console.error('Error playing block audio:', error);
    });
  }
}