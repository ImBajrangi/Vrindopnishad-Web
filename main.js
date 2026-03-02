// Sample data
const data = {
  pages: [
    { id: 1, title: 'Monsoon Whispers', desc: 'Poem page about rains', src: 'class/image/Home Pics/img_sn01.png', featured: true, trending: true, date: '2026-07-20', tags: ['nature', 'hindi'], href: 'page/content.html' },
    { id: 2, title: 'Midnight Ghazal', desc: 'Romantic verses', src: 'class/image/Home Pics/img_sn02.png', featured: false, trending: false, date: '2026-07-22', tags: ['romance', 'english'], href: 'page/content.html' },
  ],
  videos: [
    { id: 1, title: 'Recital: Kabir', desc: 'Dohe in voice-over', src: 'Stack/sounds/info.mp3', featured: true, trending: true, date: '2026-07-18', tags: ['kabir', 'recital'], href: 'Gallery/main/Gallery.html' },
  ],
  pictures: [
    { id: 1, title: 'Ink and Paper', desc: 'Still life', src: 'class/image/icons/book-open-cover.svg', featured: false, trending: false, date: '2026-07-23', tags: ['art', 'aesthetic'], href: 'Gallery/main/Gallery.html' },
  ]
};

// State
let selectedFilter = 'all';
let selectedTags = [];
let searchTerm = '';
let currentLayout = 'grid';
let currentRecommendation = null;
let enhancedResults = null;

// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Utility functions
function getAllTags() {
  const allTags = new Set();
  Object.values(data).forEach(category => {
    category.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => allTags.add(tag));
      }
    });
  });
  return Array.from(allTags);
}

function renderTagChips() {
  const tagFilters = document.getElementById('tag-filters');
  const tags = getAllTags();

  tagFilters.innerHTML = tags.map(tag =>
    `<span class="tag-chip" data-tag="${tag}">${tag}</span>`
  ).join('');
}

function itemMatchesFilters(item) {
  if (selectedFilter === 'all') return true;
  if (selectedFilter === 'featured' && item.featured) return true;
  if (selectedFilter === 'trending' && item.trending) return true;
  if (selectedFilter === 'newest') {
    const itemDate = new Date(item.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return itemDate > weekAgo;
  }
  return false;
}

function itemMatchesSearch(item) {
  if (!searchTerm) return true;
  // If we have enhanced results with relevance scores, use those
  if (enhancedResults && enhancedResults.rankedResults) {
    return enhancedResults.rankedResults.some(r => r.id === item.id);
  }
  const searchLower = searchTerm.toLowerCase();
  return item.title.toLowerCase().includes(searchLower) ||
    item.desc.toLowerCase().includes(searchLower);
}

function itemMatchesTags(item) {
  if (selectedTags.length === 0) return true;
  return selectedTags.some(tag => item.tags && item.tags.includes(tag));
}

function createItemElement(item, type) {
  const element = document.createElement('div');
  element.className = 'item fade-in';

  const badgesHtml = [];
  if (item.featured) badgesHtml.push('<span class="badge">Featured</span>');
  if (item.trending) badgesHtml.push('<span class="badge">Trending</span>');

  const tagsHtml = item.tags ?
    `<div class="tag-list">${item.tags.map(tag => `<span class="tag-chip">${tag}</span>`).join('')}</div>` : '';

  const mediaHtml = type === 'videos'
    ? `<video src="${item.src}" controls></video>`
    : `<img src="${item.src}" alt="${item.title}">`;

  const href = item.href || '#';
  element.innerHTML = `${badgesHtml.length ? `<div class="badges">${badgesHtml.join('')}</div>` : ''}
    <div class="item-inner">
      ${mediaHtml}
      <div class="item-content">
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        ${tagsHtml}
      </div>
      <a class="block-link" href="${href}"></a>
    </div>`;
  return element;
}

function renderItems() {
  const container = document.getElementById('items-container');
  container.innerHTML = '';

  let allItems = [];

  // Collect all items that match filters
  Object.entries(data).forEach(([type, items]) => {
    items.forEach(item => {
      if (itemMatchesFilters(item) && itemMatchesSearch(item) && itemMatchesTags(item)) {
        allItems.push({ ...item, type });
      }
    });
  });

  // If we have enhanced results with relevance scores, sort by relevance
  if (enhancedResults && enhancedResults.rankedResults && searchTerm) {
    const scoreMap = new Map();
    enhancedResults.rankedResults.forEach(r => {
      scoreMap.set(r.title, r.relevance_score || 0);
    });
    allItems.sort((a, b) => (scoreMap.get(b.title) || 0) - (scoreMap.get(a.title) || 0));
  }

  // Show recommendation panel if available
  renderRecommendationPanel();

  // Create and append elements
  allItems.forEach((item, index) => {
    const element = createItemElement(item, item.type);
    container.appendChild(element);

    // Add staggered GSAP animation
    gsap.fromTo(element,
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay: index * 0.1,
        ease: "back.out(1.7)"
      }
    );
  });

  // Update layout class
  container.className = `items-container ${currentLayout === 'stack' ? 'stack-layout' : ''}`;
}

function renderRecommendationPanel() {
  let recPanel = document.querySelector('.hit-soochi-rec-panel');

  if (!currentRecommendation || !searchTerm) {
    if (recPanel) recPanel.remove();
    return;
  }

  const primary = currentRecommendation.primary_recommendation;
  if (!primary) return;

  if (!recPanel) {
    recPanel = document.createElement('div');
    recPanel.className = 'hit-soochi-rec-panel';
    const container = document.getElementById('items-container');
    container.parentNode.insertBefore(recPanel, container);
  }

  recPanel.innerHTML = `
    <div class="rec-card" data-intent="${currentRecommendation.detected_intent}">
      <span class="rec-icon">${primary.icon}</span>
      <div class="rec-content">
        <strong>Try ${primary.service}</strong>
        <p>${primary.description}</p>
      </div>
      <a href="${primary.url}" class="rec-cta">${primary.cta} →</a>
    </div>
  `;

  // Animate in
  gsap.fromTo(recPanel,
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
  );
}

function setupFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFilter = btn.dataset.filter;
      renderItems();
    });
  });
}

function setupLayoutToggle() {
  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLayout = btn.dataset.layout;
      renderItems();
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('search-input');
  let debounceTimer;

  // Initialize HitSoochi if available
  if (typeof HitSoochi !== 'undefined') {
    HitSoochi.init('#search-input', {
      enableSuggestions: true,
      onSearch: (query) => performEnhancedSearch(query)
    });
  }

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchTerm = e.target.value;
      performEnhancedSearch(searchTerm);
    }, 300);
  });
}

async function performEnhancedSearch(query) {
  if (!query || query.length < 2) {
    enhancedResults = null;
    currentRecommendation = null;
    renderItems();
    return;
  }

  // Use HitSoochi if available
  if (typeof HitSoochi !== 'undefined') {
    try {
      // Get all items for ranking
      const allItems = [];
      Object.entries(data).forEach(([type, items]) => {
        items.forEach(item => allItems.push({ ...item, type }));
      });

      enhancedResults = await HitSoochi.enhancedSearch(query, allItems);
      currentRecommendation = enhancedResults.recommendations;

      console.log('🔍 HitSoochi Enhanced Search:', {
        intent: enhancedResults.intent,
        confidence: enhancedResults.confidence,
        results: enhancedResults.rankedResults?.length || 0
      });
    } catch (error) {
      console.warn('HitSoochi search failed, using fallback:', error);
      enhancedResults = null;
      currentRecommendation = null;
    }
  }

  renderItems();
}

function setupCardTilt() {
  document.body.addEventListener('mousemove', (event) => {
    const target = event.target.closest('.poem-stack .item-inner');
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;

    gsap.to(target, {
      duration: 0.3,
      rotationY: x,
      rotationX: y,
      ease: "power2.out"
    });
  }, { passive: true });

  document.body.addEventListener('mouseleave', (event) => {
    const target = event.target && event.target.closest ? event.target.closest('.poem-stack .item-inner') : null;
    if (target) {
      gsap.to(target, {
        duration: 0.3,
        rotationY: 0,
        rotationX: 0,
        ease: "power2.out"
      });
    }
  }, true);
}

function setupTagFilters() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-chip')) {
      const tag = e.target.dataset.tag;

      if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter(t => t !== tag);
        e.target.classList.remove('active');
      } else {
        selectedTags.push(tag);
        e.target.classList.add('active');
      }

      renderItems();
    }
  });
}

// GSAP Animations
function initializeGSAPAnimations() {
  // Header animations
  gsap.fromTo('.poem-stack header',
    { opacity: 0, y: -50 },
    { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
  );

  // Filter animations
  gsap.fromTo('.poem-stack .filters',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power2.out" }
  );

  // Scroll-triggered animations for items
  ScrollTrigger.batch('.poem-stack .item', {
    onEnter: (elements) => {
      gsap.fromTo(elements,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)"
        }
      );
    },
    onLeave: (elements) => {
      gsap.to(elements, { opacity: 0, y: -50, duration: 0.3 });
    },
    onEnterBack: (elements) => {
      gsap.to(elements, { opacity: 1, y: 0, duration: 0.6 });
    },
    onLeaveBack: (elements) => {
      gsap.to(elements, { opacity: 0, y: 50, duration: 0.3 });
    }
  });

  // Parallax effect for header
  gsap.to('.poem-stack header', {
    yPercent: -50,
    ease: "none",
    scrollTrigger: {
      trigger: '.poem-stack',
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  renderTagChips();
  setupFilterButtons();
  setupLayoutToggle();
  setupSearch();
  setupCardTilt();
  setupTagFilters();
  renderItems();

  // Initialize GSAP animations
  initializeGSAPAnimations();

  // Tools menu open/close bindings (match Home behavior)
  const toolsIcon = document.querySelector('.tools-icon');
  const toolsMenu = document.querySelector('.tools-menu');
  const toolsMenuClose = document.querySelector('.tools-menu-close');
  const body = document.body;

  if (toolsIcon && toolsMenu) {
    toolsIcon.addEventListener('click', () => {
      toolsMenu.classList.add('active');
      body.classList.add('tools-menu-open');

      // GSAP animation for tools menu
      gsap.fromTo('.tools-menu .tool-item',
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)"
        }
      );
    });
  }

  if (toolsMenuClose && toolsMenu) {
    toolsMenuClose.addEventListener('click', () => {
      toolsMenu.classList.remove('active');
      body.classList.remove('tools-menu-open');
    });
  }

  // Close tools menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toolsMenu && toolsMenu.classList.contains('active')) {
      toolsMenu.classList.remove('active');
      body.classList.remove('tools-menu-open');
    }
  });

  console.log('🎭 Poem Stack initialized with GSAP animations!');
});

// Export for debugging
window.poemStackData = data;
window.poemStackState = { selectedFilter, selectedTags, searchTerm, currentLayout };

