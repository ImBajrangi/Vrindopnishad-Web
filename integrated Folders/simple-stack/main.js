// Poem Stack data model with tags and featured
const data = {
  pages: [
    { id: 1, title: 'Monsoon Whispers', desc: 'Poem page about rains', src: '/class/image/Home Pics/img_sn01.png', featured: true, trending: true, date: '2026-07-20', tags: ['nature','hindi'], href: 'page/content.html' },
    { id: 2, title: 'Midnight Ghazal', desc: 'Romantic verses', src: '/class/image/Home Pics/img_sn02.png', featured: false, trending: false, date: '2026-07-22', tags: ['romance','english'], href: 'page/content.html' },
  ],
  videos: [
    { id: 1, title: 'Recital: Kabir', desc: 'Dohe in voice-over', src: 'Stack/sounds/info.mp3', featured: true, trending: true, date: '2026-07-18', tags: ['kabir','recital'], href: 'Gallery/main/Gallery.html' },
  ],
  pictures: [
    { id: 1, title: 'Ink and Paper', desc: 'Still life', src: 'class/image/icons/book-open-cover.svg', featured: false, trending: false, date: '2026-07-23', tags: ['art','aesthetic'], href: 'Gallery/main/Gallery.html' },
  ]
};

const filterButtons = () => Array.from(document.querySelectorAll('.filters .filter-group button'));
const layoutButtons = () => Array.from(document.querySelectorAll('.filters .layout-toggle button'));
const categorySections = () => Array.from(document.querySelectorAll('.category-grid'));
const searchInput = () => document.getElementById('searchInput');
const tagFiltersContainer = () => document.getElementById('tagFilters');

let selectedFilter = 'all';
let selectedLayout = 'grid';
let selectedTags = new Set();

function getAllTags() {
  const allItems = [...data.pages, ...data.videos, ...data.pictures];
  return Array.from(new Set(allItems.flatMap(i => i.tags || []))).sort();
}

function renderTagChips() {
  const container = tagFiltersContainer();
  if (!container) return;
  container.innerHTML = '';
  getAllTags().forEach(tag => {
    const chip = document.createElement('button');
    chip.className = 'tag';
    chip.textContent = `#${tag}`;
    chip.dataset.tag = tag;
    chip.addEventListener('click', () => {
      if (selectedTags.has(tag)) selectedTags.delete(tag); else selectedTags.add(tag);
      chip.classList.toggle('active');
      renderItems();
    });
    container.appendChild(chip);
  });
}

function itemMatchesFilters(item, filter) {
  if (filter === 'featured' && !item.featured) return false;
  if (filter === 'trending' && !item.trending) return false;
  return true;
}

function itemMatchesSearch(item, term) {
  if (!term) return true;
  const hay = `${item.title} ${item.desc} ${(item.tags||[]).join(' ')}`.toLowerCase();
  return hay.includes(term.toLowerCase());
}

function itemMatchesTags(item) {
  if (selectedTags.size === 0) return true;
  const tags = new Set(item.tags || []);
  for (const t of selectedTags) { if (!tags.has(t)) return false; }
  return true;
}

function createItemElement(item, type) {
  const element = document.createElement('div');
  element.className = 'item';
  element.dataset.id = String(item.id);
  element.dataset.type = type;

  const mediaHtml = type === 'videos'
    ? `<video src="${item.src}" controls></video>`
    : `<img src="${item.src}" alt="${item.title}">`;

  const badgesHtml = `
    <div class="badges">
      ${item.featured ? '<span class="badge">Featured</span>' : ''}
      ${item.trending ? '<span class="badge">Trending</span>' : ''}
    </div>`;

  const tagsHtml = `<div class="tag-list">${(item.tags||[]).map(t=>`<span class="tag-chip">#${t}</span>`).join('')}</div>`;

  const href = item.href || '#';
  element.innerHTML = `${badgesHtml}
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

function applyLayout(container) {
  if (selectedLayout === 'stack') container.classList.add('stack');
  else container.classList.remove('stack');
}

function renderItems() {
  const term = (searchInput() && searchInput().value) || '';
  categorySections().forEach(section => {
    const type = section.id; // pages | videos | pictures
    const container = section.querySelector('.items');
    if (!container) return;
    container.innerHTML = '';

    let items = data[type] || [];
    if (selectedFilter === 'newest') {
      items = items.slice().sort((a,b)=> new Date(b.date) - new Date(a.date));
    }
    items = items.filter(i => itemMatchesFilters(i, selectedFilter))
                 .filter(i => itemMatchesSearch(i, term))
                 .filter(i => itemMatchesTags(i));

    items.forEach(item => container.appendChild(createItemElement(item, type)));
    applyLayout(container);
  });
}

function setupFilterButtons() {
  filterButtons().forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons().forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFilter = btn.dataset.filter;
      renderItems();
    });
  });
}

function setupLayoutToggle() {
  layoutButtons().forEach(btn => {
    btn.addEventListener('click', () => {
      layoutButtons().forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedLayout = btn.dataset.layout;
      renderItems();
    });
  });
}

function setupSearch() {
  const input = searchInput();
  if (!input) return;
  input.addEventListener('input', () => renderItems());
}

function setupCardTilt() {
  document.body.addEventListener('mousemove', (event) => {
    const card = event.target.closest('.item');
    if (!card) return;
    const inner = card.querySelector('.item-inner');
    if (!inner) return;
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    inner.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) scale(1.01)`;
  }, { passive: true });
  document.body.addEventListener('mouseleave', (event) => {
    const card = event.target && event.target.closest ? event.target.closest('.item') : null;
    if (!card) return;
    const inner = card.querySelector('.item-inner');
    if (inner) inner.style.transform = '';
  }, true);
}

document.addEventListener('DOMContentLoaded', () => {
  renderTagChips();
  setupFilterButtons();
  setupLayoutToggle();
  setupSearch();
  setupCardTilt();
  renderItems();

  // Tools menu open/close bindings (match Home behavior)
  const toolsIcon = document.querySelector('.tools-icon');
  const toolsMenu = document.querySelector('.tools-menu');
  const toolsMenuClose = document.querySelector('.tools-menu-close');
  const body = document.body;
  if (toolsIcon && toolsMenu) {
    toolsIcon.addEventListener('click', () => {
      toolsMenu.classList.add('active');
      body.classList.add('tools-menu-open');
    });
  }
  if (toolsMenuClose && toolsMenu) {
    toolsMenuClose.addEventListener('click', () => {
      toolsMenu.classList.remove('active');
      body.classList.remove('tools-menu-open');
    });
  }
});


