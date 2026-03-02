/**
 * Book Integration Script
 * Bridges the dynamic loader with existing book.js functionality
 */

// Prevent book.js from auto-initializing
window.preventBookAutoInit = true;

// Wait for dynamic content to be loaded
document.addEventListener('dynamicBookReady', function(event) {
  console.log('Dynamic book content ready, initializing book functionality...');
  
  // Now initialize the book.js functionality
  if (typeof initBookInterface === 'function') {
    initializeBookFunctionality();
  } else {
    // Wait for book.js to load
    waitForBookJS();
  }
});

function initializeBookFunctionality() {
  try {
    // Initialize book functionality in the correct order
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
    
    console.log('Book functionality initialized successfully');
  } catch (error) {
    console.error('Error initializing book functionality:', error);
  }
}

function waitForBookJS() {
  let attempts = 0;
  const maxAttempts = 100; // 10 seconds
  
  const checkInterval = setInterval(() => {
    attempts++;
    
    if (typeof initBookInterface === 'function') {
      clearInterval(checkInterval);
      initializeBookFunctionality();
    } else if (attempts >= maxAttempts) {
      clearInterval(checkInterval);
      console.error('Timeout waiting for book.js to load');
    }
  }, 100);
}

// Enhanced book.js functions to work with dynamic content
function enhanceBookFunctions() {
  // Override the original loadPanelContent function to work with dynamic data
  const originalLoadPanelContent = window.loadPanelContent;
  
  window.loadPanelContent = function(contentKey, title) {
    console.log('Loading panel content for:', contentKey, title);
    
    // Try to get content from pageContentData (set by dynamic loader)
    const contentData = window.pageContentData && window.pageContentData[contentKey];
    
    if (contentData) {
      loadDynamicPanelContent(contentData, title);
    } else if (originalLoadPanelContent) {
      // Fallback to original function
      originalLoadPanelContent(contentKey, title);
    } else {
      console.warn('No content found for:', contentKey);
      showNoContentMessage(title);
    }
  };
}

function loadDynamicPanelContent(contentData, title) {
  const linkPanel = document.getElementById('link-panel');
  const linkPanelOverlay = document.getElementById('link-panel-overlay');
  const linkPanelTitle = document.getElementById('link-panel-title');
  
  if (!linkPanel) return;
  
  // Set title
  if (linkPanelTitle) {
    linkPanelTitle.textContent = contentData.title || title;
  }
  
  // Load YouTube content
  const youtubeIframe = document.getElementById('youtube-iframe');
  if (youtubeIframe && contentData.youtube) {
    youtubeIframe.src = contentData.youtube;
  }
  
  // Load Canva content
  const canvaIframe = document.getElementById('canva-iframe');
  if (canvaIframe && contentData.canva) {
    canvaIframe.src = contentData.canva;
  }
  
  // Load links
  const linksList = document.getElementById('links-list');
  if (linksList && contentData.links && contentData.links.length > 0) {
    let linksHTML = '';
    contentData.links.forEach((link, index) => {
      linksHTML += `
        <div class="link-item" style="--i: ${index}">
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
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" title="Open in new tab">
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      `;
    });
    linksList.innerHTML = linksHTML;
    
    // Add event listeners to copy buttons
    document.querySelectorAll('.copy-link').forEach(btn => {
      btn.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        copyLinkToClipboard(url, 'Link');
      });
    });
  }
}

function showNoContentMessage(title) {
  const linkPanelTitle = document.getElementById('link-panel-title');
  if (linkPanelTitle) {
    linkPanelTitle.textContent = title || 'Related Content';
  }
  
  // Show empty state in containers
  const containers = [
    document.querySelector('.youtube-container'),
    document.querySelector('.canva-container'),
    document.querySelector('.links-container')
  ];
  
  containers.forEach(container => {
    if (container) {
      container.innerHTML = '<div class="empty-message">No content available</div>';
    }
  });
}

// Admin panel for dynamic content management
function createAdminPanel() {
  if (document.getElementById('admin-panel')) return; // Already exists
  
  const adminPanel = document.createElement('div');
  adminPanel.id = 'admin-panel';
  adminPanel.innerHTML = `
    <div class="admin-panel-content">
      <h3>Dynamic Book Admin</h3>
      <div class="admin-actions">
        <button id="admin-add-page">Add Page</button>
        <button id="admin-export-data">Export Data</button>
        <button id="admin-import-data">Import Data</button>
        <button id="admin-reload">Reload</button>
        <button id="admin-toggle" class="admin-toggle">Admin</button>
      </div>
      <div class="admin-form" id="add-page-form" style="display: none;">
        <h4>Add New Page</h4>
        <select id="admin-chapter-select">
          <option value="vertical-section">Chapter 1 (Vertical)</option>
          <option value="horizontal-section">Chapter 2 (Horizontal)</option>
        </select>
        <input type="text" id="admin-page-title" placeholder="Page Title" />
        <textarea id="admin-page-description" placeholder="Page Description"></textarea>
        <input type="url" id="admin-media-url" placeholder="Media URL" />
        <select id="admin-media-type">
          <option value="video">Video</option>
          <option value="image">Image</option>
        </select>
        <button id="admin-save-page">Save Page</button>
        <button id="admin-cancel">Cancel</button>
      </div>
      <input type="file" id="admin-file-input" accept=".json" style="display: none;" />
    </div>
  `;
  
  // Add styles
  const adminStyles = document.createElement('style');
  adminStyles.textContent = `
    #admin-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      z-index: 10000;
      font-family: monospace;
      font-size: 12px;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    #admin-panel.collapsed .admin-panel-content > *:not(.admin-toggle) {
      display: none;
    }
    
    .admin-actions button {
      margin: 2px;
      padding: 4px 8px;
      font-size: 11px;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
      border-radius: 3px;
    }
    
    .admin-actions button:hover {
      background: #e9e9e9;
    }
    
    .admin-toggle {
      position: absolute;
      top: 5px;
      right: 5px;
      font-weight: bold;
    }
    
    .admin-form input, .admin-form textarea, .admin-form select {
      width: 100%;
      margin: 5px 0;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 3px;
      font-size: 11px;
    }
    
    .admin-form textarea {
      height: 60px;
      resize: vertical;
    }
  `;
  document.head.appendChild(adminStyles);
  document.body.appendChild(adminPanel);
  
  // Bind admin events
  bindAdminEvents();
  
  // Start collapsed
  adminPanel.classList.add('collapsed');
}

function bindAdminEvents() {
  const toggleBtn = document.getElementById('admin-toggle');
  const addPageBtn = document.getElementById('admin-add-page');
  const exportBtn = document.getElementById('admin-export-data');
  const importBtn = document.getElementById('admin-import-data');
  const reloadBtn = document.getElementById('admin-reload');
  const savePageBtn = document.getElementById('admin-save-page');
  const cancelBtn = document.getElementById('admin-cancel');
  const fileInput = document.getElementById('admin-file-input');
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.getElementById('admin-panel').classList.toggle('collapsed');
    });
  }
  
  if (addPageBtn) {
    addPageBtn.addEventListener('click', () => {
      const form = document.getElementById('add-page-form');
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (window.dynamicBookLoader) {
        window.dynamicBookLoader.exportBookData();
      }
    });
  }
  
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      fileInput.click();
    });
  }
  
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      if (window.dynamicBookLoader) {
        window.dynamicBookLoader.reload().then(() => {
          location.reload(); // Refresh page after reload
        });
      }
    });
  }
  
  if (savePageBtn) {
    savePageBtn.addEventListener('click', saveNewPage);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      document.getElementById('add-page-form').style.display = 'none';
      clearAdminForm();
    });
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && window.dynamicBookLoader) {
        window.dynamicBookLoader.importBookData(file).then(() => {
          alert('Data imported successfully! Reloading page...');
          location.reload();
        }).catch((error) => {
          alert('Import failed: ' + error.message);
        });
      }
    });
  }
}

function saveNewPage() {
  const chapterId = document.getElementById('admin-chapter-select').value;
  const title = document.getElementById('admin-page-title').value;
  const description = document.getElementById('admin-page-description').value;
  const mediaUrl = document.getElementById('admin-media-url').value;
  const mediaType = document.getElementById('admin-media-type').value;
  
  if (!title.trim()) {
    alert('Please enter a page title');
    return;
  }
  
  const pageData = {
    title: title.trim(),
    description: description.trim(),
    mediaUrl: mediaUrl.trim(),
    mediaType: mediaType,
    tocTitle: title.trim(),
    relatedContent: {
      youtube: null,
      canva: null,
      links: []
    }
  };
  
  if (window.addBookPage(chapterId, pageData)) {
    alert('Page added successfully!');
    document.getElementById('add-page-form').style.display = 'none';
    clearAdminForm();
    
    // Reinitialize scroll sections
    if (typeof initScrollSections === 'function') {
      initScrollSections();
    }
  } else {
    alert('Failed to add page');
  }
}

function clearAdminForm() {
  document.getElementById('admin-page-title').value = '';
  document.getElementById('admin-page-description').value = '';
  document.getElementById('admin-media-url').value = '';
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  enhanceBookFunctions();
  
  // Create admin panel in development mode
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.search.includes('admin=true')) {
    createAdminPanel();
  }
});

// Debug utilities
window.debugBook = {
  getBookData: () => window.dynamicBookLoader?.getBookData(),
  addPage: (chapterId, pageData) => window.addBookPage(chapterId, pageData),
  updatePage: (chapterId, pageId, newData) => window.updateBookPage(chapterId, pageId, newData),
  removePage: (chapterId, pageId) => window.removeBookPage(chapterId, pageId),
  exportData: () => window.exportBookData(),
  reloadData: () => window.reloadBookData(),
  showAdminPanel: () => createAdminPanel()
};