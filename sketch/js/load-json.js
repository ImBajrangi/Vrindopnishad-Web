console.log('JS file loaded successfully!');
alert('JavaScript is working!');
// ============================================
// CONFIGURATION - Add your JSON file paths here
// ============================================
const JSON_FILES = [
    '/class/json/Default Collection-2026-09-24T15-20-20.json',
    // Add more JSON files as needed:
    '/class/json/Another-Collection.json',
    '/class/json/More-Content.json'
];

// Alternatively, embed JSON directly (no server needed)
const USE_EMBEDDED = true;
const EMBEDDED_DATA = {
    "collection": {
        "name": "Default Collection",
        "entries": [
            {
                "id": "entry-1",
                "title": "श्री हित हरिवंश महाप्रभु",
                "description": "राधावल्लभ संप्रदाय के आचार्य",
                "category": "वैष्णव संत",
                "tags": ["हित हरिवंश", "राधावल्लभ"],
                "content": {
                    "title": "श्री हित हरिवंश महाप्रभु",
                    "content": "श्री हित हरिवंश महाप्रभु, श्री वृंदावन धाम के रसिक शिरोमणि संत और श्री कृष्ण की वंशी के अवतार हैं।",
                    "status": "published",
                    "excerpt": "राधावल्लभ संप्रदाय के आचार्य",
                    "tags": []
                },
                "images": [],
                "videos": [],
                "links": []
            }
            // Add more entries here from your JSON file
        ]
    }
};


// ============================================
// Global variables
// ============================================
let poems = [];
let jsonData = null;
let currentIndex = 0;
let allCollections = []; // Store all loaded collections
let currentCategory = 'all'; // Track current category filter

// Get DOM elements
const contentArea = document.getElementById('contentArea');
const fontDown = document.getElementById('fontDown');
const fontUp = document.getElementById('fontUp');
const themeToggle = document.getElementById('themeToggle');
const dynamicTitle = document.getElementById('dynamicTitle');
const authorDisplay = document.getElementById('authorDisplay');

// ============================================
// Load JSON data - Multiple files support
// ============================================
async function loadAllJSONFiles() {
    contentArea.innerHTML = `
        <div class="no-content">
            <p>Loading poetry collection...</p>
        </div>
    `;

    try {
        // Option 1: Use embedded data
        if (USE_EMBEDDED && EMBEDDED_DATA?.collection?.entries?.length > 0) {
            jsonData = EMBEDDED_DATA;
            poems = EMBEDDED_DATA.collection.entries;
            console.log(`✓ Loaded embedded data with ${poems.length} entries`);
            
            if (EMBEDDED_DATA.collection.name) {
                document.title = `${EMBEDDED_DATA.collection.name} - Vrindopnishad`;
            }
            
            currentIndex = 0;
            displayPoem();
            return;
        }

        // Option 2: Load from external files
        const loadPromises = JSON_FILES.map(async (filePath) => {
            try {
                const response = await fetch(filePath);
                
                if (!response.ok) {
                    console.warn(`Could not load ${filePath}: ${response.status}`);
                    return null;
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType?.includes('application/json')) {
                    console.warn(`${filePath} is not a JSON file`);
                    return null;
                }
                
                return await response.json();
            } catch (error) {
                console.error(`Failed to load ${filePath}:`, error.message);
                return null;
            }
        });

        const results = await Promise.all(loadPromises);
        
        // Combine all entries from all files
        results.forEach((data, index) => {
            if (data?.collection?.entries) {
                allCollections.push(data);
                poems.push(...data.collection.entries);
            }
        });

        if (poems.length === 0) {
            throw new Error('No valid entries found in JSON files');
        }

        console.log(`✓ Loaded ${allCollections.length} collection(s) with ${poems.length} total entries`);
        
        // Use first collection name as default
        if (allCollections[0]?.collection?.name) {
            document.title = `${allCollections[0].collection.name} - Vrindopnishad`;
        }
        
        // Store combined data
        jsonData = {
            collection: {
                name: allCollections.map(c => c.collection?.name).filter(Boolean).join(' & ') || 'Combined Collections',
                entries: poems
            }
        };
        
        currentIndex = 0;
        displayPoem();
        
    } catch (error) {
        console.error('Error loading data:', error);
        contentArea.innerHTML = `
            <div class="no-content">
                <p style="color: #ff6b6b;">Error loading poems: ${error.message}</p>
                <p style="font-size: 0.9rem; margin-top: 1rem; opacity: 0.8;">
                    Please check:<br>
                    1. JSON file paths in the code<br>
                    2. Files exist and are accessible<br>
                    3. Running through a web server (not file:///)
                </p>
            </div>
        `;
    }
}

// ============================================
// Display poem (unchanged UI logic)
// ============================================
function displayPoem() {
    if (poems.length === 0) {
        contentArea.innerHTML = '<div class="no-content"><p>No poems found</p></div>';
        return;
    }

    const poem = poems[currentIndex];
    const poemContent = poem.content;
    
    // Update the main title and author with animation
    dynamicTitle.style.opacity = '0';
    authorDisplay.style.opacity = '0';
    authorDisplay.style.transform = 'translateX(10px)';
    
    setTimeout(() => {
        dynamicTitle.textContent = poemContent.title || 'वृंदोपनिषद्';
        authorDisplay.textContent = poemContent.excerpt || '';
        dynamicTitle.style.opacity = '1';
        authorDisplay.style.opacity = '1';
        authorDisplay.style.transform = 'translateX(0)';
    }, 250);

    const navigation = poems.length > 1 ? `
        <div class="navigation">
            <button class="nav-btn" ${currentIndex === 0 ? 'disabled' : ''} onclick="previousPoem()">← Previous</button>
            <div class="poem-counter">${currentIndex + 1} of ${poems.length}</div>
            <button class="nav-btn" ${currentIndex === poems.length - 1 ? 'disabled' : ''} onclick="nextPoem()">Next →</button>
        </div>
    ` : '';

    const tags = poemContent.tags && poemContent.tags.length > 0 ? 
        `<div class="poem-tags">${poemContent.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';

    const content = formatContent(poemContent.content || '');
    const { imageContent, audioContent, linkContent } = generateSeparateMediaContent(poem);

    contentArea.innerHTML = `
        <div class="reader">
            <h2 class="poem-title">${poem.title || 'वृंदोपनिषद्'}</h2>
            <div class="poem-meta">
                <div class="poem-author">${poem.description || 'श्री हरिवंश'}</div>
                <div class="poem-type">${poem.category || 'भाव'}</div>
                <div class="poem-status ${poemContent.status === 'draft' ? 'draft' : ''}">${poemContent.status || 'published'}</div>
            </div>
            ${tags}
            <div class="poem-content">${content}</div>
            ${linkContent}
            ${audioContent}
            ${imageContent}
        </div>
        ${navigation}
    `;
}

// ============================================
// Helper functions (unchanged)
// ============================================
function formatContent(content) {
    if (!content) return '';
    
    let formattedContent = content.trim();
    
    // Check if it's repetitive content
    const words = formattedContent.split(/\s+/);
    if (words.length > 10 && words.every(word => word.toLowerCase() === words[0].toLowerCase())) {
        const uniqueWord = words[0];
        const count = words.length;
        
        if (count > 20) {
            let formatted = '';
            for (let i = 0; i < count; i++) {
                if (i > 0 && i % 8 === 0) {
                    formatted += '\n\n';
                } else if (i > 0) {
                    formatted += ' ';
                }
                formatted += uniqueWord;
            }
            return formatted;
        }
    }
    
    return formattedContent
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .replace(/\n/g, '\n');
}

function generateSeparateMediaContent(poem) {
    if (!poem) return { imageContent: '', audioContent: '', linkContent: '' };
    
    const poemContent = poem.content;
    const poemTitle = (poemContent.title || '').toLowerCase();
    const poemTags = poemContent.tags || [];
    const poemExcerpt = (poemContent.excerpt || '').toLowerCase();
    
    const imageContent = poem.images && poem.images.length > 0 
        ? generateImageGallery(poem.images.map(img => ({
            src: img.url,
            title: img.title,
            alt: img.title
        })))
        : '';
    
    const audioContent = poem.videos && poem.videos.length > 0
        ? generateAudioPlayer({
            src: poem.videos[0].url,
            title: poem.videos[0].title,
            type: 'video/mp4'
        })
        : '';
    
    const links = poem.links && poem.links.length > 0
        ? poem.links.map(link => ({
            title: link.title,
            url: link.url,
            description: ''
        }))
        : generateRelevantLinks(poemTitle, poemTags, poemExcerpt);
    
    const linkContent = links.length > 0 ? generateLinksSection(links) : '';
    
    return {
        imageContent,
        audioContent,
        linkContent
    };
}

function generateImageGallery(images) {
    if (images.length === 0) return '';
    
    const imageHtml = images.map((image, index) => `
        <div class="media-item">
            <img src="${image.src}" 
                 alt="${image.alt || image.title || 'Sacred Image'}" 
                 title="${image.title || 'Sacred Image'}"
                 loading="lazy"
                 onclick="openImageModal('${image.src}', '${image.title || 'Sacred Image'}')"
                 style="cursor: pointer;">
            ${image.title ? `<p class="media-caption">${image.title}</p>` : ''}
        </div>
    `).join('');
    
    return `
        <div class="media-gallery">
            <h3 class="media-title">Sacred Images</h3>
            <div class="image-grid">
                ${imageHtml}
            </div>
        </div>
    `;
}

function generateAudioPlayer(audio) {
    if (!audio) return '';
    
    return `
        <div class="media-audio">
            <h3 class="media-title">Sacred Audio</h3>
            <div class="audio-player">
                <audio controls preload="metadata" style="width: 100%;">
                    <source src="${audio.src}" type="${audio.type || 'audio/mp3'}">
                    Your browser does not support the audio element.
                </audio>
                <div class="audio-info">
                    <p class="audio-title">${audio.title || 'Sacred Audio'}</p>
                </div>
            </div>
        </div>
    `;
}

function generateRelevantLinks(title, tags, excerpt) {
    const links = [];
    
    if (tags.some(tag => tag.toLowerCase().includes('radhe')) || title.includes('radhe') || excerpt.includes('radhe')) {
        links.push({
            title: 'Radhe Radhe - Divine Love',
            url: 'https://en.wikipedia.org/wiki/Radha',
            description: 'Learn about Radha, the divine consort of Krishna'
        });
    }
    
    if (tags.some(tag => tag.toLowerCase().includes('harivansh')) || title.includes('harivansh') || excerpt.includes('harivansh')) {
        links.push({
            title: 'Harivansh Purana',
            url: 'https://en.wikipedia.org/wiki/Harivamsa',
            description: 'Sacred text describing the lineage of Hari (Vishnu/Krishna)'
        });
    }
    
    if (tags.some(tag => tag.toLowerCase().includes('vrindavan')) || title.includes('vrindavan')) {
        links.push({
            title: 'Vrindavan - Sacred Land',
            url: 'https://en.wikipedia.org/wiki/Vrindavan',
            description: 'The holy land associated with Krishna\'s childhood'
        });
    }
    
    return links;
}

function generateLinksSection(links) {
    if (links.length === 0) return '';
    
    const linksHtml = links.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="sacred-link">
            <div class="link-title">${link.title}</div>
            ${link.description ? `<div class="link-description">${link.description}</div>` : ''}
        </a>
    `).join('');
    
    return `
        <div class="media-links">
            <h3 class="media-title">Related Sacred Links</h3>
            <div class="links-grid">
                ${linksHtml}
            </div>
        </div>
    `;
}

function openImageModal(src, title) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeImageModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeImageModal()">×</button>
            <img src="${src}" alt="${title}" class="modal-image">
            <p class="modal-title">${title}</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    if (!document.querySelector('#modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .image-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(10px);
            }
            .modal-backdrop {
                position: absolute;
                width: 100%;
                height: 100%;
            }
            .modal-content {
                position: relative;
                max-width: 90vw;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .modal-image {
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            .modal-title {
                color: white;
                margin-top: 1rem;
                text-align: center;
                font-size: 1.2rem;
            }
            .modal-close {
                position: absolute;
                top: -40px;
                right: 0;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: none;
                font-size: 2rem;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                line-height: 1;
            }
        `;
        document.head.appendChild(styles);
    }
}

function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.remove();
    }
}

// ============================================
// Navigation functions
// ============================================
function previousPoem() {
    if (currentIndex > 0) {
        currentIndex--;
        displayPoem();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function nextPoem() {
    if (currentIndex < poems.length - 1) {
        currentIndex++;
        displayPoem();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ============================================
// Controls (unchanged)
// ============================================
fontDown.addEventListener('click', () => {
    const content = document.querySelector('.poem-content');
    if (content) {
        const currentSize = parseFloat(window.getComputedStyle(content).fontSize);
        const newSize = Math.max(currentSize * 0.85, 16);
        content.style.fontSize = newSize + 'px';
    }
});

fontUp.addEventListener('click', () => {
    const content = document.querySelector('.poem-content');
    if (content) {
        const currentSize = parseFloat(window.getComputedStyle(content).fontSize);
        const newSize = Math.min(currentSize * 1.15, 40);
        content.style.fontSize = newSize + 'px';
    }
});

// Theme toggle
let isDark = false;

const iconStyles = document.createElement('style');
iconStyles.textContent = `
    #themeToggle i {
        font-size: 1.2rem;
        transition: transform 0.3s ease, color 0.3s ease;
    }
    #themeToggle i.fa-sun {
        color: #ffde24ff;
    }
    #themeToggle i.fa-moon {
        color: #afc3ffff;
    }
    #themeToggle:hover i {
        transform: rotate(45deg);
    }
`;
document.head.appendChild(iconStyles);

function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.top = Math.random() * window.innerHeight + 'px';
    star.style.left = Math.random() * window.innerWidth + 'px';
    star.style.transform = `rotate(${Math.random() * 45}deg)`;
    document.body.appendChild(star);
    
    setTimeout(() => {
        star.remove();
    }, 2000);
}

function createStars(count) {
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'particle';
        star.style.width = (Math.random() * 3 + 1) + 'px';
        star.style.height = star.style.width;
        star.style.top = Math.random() * 100 + 'vh';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.animationDelay = Math.random() * 3 + 's';
        document.body.appendChild(star);
    }
}

createStars(50);
setInterval(createShootingStar, 8000);

const nebula = document.createElement('div');
nebula.className = 'nebula';
document.body.appendChild(nebula);

themeToggle.addEventListener('click', () => {
    if (isDark) {
        document.body.style.background = `
            linear-gradient(45deg, #000621ff, transparent),
            linear-gradient(-45deg, #1b0036ff, transparent),
            linear-gradient(135deg, #1d0043ff, transparent),
            linear-gradient(-135deg, #2c0044ff, transparent)
        `;
        document.documentElement.style.setProperty('--nebula-color-1', 'rgba(35, 8, 47, 0.15)');
        document.documentElement.style.setProperty('--nebula-color-2', 'rgba(10, 28, 60, 0.15)');
        document.documentElement.style.setProperty('--nebula-color-3', 'rgba(31, 6, 45, 0.15)');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.style.background = `
            linear-gradient(45deg, #000036ff, transparent),
            linear-gradient(-45deg, #000047ff, transparent),
            linear-gradient(135deg, #2d0066, transparent),
            linear-gradient(-135deg, #33004fff, transparent)
        `;
        document.documentElement.style.setProperty('--nebula-color-1', 'rgba(60, 0, 120, 0.35)');
        document.documentElement.style.setProperty('--nebula-color-2', 'rgba(0, 45, 105, 0.35)');
        document.documentElement.style.setProperty('--nebula-color-3', 'rgba(73, 0, 115, 0.35)');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    document.body.style.backgroundSize = '400% 400%, 400% 400%, 400% 400%, 400% 400%';
    isDark = !isDark;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
        previousPoem();
    }
    if (e.key === 'ArrowRight' && currentIndex < poems.length - 1) {
        nextPoem();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '+') {
        e.preventDefault();
        fontUp.click();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        fontDown.click();
    }
});

// ============================================
// Initialize - Load all JSON files
// ============================================
loadAllJSONFiles();