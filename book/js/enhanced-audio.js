/**
 * Enhanced Audio Management for Interactive Book
 * Loads audio data from JSON and enhances music playback
 */

// Global variable to store audio data
let audioData = null;

// Load audio data from JSON file
async function loadAudioData() {
  try {
    const response = await fetch('audio-data.json');
    if (!response.ok) throw new Error('Failed to load audio data');
    audioData = await response.json();
    console.log('Audio data loaded successfully');
    return audioData;
  } catch (error) {
    console.error('Error loading audio data:', error);
    NotificationManager.show('Error loading audio data. Using fallback.', 'error', {
      appName: 'Music Player'
    });
    return { blocks: {}, backgroundMusic: {}, additionalTracks: [] };
  }
}

// Initialize enhanced audio functionality
document.addEventListener('DOMContentLoaded', async function() {
  // Load audio data first
  await loadAudioData();
  
  // Initialize enhanced music buttons
  enhanceMusicButtons();
  
  // Set up floating player UI
  setupFloatingPlayer();
});

// Enhance music buttons with data from JSON
function enhanceMusicButtons() {
  if (!audioData || !audioData.blocks) return;
  
  const blockMusicButtons = document.querySelectorAll('.block-music');
  
  blockMusicButtons.forEach(btn => {
    const section = btn.getAttribute('data-section');
    const index = btn.getAttribute('data-index');
    const blockKey = `${section}-${index}`;
    const trackData = audioData.blocks[blockKey];
    
    if (trackData) {
      // Add data attributes and tooltip
      btn.title = `Play: ${trackData.title} by ${trackData.artist} (${trackData.duration})`;
      btn.setAttribute('data-track-title', trackData.title);
      btn.setAttribute('data-track-artist', trackData.artist);
      
      // Override click handler
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Mark user interaction
        document.documentElement.classList.add('user-interaction');
        
        playTrackFromJson(blockKey, this);
      }, true);
    } else {
      // Track not found in JSON data
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        NotificationManager.show(`No music data found for this section.`, 'error', {
          appName: 'Music Player'
        });
      }, true);
    }
  });
}

// Play audio track from JSON data
function playTrackFromJson(blockKey, button) {
  if (!audioData?.blocks?.[blockKey]) {
    NotificationManager.show('Audio track information not found', 'error', {
      appName: 'Music Player'
    });
    return;
  }
  
  const trackData = audioData.blocks[blockKey];
  const [sectionType, index] = blockKey.split('-');
  const audioId = `block-audio-${sectionType}-${index}`;
  const audio = document.getElementById(audioId);
  
  if (!audio) {
    NotificationManager.show(`Could not find audio element for ${trackData.title}`, 'error', {
      appName: 'Music Player'
    });
    return;
  }
  
  // Check if already playing
  if (!audio.paused) {
    audio.pause();
    button.classList.remove('active');
    NotificationManager.show(`Paused: ${trackData.title}`, 'info', {
      appName: 'Music Player'
    });
    updateFloatingPlayer(null, false);
    return;
  }
  
  // Stop all other audio
  stopAllAudio();
  
  // Show loading state
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  
  // Check if source exists
  const audioSource = trackData.audioSrc;
  if (!audioSource) {
    button.innerHTML = '<i class="fas fa-music"></i>';
    NotificationManager.show(`Music source not found for ${trackData.title}`, 'error', {
      appName: 'Music Player'
    });
    return;
  }
  
  // Set audio source if needed
  if (audio.querySelector('source').src !== trackData.audioSrc) {
    audio.innerHTML = '';
    const source = document.createElement('source');
    source.src = trackData.audioSrc;
    source.type = trackData.audioType || 'audio/mp3';
    audio.appendChild(source);
    audio.load();
  }
  
  // Play audio
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      // Success - update UI
      button.innerHTML = '<i class="fas fa-music"></i>';
      button.classList.add('active');
      
      // Show notification with track info
      NotificationManager.show(`Now playing: ${trackData.title} by ${trackData.artist}`, 'success', {
        appName: 'Music Player'
      });
      
      // Update player UI
      updateFloatingPlayer(trackData, true);
      
      // Set volume
      audio.volume = trackData.volume || 0.3;
      
      // Save as last played
      localStorage.setItem('last_played_audio_section', sectionType);
      localStorage.setItem('last_played_audio_index', index);
      
      // Update button states
      document.querySelectorAll('.block-music.last-played').forEach(btn => {
        btn.classList.remove('last-played');
      });
      button.classList.add('last-played');
      
    }).catch(error => {
      button.innerHTML = '<i class="fas fa-music"></i>';
      console.error('Error playing audio:', error);
      
      if (error.name === 'NotAllowedError') {
        NotificationManager.show('Click again to play. Browser requires user interaction.', 'info', {
          appName: 'Music Player'
        });
      } else if (error.name === 'NotFoundError' || error.name === 'NetworkError') {
        NotificationManager.show(`Music file not found: ${trackData.title}`, 'error', {
          appName: 'Music Player'
        });
      } else if (error.name === 'AbortError') {
        NotificationManager.show('Music playback was interrupted', 'info', {
          appName: 'Music Player'
        });
      } else {
        NotificationManager.show(`Error playing music: ${error.message}`, 'error', {
          appName: 'Music Player'
        });
      }
    });
  } else {
    button.innerHTML = '<i class="fas fa-music"></i>';
    NotificationManager.show('Your browser does not support audio playback', 'error', {
      appName: 'Music Player'
    });
  }
}

// Stop all audio elements
function stopAllAudio() {
  const allAudio = document.querySelectorAll('audio');
  allAudio.forEach(audio => {
    if (!audio.paused) {
      audio.pause();
      
      // Reset any active buttons
      const audioId = audio.id;
      if (audioId && audioId.startsWith('block-audio-')) {
        const [_, sectionType, index] = audioId.split('-');
        if (sectionType && index) {
          const button = document.querySelector(`.block-music[data-section="${sectionType}"][data-index="${index}"]`);
          if (button) {
            button.classList.remove('active');
          }
        }
      }
    }
  });
  
  // Reset music toggle button
  const musicToggle = document.getElementById('toggle-music');
  if (musicToggle) {
    musicToggle.classList.remove('active');
  }
  
  // Hide floating player
  updateFloatingPlayer(null, false);
}

// Set up a minimal floating player UI
function setupFloatingPlayer() {
  // Check if already exists
  if (document.getElementById('floating-player')) return;
  
  // Create player element
  const player = document.createElement('div');
  player.id = 'floating-player';
  player.innerHTML = `
    <div class="player-info">
      <div class="track-title">Select a track</div>
      <div class="track-artist">—</div>
    </div>
    <button class="player-close"><i class="fas fa-times"></i></button>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #floating-player {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(255,255,255,0.9);
      border-radius: 10px;
      padding: 10px 15px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: none;
      z-index: 100;
      max-width: 300px;
    }
    #floating-player.active {
      display: flex;
      animation: fadeIn 0.3s ease;
    }
    .dark-mode #floating-player {
      background: rgba(40,40,40,0.9);
      color: #fff;
    }
    .player-info {
      flex: 1;
    }
    .track-title {
      font-weight: bold;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .track-artist {
      font-size: 12px;
      opacity: 0.7;
    }
    .player-close {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      transition: 0.2s ease;
    }
    .player-close:hover {
      background: rgba(0,0,0,0.1);
      opacity: 1;
    }
    .dark-mode .player-close:hover {
      background: rgba(255,255,255,0.1);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  
  // Append to document
  document.head.appendChild(style);
  document.body.appendChild(player);
  
  // Add event listener to close button
  const closeBtn = player.querySelector('.player-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      // Stop all audio
      stopAllAudio();
      
      // Hide player
      player.classList.remove('active');
    });
  }
}

// Update the floating player UI
function updateFloatingPlayer(trackData, isPlaying) {
  const player = document.getElementById('floating-player');
  if (!player) return;
  
  if (!trackData || !isPlaying) {
    player.classList.remove('active');
    return;
  }
  
  // Update track info
  player.querySelector('.track-title').textContent = trackData.title || 'Unknown Track';
  player.querySelector('.track-artist').textContent = trackData.artist || 'Unknown Artist';
  
  // Show the player
  player.classList.add('active');
}

/**
 * Initialize enhanced music buttons with tooltips and data attributes
 */
function initEnhancedMusicButtons() {
  const blockMusicButtons = document.querySelectorAll('.block-music');
  
  if (!audioData || !audioData.blocks) {
    console.warn('Audio data not loaded. Music buttons will use default behavior.');
    return;
  }
  
  blockMusicButtons.forEach(btn => {
    // Get section and index
    const section = btn.getAttribute('data-section');
    const index = btn.getAttribute('data-index');
    const blockKey = `${section}-${index}`;
    
    // Get track data from JSON
    const trackData = audioData.blocks[blockKey];
    
    if (trackData) {
      // Set button tooltip with track information
      btn.title = `Play: ${trackData.title} (${trackData.duration}) by ${trackData.artist}`;
      
      // Add data attributes with track info
      btn.setAttribute('data-audio-title', trackData.title);
      btn.setAttribute('data-audio-artist', trackData.artist);
      btn.setAttribute('data-audio-duration', trackData.duration);
      
      // Update button appearance
      btn.innerHTML = '<i class="fas fa-music"></i>';
      btn.classList.add('enhanced');
      
      // Replace click handler
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        playEnhancedAudio(blockKey, this);
      });
    }
  });
}

/**
 * Update audio sources in the DOM based on JSON data
 */
function updateAudioSources() {
  if (!audioData) return;
  
  // Update block audio sources
  for (const [blockKey, trackData] of Object.entries(audioData.blocks)) {
    const [section, sectionType] = blockKey.split('-');
    const audioId = `block-audio-${section}-${sectionType}`;
    const audioElement = document.getElementById(audioId);
    
    if (audioElement) {
      // Clear existing sources
      audioElement.innerHTML = '';
      
      // Add new source from JSON
      const sourceElement = document.createElement('source');
      sourceElement.src = trackData.audioSrc;
      sourceElement.type = trackData.audioType || 'audio/mp3';
      audioElement.appendChild(sourceElement);
      
      // Set other audio attributes
      audioElement.preload = 'none';
      if (trackData.loop) audioElement.loop = true;
      
      console.log(`Updated audio source for ${audioId}`);
    }
  }
  
  // Update background music for notes panel
  if (audioData.backgroundMusic && audioData.backgroundMusic.notesPanel) {
    const bgMusic = document.getElementById('notes-background-music');
    if (bgMusic) {
      const trackData = audioData.backgroundMusic.notesPanel;
      
      // Clear existing sources
      bgMusic.innerHTML = '';
      
      // Add new source
      const sourceElement = document.createElement('source');
      sourceElement.src = trackData.audioSrc;
      sourceElement.type = trackData.audioType || 'audio/mp3';
      bgMusic.appendChild(sourceElement);
      
      // Set other attributes
      bgMusic.loop = trackData.loop !== false;
      bgMusic.preload = 'none';
      
      console.log('Updated background music source');
    }
  }
}

/**
 * Play audio with enhanced features
 * @param {string} blockKey - The block key (section-index)
 * @param {HTMLElement} button - The button element that was clicked
 */
function playEnhancedAudio(blockKey, button) {
  if (!audioData || !audioData.blocks || !audioData.blocks[blockKey]) {
    console.warn(`No audio data found for ${blockKey}`);
    return;
  }
  
  // Get track data
  const trackData = audioData.blocks[blockKey];
  
  // Get audio element
  const [section, index] = blockKey.split('-');
  const audioId = `block-audio-${section}-${index}`;
  const audio = document.getElementById(audioId);
  
  if (!audio) {
    showNotification('Audio track not found', 'error');
    return;
  }
  
  // Stop all other audio first
  stopAllAudio();
  
  // Check if this audio is already playing
  if (!audio.paused) {
    // If it's playing, pause it
    audio.pause();
    button.classList.remove('active');
    showNotification(`Paused: ${trackData.title}`, 'info');
  } else {
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // Then play this audio
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Success - update UI
        button.innerHTML = '<i class="fas fa-music"></i>';
        button.classList.add('active');
        
        // Show notification with track info
        showNotification(`Playing: ${trackData.title} by ${trackData.artist}`, 'success', {
          duration: 3000
        });
        
        // Update music player UI if exists
        updateMusicPlayerUI(trackData);
        
        // Set volume from track data or default
        audio.volume = trackData.volume || 0.3;
        
        // Save last played audio
        localStorage.setItem('last_played_audio_section', section);
        localStorage.setItem('last_played_audio_index', index);
        
        // Remove last-played class from all buttons
        document.querySelectorAll('.block-music.last-played').forEach(btn => {
          btn.classList.remove('last-played');
        });
        
        // Add last-played class to this button
        button.classList.add('last-played');
        
      }).catch(error => {
        // Failed to play
        button.innerHTML = '<i class="fas fa-music"></i>';
        console.error('Error playing audio:', error);
        
        if (error.name === 'NotAllowedError') {
          showNotification('Click again to play. Browsers require user interaction.', 'info');
        }
      });
    }
  }
}

/**
 * Sets up the music player UI if it doesn't exist
 */
function setupMusicPlayerUI() {
  // Check if the player already exists
  if (document.getElementById('music-player')) return;
  
  // Create music player container
  const playerContainer = document.createElement('div');
  playerContainer.id = 'music-player';
  playerContainer.className = 'music-player';
  playerContainer.innerHTML = `
    <div class="music-player-inner">
      <div class="track-info">
        <div class="track-title">Select a track</div>
        <div class="track-artist">—</div>
      </div>
      <div class="player-controls">
        <button class="player-button" id="player-previous" title="Previous track">
          <i class="fas fa-step-backward"></i>
        </button>
        <button class="player-button main-control" id="player-toggle" title="Play/Pause">
          <i class="fas fa-play"></i>
        </button>
        <button class="player-button" id="player-next" title="Next track">
          <i class="fas fa-step-forward"></i>
        </button>
      </div>
      <div class="player-progress">
        <div class="progress-time current-time">0:00</div>
        <div class="progress-bar">
          <div class="progress-filled"></div>
        </div>
        <div class="progress-time duration">0:00</div>
      </div>
    </div>
    <button class="player-toggle-button" id="toggle-player">
      <i class="fas fa-music"></i>
    </button>
  `;
  
  // Append to body
  document.body.appendChild(playerContainer);
  
  // Add toggle functionality
  const togglePlayerBtn = document.getElementById('toggle-player');
  if (togglePlayerBtn) {
    togglePlayerBtn.addEventListener('click', function() {
      playerContainer.classList.toggle('expanded');
    });
  }
  
  // Add styles for the player
  const playerStyle = document.createElement('style');
  playerStyle.textContent = `
    .music-player {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 25px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 100;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .music-player.expanded {
      width: 300px;
      height: 150px;
      border-radius: 12px;
    }
    
    .music-player-inner {
      padding: 15px;
      width: 100%;
      height: 100%;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    
    .music-player.expanded .music-player-inner {
      opacity: 1;
      pointer-events: auto;
    }
    
    .player-toggle-button {
      position: absolute;
      top: 0;
      left: 0;
      width: 50px;
      height: 50px;
      background: none;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: #333;
      cursor: pointer;
    }
    
    .music-player.expanded .player-toggle-button {
      display: none;
    }
    
    .track-info {
      margin-bottom: 10px;
    }
    
    .track-title {
      font-weight: bold;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .track-artist {
      font-size: 12px;
      color: #666;
    }
    
    .player-controls {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 10px;
    }
    
    .player-button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
    }
    
    .player-button.main-control {
      width: 30px;
      height: 30px;
      background-color: #4a90e2;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .player-progress {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .progress-time {
      font-size: 10px;
      color: #666;
    }
    
    .progress-bar {
      flex-grow: 1;
      height: 4px;
      background-color: #ddd;
      border-radius: 2px;
      position: relative;
    }
    
    .progress-filled {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: #4a90e2;
      border-radius: 2px;
      width: 0%;
    }
    
    .dark-mode .music-player {
      background-color: rgba(30, 30, 30, 0.9);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }
    
    .dark-mode .player-toggle-button,
    .dark-mode .player-button {
      color: #ddd;
    }
    
    .dark-mode .track-title {
      color: #fff;
    }
    
    .dark-mode .track-artist,
    .dark-mode .progress-time {
      color: #aaa;
    }
    
    .dark-mode .progress-bar {
      background-color: #444;
    }
  `;
  
  document.head.appendChild(playerStyle);
}

/**
 * Update the music player UI with track information
 * @param {Object} trackData - The track data object
 */
function updateMusicPlayerUI(trackData) {
  if (!trackData) return;
  
  const trackTitle = document.querySelector('.track-title');
  const trackArtist = document.querySelector('.track-artist');
  const playerToggle = document.getElementById('player-toggle');
  const currentTime = document.querySelector('.current-time');
  const duration = document.querySelector('.duration');
  
  if (trackTitle) trackTitle.textContent = trackData.title || 'Unknown Track';
  if (trackArtist) trackArtist.textContent = trackData.artist || 'Unknown Artist';
  if (playerToggle) playerToggle.innerHTML = '<i class="fas fa-pause"></i>';
  if (duration) duration.textContent = trackData.duration || '0:00';
  if (currentTime) currentTime.textContent = '0:00';
  
  // Expand the player automatically when a track starts
  const player = document.getElementById('music-player');
  if (player && !player.classList.contains('expanded')) {
    player.classList.add('expanded');
  }
}

// Helper function to format time (seconds to MM:SS)
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
} 