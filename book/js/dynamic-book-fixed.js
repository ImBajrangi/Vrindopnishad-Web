/**
 * Dynamic Book Content Loader - Fixed Version
 * Loads content from JSON and renders it dynamically
 */
class BookContentLoader {
  constructor(jsonPath = '/book/js/book-content.json') {
    this.jsonPath = jsonPath;
    this.bookData = null;
    this.currentPage = 1;
    this.totalPages = 0;
    this.isLoading = false;
    
    this.init();
  }

  async init() {
    try {
      this.isLoading = true;
      await this.loadContentData();
      this.renderAllContent();
      this.bindDynamicEvents();
      this.isLoading = false;
      console.log('✅ Dynamic book content loaded successfully');
    } catch (error) {
      console.error('❌ Error initializing dynamic book:', error);
      this.handleLoadError(error);
    }
  }

  async loadContentData() {
    try {
      // Show loading indicator
      this.showLoadingIndicator();
      
      const response = await fetch(this.jsonPath);
      if (!response.ok) {
        throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store the complete data
      this.bookData = data;
      
      // Calculate total pages
      this.calculateTotalPages();
      
      this.hideLoadingIndicator();
      
    } catch (error) {
      this.hideLoadingIndicator();
      throw error;
    }
  }

  calculateTotalPages() {
    if (!this.bookData.chapters) return;
    
    this.totalPages = this.bookData.chapters.reduce((total, chapter) => {
      return total + (chapter.pages ? chapter.pages.length : 0);
    }, 0);
    
    // Update total pages display
    const totalPagesEl = document.getElementById('total-pages');
    if (totalPagesEl) {
      totalPagesEl.textContent = this.totalPages;
    }
  }

  showLoadingIndicator() {
    // Create or show loading overlay
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
      loadingOverlay = document.createElement('div');
      loadingOverlay.id = 'loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>Loading book content...</p>
        </div>
      `;
      loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
        font-family: inherit;
      `;
      
      const loadingContent = loadingOverlay.querySelector('.loading-content');
      loadingContent.style.cssText = `
        text-align: center;
        padding: 2rem;
      `;
      
      const spinner = loadingOverlay.querySelector('.loading-spinner');
      spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top: 3px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      `;
      
      // Add spin animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(loadingOverlay);
    }
    loadingOverlay.style.display = 'flex';
  }

  hideLoadingIndicator() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  }

  renderAllContent() {
    if (!this.bookData) {
      console.error('No book data available for rendering');
      return;
    }

    // Render each section
    this.renderBookCover();
    this.renderTableOfContents();
    this.renderChaptersContent();
    this.renderBookEnd();
    
    // Update navigation
    this.updatePageNavigation();
    
    console.log('📚 All content rendered successfully');
  }

  renderBookCover() {
    const bookCover = document.getElementById('book-cover');
    if (!bookCover || !this.bookData.bookInfo) return;

    const { title, subtitle } = this.bookData.bookInfo;
    
    bookCover.innerHTML = `
      <div class="cover-content">
        <h1 class="book-title">${title || 'Dynamic Book'}</h1>
        <p class="book-subtitle">${subtitle || 'An interactive reading experience'}</p>
        <button class="start-reading" id="start-reading">
          Start Reading <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;

    // Bind start reading event
    const startBtn = bookCover.querySelector('#start-reading');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        bookCover.style.display = 'none';
        sessionStorage.setItem('hasStartedReading', 'true');
      });
    }
  }

  renderTableOfContents() {
    const tocList = document.querySelector('.toc-list');
    if (!tocList || !this.bookData.chapters) return;

    let tocHTML = '';
    let pageCounter = 1;

    this.bookData.chapters.forEach(chapter => {
      if (!chapter.pages) return;
      
      chapter.pages.forEach(page => {
        const isActive = pageCounter === 1 ? 'active' : '';
        tocHTML += `
          <li class="toc-item ${isActive}" data-section="${chapter.id}" data-index="${page.id}" data-page="${pageCounter}">
            <span class="toc-number">${pageCounter}.</span> ${page.tocTitle || page.title}
          </li>
        `;
        pageCounter++;
      });
    });

    tocList.innerHTML = tocHTML;
  }

  renderChaptersContent() {
    if (!this.bookData.chapters) return;

    const chaptersContainer = document.getElementById('chapters-container');
    if (!chaptersContainer) return;

    let chaptersHTML = '';

    this.bookData.chapters.forEach((chapter, chapterIndex) => {
      // Create chapter intro
      chaptersHTML += this.generateChapterIntroHTML(chapter, chapterIndex);
      
      // Create chapter section
      chaptersHTML += this.generateChapterSectionHTML(chapter);
    });

    chaptersContainer.innerHTML = chaptersHTML;
  }

  generateChapterIntroHTML(chapter, index) {
    return `
      <div class="section chapter-intro" id="${chapter.id}-intro">
        <div class="container-medium">
          <div class="padding-vertical">
            <div class="max-width-large">
              <div class="chapter-header">
                <span class="chapter-number">Chapter ${chapter.chapterNumber}</span>
                <h1 class="heading">${chapter.title}</h1>
                <p class="chapter-description">${chapter.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  generateChapterSectionHTML(chapter) {
    const scrollType = chapter.scrollType || 'vertical';
    const sectionClass = scrollType === 'horizontal' ? 'horizontal-section' : 'vertical-section';
    
    let pagesHTML = '';
    if (chapter.pages) {
      chapter.pages.forEach(page => {
        pagesHTML += this.generatePageHTML(page, chapter.id);
      });
    }

    return `
      <div class="scroll-section ${sectionClass} section" id="${chapter.id}">
        <div class="wrapper">
          <div role="list" class="list">
            ${pagesHTML}
          </div>
        </div>
      </div>
    `;
  }

  generatePageHTML(page, sectionId) {
    const mediaHTML = this.generateMediaHTML(page);
    
    return `
      <div role="listitem" class="item" data-page="${page.pageNumber}">
        <div class="page-number">Page ${page.pageNumber}</div>
        <div class="item_content">
          <h2 class="item_number">${page.itemNumber}</h2>
          <h2>${page.title}</h2>
          <p class="item_p">${page.description}</p>
          <div class="page-actions">
            <button class="page-action bookmark" data-section="${sectionId}" data-index="${page.id}" title="Bookmark this page">
              <i class="fas fa-bookmark"></i>
            </button>
            <button class="page-action notes" data-section="${sectionId}" data-index="${page.id}" title="Add notes">
              <i class="fas fa-sticky-note"></i>
            </button>
            <button class="page-action block-music" data-section="${sectionId}" data-index="${page.id}" title="Background music">
              <i class="fas fa-music"></i>
            </button>
            <button class="page-action link-page" data-section="${sectionId}" data-index="${page.id}" data-title="${page.tocTitle || page.title}" title="Related content">
              <i class="fas fa-link"></i>
            </button>
          </div>
        </div>
        ${mediaHTML}
      </div>
    `;
  }

  generateMediaHTML(page) {
    if (!page.mediaUrl) return '';

    switch (page.mediaType) {
      case 'video':
        return `
          <video
            src="${page.mediaUrl}"
            loading="lazy"
            autoplay
            muted
            loop
            playsinline
            class="item_media"
            onloadstart="console.log('Loading video:', '${page.title}')"
            onerror="console.error('Failed to load video:', '${page.mediaUrl}')"
          ></video>
        `;
      
      case 'image':
        return `
          <img
            src="${page.mediaUrl}"
            loading="lazy"
            alt="${page.title}"
            class="item_media"
            onerror="console.error('Failed to load image:', '${page.mediaUrl}')"
          />
        `;
      
      default:
        return '';
    }
  }

  renderBookEnd() {
    const bookEndElement = document.querySelector('#book-end .end-content');
    if (!bookEndElement || !this.bookData.endContent) return;

    const { title, message } = this.bookData.endContent;

    bookEndElement.innerHTML = `
      <h1 class="heading">${title}</h1>
      <p class="end-message">${message}</p>
      <div class="end-actions">
        <button class="action-btn" id="restart-book">
          <i class="fas fa-redo"></i> Read Again
        </button>
        <button class="action-btn" id="share-book">
          <i class="fas fa-link"></i> Share
        </button>
      </div>
    `;

    // Bind events
    const restartBtn = bookEndElement.querySelector('#restart-book');
    const shareBtn = bookEndElement.querySelector('#share-book');

    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restartBook());
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareBook());
    }
  }

  bindDynamicEvents() {
    // Bind link page events
    document.addEventListener('click', (e) => {
      const linkBtn = e.target.closest('.link-page');
      if (linkBtn) {
        const section = linkBtn.dataset.section;
        const index = parseInt(linkBtn.dataset.index);
        const title = linkBtn.dataset.title;
        this.handleLinkPageClick(section, index, title);
      }
    });

    // Bind TOC events
    document.addEventListener('click', (e) => {
      const tocItem = e.target.closest('.toc-item');
      if (tocItem) {
        const section = tocItem.dataset.section;
        const index = parseInt(tocItem.dataset.index);
        const page = parseInt(tocItem.dataset.page);
        this.handleTocClick(section, index, page);
      }
    });

    console.log('🔗 Dynamic events bound successfully');
  }

  handleLinkPageClick(sectionId, pageIndex, title) {
    const chapter = this.findChapter(sectionId);
    if (!chapter) return;

    const page = this.findPage(chapter, pageIndex);
    if (!page || !page.relatedContent) {
      console.warn('No related content found for page:', title);
      return;
    }

    this.showRelatedContentPanel(page, title);
  }

  handleTocClick(sectionId, pageIndex, pageNumber) {
    // Update current page
    this.currentPage = pageNumber;
    this.updatePageNavigation();

    // Update TOC active state
    document.querySelectorAll('.toc-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"][data-index="${pageIndex}"]`)?.classList.add('active');

    // Scroll to section
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }

    // Close TOC if open
    const toc = document.getElementById('toc');
    if (toc) {
      toc.classList.remove('active');
    }
  }

  showRelatedContentPanel(page, title) {
    const linkPanel = document.getElementById('link-panel');
    const linkPanelOverlay = document.getElementById('link-panel-overlay');
    const linkPanelTitle = document.getElementById('link-panel-title');
    
    if (!linkPanel) {
      console.warn('Link panel not found in DOM');
      return;
    }

    // Update title
    if (linkPanelTitle) {
      linkPanelTitle.textContent = `${title} - Related Content`;
    }

    const { relatedContent } = page;

    // Update YouTube content
    if (relatedContent.youtube) {
      const youtubeIframe = document.getElementById('youtube-iframe');
      if (youtubeIframe) {
        // Handle both full URLs and video IDs
        const youtubeUrl = relatedContent.youtube.includes('youtube.com') 
          ? relatedContent.youtube 
          : `https://www.youtube.com/embed/${relatedContent.youtube}?autoplay=0&rel=0`;
        youtubeIframe.src = youtubeUrl;
      }
    }

    // Update Canva content
    if (relatedContent.canva) {
      const canvaIframe = document.getElementById('canva-iframe');
      if (canvaIframe) {
        canvaIframe.src = relatedContent.canva;
      }
    }

    // Update links content
    if (relatedContent.links && relatedContent.links.length > 0) {
      const linksList = document.getElementById('links-list');
      if (linksList) {
        let linksHTML = '';
        relatedContent.links.forEach(link => {
          linksHTML += `
            <div class="link-item">
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
            if (window.copyLinkToClipboard) {
              window.copyLinkToClipboard(url, 'Link');
            } else {
              navigator.clipboard.writeText(url).then(() => {
                alert('Link copied to clipboard!');
              });
            }
          });
        });
      }
    }

    // Show panel
    linkPanel.classList.add('active');
    linkPanelOverlay.classList.add('active');
    
    // Reset tabs to show YouTube first
    this.resetTabs();
  }

  resetTabs() {
    const tabButtons = document.querySelectorAll('.link-panel-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
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

  findChapter(sectionId) {
    return this.bookData.chapters.find(ch => ch.id === sectionId);
  }

  findPage(chapter, pageIndex) {
    return chapter.pages.find(p => p.id === pageIndex);
  }

  updatePageNavigation() {
    const currentPageEl = document.getElementById('current-page');
    if (currentPageEl) {
      currentPageEl.textContent = this.currentPage;
    }

    // Update progress bar if exists
    const progressBar = document.getElementById('reading-progress');
    if (progressBar && this.totalPages > 0) {
      const progress = (this.currentPage / this.totalPages) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }

  restartBook() {
    this.currentPage = 1;
    this.updatePageNavigation();
    
    // Show book cover
    const bookCover = document.getElementById('book-cover');
    if (bookCover) {
      bookCover.style.display = 'flex';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Clear session storage
    sessionStorage.removeItem('hasStartedReading');
  }

  shareBook() {
    const title = this.bookData.bookInfo?.title || 'Interactive Book';
    const text = `Check out "${title}" - ${this.bookData.bookInfo?.subtitle || 'An amazing interactive reading experience'}`;
    const url = window.location.href;

    if (window.sharePage && typeof window.sharePage === 'function') {
      window.sharePage(title, text, url);
    } else if (navigator.share) {
      navigator.share({ title, text, url }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${title} - ${url}`).then(() => {
        alert('Book link copied to clipboard!');
      }).catch(() => {
        alert(`Share this book: ${url}`);
      });
    }
  }

  handleLoadError(error) {
    const mainWrapper = document.querySelector('.main-wrapper');
    if (mainWrapper) {
      mainWrapper.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; color: #666;">
          <h2>⚠️ Content Loading Error</h2>
          <p>Failed to load book content: ${error.message}</p>
          <p>Please check:</p>
          <ul style="text-align: left; display: inline-block; margin: 1rem 0;">
            <li>JSON file path: <code>${this.jsonPath}</code></li>
            <li>JSON file format and structure</li>
            <li>Network connection</li>
            <li>Console for detailed errors</li>
          </ul>
          <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer;">
            🔄 Retry Loading
          </button>
        </div>
      `;
    }
  }

  // Public API methods for external use
  addNewPage(chapterId, pageData) {
    const chapter = this.findChapter(chapterId);
    if (!chapter) {
      console.error('Chapter not found:', chapterId);
      return false;
    }

    // Ensure required fields
    pageData.id = pageData.id || chapter.pages.length;
    pageData.pageNumber = pageData.pageNumber || this.totalPages + 1;
    pageData.itemNumber = pageData.itemNumber || pageData.pageNumber;

    chapter.pages.push(pageData);
    this.totalPages++;
    
    // Re-render affected content
    this.renderChaptersContent();
    this.renderTableOfContents();
    this.updatePageNavigation();
    
    console.log('✅ New page added successfully');
    return true;
  }

  updatePage(chapterId, pageIndex, newData) {
    const chapter = this.findChapter(chapterId);
    if (!chapter) return false;

    const pageIdx = chapter.pages.findIndex(p => p.id === pageIndex);
    if (pageIdx === -1) return false;

    // Update page data
    chapter.pages[pageIdx] = { ...chapter.pages[pageIdx], ...newData };
    
    // Re-render affected content
    this.renderChaptersContent();
    this.renderTableOfContents();
    
    console.log('✅ Page updated successfully');
    return true;
  }

  getBookData() {
    return this.bookData;
  }

  async reloadContent(newJsonPath = null) {
    if (newJsonPath) {
      this.jsonPath = newJsonPath;
    }
    await this.init();
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if book content loader should be initialized
  if (typeof initializeBookContentLoader !== 'undefined' && !initializeBookContentLoader) {
    return; // Skip auto-initialization if disabled
  }

  // Create global instance
  window.bookContentLoader = new BookContentLoader();
  
  // Make it available globally for debugging
  window.BookContentLoader = BookContentLoader;
  
  console.log('📖 Book Content Loader initialized and ready!');
});

// Utility functions for easy access
window.addBookPage = function(chapterId, pageData) {
  if (window.bookContentLoader) {
    return window.bookContentLoader.addNewPage(chapterId, pageData);
  }
  console.error('Book content loader not initialized');
  return false;
};

window.updateBookPage = function(chapterId, pageIndex, newData) {
  if (window.bookContentLoader) {
    return window.bookContentLoader.updatePage(chapterId, pageIndex, newData);
  }
  console.error('Book content loader not initialized');
  return false;
};

window.getBookData = function() {
  if (window.bookContentLoader) {
    return window.bookContentLoader.getBookData();
  }
  console.error('Book content loader not initialized');
  return null;
};


