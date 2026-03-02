// Make ScrollTrigger available for use in GSAP animations
gsap.registerPlugin(ScrollTrigger);

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
  // Clean up any existing word-hover elements that might be causing flicker
  removeWordHoverEffects();
  
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
  initMobileMenu();
  initLinkPanel();
  updateReadingProgress();
  updateLinkIcons();
  
  // Audio functionality moved to audio.js
  
  // Setup message listener for iframe communications
  window.addEventListener('message', handleIframeMessage);
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
        NotificationManager.group('Page bookmarked!', 'success');
      } else {
        removeBookmark(section, index);
        NotificationManager.group('Bookmark removed', 'info');
      }
    });
  });

  // Handle share page buttons with event listener replacement to prevent duplicates
  const sharePageButtons = document.querySelectorAll('.link-page');
  sharePageButtons.forEach(btn => {
    // Define the handler function
    const sharePageHandler = function() {
      const section = this.getAttribute('data-section');
      const index = this.getAttribute('data-index');
      const title = this.getAttribute('data-title');
      const contentKey = `${section}-${index}`;
      
      // Load content based on section and index
      if (window.loadPanelContent && typeof window.loadPanelContent === 'function') {
        // Use the loadPanelContent function if available
        const linkPanel = document.getElementById('link-panel');
        const linkPanelOverlay = document.getElementById('link-panel-overlay');
        
        if (linkPanel && linkPanelOverlay) {
          // Show the panel
          linkPanel.classList.add('active');
          linkPanelOverlay.classList.add('active');
          
          // Load the content
          loadPanelContent(contentKey, title);
          
          // Reset tabs if function exists
          if (window.resetTabs && typeof window.resetTabs === 'function') {
            resetTabs();
          }
        }
      } else {
        // Fallback to just sharing the page URL
        const pageNumber = section === 'vertical-section' 
          ? parseInt(index) + 1 
          : parseInt(index) + 5;
        
        // Get the URL with a hash to the specific page
        const pageUrl = window.location.href.split('#')[0] + `#page=${pageNumber}`;
        
        // Share the page
        sharePage(title, `Check out this page about "${title}" from The Wonders of Nature interactive book!`, pageUrl);
      }
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
  let autosaveTimer = null;
  const AUTOSAVE_DELAY = 3000; // 3 seconds delay for autosave

  noteButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      currentNoteSection = this.getAttribute('data-section');
      currentNoteIndex = this.getAttribute('data-index');
      
      if (notesPanel && pageNotesTextarea) {
        // Load existing notes
        const noteKey = `note_${currentNoteSection}_${currentNoteIndex}`;
        const savedNote = localStorage.getItem(noteKey) || '';
        
        pageNotesTextarea.value = savedNote;
        adjustTextareaHeight(pageNotesTextarea);
        
        // Show panel
        notesPanel.classList.add('active');
        
        // Set up autosave for this note
        setupAutosave(pageNotesTextarea, currentNoteSection, currentNoteIndex);
        
        // Add some default text if empty
        if (savedNote.trim() === '') {
          showNotification('Adding notes for this page - autosave enabled', 'info', {
            appName: 'Notes',
            icon: '<i class="fas fa-sticky-note"></i>'
          });
        }
      }
    });
  });

  if (closeNotesBtn) {
    closeNotesBtn.addEventListener('click', function() {
      // Save notes on close
      if (notesPanel && pageNotesTextarea && currentNoteSection && currentNoteIndex >= 0) {
        const content = pageNotesTextarea.value;
        saveNotes(currentNoteSection, currentNoteIndex, content);
        
        // Clean up autosave
        clearInterval(autosaveTimer);
        autosaveTimer = null;
      }
      
      notesPanel.classList.remove('active');
      notesPanel.classList.remove('fullscreen');
    });
  }

  if (saveNotesBtn) {
    saveNotesBtn.addEventListener('click', function() {
      if (notesPanel && pageNotesTextarea && currentNoteSection && currentNoteIndex >= 0) {
        const content = pageNotesTextarea.value;
        saveNotes(currentNoteSection, currentNoteIndex, content, false);
      }
    });
  }

  if (pageNotesTextarea) {
    // Adjust textarea height as user types
    pageNotesTextarea.addEventListener('input', function() {
      adjustTextareaHeight(this);
    });
  }

  // Load existing bookmarks and notes
  loadSavedBookmarks();
  loadSavedNotes();
  
  // Add click-outside functionality to close notes panel
  document.addEventListener('mousedown', function(e) {
    // Check if notes panel is active
    if (notesPanel && notesPanel.classList.contains('active')) {
      // Check if click is outside the notes panel
      if (!notesPanel.contains(e.target)) {
        // First save any changes
        if (currentNoteSection && currentNoteIndex >= 0 && pageNotesTextarea) {
          saveNotes(currentNoteSection, currentNoteIndex, pageNotesTextarea.value, true);
        }
        
        // Then close the panel
        notesPanel.classList.remove('active');
        notesPanel.classList.remove('fullscreen');
        
        // Update expand button icon if needed
        const expandNotesBtn = document.getElementById('expand-notes');
        if (expandNotesBtn) {
          const expandIcon = expandNotesBtn.querySelector('i');
          if (expandIcon && expandIcon.classList.contains('fa-compress')) {
            expandIcon.classList.remove('fa-compress');
            expandIcon.classList.add('fa-expand');
            expandNotesBtn.title = 'Expand to fullscreen';
          }
        }
      }
    }
  });
  
  // Make notes textarea auto-resize based on content
  if (pageNotesTextarea) {
    // Set initial height
    adjustTextareaHeight(pageNotesTextarea);
    
    // Add input listener to adjust height on typing
    pageNotesTextarea.addEventListener('input', function() {
      adjustTextareaHeight(this);
    });
    
    // Also adjust when the notes panel is opened
    noteButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        setTimeout(() => {
          adjustTextareaHeight(pageNotesTextarea);
        }, 300); // Delay to ensure panel is visible
      });
    });
  }
  
  // Add keyboard shortcut to close notes panel (Escape key)
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && notesPanel && notesPanel.classList.contains('active')) {
      // First save any changes
      if (currentNoteSection && currentNoteIndex >= 0 && pageNotesTextarea) {
        saveNotes(currentNoteSection, currentNoteIndex, pageNotesTextarea.value, true);
      }
      
      // Then exit fullscreen if active
      if (notesPanel.classList.contains('fullscreen')) {
        notesPanel.classList.remove('fullscreen');
        
        // Update expand button icon
        const expandNotesBtn = document.getElementById('expand-notes');
        if (expandNotesBtn) {
          const expandIcon = expandNotesBtn.querySelector('i');
          if (expandIcon) {
            expandIcon.classList.remove('fa-compress');
            expandIcon.classList.add('fa-expand');
            expandNotesBtn.title = 'Expand to fullscreen';
          }
        }
      } else {
        // Close the panel if not in fullscreen
        notesPanel.classList.remove('active');
      }
    }
  });
  
  // Enable resizable notes panel with memory
  if (notesPanel) {
    enableResizablePanel(notesPanel, 'notesPanelWidth');
  }
  
  // Also make link panel resizable
  const linkPanel = document.getElementById('link-panel');
  if (linkPanel) {
    enableResizablePanel(linkPanel, 'linkPanelWidth');
  }
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
  // Setup auto-save functionality for notes
  const pageNotesTextarea = document.getElementById('page-notes');
  
  if (pageNotesTextarea) {
    // Initialize saved notes highlighting
    loadSavedNotes();
    
    // Initialize saved bookmarks highlighting
    loadSavedBookmarks();
  }
  
  // Set up audio button for notes panel
  const toggleMusicBtn = document.getElementById('toggle-music');
  const musicVolume = document.getElementById('music-volume');
  const notesAudio = document.getElementById('notes-background-music');
  
  if (toggleMusicBtn && notesAudio) {
    toggleMusicBtn.addEventListener('click', function() {
      if (notesAudio.paused) {
        // Try to play background music
        try {
          const playPromise = notesAudio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              // Success
              toggleMusicBtn.classList.add('active');
              NotificationManager.show('Background music started', 'success', {
                appName: 'Music Player'
              });
            }).catch(error => {
              // Handle error
              console.error('Error playing notes background music:', error);
              NotificationManager.show('Could not play background music. ' + 
                (error.name === 'NotAllowedError' ? 'Please click again.' : 'Music file not found.'), 
                'error', {
                appName: 'Music Player'
              });
            });
          }
        } catch (error) {
          // Handle any exceptions
          console.error('Exception playing audio:', error);
          NotificationManager.show('Audio playback error: ' + error.message, 'error', {
            appName: 'Music Player'
          });
        }
      } else {
        notesAudio.pause();
        toggleMusicBtn.classList.remove('active');
        NotificationManager.show('Background music paused', 'info', {
          appName: 'Music Player'
        });
      }
    });
  }
  
  // Set up volume control for notes audio
  if (musicVolume && notesAudio) {
    // Set initial volume
    notesAudio.volume = parseInt(musicVolume.value) / 100;
    
    // Update volume on change
    musicVolume.addEventListener('input', function() {
      notesAudio.volume = parseInt(this.value) / 100;
    });
  }
}

// Initialize fullscreen functionality
function initFullscreen() {
  const fullscreenBtn = document.getElementById('toggle-fullscreen');
  
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', function() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          NotificationManager.show('Fullscreen mode is not supported by your browser', 'error');
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
  // Check if the modern notification sound function is available
  if (window.playNotificationSound && 
      typeof window.playNotificationSound === 'function' && 
      window.playNotificationSound !== playNotificationSound) {
    // Use the modern notification sound function
    return window.playNotificationSound(type);
  }
  
  // Fallback to original implementation
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
function showNotification(message, type = 'info', options = {}) {
  // Use the NotificationManager if available
  if (window.NotificationManager && typeof window.NotificationManager.show === 'function') {
    return window.NotificationManager.show(message, type, options);
  }
  
  // Check if the modern notification system is available
  if (window.showNotification && typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
    // Use the modern notification system
    return window.showNotification(message, type, options);
  }
  
  // Fallback to the original implementation
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
  let appName = options.appName || '';
  let icon = options.icon || '';
  
  if (!appName || !icon) {
    if (type === 'success') {
      appName = options.appName || 'Success';
      icon = options.icon || '<i class="fas fa-check"></i>';
    } else if (type === 'error') {
      appName = options.appName || 'Alert';
      icon = options.icon || '<i class="fas fa-exclamation"></i>';
    } else {
      appName = options.appName || 'Info';
      icon = options.icon || '<i class="fas fa-info"></i>';
    }
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
  const duration = options.duration || 3000;
  const timeoutId = setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, duration);
  
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
      
      // Restart the auto-dismiss timeout
      const newTimeoutId = setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 1500);
      
      notification.dataset.timeoutId = newTimeoutId;
    }
  }, { passive: true });
  
  notification.addEventListener('touchcancel', () => {
    // Reset transform and opacity on touch cancel
    notification.classList.remove('swiping');
    notification.style.transform = '';
    notification.style.opacity = '';
    
    // Restart the auto-dismiss timeout
    const newTimeoutId = setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 1500);
    
    notification.dataset.timeoutId = newTimeoutId;
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

// Update link icons
function updateLinkIcons() {
  const linkButtons = document.querySelectorAll('.link-page');
  if (linkButtons.length > 0) {
    linkButtons.forEach(btn => {
      btn.innerHTML = '<i class="fas fa-link"></i>';
    });
  }
  
  // Also update share button in the end actions
  const shareBookBtn = document.getElementById('share-book');
  if (shareBookBtn) {
    shareBookBtn.innerHTML = '<i class="fas fa-link"></i> Share';
  }
}

// Copy link to clipboard with notification
function copyLinkToClipboard(url, title) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => {
        showNotification(`Link to "${title}" copied to clipboard!`, 'success', {
          appName: 'Copy Link',
          icon: '<i class="fas fa-copy"></i>',
          duration: 3000
        });
      })
      .catch(error => {
        console.error('Error copying to clipboard:', error);
        showNotification('Could not copy link. Try again later.', 'error', {
          appName: 'Copy Link',
          icon: '<i class="fas fa-exclamation-triangle"></i>',
          duration: 4000
        });
      });
  } else {
    // Fallback for browsers without clipboard API
    try {
      // Create temporary input element
      const tempInput = document.createElement('input');
      tempInput.value = url;
      document.body.appendChild(tempInput);
      tempInput.select();
      
      // Execute copy command
      const successful = document.execCommand('copy');
      document.body.removeChild(tempInput);
      
      if (successful) {
        showNotification(`Link to "${title}" copied to clipboard!`, 'success', {
          appName: 'Copy Link',
          icon: '<i class="fas fa-copy"></i>',
          duration: 3000
        });
      } else {
        showNotification('Could not copy link. Try again later.', 'error', {
          appName: 'Copy Link',
          icon: '<i class="fas fa-exclamation-triangle"></i>',
          duration: 4000
        });
      }
    } catch (err) {
      console.error('Clipboard API error:', err);
      showNotification('Could not copy link automatically. The URL is: ' + url, 'info', {
        appName: 'Copy Link',
        icon: '<i class="fas fa-info-circle"></i>',
        duration: 5000
      });
    }
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

/**
 * Helper function to save notes with optional silent mode
 * @param {string} section - The section of the note
 * @param {number} index - The index of the note
 * @param {string} content - The content of the note
 * @param {boolean} silent - Whether to show a notification
 */
function saveNotes(section, index, content, silent = false) {
  if (!section || index < 0) return;
  
  const noteKey = `note_${section}_${index}`;
  localStorage.setItem(noteKey, content);
  
  // Show notification only if not in silent mode
  if (!silent) {
    NotificationManager.show('Notes saved successfully!', 'success', {
      appName: 'Notes',
      icon: '<i class="fas fa-sticky-note"></i>',
      duration: 2000
    });
  }
  
  // Highlight note button if there's content
  const noteButton = document.querySelector(`.notes[data-section="${section}"][data-index="${index}"]`);
  if (noteButton) {
    if (content.trim() !== '') {
      noteButton.classList.add('active');
    } else {
      noteButton.classList.remove('active');
    }
  }
}

// Make showNotification function available globally
window.showNotification = showNotification;

/**
 * Adjusts the height of a textarea to fit its content
 * @param {HTMLTextAreaElement} textarea - The textarea element to adjust
 */
function adjustTextareaHeight(textarea) {
  if (!textarea) return;
  
  // Reset height to allow proper calculation
  textarea.style.height = 'auto';
  
  // Calculate required height based on content
  const contentHeight = textarea.scrollHeight;
  
  // Get minimum height from CSS or set default
  const minHeight = parseInt(window.getComputedStyle(textarea).getPropertyValue('min-height')) || 200;
  
  // Set the height to the larger of content height or min height
  const newHeight = Math.max(contentHeight, minHeight);
  
  // Apply the new height
  textarea.style.height = newHeight + 'px';
  
  // Adjust notes panel height if needed
  const notesPanel = document.getElementById('notes-panel');
  const notesPanelContent = document.querySelector('.notes-content');
  
  if (notesPanel && !notesPanel.classList.contains('fullscreen')) {
    // Calculate panel content maximum height
    const viewportHeight = window.innerHeight;
    const maxPanelHeight = 0.85 * viewportHeight; // 85% of viewport
    
    // Get heights of other elements in the panel
    const notesHeader = notesPanel.querySelector('.notes-header');
    const notesActions = notesPanel.querySelector('.notes-actions');
    
    const headerHeight = notesHeader ? notesHeader.offsetHeight : 0;
    const actionsHeight = notesActions ? notesActions.offsetHeight : 0;
    
    // Calculate content padding
    const contentStyle = window.getComputedStyle(notesPanelContent);
    const contentPaddingTop = parseInt(contentStyle.paddingTop) || 0;
    const contentPaddingBottom = parseInt(contentStyle.paddingBottom) || 0;
    const contentPadding = contentPaddingTop + contentPaddingBottom;
    
    // Calculate the available height for the content area
    const availableContentHeight = maxPanelHeight - headerHeight - actionsHeight;
    
    // If content is too large, limit to available height and enable scrolling
    if (newHeight + contentPadding > availableContentHeight) {
      const adjustedContentHeight = availableContentHeight;
      notesPanelContent.style.height = adjustedContentHeight + 'px';
      notesPanelContent.style.overflowY = 'auto';
      
      // Set panel to max allowed height
      notesPanel.style.height = maxPanelHeight + 'px';
    } else {
      // Content fits, adjust panel height to fit content exactly
      notesPanelContent.style.height = 'auto';
      notesPanelContent.style.overflowY = 'visible';
      
      // Set panel height to fit content + padding + header + actions
      const totalPanelHeight = headerHeight + newHeight + contentPadding + actionsHeight + 20; // Extra buffer
      notesPanel.style.height = Math.min(totalPanelHeight, maxPanelHeight) + 'px';
    }
  }
}

// Initialize mobile menu functionality
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMobileMenu = document.getElementById('close-mobile-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');
  
  // Mobile menu items
  const mobileToc = document.getElementById('mobile-toc');
  const mobileTheme = document.getElementById('mobile-theme');
  const mobileFullscreen = document.getElementById('mobile-fullscreen');
  const mobileShare = document.getElementById('mobile-share');
  const mobileRestart = document.getElementById('mobile-restart');
  
  if (mobileMenuToggle && mobileMenu) {
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function() {
      mobileMenu.classList.add('active');
      mobileOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
    
    // Close mobile menu
    if (closeMobileMenu) {
      closeMobileMenu.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      });
    }
    
    // Close when overlay is clicked
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      });
    }
    
    // Mobile menu item actions
    if (mobileToc) {
      mobileToc.addEventListener('click', function() {
        const toc = document.getElementById('toc');
        if (toc) {
          toc.classList.add('active');
          
          // Close mobile menu
          mobileMenu.classList.remove('active');
          mobileOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
    
    if (mobileTheme) {
      mobileTheme.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        // Save theme preference
        if (document.body.classList.contains('dark-mode')) {
          localStorage.setItem('theme', 'dark');
          
          // Update icon in mobile menu
          const themeIcon = this.querySelector('i');
          if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
          }
          
          // Update icon in header if visible
          const headerThemeToggle = document.getElementById('toggle-theme');
          if (headerThemeToggle) {
            headerThemeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light</span>';
          }
        } else {
          localStorage.setItem('theme', 'light');
          
          // Update icon in mobile menu
          const themeIcon = this.querySelector('i');
          if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
          }
          
          // Update icon in header if visible
          const headerThemeToggle = document.getElementById('toggle-theme');
          if (headerThemeToggle) {
            headerThemeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Dark</span>';
          }
        }
      });
    }
    
    if (mobileFullscreen) {
      mobileFullscreen.addEventListener('click', function() {
        // Close mobile menu first
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Toggle fullscreen
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            showNotification('Fullscreen mode is not supported by your browser', 'error');
          });
          
          // Update icon in header if visible
          const fullscreenBtn = document.getElementById('toggle-fullscreen');
          if (fullscreenBtn) {
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i><span>Exit</span>';
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
            
            // Update icon in header if visible
            const fullscreenBtn = document.getElementById('toggle-fullscreen');
            if (fullscreenBtn) {
              fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i><span>Fullscreen</span>';
            }
          }
        }
      });
    }
    
    if (mobileShare) {
      mobileShare.addEventListener('click', function() {
        // Close mobile menu first
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Share the book
        const title = document.querySelector('.book-title')?.textContent || 'The Wonders of Nature';
        sharePage(
          title,
          `Check out this amazing book: "${title}" - An interactive journey through Earth's Beauty!`,
          window.location.href
        );
      });
    }
    
    if (mobileRestart) {
      mobileRestart.addEventListener('click', function() {
        // Close mobile menu first
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Restart book
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const bookCover = document.getElementById('book-cover');
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
  }
  
  // Update mobile menu state on window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 767 && mobileMenu && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      if (mobileOverlay) {
        mobileOverlay.classList.remove('active');
      }
      document.body.style.overflow = '';
    }
  });
  
  // Initialize mobile menu based on saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' && mobileTheme) {
    const themeIcon = mobileTheme.querySelector('i');
    if (themeIcon) {
      themeIcon.className = 'fas fa-sun';
    }
  }
}

// Initialize link panel functionality
function initLinkPanel() {
  const linkPanel = document.getElementById('link-panel');
  const linkPanelOverlay = document.getElementById('link-panel-overlay');
  const closeLinkPanel = document.getElementById('close-link-panel');
  const linkPanelFullscreen = document.getElementById('link-panel-fullscreen');
  const linkPanelTitle = document.getElementById('link-panel-title');
  const linkButtons = document.querySelectorAll('.link-page');
  const tabButtons = document.querySelectorAll('.link-panel-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  // Content elements
  const youtubeIframe = document.getElementById('youtube-iframe');
  const canvaIframe = document.getElementById('canva-iframe');
  const linksList = document.getElementById('links-list');
  const pageContentData = "/book/js/book-content.json";
  // Page specific content data
  // const pageContentData = {
  //   "vertical-section-0": {
  //     title: "Wildlife in Action",
  //     youtube: "https://www.youtube.com/embed/V5DCnRUbMiI", // Wildlife video
  //     canva: "https://www.canva.com/design/DAF6H0dRTUQ/view?embed",
  //     links: [
  //       {
  //         title: "National Geographic",
  //         description: "Explore wildlife photography and conservation efforts.",
  //         url: "https://www.nationalgeographic.com/animals/",
  //         icon: "fas fa-paw"
  //       },
  //       {
  //         title: "Notification Demo in Iframe",
  //         description: "Test iframe notifications with this interactive demo.",
  //         url: "../integrated Folders/notification/iframe-demo.html",
  //         icon: "fas fa-bell"
  //       },
  //       {
  //         title: "WWF Wildlife Conservation",
  //         description: "Learn about wildlife conservation projects around the world.",
  //         url: "https://www.worldwildlife.org/",
  //         icon: "fas fa-globe-americas"
  //       }
  //     ]
  //   },
  //   "vertical-section-1": {
  //     title: "The Changing Seasons",
  //     youtube: "https://www.youtube.com/embed/RMAwdQU0o2o", // Seasons timelapse
  //     canva: "https://www.canva.com/design/DAF1sR0qLDI/view?embed",
  //     links: [
  //       {
  //         title: "Seasonal Phenomena",
  //         description: "Scientific explanation of seasonal changes on Earth.",
  //         url: "https://scijinks.gov/seasons/",
  //         icon: "fas fa-sun"
  //       },
  //       {
  //         title: "Seasonal Photography Tips",
  //         description: "Learn how to capture the beauty of changing seasons.",
  //         url: "https://www.nationalgeographic.com/photography/article/how-to-photograph-the-seasons",
  //         icon: "fas fa-camera"
  //       }
  //     ]
  //   },
  //   "vertical-section-2": {
  //     title: "Guardians of Nature",
  //     youtube: "https://www.youtube.com/embed/jGWdN1xXG7k", // Conservation video
  //     canva: "https://www.canva.com/design/DAFzaiWqJxM/view?embed",
  //     links: [
  //       {
  //         title: "Conservation International",
  //         description: "Global environmental organization working to protect nature.",
  //         url: "https://www.conservation.org/",
  //         icon: "fas fa-leaf"
  //       },
  //       {
  //         title: "How to Become an Environmental Guardian",
  //         description: "Steps you can take to help protect our environment.",
  //         url: "https://www.environmentalscience.org/careers",
  //         icon: "fas fa-shield-alt"
  //       }
  //     ]
  //   },
  //   "vertical-section-3": {
  //     title: "Astral Aesthetics",
  //     youtube: "https://www.youtube.com/embed/rlS9eH5tEnY", // Space video
  //     canva: "https://www.canva.com/design/DAF5UOZVJv8/view?embed",
  //     links: [
  //       {
  //         title: "NASA Image Gallery",
  //         description: "Stunning images of space from NASA missions.",
  //         url: "https://www.nasa.gov/multimedia/imagegallery/",
  //         icon: "fas fa-rocket"
  //       },
  //       {
  //         title: "Space.com",
  //         description: "Latest news and information about space exploration.",
  //         url: "https://www.space.com/",
  //         icon: "fas fa-star"
  //       }
  //     ]
  //   },
  //   "horizontal-section-0": {
  //     title: "Wildlife Landscapes",
  //     youtube: "https://www.youtube.com/embed/4KzFe50RQkQ", // Landscape video
  //     canva: "https://www.canva.com/design/DAF6H0dRTUQ/view?embed",
  //     links: [
  //       {
  //         title: "UNESCO World Heritage Sites",
  //         description: "Natural wonders recognized for their outstanding value.",
  //         url: "https://whc.unesco.org/en/list/",
  //         icon: "fas fa-mountain"
  //       },
  //       {
  //         title: "National Parks Conservation",
  //         description: "Protecting and enhancing America's National Park System.",
  //         url: "https://www.npca.org/",
  //         icon: "fas fa-tree"
  //       }
  //     ]
  //   },
  //   "horizontal-section-1": {
  //     title: "Nature's Symphony",
  //     youtube: "https://www.youtube.com/embed/qAT_Bky9hyc", // Nature sounds
  //     canva: "https://www.canva.com/design/DAF1sR0qLDI/view?embed",
  //     links: [
  //       {
  //         title: "BBC Earth Sounds",
  //         description: "Collection of natural sounds from around the world.",
  //         url: "https://www.bbc.co.uk/programmes/articles/38BYK8zPRwtJtyfNgqHwGc1/natural-history-on-radio-4",
  //         icon: "fas fa-volume-up"
  //       },
  //       {
  //         title: "Nature Sound Map",
  //         description: "Interactive map of nature sounds from around the globe.",
  //         url: "https://www.naturesoundmap.com/",
  //         icon: "fas fa-map-marked-alt"
  //       }
  //     ]
  //   },
  //   "horizontal-section-2": {
  //     title: "Nature's Masterpieces",
  //     youtube: "https://www.youtube.com/embed/46-WSRneTQw", // Landscapes
  //     canva: "https://www.canva.com/design/DAFzaiWqJxM/view?embed",
  //     links: [
  //       {
  //         title: "Natural Wonders of the World",
  //         description: "Explore the most incredible natural formations on Earth.",
  //         url: "https://www.nationalgeographic.com/travel/article/natural-wonders",
  //         icon: "fas fa-globe"
  //       },
  //       {
  //         title: "Landscape Photography",
  //         description: "Tips and techniques for capturing stunning landscapes.",
  //         url: "https://www.outdoorphotographer.com/tips-techniques/landscape-photography-tips/",
  //         icon: "fas fa-camera-retro"
  //       }
  //     ]
  //   },
  //   "horizontal-section-3": {
  //     title: "The Power of Nature",
  //     youtube: "https://www.youtube.com/embed/oaofuaWXdow", // Natural forces
  //     canva: "https://www.canva.com/design/DAF5UOZVJv8/view?embed",
  //     links: [
  //       {
  //         title: "Natural Disasters Information",
  //         description: "Learn about the science behind natural disasters.",
  //         url: "https://www.nationalgeographic.org/encyclopedia/natural-disasters/",
  //         icon: "fas fa-bolt"
  //       },
  //       {
  //         title: "Earth Observatory",
  //         description: "NASA's Earth Observatory - monitoring Earth systems.",
  //         url: "https://earthobservatory.nasa.gov/",
  //         icon: "fas fa-satellite"
  //       }
  //     ]
  //   }
  // };
  
  // Add pulse animation to link buttons to draw attention to the feature
  if (linkButtons) {
    setTimeout(() => {
      linkButtons.forEach(btn => {
        btn.classList.add('pulse');
        
        // Remove pulse after 5 seconds
        setTimeout(() => {
          btn.classList.remove('pulse');
        }, 5000);
      });
    }, 2000);
  }
  
  if (linkButtons && linkPanel && closeLinkPanel) {
    // Add click event to link buttons
    linkButtons.forEach(btn => {
      // Remove existing click events by cloning the button
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      // Add click event to the new button
      newBtn.addEventListener('click', function() {
        // Get section and index
        const section = this.getAttribute('data-section');
        const index = this.getAttribute('data-index');
        const title = this.getAttribute('data-title');
        const contentKey = `${section}-${index}`;
        
        // Load content based on section and index
        loadPanelContent(contentKey, title);
        
        // Show the panel
        linkPanel.classList.add('active');
        linkPanelOverlay.classList.add('active');
        
        // Reset tabs - always show YouTube tab first
        resetTabs();
      });
    });
    
    // Close panel functionality
    closeLinkPanel.addEventListener('click', function() {
      linkPanel.classList.remove('active');
      linkPanel.classList.remove('fullscreen');
      linkPanelOverlay.classList.remove('active');
      
      // Update fullscreen button icon
      if (linkPanelFullscreen) {
        linkPanelFullscreen.innerHTML = '<i class="fas fa-expand"></i>';
      }
      
      // Pause any playing videos
      if (youtubeIframe) {
        youtubeIframe.src = youtubeIframe.src; // Reload iframe to stop video
      }
    });
    
    // Close on overlay click
    if (linkPanelOverlay) {
      linkPanelOverlay.addEventListener('click', function() {
        linkPanel.classList.remove('active');
        linkPanel.classList.remove('fullscreen');
        linkPanelOverlay.classList.remove('active');
        
        // Update fullscreen button icon
        if (linkPanelFullscreen) {
          linkPanelFullscreen.innerHTML = '<i class="fas fa-expand"></i>';
        }
        
        // Pause any playing videos
        if (youtubeIframe) {
          youtubeIframe.src = youtubeIframe.src; // Reload iframe to stop video
        }
      });
    }
    
    // Toggle fullscreen
    if (linkPanelFullscreen) {
      linkPanelFullscreen.addEventListener('click', function() {
        linkPanel.classList.toggle('fullscreen');
        
        // Update icon based on state
        const icon = this.querySelector('i');
        if (linkPanel.classList.contains('fullscreen')) {
          this.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
          this.innerHTML = '<i class="fas fa-expand"></i>';
        }
      });
    }
    
    // Tab switching functionality
    if (tabButtons && tabPanes) {
      tabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
          // Get tab data
          const tabTarget = this.getAttribute('data-tab');
          
          // Remove active class from all tabs and panes
          tabButtons.forEach(t => t.classList.remove('active'));
          tabPanes.forEach(p => p.classList.remove('active'));
          
          // Add active class to clicked tab and corresponding pane
          this.classList.add('active');
          document.getElementById(`${tabTarget}-tab`).classList.add('active');
        });
      });
    }
    
    // Add keyboard shortcut to close panel (Escape key)
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && linkPanel.classList.contains('active')) {
        linkPanel.classList.remove('active');
        linkPanel.classList.remove('fullscreen');
        linkPanelOverlay.classList.remove('active');
        
        // Update fullscreen button icon
        if (linkPanelFullscreen) {
          linkPanelFullscreen.innerHTML = '<i class="fas fa-expand"></i>';
        }
        
        // Pause any playing videos
        if (youtubeIframe) {
          youtubeIframe.src = youtubeIframe.src; // Reload iframe to stop video
        }
      }
    });
  }
  
  // Load content based on section and index
  function loadPanelContent(contentKey, title) {
    console.log('Loading panel content for:', contentKey, title);
    
    // Show initial loading notification
    NotificationManager.show(`Loading content for "${title}"`, 'info', {
      appName: 'Book Panel',
      duration: 2000
    });
    
    // Normalize content key if it contains line breaks or extra spaces
    contentKey = contentKey.trim().replace(/[\r\n]+/g, '');
    
    // Get content data for the specific page
    const contentData = pageContentData[contentKey];
    
    if (!contentData) {
      console.warn(`No content data found for key: ${contentKey}`);
      // Show error notification
      showNotification(`No content available for "${title}"`, 'error', {
        appName: 'Book Panel',
        duration: 4000
      });
      // Fallback to a default message
      showNoContentMessage(title);
      return;
    }
    
    // Set panel title
    if (linkPanelTitle) {
      linkPanelTitle.textContent = contentData.title || title || 'Related Content';
    }
    
    // Get container elements with check and setup
    const youtubeContainer = document.querySelector('.youtube-container');
    const canvaContainer = document.querySelector('.canva-container');
    const linksContainer = document.querySelector('.links-container');
    
    // Ensure containers have position relative
    [youtubeContainer, canvaContainer, linksContainer].forEach(container => {
      if (container) {
        const position = window.getComputedStyle(container).position;
        if (position === 'static') {
          container.style.position = 'relative';
        }
      }
    });
    
    // Show loader in each content container
    const youtubeLoader = youtubeContainer ? showContentLoader(youtubeContainer, 'YouTube') : null;
    const canvaLoader = canvaContainer ? showContentLoader(canvaContainer, 'Canva') : null;
    const linksLoader = linksContainer ? showContentLoader(linksContainer, 'Links') : null;
    
    // Track overall content status
    let hasAnyContent = false;
    
    // Load YouTube content
    const youtubeIframe = document.getElementById('youtube-iframe');
    if (youtubeIframe && contentData.youtube) {
      hasAnyContent = true;
      // Clear existing iframe content first
      youtubeIframe.src = '';
      
      // Set timeout to ensure the iframe is reset before loading new content
      setTimeout(() => {
        youtubeIframe.src = contentData.youtube;
        
        // Hide loader when iframe loads
        youtubeIframe.onload = function() {
          if (youtubeLoader) {
            hideContentLoader(youtubeLoader);
          }
          NotificationManager.group('Video content loaded successfully', 'success', {
            appName: 'YouTube',
            icon: '<i class="fab fa-youtube"></i>',
            duration: 3000
          });
        };
        
        // Handle iframe load errors
        youtubeIframe.onerror = function() {
          if (youtubeLoader) {
            hideContentLoader(youtubeLoader);
          }
          NotificationManager.show('Failed to load video content', 'error', {
            appName: 'YouTube',
            icon: '<i class="fab fa-youtube"></i>',
            duration: 4000
          });
          if (youtubeContainer) {
            showEmptyContainerMessage(youtubeContainer, 'Error loading video content');
          }
        };
        
        // If iframe doesn't load within 5 seconds, hide loader anyway
        setTimeout(() => {
          if (youtubeLoader) {
            hideContentLoader(youtubeLoader);
          }
        }, 5000);
      }, 100);
    } else {
      // No YouTube content or iframe not found
      setTimeout(() => {
        if (youtubeLoader) {
          hideContentLoader(youtubeLoader);
        }
        
        // Show no-content message in the YouTube container
        if (youtubeContainer && (!contentData.youtube || !youtubeIframe)) {
          showEmptyContainerMessage(youtubeContainer, 'No video references available');
        }
      }, 500);
    }
    
    // Load Canva content
    const canvaIframe = document.getElementById('canva-iframe');
    if (canvaIframe && contentData.canva) {
      hasAnyContent = true;
      // Clear existing iframe content first
      canvaIframe.src = '';
      
      // Set timeout to ensure the iframe is reset before loading new content
      setTimeout(() => {
        canvaIframe.src = contentData.canva;
        
        // Hide loader when iframe loads
        canvaIframe.onload = function() {
          if (canvaLoader) {
            hideContentLoader(canvaLoader);
          }
          showNotification('Design content loaded successfully', 'success', {
            appName: 'Canva',
            icon: '<i class="fas fa-palette"></i>',
            duration: 3000
          });
        };
        
        // Handle iframe load errors
        canvaIframe.onerror = function() {
          if (canvaLoader) {
            hideContentLoader(canvaLoader);
          }
          showNotification('Failed to load design content', 'error', {
            appName: 'Canva',
            icon: '<i class="fas fa-palette"></i>',
            duration: 4000
          });
          if (canvaContainer) {
            showEmptyContainerMessage(canvaContainer, 'Error loading design content');
          }
        };
        
        // If iframe doesn't load within 5 seconds, hide loader anyway
        setTimeout(() => {
          if (canvaLoader) {
            hideContentLoader(canvaLoader);
          }
        }, 5000);
      }, 100);
    } else {
      // No Canva content or iframe not found
      setTimeout(() => {
        if (canvaLoader) {
          hideContentLoader(canvaLoader);
        }
        
        // Show no-content message in the Canva container
        if (canvaContainer && (!contentData.canva || !canvaIframe)) {
          showEmptyContainerMessage(canvaContainer, 'No web content references available');
        }
      }, 500);
    }
    
    // Load links content
    setTimeout(() => {
      if (linksList && contentData.links && contentData.links.length > 0) {
        hasAnyContent = true;
        // Clear existing links
        linksList.innerHTML = '';
        
        // Add new links
        contentData.links.forEach((link, index) => {
          const linkItem = document.createElement('div');
          linkItem.className = 'link-item';
          
          // Add animation delay style based on index for staggered animation
          linkItem.style.setProperty('--i', index);
          
          // Check if the link is an iframe demo (contains 'iframe-demo' in the URL)
          const isIframeDemo = link.url.includes('iframe-demo') || link.url.includes('integrated Folders/notification');
          
          linkItem.innerHTML = `
            <div class="link-icon">
              <i class="${link.icon || 'fas fa-link'}"></i>
            </div>
            <div class="link-info">
              <h4>${link.title}</h4>
              <p>${link.description}</p>
              <div class="link-url">${link.url.split('?')[0].replace(/^https?:\/\//, '').substring(0, 30)}${link.url.length > 30 ? '...' : ''}</div>
            </div>
            <div class="link-actions">
              <button class="copy-link" data-url="${link.url}" title="Copy link to clipboard">
                <i class="fas fa-copy"></i>
              </button>
              ${isIframeDemo ? 
                `<button class="load-in-panel" data-url="${link.url}" title="Open in panel">
                  <i class="fas fa-desktop"></i>
                </button>` : ''
              }
              <a href="${link.url}" target="_blank" rel="noopener noreferrer" title="Open in new tab">
                <i class="fas fa-external-link-alt"></i>
              </a>
            </div>
          `;
          
          linksList.appendChild(linkItem);
        });
        
        // Add event listeners to copy buttons
        document.querySelectorAll('.copy-link').forEach(btn => {
          btn.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            copyLinkToClipboard(url, 'Link');
          });
        });
        
        // Add event listeners to "load in panel" buttons
        document.querySelectorAll('.load-in-panel').forEach(btn => {
          btn.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            loadUrlInWebPanel(url);
          });
        });
        
        // Hide the loader and show success notification
        if (linksLoader) {
          hideContentLoader(linksLoader);
        }
        
        NotificationManager.group(`${contentData.links.length} related links available`, 'info', {
          appName: 'Links',
          icon: '<i class="fas fa-link"></i>',
          duration: 3000
        });
      } else {
        // No links available
        if (linksLoader) {
          hideContentLoader(linksLoader);
        }
        
        // Show no-content message in the links container
        if (linksContainer && (!contentData.links || !contentData.links.length)) {
          showEmptyContainerMessage(linksContainer, 'No links references available');
        }
      }
      
      // If no content is found in any section
      if (!hasAnyContent && !contentData.youtube && !contentData.canva && (!contentData.links || contentData.links.length === 0)) {
        NotificationManager.show(`No references available for "${title}"`, 'info', {
          appName: 'Book Panel',
          duration: 4000
        });
      }
    }, 500);
  }
  
  // Make loadPanelContent globally accessible
  window.loadPanelContent = loadPanelContent;
  
  // Reset tabs to default state (YouTube tab active)
  function resetTabs() {
    if (tabButtons && tabPanes) {
      // Remove active class from all tabs and panes
      tabButtons.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      // Set YouTube tab as active
      const videoTab = document.querySelector('.link-panel-tab[data-tab="video"]');
      if (videoTab) {
        videoTab.classList.add('active');
      }
      
      // Set video pane as active
      const videoPane = document.getElementById('video-tab');
      if (videoPane) {
        videoPane.classList.add('active');
      }
    }
  }
  
  // Make resetTabs globally accessible
  window.resetTabs = resetTabs;
  
  // Helper function to show a simple content loader
  function showContentLoader(container, loaderText) {
    if (!container) return null;
    
    // Check if ContentLoader is available from content-loader.js
    if (window.ContentLoader && typeof window.ContentLoader.show === 'function') {
      return window.ContentLoader.show(container, {
        loaderText: loaderText || "Loading",
        text: `Loading ${loaderText.toLowerCase()} content...`,
        smallSize: true
      });
    } else {
      // Create a simple loader if ContentLoader is not available
      const loader = document.createElement('div');
      loader.className = 'simple-loader';
      loader.innerHTML = `
        <div class="loader-spinner"></div>
        <div class="loader-text">Loading ${loaderText || 'content'}...</div>
      `;
      
      // Add some basic styles
      loader.style.position = 'absolute';
      loader.style.top = '0';
      loader.style.left = '0';
      loader.style.width = '100%';
      loader.style.height = '100%';
      loader.style.display = 'flex';
      loader.style.flexDirection = 'column';
      loader.style.alignItems = 'center';
      loader.style.justifyContent = 'center';
      loader.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      loader.style.zIndex = '10';
      
      // Clear container and append loader
      container.innerHTML = '';
      container.appendChild(loader);
      
      return loader;
    }
  }
  
  // Helper function to hide the content loader
  function hideContentLoader(loader) {
    if (!loader) return;
    
    // Check if ContentLoader is available
    if (window.ContentLoader && typeof window.ContentLoader.hide === 'function') {
      window.ContentLoader.hide(loader);
    } else {
      // Remove the simple loader
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }
  }
  
  // Show a message when no content is available
  function showNoContentMessage(title) {
    const linkPanel = document.getElementById('link-panel');
    const linkPanelTitle = document.getElementById('link-panel-title');
    
    if (linkPanelTitle) {
      linkPanelTitle.textContent = title || 'Related Content';
    }
    
    const containers = [
      document.querySelector('.youtube-container'),
      document.querySelector('.canva-container'),
      document.querySelector('.links-container')
    ];
    
    containers.forEach(container => {
      if (container) {
        showEmptyContainerMessage(container, 'No references available');
      }
    });
    
    // Show notification
    NotificationManager.show('No references available for this section', 'info');
  }
  
  // Show a message in an empty container
  function showEmptyContainerMessage(container, message) {
    if (!container) return;
    
    // Use ContentLoader utility if available
    if (window.ContentLoader && typeof window.ContentLoader.showEmptyMessage === 'function') {
      window.ContentLoader.showEmptyMessage(container, message || 'No content available', 'fas fa-info-circle');
      return;
    }
    
    // Fallback if ContentLoader is not available
    // Clear container
    container.innerHTML = '';
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'empty-content-message';
    messageElement.innerHTML = `
      <div class="empty-icon">
        <i class="fas fa-info-circle"></i>
      </div>
      <p>${message || 'No content available'}</p>
    `;
    
    // Add some basic styles
    messageElement.style.display = 'flex';
    messageElement.style.flexDirection = 'column';
    messageElement.style.alignItems = 'center';
    messageElement.style.justifyContent = 'center';
    messageElement.style.height = '100%';
    messageElement.style.padding = '2rem';
    messageElement.style.textAlign = 'center';
    messageElement.style.color = 'rgba(0, 0, 0, 0.5)';
    
    // Style icon
    const icon = messageElement.querySelector('.empty-icon');
    if (icon) {
      icon.style.fontSize = '3rem';
      icon.style.marginBottom = '1rem';
      icon.style.opacity = '0.3';
    }
    
    // Append message to container
    container.appendChild(messageElement);
  }
}

/**
 * Remove any existing word-hover effects by unwrapping spans
 * This ensures any previously added effects are completely removed
 */
function removeWordHoverEffects() {
  // Find all hoverable word spans
  const hoverableWords = document.querySelectorAll('.hoverable-word');
  
  if (hoverableWords.length > 0) {
    console.log('Removing word hover effects from', hoverableWords.length, 'elements');
    
    // Process in batches to prevent UI from freezing
    const batchSize = 50;
    let currentBatch = 0;
    
    function processBatch() {
      const start = currentBatch * batchSize;
      const end = Math.min(start + batchSize, hoverableWords.length);
      
      for (let i = start; i < end; i++) {
        const span = hoverableWords[i];
        // Replace the span with its text content
        if (span && span.parentNode) {
          const textNode = document.createTextNode(span.textContent);
          span.parentNode.replaceChild(textNode, span);
        }
      }
      
      currentBatch++;
      
      // If there are more batches to process, schedule the next one
      if (currentBatch * batchSize < hoverableWords.length) {
        setTimeout(processBatch, 0);
      } else {
        // After all spans are processed, normalize the text nodes
        // to combine adjacent text nodes into a single node
        document.querySelectorAll('.item_p, .chapter-description, .item_content h2').forEach(element => {
          if (element) element.normalize();
        });
      }
    }
    
    // Start processing batches
    processBatch();
  }
  
  // Also remove processed classes from containers
  document.querySelectorAll('.word-hover-processed').forEach(element => {
    element.classList.remove('word-hover-processed');
  });
  
  // Disable any mutation observers related to word-hover
  if (window.wordHoverObserver) {
    window.wordHoverObserver.disconnect();
    window.wordHoverObserver = null;
  }
  
  // Clear any stored processed element sets
  if (window.processedElements) {
    window.processedElements = null;
  }
  
  // Remove any animation flags
  if (window.isAnimating !== undefined) {
    window.isAnimating = false;
  }
  
  if (window.isScrolling !== undefined) {
    window.isScrolling = false;
  }
  
  // Force a document reflow to ensure changes take effect
  document.body.getBoundingClientRect();
}

// Handle messages from iframes
function handleIframeMessage(event) {
  // Validate the message structure
  if (!event.data || typeof event.data !== 'object') return;
  
  const { action, message, type, options, source } = event.data;
  
  // Handle different message actions
  switch (action) {
    case 'showNotification':
      if (message) {
        // Show notification using the parent window's notification system
        showNotification(message, type || 'info', options || {});
      }
      break;
      
    case 'iframeReady':
      console.log('Iframe ready:', source);
      // You can do additional setup for the iframe here if needed
      break;
      
    // Add other message handlers as needed
  }
}

// Load URL in web panel (reusing the Canva iframe)
function loadUrlInWebPanel(url) {
  const canvaTab = document.querySelector('.link-panel-tab[data-tab="canva"]');
  const canvaIframe = document.getElementById('canva-iframe');
  const linkPanelTitle = document.getElementById('link-panel-title');
  
  if (!canvaIframe) {
    showNotification('Web panel is not available', 'error');
    return;
  }
  
  // Show loading notification
  showNotification('Loading web content...', 'info', {
    appName: 'Web Panel',
    icon: '<i class="fas fa-globe"></i>',
    duration: 2000
  });
  
  // Switch to the Canva tab (which we'll use for our web content)
  if (canvaTab) {
    canvaTab.click();
  }
  
  // Update the panel title
  if (linkPanelTitle) {
    linkPanelTitle.textContent = 'Web Content';
  }
  
  // Clear existing iframe content
  canvaIframe.src = '';
  
  // Set timeout to ensure the iframe is reset
  setTimeout(() => {
    // Load the content in the iframe
    canvaIframe.src = url;
    
    // Show success notification when loaded
    canvaIframe.onload = function() {
      showNotification('Web content loaded successfully', 'success', {
        appName: 'Web Panel',
        icon: '<i class="fas fa-check-circle"></i>',
        duration: 3000
      });
    };
    
    // Show error notification if loading fails
    canvaIframe.onerror = function() {
      showNotification('Failed to load web content', 'error', {
        appName: 'Web Panel',
        icon: '<i class="fas fa-exclamation-circle"></i>',
        duration: 4000
      });
    };
  }, 100);
}

/**
 * Helper function to enable panel resizing with memory
 * @param {HTMLElement} panel - The panel element
 * @param {string} storageKey - The localStorage key to use
 */
function enableResizablePanel(panel, storageKey) {
  // Check for saved panel width
  if (localStorage.getItem(storageKey)) {
    const savedWidth = localStorage.getItem(storageKey);
    if (window.innerWidth > 991) { // Only apply on larger screens
      panel.style.width = savedWidth + 'px';
    }
  }
  
  // Add resize tooltip if it doesn't exist
  if (!panel.querySelector('.resize-tooltip')) {
    const tooltip = document.createElement('div');
    tooltip.className = 'resize-tooltip';
    tooltip.textContent = 'Drag to resize';
    panel.appendChild(tooltip);
    
    // Show tooltip on first visit (using session storage)
    const tooltipShown = sessionStorage.getItem(`${storageKey}_tooltip_shown`);
    if (!tooltipShown && window.innerWidth > 991) {
      // Show tooltip with delay
      setTimeout(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(-50%) translateX(0)';
        
        // Hide tooltip after 3 seconds
        setTimeout(() => {
          tooltip.style.opacity = '0';
          sessionStorage.setItem(`${storageKey}_tooltip_shown`, 'true');
        }, 3000);
      }, 1000);
    }
  }
  
  // Listen for resize changes to save user's preferred width
  try {
    if (typeof ResizeObserver !== 'undefined') {
      let resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          if (entry.target === panel && window.innerWidth > 991) {
            // Get the current width and save it
            const currentWidth = entry.contentRect.width;
            if (currentWidth >= 300) { // Only save if it meets minimum
              localStorage.setItem(storageKey, currentWidth);
            }
          }
        }
      });
      
      // Start observing
      resizeObserver.observe(panel);
    }
  } catch (error) {
    console.log('ResizeObserver not supported in this browser');
  }
  
  // Add manual resize handler for better compatibility
  if (window.innerWidth > 991) {
    // Create a resize handle element
    let resizeHandle = document.createElement('div');
    resizeHandle.className = 'manual-resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.left = '0';
    resizeHandle.style.top = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.width = '15px';
    resizeHandle.style.cursor = 'ew-resize';
    resizeHandle.style.zIndex = '99';
    
    // Attach the handle to the panel if it doesn't exist yet
    if (!panel.querySelector('.manual-resize-handle')) {
      panel.appendChild(resizeHandle);
    } else {
      resizeHandle = panel.querySelector('.manual-resize-handle');
    }
    
    // Variables for tracking resize state
    let isResizing = false;
    let startX, startWidth;
    
    // Mouse down event - start resizing
    resizeHandle.addEventListener('mousedown', (e) => {
      // Only allow resizing on larger screens
      if (window.innerWidth <= 991) return;
      
      isResizing = true;
      startX = e.clientX;
      startWidth = parseInt(window.getComputedStyle(panel).width, 10);
      
      // Add a class to indicate resizing is happening
      panel.classList.add('resizing');
      
      // Add resizing event listeners to document
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Prevent default to avoid text selection
      e.preventDefault();
    });
    
    // Mouse move handler
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      // Calculate new width (drag from left edge so movement is reversed)
      const deltaX = e.clientX - startX;
      let newWidth = startWidth - deltaX;
      
      // Apply constraints
      newWidth = Math.max(300, Math.min(newWidth, window.innerWidth * 0.9));
      
      // Apply the new width
      panel.style.width = `${newWidth}px`;
    };
    
    // Mouse up handler
    const handleMouseUp = () => {
      if (!isResizing) return;
      
      // End resizing
      isResizing = false;
      panel.classList.remove('resizing');
      
      // Save the new width
      const newWidth = parseInt(window.getComputedStyle(panel).width, 10);
      if (newWidth >= 300) {
        localStorage.setItem(storageKey, newWidth);
      }
      
      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }
}

/**
 * Setup autosave for notes
 * @param {HTMLTextAreaElement} textarea - The textarea to watch
 * @param {string} section - The section identifier
 * @param {number} index - The note index
 */
function setupAutosave(textarea, section, index) {
  // Clear any existing autosave timer
  if (autosaveTimer) {
    clearInterval(autosaveTimer);
    autosaveTimer = null;
  }
  
  // Store initial value for change detection
  let lastValue = textarea.value;
  
  // Create new autosave timer
  autosaveTimer = setInterval(() => {
    const currentValue = textarea.value;
    
    // Only save if content has changed
    if (currentValue !== lastValue) {
      saveNotes(section, index, currentValue, true);
      lastValue = currentValue;
      
      // Show subtle notification
      NotificationManager.show('Notes autosaved', 'success', {
        appName: 'Notes',
        icon: '<i class="fas fa-save"></i>',
        duration: 1500
      });
    }
  }, AUTOSAVE_DELAY);
  
  // Also set up save on blur (when user clicks away)
  textarea.addEventListener('blur', function() {
    if (textarea.value !== lastValue) {
      saveNotes(section, index, textarea.value, true);
      lastValue = textarea.value;
    }
  });
}
