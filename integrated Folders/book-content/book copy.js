// Make ScrollTrigger available for use in GSAP animations
gsap.registerPlugin(ScrollTrigger);

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
  // Initialize book functionality
  initBookInterface();
  initScrollSections();
  initBookNavigation();
  initTableOfContents();
  initThemeToggle();
  initNotes();
  initFullscreen();
  initHeaderShareButton();
  initHeaderScroll();
  updateReadingProgress();
  updateShareIcons();
});

/**
 * Helper function to remove all existing click listeners before adding a new one
 * This prevents duplicate event handling
 * @param {Element} element - The element to update
 * @param {Function} handler - The new event handler to attach
 */
function replaceEventListener(element, handler) {
  // Create a copy of the element to remove all event listeners
  const newElement = element.cloneNode(true);
  // Replace the original element with the clone
  element.parentNode.replaceChild(newElement, element);
  // Add the new event listener
  newElement.addEventListener('click', handler);
  return newElement;
}

// Initialize the main book interface
function initBookInterface() {
  // Show cover on load
  const bookCover = document.getElementById('book-cover');
  const startReadingBtn = document.getElementById('start-reading');
  
  if (bookCover && startReadingBtn) {
    // Check if user has already started reading
    const hasStartedReading = sessionStorage.getItem('hasStartedReading');
    
    if (hasStartedReading) {
      bookCover.style.display = 'none';
    } else {
      // When user clicks start reading, hide cover
      startReadingBtn.addEventListener('click', function() {
        gsap.to(bookCover, {
          opacity: 0,
          duration: 0.5,
          onComplete: function() {
            bookCover.style.display = 'none';
            sessionStorage.setItem('hasStartedReading', 'true');
          }
        });
      });
    }
  }

  // Handle restart reading button
  const restartBtn = document.getElementById('restart-book');
  if (restartBtn) {
    restartBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (bookCover) {
        bookCover.style.display = 'flex';
        gsap.fromTo(bookCover, 
          { opacity: 0 }, 
          { opacity: 1, duration: 0.5 }
        );
        sessionStorage.removeItem('hasStartedReading');
      }
    });
  }

  // Handle share button with event listener replacement to prevent duplicates
  const shareBtn = document.getElementById('share-book');
  if (shareBtn) {
    // Define the handler function
    const shareHandler = function() {
      sharePage(
        'The Wonders of Nature', 
        'Check out this amazing interactive book about nature!', 
        window.location.href
      );
    };
    
    // Replace any existing event listeners with our new one
    replaceEventListener(shareBtn, shareHandler);
  }
}

// Initialize scroll sections
function initScrollSections() {
  // Select the HTML elements needed for the animation
  const scrollSections = document.querySelectorAll(".scroll-section");

  // Setup scroll sections
  scrollSections.forEach((section) => {
    const wrapper = section.querySelector(".wrapper");
    const items = wrapper.querySelectorAll(".item");

    // Initialize direction
    let direction = null;

    if (section.classList.contains("vertical-section")) {
      direction = "vertical";
    } else if (section.classList.contains("horizontal-section")) {
      direction = "horizontal";
    }

    initScroll(section, items, direction);
  });

  // Handle bookmark buttons
  const bookmarkButtons = document.querySelectorAll('.bookmark');
  bookmarkButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
      const section = this.getAttribute('data-section');
      const index = this.getAttribute('data-index');
      const isActive = this.classList.contains('active');
      
      if (isActive) {
        saveBookmark(section, index);
        showNotification('Page bookmarked!', 'success');
      } else {
        removeBookmark(section, index);
        showNotification('Bookmark removed', 'info');
      }
    });
  });

  // Handle share page buttons with event listener replacement to prevent duplicates
  const sharePageButtons = document.querySelectorAll('.share-page');
  sharePageButtons.forEach(btn => {
    // Define the handler function
    const sharePageHandler = function() {
      const section = this.getAttribute('data-section');
      const index = this.getAttribute('data-index');
      const title = this.getAttribute('data-title');
      const pageNumber = section === 'vertical-section' 
        ? parseInt(index) + 1 
        : parseInt(index) + 5;
      
      // Get the URL with a hash to the specific page
      const pageUrl = window.location.href.split('#')[0] + `#page=${pageNumber}`;
      
      // Share the page
      sharePage(title, `Check out this page about "${title}" from The Wonders of Nature interactive book!`, pageUrl);
    };
    
    // Replace any existing event listeners with our new one
    replaceEventListener(btn, sharePageHandler);
  });

  // Handle note buttons
  const noteButtons = document.querySelectorAll('.notes');
  const notesPanel = document.getElementById('notes-panel');
  const pageNotesTextarea = document.getElementById('page-notes');
  const saveNotesBtn = document.getElementById('save-notes');
  const closeNotesBtn = document.getElementById('close-notes');
  
  // Add expand button to notes panel if it doesn't exist
  if (!document.getElementById('expand-notes')) {
    const expandBtn = document.createElement('button');
    expandBtn.id = 'expand-notes';
    expandBtn.className = 'expand-notes';
    expandBtn.title = 'Expand to fullscreen';
    expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
    
    const notesHeader = document.querySelector('.notes-header');
    if (notesHeader && notesHeader.querySelector('.close-notes')) {
      notesHeader.insertBefore(expandBtn, notesHeader.querySelector('.close-notes'));
    }
  }
  
  // Initialize expand button
  const expandNotesBtn = document.getElementById('expand-notes') || document.querySelector('.expand-notes');
  
  if (expandNotesBtn) {
    expandNotesBtn.addEventListener('click', function() {
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
  
  // Ensure textarea is a good size
  if (pageNotesTextarea) {
    pageNotesTextarea.style.minHeight = '400px';
    pageNotesTextarea.style.fontSize = '2rem';
    pageNotesTextarea.style.fontFamily = "'Caveat', 'Laila', sans-serif";
  }

  // Initialize notes panel functionality
  let currentNoteSection = '';
  let currentNoteIndex = -1;

  noteButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      currentNoteSection = this.getAttribute('data-section');
      currentNoteIndex = this.getAttribute('data-index');
      
      // Load existing notes
      const noteKey = `note_${currentNoteSection}_${currentNoteIndex}`;
      const existingNote = localStorage.getItem(noteKey) || '';
      
      if (pageNotesTextarea) {
        pageNotesTextarea.value = existingNote;
      }
      
      if (notesPanel) {
        notesPanel.classList.add('active');
      }
    });
  });

  if (closeNotesBtn) {
    closeNotesBtn.addEventListener('click', function() {
      notesPanel.classList.remove('active');
    });
  }

  if (saveNotesBtn) {
    saveNotesBtn.addEventListener('click', function() {
      const noteKey = `note_${currentNoteSection}_${currentNoteIndex}`;
      localStorage.setItem(noteKey, pageNotesTextarea.value);
      showNotification('Notes saved successfully!', 'success');
      
      // Highlight note button if there's content
      if (pageNotesTextarea.value.trim() !== '') {
        document.querySelector(`.notes[data-section="${currentNoteSection}"][data-index="${currentNoteIndex}"]`).classList.add('active');
      } else {
        document.querySelector(`.notes[data-section="${currentNoteSection}"][data-index="${currentNoteIndex}"]`).classList.remove('active');
      }
    });
  }

  // Load existing bookmarks and notes
  loadSavedBookmarks();
  loadSavedNotes();
}

// Initialize the scroll animation for a section
function initScroll(section, items, direction) {
  // Initial states
  items.forEach((item, index) => {
    if (index !== 0) {
      direction == "horizontal"
        ? gsap.set(item, { xPercent: 100 })
        : gsap.set(item, { yPercent: 100 });
    }
  });

  // Store ID of ScrollTrigger for later access
  const sectionId = section.id || "section-" + Math.random().toString(36).substr(2, 9);
  section.id = sectionId;

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      pin: true,
      start: "top top",
      end: () => `+=${items.length * 100}%`,
      scrub: 1,
      id: sectionId, // Assign ID for later reference
      invalidateOnRefresh: true,
      onUpdate: function(self) {
        updatePageIndicator(self, section, items);
      }
    },
    defaults: { ease: "none" },
  });
  
  items.forEach((item, index) => {
    timeline.to(item, {
      scale: 0.9,
      borderRadius: "10px",
    });

    direction == "horizontal"
      ? timeline.to(
          items[index + 1],
          {
            xPercent: 0,
          },
          "<"
        )
      : timeline.to(
          items[index + 1],
          {
            yPercent: 0,
          },
          "<"
        );
  });
}

// Handle book navigation
function initBookNavigation() {
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const currentPageEl = document.getElementById('current-page');
  const totalPagesEl = document.getElementById('total-pages');
  
  // Calculate total pages
  const totalItems = document.querySelectorAll('.item').length;
  
  if (totalPagesEl) {
    totalPagesEl.textContent = totalItems;
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      const currentPage = parseInt(currentPageEl.textContent);
      if (currentPage > 1) {
        navigateToPage(currentPage - 1);
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      const currentPage = parseInt(currentPageEl.textContent);
      if (currentPage < totalItems) {
        navigateToPage(currentPage + 1);
      }
    });
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    const currentPage = parseInt(currentPageEl.textContent);
    
    if (e.key === 'ArrowLeft' && currentPage > 1) {
      navigateToPage(currentPage - 1);
    } else if (e.key === 'ArrowRight' && currentPage < totalItems) {
      navigateToPage(currentPage + 1);
    }
  });
}

// Navigate to a specific page
function navigateToPage(pageNumber) {
  const items = document.querySelectorAll('.item');
  const currentPageEl = document.getElementById('current-page');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  
  if (pageNumber < 1 || pageNumber > items.length) {
    return;
  }
  
  // Update page indicator
  if (currentPageEl) {
    currentPageEl.textContent = pageNumber;
  }
  
  // Update button states
  if (prevBtn) {
    prevBtn.disabled = pageNumber === 1;
  }
  
  if (nextBtn) {
    nextBtn.disabled = pageNumber === items.length;
  }
  
  // Find section containing the target page
  let targetSection;
  let targetIndex;
  
  if (pageNumber <= 4) {
    targetSection = 'vertical-section';
    targetIndex = pageNumber - 1;
  } else {
    targetSection = 'horizontal-section';
    targetIndex = pageNumber - 5;
  }
  
  // Find the section element
  const section = document.querySelector(`.${targetSection}`);
  if (!section) return;
  
  // Scroll to section first
  const sectionRect = section.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const sectionTop = scrollTop + sectionRect.top;
  
  // Scroll to section
  window.scrollTo({
    top: sectionTop,
    behavior: 'smooth'
  });
  
  // Let the scroll complete, then handle the page change
  setTimeout(() => {
    // Get items in this section
    const sectionItems = section.querySelectorAll('.item');
    const targetItem = sectionItems[targetIndex];
    
    if (!targetItem) return;
    
    // For direct access to the ScrollTrigger instance
    const stInstance = ScrollTrigger.getById(section.id);
    
    if (stInstance) {
      // Calculate progress value for the target page
      const progressValue = targetIndex / (sectionItems.length - 1);
      
      // Directly set the scroll position for the ScrollTrigger instance
      gsap.to(window, {
        scrollTo: {
          y: stInstance.start + ((stInstance.end - stInstance.start) * progressValue),
          autoKill: false
        },
        duration: 0.5,
        ease: "power2.inOut"
      });
    } else {
      // Fallback method if ScrollTrigger instance is not found
      // Force scroll manually
      const progress = targetIndex / (sectionItems.length - 1);
      const scrollDistance = section.scrollHeight * progress;
      
      // Manually change appearance
      sectionItems.forEach((item, idx) => {
        if (idx < targetIndex) {
          gsap.set(item, { scale: 0.9, borderRadius: "10px" });
          
          // Set position based on direction
          if (section.classList.contains("horizontal-section")) {
            gsap.set(item, { xPercent: 0 });
          } else {
            gsap.set(item, { yPercent: 0 });
          }
        } else if (idx === targetIndex) {
          gsap.set(item, { scale: 1, borderRadius: 0 });
          
          // Set position based on direction
          if (section.classList.contains("horizontal-section")) {
            gsap.set(item, { xPercent: 0 });
          } else {
            gsap.set(item, { yPercent: 0 });
          }
        } else {
          // Set position based on direction
          if (section.classList.contains("horizontal-section")) {
            gsap.set(item, { xPercent: 100 });
          } else {
            gsap.set(item, { yPercent: 100 });
          }
        }
      });
    }
  }, 300); // Give time for the scroll to section to complete
  
  // Update TOC highlighting
  document.querySelectorAll('.toc-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const tocItem = document.querySelector(`.toc-item[data-section="${targetSection}"][data-index="${targetIndex}"]`);
  if (tocItem) {
    tocItem.classList.add('active');
  }
}

// Update page indicator during scroll
function updatePageIndicator(self, section, items) {
  const currentPageEl = document.getElementById('current-page');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  
  if (!currentPageEl) return;
  
  // Calculate current page based on progress
  const progress = Math.round(self.progress * (items.length - 1));
  let pageNumber;
  
  if (section.classList.contains('vertical-section')) {
    pageNumber = progress + 1;
  } else {
    pageNumber = progress + 5; // Start from 5 for horizontal section
  }
  
  // Update page indicator
  currentPageEl.textContent = pageNumber;
  
  // Update button states
  if (prevBtn) {
    prevBtn.disabled = pageNumber === 1;
  }
  
  if (nextBtn) {
    nextBtn.disabled = pageNumber === document.querySelectorAll('.item').length;
  }
  
  // Update TOC highlighting
  updateTocHighlighting(section.className, progress);
}

// Initialize table of contents
function initTableOfContents() {
  const toggleTocBtn = document.getElementById('toggle-toc');
  const closeTocBtn = document.getElementById('close-toc');
  const toc = document.getElementById('toc');
  const tocItems = document.querySelectorAll('.toc-item');
  
  if (toggleTocBtn && toc) {
    toggleTocBtn.addEventListener('click', function() {
      toc.classList.toggle('active');
    });
  }
  
  if (closeTocBtn && toc) {
    closeTocBtn.addEventListener('click', function() {
      toc.classList.remove('active');
    });
  }
  
  // Handle TOC item clicks
  tocItems.forEach(item => {
    item.addEventListener('click', function() {
      const section = this.getAttribute('data-section');
      const index = parseInt(this.getAttribute('data-index'));
      let pageNumber;
      
      if (section === 'vertical-section') {
        pageNumber = index + 1;
      } else {
        pageNumber = index + 5;
      }
      
      navigateToPage(pageNumber);
      
      // Close TOC on mobile
      if (window.innerWidth < 768) {
        toc.classList.remove('active');
      }
    });
  });
}

// Update TOC highlighting based on current section and progress
function updateTocHighlighting(sectionClass, progress) {
  const tocItems = document.querySelectorAll('.toc-item');
  
  tocItems.forEach(item => {
    item.classList.remove('active');
  });
  
  let section = '';
  if (sectionClass.includes('vertical-section')) {
    section = 'vertical-section';
  } else if (sectionClass.includes('horizontal-section')) {
    section = 'horizontal-section';
  }
  
  const activeItem = document.querySelector(`.toc-item[data-section="${section}"][data-index="${progress}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

// Initialize dark/light theme toggle
function initThemeToggle() {
  const themeToggle = document.getElementById('toggle-theme');
  
  // Check saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light</span>';
    }
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');
      
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light</span>';
      } else {
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Dark</span>';
      }
    });
  }
}

// Initialize notes functionality
function initNotes() {
  // Implemented in initScrollSections for simplicity
}

// Initialize fullscreen functionality
function initFullscreen() {
  const fullscreenBtn = document.getElementById('toggle-fullscreen');
  
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', function() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          showNotification('Fullscreen mode is not supported by your browser', 'error');
        });
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i><span>Exit</span>';
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i><span>Fullscreen</span>';
        }
      }
    });
  }
  
  // Handle fullscreen change
  document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement && fullscreenBtn) {
      fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i><span>Fullscreen</span>';
    }
  });
}

// Update reading progress bar
function updateReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  
  window.addEventListener('scroll', function() {
    if (progressBar) {
      const windowHeight = document.documentElement.clientHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      progressBar.style.width = scrollPercent + '%';
    }
  });
}

// Save bookmark to localStorage
function saveBookmark(section, index) {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  const bookmark = { section, index };
  
  // Check if bookmark already exists
  const exists = bookmarks.some(b => b.section === section && b.index === index);
  
  if (!exists) {
    bookmarks.push(bookmark);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }
}

// Remove bookmark from localStorage
function removeBookmark(section, index) {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  const filteredBookmarks = bookmarks.filter(b => !(b.section === section && b.index === index));
  
  localStorage.setItem('bookmarks', JSON.stringify(filteredBookmarks));
}

// Load saved bookmarks from localStorage
function loadSavedBookmarks() {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  
  bookmarks.forEach(bookmark => {
    const btn = document.querySelector(`.bookmark[data-section="${bookmark.section}"][data-index="${bookmark.index}"]`);
    if (btn) {
      btn.classList.add('active');
    }
  });
}

// Load saved notes
function loadSavedNotes() {
  const noteButtons = document.querySelectorAll('.notes');
  
  noteButtons.forEach(btn => {
    const section = btn.getAttribute('data-section');
    const index = btn.getAttribute('data-index');
    const noteKey = `note_${section}_${index}`;
    const existingNote = localStorage.getItem(noteKey);
    
    if (existingNote && existingNote.trim() !== '') {
      btn.classList.add('active');
    }
  });
}

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

// Show notification
function showNotification(message, type = 'info') {
  const notifications = document.getElementById('notifications');
  
  if (!notifications) return;
  
  // Play notification sound
  playNotificationSound(type);
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // Get current time
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
  
  // Create notification content
  let appName = '';
  let icon = '';
  if (type === 'success') {
    appName = 'Success';
    icon = '<i class="fas fa-check"></i>';
  } else if (type === 'error') {
    appName = 'Alert';
    icon = '<i class="fas fa-exclamation"></i>';
  } else {
    appName = 'Info';
    icon = '<i class="fas fa-info"></i>';
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
  
  notification.appendChild(header);
  notification.appendChild(content);
  notifications.appendChild(notification);
  
  // Mobile device haptic feedback (if available)
  if (window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(50);
    } catch (e) {
      // Silently fail if vibration API not supported
    }
  }
  
  // Auto remove after delay
  const timeoutId = setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
  
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
  
  // Add swipe functionality
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  const minSwipeDistance = 50;
  
  notification.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    
    // Add class to indicate touch in progress
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
    }
  }, { passive: true });
  
  return notification;
}

// Add GSAP scrollTo plugin to handle smoother scrolling
window.addEventListener('load', function() {
  // Check if GSAP ScrollToPlugin is available
  if (gsap.getProperty && typeof gsap.getProperty === 'function') {
    if (!gsap.plugins || !gsap.plugins.scrollTo) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollToPlugin.min.js';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = function() {
        console.log('ScrollToPlugin loaded successfully');
      };
    }
  }
});

// Function to share content using Web Share API or fallback
function sharePage(title, text, url) {
  try {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: url
      })
      .then(() => showNotification('Page shared successfully!', 'success'))
      .catch((error) => {
        console.error('Error sharing:', error);
        showModernShareModal(title, text, url);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      showModernShareModal(title, text, url);
    }
  } catch (err) {
    console.error('Error in sharePage function:', err);
    showModernShareModal(title, text, url);
  }
}

// Modern share modal with copy button functionality
function showModernShareModal(title, text, url) {
  try {
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    
    // Create title for the modal, truncate if too long
    const displayTitle = title.length > 45 ? title.substring(0, 45) + '...' : title;
    
    shareModal.innerHTML = `
      <div class="share-modal-content">
        <div class="share-modal-header">
          <h3>Share</h3>
          <button class="share-modal-close">&times;</button>
        </div>
        <p>${displayTitle}</p>
        <div class="share-url-container">
          <input type="text" class="share-url-input" value="${url}" readonly onclick="this.select();">
          <button class="copy-btn"></button>
        </div>
        <div class="share-options">
          <a href="mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + ' ' + url)}" class="share-option email">
            <i class="fa-brands fa-google"></i>
            <span>Gmail</span>
          </a>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}" target="_blank" class="share-option twitter">
            <i class="fa-brands fa-x-twitter"></i>
            <span>X/Twitter</span>
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" class="share-option facebook">
            <i class="fa-brands fa-facebook-f"></i>
            <span>Facebook</span>
          </a>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}" target="_blank" class="share-option whatsapp">
            <i class="fa-brands fa-whatsapp"></i>
            <span>WhatsApp</span>
          </a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" class="share-option linkedin">
            <i class="fa-brands fa-linkedin-in"></i>
            <span>LinkedIn</span>
          </a>
          <a href="https://telegram.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}" target="_blank" class="share-option telegram">
            <i class="fa-brands fa-telegram"></i>
            <span>Telegram</span>
          </a>
        </div>
      </div>
    `;
    
    document.body.appendChild(shareModal);
    
    // Focus and select the URL input for easy copying
    setTimeout(() => {
      const urlInput = shareModal.querySelector('.share-url-input');
      if (urlInput) {
        urlInput.focus();
        urlInput.select();
      }
    }, 100);
    
    // Copy button functionality with visual feedback
    const copyBtn = shareModal.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        copyShareUrl(shareModal, url);
      });
    }
    
    // Close modal functionality
    const closeBtn = shareModal.querySelector('.share-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeShareModal(shareModal);
      });
    }
    
    // Close on outside click
    shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) {
        closeShareModal(shareModal);
      }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function escKeyHandler(e) {
      if (e.key === 'Escape') {
        closeShareModal(shareModal);
        document.removeEventListener('keydown', escKeyHandler);
      }
    });
    
    // Add vibration feedback if available
    if (window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(15);
      } catch (e) {
        // Silently fail
      }
    }
  } catch (err) {
    console.error('Error in showModernShareModal:', err);
    alert('Share this URL: ' + url);
  }
}

// Copy URL to clipboard with visual feedback
function copyShareUrl(modal, url) {
  const copyBtn = modal.querySelector('.copy-btn');
  const urlInput = modal.querySelector('.share-url-input');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => {
        // Just update class for button - the icon changes via CSS
        copyBtn.textContent = '';
        copyBtn.classList.add('copied');
        
        // Reset button after 2 seconds
        setTimeout(() => {
          copyBtn.textContent = '';
          copyBtn.classList.remove('copied');
        }, 2000);
        
        // Add vibration feedback if available
        if (window.navigator && window.navigator.vibrate) {
          try {
            window.navigator.vibrate(20);
          } catch (e) {
            // Silently fail
          }
        }
        
        showNotification('Link copied to clipboard!', 'success');
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        // Fallback to manual selection
        if (urlInput) {
          urlInput.focus();
          urlInput.select();
          showNotification('Please copy manually using Ctrl/Cmd+C', 'info');
        }
      });
  } else {
    // Fallback for browsers without clipboard API
    if (urlInput) {
      urlInput.focus();
      urlInput.select();
      
      // Try to use the older document.execCommand method
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          copyBtn.textContent = '';
          copyBtn.classList.add('copied');
          
          setTimeout(() => {
            copyBtn.textContent = '';
            copyBtn.classList.remove('copied');
          }, 2000);
          
          showNotification('Link copied to clipboard!', 'success');
        } else {
          showNotification('Please copy manually using Ctrl/Cmd+C', 'info');
        }
      } catch (err) {
        showNotification('Please copy manually using Ctrl/Cmd+C', 'info');
      }
    }
  }
}

// Close share modal with animation
function closeShareModal(modal) {
  modal.style.opacity = '0';
  modal.querySelector('.share-modal-content').style.transform = 'translateY(20px)';
  
  // Remove modal after animation
  setTimeout(() => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  }, 300);
}

// Make the sharePage function available globally
window.sharePage = sharePage;

// Add pulse effect to share buttons when page loads
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
      btn.classList.add('pulse');
      
      // Remove pulse effect when user interacts with the page
      window.addEventListener('click', () => {
        btn.classList.remove('pulse');
      }, { once: true });
    });
  }, 2000); // Delay the pulse effect
});

// Add share button to header
function initHeaderShareButton() {
  const headerControls = document.querySelector('.book-controls');
  if (headerControls) {
    // First check if the button already exists
    let shareBtn = document.getElementById('header-share');
    
    // If button doesn't exist, create it
    if (!shareBtn) {
      // Create share button element
      shareBtn = document.createElement('button');
      shareBtn.className = 'book-control';
      shareBtn.id = 'header-share';
      shareBtn.innerHTML = `
        <i class="fa-solid fa-share-nodes"></i>
        <span>Share</span>
      `;
      
      // Add to header controls
      headerControls.appendChild(shareBtn);
    }
    
    // Define the handler function
    const headerShareHandler = function() {
      const title = document.querySelector('.book-title')?.textContent || 'The Wonders of Nature';
      const currentUrl = window.location.href;
      sharePage(
        title,
        `Check out this amazing book: "${title}" - An interactive reading experience!`,
        currentUrl
      );
    };
    
    // Replace any existing event listeners with our new one
    replaceEventListener(shareBtn, headerShareHandler);
  }
}

// Update share page icons to more modern ones
function updateShareIcons() {
  const sharePageButtons = document.querySelectorAll('.share-page');
  if (sharePageButtons.length > 0) {
    sharePageButtons.forEach(btn => {
      btn.innerHTML = '<i class="fa-solid fa-share-nodes"></i>';
    });
  }
  
  // Also update share button in the end actions
  const shareBookBtn = document.getElementById('share-book');
  if (shareBookBtn) {
    shareBookBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Share';
  }
}

// Initialize scroll-based header visibility with enhanced behavior
function initHeaderScroll() {
  const header = document.querySelector('.book-header');
  if (!header) return;
  
  let lastScrollTop = 0;
  let headerHeight = header.offsetHeight;
  let isHeaderVisible = true;
  let scrollDelta = 10; // Minimum scroll difference to trigger hide/show
  let scrollTimeout;
  
  // Add transition class for smooth animation
  header.classList.add('header-scroll-transition');
  
  // Create a throttled scroll handler
  let ticking = false;
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Only trigger hide/show if we've scrolled more than scrollDelta
        if (Math.abs(lastScrollTop - scrollTop) <= scrollDelta) {
          ticking = false;
          return;
        }
        
        // Don't hide header when at the top of the page
        if (scrollTop <= headerHeight) {
          header.classList.remove('header-hidden');
          isHeaderVisible = true;
        } 
        // Show header when scrolling up
        else if (scrollTop < lastScrollTop) {
          if (!isHeaderVisible) {
            header.classList.remove('header-hidden');
            isHeaderVisible = true;
          }
        } 
        // Hide header when scrolling down (after scrolling past header height)
        else if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
          if (isHeaderVisible) {
            header.classList.add('header-hidden');
            isHeaderVisible = false;
          }
        }
        
        lastScrollTop = scrollTop;
        ticking = false;
        
        // Reset timer for scroll-stopped behavior
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
          // If user has stopped scrolling for a moment, show the header
          if (!isHeaderVisible) {
            header.classList.remove('header-hidden');
            isHeaderVisible = true;
          }
        }, 2000); // Show header after 2 seconds of no scrolling
      });
      
      ticking = true;
    }
  }, { passive: true });
  
  // Add a small delay before enabling the hide behavior
  setTimeout(() => {
    header.classList.add('header-scroll-enabled');
  }, 1000);
  
  // Show header when user mouses to the top of the screen
  document.addEventListener('mousemove', function(e) {
    if (e.clientY < 20 && !isHeaderVisible) {
      header.classList.remove('header-hidden');
      isHeaderVisible = true;
    }
  }, { passive: true });
}
