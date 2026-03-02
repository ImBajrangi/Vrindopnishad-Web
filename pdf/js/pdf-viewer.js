// PDF Viewer JavaScript

// PDF.js variables
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.0;
let rotation = 0;
let pdfData = null; // Store PDF data for download/print
let isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
let thumbnailSwiper = null;
let isMobile = window.innerWidth <= 768;

// Three.js space background variables
let scene, camera, renderer;
let stars = [];
let constellationPoints = [];
let constellationLines = [];

// DOM Elements
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('file-input');
const openFileBtn = document.getElementById('open-file-btn');
const downloadBtn = document.getElementById('download-btn');
const printBtn = document.getElementById('print-btn');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const zoomLevelText = document.getElementById('zoom-level');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageText = document.getElementById('current-page');
const totalPagesText = document.getElementById('total-pages');
const rotateBtn = document.getElementById('rotate-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const dropArea = document.getElementById('drop-area');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const closeSidebarBtn = document.getElementById('close-sidebar');
const thumbnailsContainer = document.getElementById('thumbnails-container');
const loader = document.getElementById('loader');
const fileNameElement = document.getElementById('file-name');
const errorModal = document.getElementById('error-modal');
const errorMessage = document.getElementById('error-message');
const closeModalBtns = document.querySelectorAll('.close-modal-btn');
const leftArrow = document.getElementById('left-arrow');
const rightArrow = document.getElementById('right-arrow');
const spaceBackground = document.getElementById('space-background');
const themeToggle = document.getElementById('theme-toggle');
const starsContainer = document.querySelector('.constellation-lines');

// Space background settings
const spaceSettings = {
    starsCount: 650,
    starSize: { min: 0.2, max: 2.0 },
    starColor: 0xffffff,
    constellationCount: 10,
    constellationPointsMin: 5,
    constellationPointsMax: 12,
    constellationLineColor: 0x6366f1, // Updated to match theme
    constellationLineOpacity: 0.3,
    cameraZ: 1000,
    movementSpeed: 0.2
};

// Initialize the PDF viewer
async function init() {
    // Set PDF.js worker source
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '../libs/pdf.worker.min.js';
    }

    // Check if device is mobile
    detectMobileDevice();

    // Add event listeners
    fileInput.addEventListener('change', handleFileSelect);
    openFileBtn.addEventListener('click', () => fileInput.click());
    downloadBtn.addEventListener('click', downloadPDF);
    printBtn.addEventListener('click', printPDF);
    zoomInBtn.addEventListener('click', () => {
        if (scale < 3.0) {
            scale += 0.25;
            updateZoomLevel();
            queueRenderPage(pageNum);
        }
    });
    zoomOutBtn.addEventListener('click', () => {
        if (scale > 0.5) {
            scale -= 0.25;
            updateZoomLevel();
            queueRenderPage(pageNum);
        }
    });
    prevPageBtn.addEventListener('click', onPrevPage);
    nextPageBtn.addEventListener('click', onNextPage);
    leftArrow.addEventListener('click', onPrevPage);
    rightArrow.addEventListener('click', onNextPage);
    rotateBtn.addEventListener('click', () => {
        rotation = (rotation + 90) % 360;
        queueRenderPage(pageNum);
    });
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    sidebarToggle.addEventListener('click', toggleSidebar);
    closeSidebarBtn.addEventListener('click', toggleSidebar);
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => errorModal.classList.remove('show'));
    });

    // Track mouse for space background effect
    document.addEventListener('mousemove', animateStars);

    // Handle window resize
    window.addEventListener('resize', () => {
        // Update mobile detection
        detectMobileDevice();

        if (pdfDoc) {
            // Adjust PDF canvas if necessary
            resizeCanvas();
        }

        // Reset Three.js scene
        if (renderer) {
            updateThreeJsSize();
        }

        // Update thumbnail container for mobile
        updateThumbnailDisplay();
    });

    // Add keyboard event listeners
    window.addEventListener('keydown', handleKeyDown);

    // Drag and drop
    setupDragAndDrop();

    // Initialize space background
    initSpaceBackground();

    // Draw static constellation lines
    drawConstellationLines();

    // Hide navigation arrows initially
    leftArrow.style.display = 'none';
    rightArrow.style.display = 'none';

    // Add pulsing glow effect to buttons
    addButtonGlowEffect();

    // Check for book in URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('book');
    const directPdfPath = urlParams.get('file');

    if (bookId) {
        loadBookById(bookId);
    } else if (directPdfPath) {
        loadPdf(directPdfPath);
    }
}

// Load book data and PDF by book ID
async function loadBookById(bookId) {
    try {
        showLoader();
        const response = await fetch('../../class/json/books-data.json');
        if (!response.ok) throw new Error('Failed to load books data');

        const data = await response.json();
        const book = data.books.find(b => b.id === parseInt(bookId));

        if (book && book.format.includes('pdf')) {
            // Update UI with book title
            if (fileNameElement) fileNameElement.textContent = book.title;

            // Construct PDF path - following the pattern in the original embedded script
            const pdfPath = `../pdfs/${book.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
            loadPdf(pdfPath);
        } else {
            showError('Book not found or PDF format not available.');
            hideLoader();
        }
    } catch (error) {
        console.error('Error loading book:', error);
        showError('Could not load book information.');
        hideLoader();
    }
}

// Load PDF from a URL/path
async function loadPdf(path) {
    try {
        showLoader();
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);

        const arrayBuffer = await response.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);
        pdfData = typedArray;

        // Load the PDF using the existing core logic
        loadPDF(typedArray);

        // Hide drop area and show navigation
        if (dropArea) dropArea.style.display = 'none';
        if (leftArrow) leftArrow.style.display = 'flex';
        if (rightArrow) rightArrow.style.display = 'flex';

    } catch (error) {
        console.error('Error loading PDF from path:', error);
        showError('Could not load the PDF file. Please check the file path.');
        hideLoader();
    }
}

// Add pulsing glow effect to buttons
function addButtonGlowEffect() {
    const primaryButtons = document.querySelectorAll('.primary-btn');
    primaryButtons.forEach(btn => {
        btn.addEventListener('mouseover', () => {
            btn.style.boxShadow = `0 0 15px 5px ${isDarkTheme ? 'rgba(129, 140, 248, 0.5)' : 'rgba(99, 102, 241, 0.5)'}`;
        });
        btn.addEventListener('mouseout', () => {
            btn.style.boxShadow = '';
        });
    });

    const toolButtons = document.querySelectorAll('.tool-btn:not([disabled])');
    toolButtons.forEach(btn => {
        btn.addEventListener('mouseover', () => {
            btn.style.boxShadow = `0 0 10px 2px ${isDarkTheme ? 'rgba(129, 140, 248, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`;
        });
        btn.addEventListener('mouseout', () => {
            btn.style.boxShadow = '';
        });
    });
}

// Detect if the device is mobile
function detectMobileDevice() {
    isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('mobile-device', isMobile);

    if (isMobile) {
        // Apply mobile-specific adjustments
        if (scale > 1.0) {
            scale = 1.0;
            updateZoomLevel();
            if (pdfDoc) queueRenderPage(pageNum);
        }
    }
}

// Update thumbnail display based on device
function updateThumbnailDisplay() {
    if (pdfDoc) {
        // For mobile mode
        if (isMobile) {
            // Adjust the thumbnail container layout for horizontal scrolling
            thumbnailsContainer.style.display = 'flex';
            thumbnailsContainer.style.flexDirection = 'row';
            thumbnailsContainer.style.flexWrap = 'nowrap';
            thumbnailsContainer.style.overflowX = 'auto';
            thumbnailsContainer.style.overflowY = 'hidden';
            thumbnailsContainer.style.padding = '10px';
            thumbnailsContainer.style.scrollSnapType = 'x mandatory';
            thumbnailsContainer.style.scrollBehavior = 'smooth';
            thumbnailsContainer.style.WebkitOverflowScrolling = 'touch'; // iOS smooth scrolling

            // Adjust individual thumbnails
            const thumbnails = document.querySelectorAll('.thumbnail');
            thumbnails.forEach(thumbnail => {
                thumbnail.style.flex = '0 0 auto';
                thumbnail.style.width = '130px'; // Slightly larger thumbnails
                thumbnail.style.marginRight = '15px';
                thumbnail.style.marginBottom = '0';
                thumbnail.style.scrollSnapAlign = 'start';
                thumbnail.style.border = '1px solid var(--border-color)';

                // Make the active thumbnail more noticeable
                if (thumbnail.classList.contains('active')) {
                    thumbnail.style.border = '2px solid var(--primary-color)';
                    thumbnail.style.boxShadow = '0 0 10px 2px var(--primary-color)';

                    // Ensure active thumbnail is visible
                    setTimeout(() => {
                        thumbnail.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'center'
                        });
                    }, 100);
                }
            });

            // Special case for landscape orientation
            if (window.innerWidth > window.innerHeight) {
                thumbnailsContainer.style.maxHeight = (window.innerHeight - 150) + 'px';
                thumbnailsContainer.style.flexWrap = 'wrap';
                thumbnailsContainer.style.overflowY = 'auto';
                thumbnailsContainer.style.alignContent = 'flex-start';
                thumbnailsContainer.style.justifyContent = 'center';

                thumbnails.forEach(thumbnail => {
                    const width = window.innerWidth < 768 ?
                        'calc(33.33% - 15px)' :
                        'calc(25% - 18px)';
                    thumbnail.style.width = width;
                    thumbnail.style.marginBottom = '15px';
                });
            }
        } else {
            // For desktop mode - vertical layout
            thumbnailsContainer.style.display = '';
            thumbnailsContainer.style.flexDirection = '';
            thumbnailsContainer.style.flexWrap = '';
            thumbnailsContainer.style.overflowX = '';
            thumbnailsContainer.style.overflowY = '';
            thumbnailsContainer.style.padding = '';
            thumbnailsContainer.style.scrollSnapType = '';
            thumbnailsContainer.style.scrollBehavior = '';
            thumbnailsContainer.style.WebkitOverflowScrolling = '';
            thumbnailsContainer.style.maxHeight = '';
            thumbnailsContainer.style.alignContent = '';
            thumbnailsContainer.style.justifyContent = '';

            // Reset individual thumbnails
            const thumbnails = document.querySelectorAll('.thumbnail');
            thumbnails.forEach(thumbnail => {
                thumbnail.style.flex = '';
                thumbnail.style.width = '';
                thumbnail.style.marginRight = '';
                thumbnail.style.marginBottom = '';
                thumbnail.style.scrollSnapAlign = '';
                thumbnail.style.border = '';
                thumbnail.style.boxShadow = '';

                // Keep active state styling but reset inline styles
                if (thumbnail.classList.contains('active')) {
                    thumbnail.style.border = '2px solid var(--primary-color)';
                    thumbnail.style.boxShadow = '0 0 8px 1px var(--primary-color)';
                }
            });
        }

        // Ensure thumbnail container is visible in sidebar
        if (sidebar.classList.contains('open')) {
            thumbnailsContainer.style.visibility = 'visible';
            thumbnailsContainer.style.opacity = '1';
        }

        // Update active thumbnail
        updateActiveThumbnail();
    }
}

// Initialize Three.js space background
function initSpaceBackground() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = spaceSettings.cameraZ;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    spaceBackground.appendChild(renderer.domElement);

    // Create stars with better materials
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: spaceSettings.starColor,
        size: 2,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    const starVertices = [];
    const starSizes = [];
    const starColors = [];

    // Create a variety of star colors for more realistic effect
    const colors = [
        new THREE.Color(0xffffff), // White
        new THREE.Color(0xccffff), // Light blue
        new THREE.Color(0xffffcc), // Light yellow
        new THREE.Color(0xffcccc)  // Light red
    ];

    for (let i = 0; i < spaceSettings.starsCount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;

        starVertices.push(x, y, z);

        // Random star size
        const size = Math.random() * (spaceSettings.starSize.max - spaceSettings.starSize.min) + spaceSettings.starSize.min;
        starSizes.push(size);

        // Random star color
        const color = colors[Math.floor(Math.random() * colors.length)];
        starColors.push(color.r, color.g, color.b);

        stars.push({
            x: x,
            y: y,
            z: z,
            size: size,
            velocity: Math.random() * 0.05
        });
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // Create constellations
    for (let i = 0; i < spaceSettings.constellationCount; i++) {
        createConstellation();
    }

    // Start animation loop
    animateSpace();
}

// Update Three.js dimensions on window resize
function updateThreeJsSize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Create a single constellation
function createConstellation() {
    const pointCount = Math.floor(Math.random() *
        (spaceSettings.constellationPointsMax - spaceSettings.constellationPointsMin) +
        spaceSettings.constellationPointsMin);

    const points = [];
    const centerX = (Math.random() - 0.5) * 1000;
    const centerY = (Math.random() - 0.5) * 1000;
    const centerZ = (Math.random() - 0.5) * 1000;

    for (let i = 0; i < pointCount; i++) {
        const x = centerX + (Math.random() - 0.5) * 200;
        const y = centerY + (Math.random() - 0.5) * 200;
        const z = centerZ + (Math.random() - 0.5) * 200;

        points.push({ x, y, z });
    }

    constellationPoints.push(points);
}

// Draw 2D constellation lines in the background
function drawConstellationLines() {
    starsContainer.innerHTML = '';

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create between a variable number of constellations based on screen size
    const constellationCount = Math.max(3, Math.floor(Math.min(width, height) / 250));

    for (let c = 0; c < constellationCount; c++) {
        // Each constellation has variable points
        const pointCount = Math.floor(Math.random() * 5) + 5;
        const points = [];

        // Create a center point for the constellation
        const centerX = Math.random() * width;
        const centerY = Math.random() * height;

        // Create the points around the center
        for (let i = 0; i < pointCount; i++) {
            const distance = 50 + Math.random() * 150;
            const angle = Math.random() * Math.PI * 2;

            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            points.push({ x, y });

            // Create a star point with glow effect
            const star = document.createElement('div');
            star.className = 'constellation-star';
            star.style.left = `${x}px`;
            star.style.top = `${y}px`;

            // Variable star sizes
            const size = (2 + Math.random() * 4);
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            // Add animation delay for twinkling effect
            star.style.animationDelay = `${Math.random() * 3}s`;

            starsContainer.appendChild(star);
        }

        // Connect the points with lines - more sophisticated connections
        for (let i = 0; i < points.length - 1; i++) {
            // Connect to nearest few points rather than random
            const distances = [];

            for (let j = 0; j < points.length; j++) {
                if (i !== j) {
                    const dist = Math.sqrt(
                        Math.pow(points[j].x - points[i].x, 2) +
                        Math.pow(points[j].y - points[i].y, 2)
                    );
                    distances.push({ index: j, distance: dist });
                }
            }

            // Sort by distance
            distances.sort((a, b) => a.distance - b.distance);

            // Connect to nearest 1-3 points
            const connectCount = Math.floor(Math.random() * 2) + 1;
            for (let k = 0; k < Math.min(connectCount, distances.length); k++) {
                createLine(points[i], points[distances[k].index]);
            }
        }
    }
}

// Create a line between two points
function createLine(point1, point2) {
    const distance = Math.sqrt(
        Math.pow(point2.x - point1.x, 2) +
        Math.pow(point2.y - point1.y, 2)
    );

    const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);

    const line = document.createElement('div');
    line.className = 'constellation-line';
    line.style.width = `${distance}px`;
    line.style.height = '2px';
    line.style.left = `${point1.x}px`;
    line.style.top = `${point1.y}px`;
    line.style.transform = `rotate(${angle}rad)`;

    // Add pulsing animation with random delay
    line.style.animationDelay = `${Math.random() * 5}s`;

    starsContainer.appendChild(line);
}

// Animate the Three.js space background
function animateSpace() {
    requestAnimationFrame(animateSpace);

    // Rotate the camera slightly for continuous movement
    camera.rotation.x += 0.0001;
    camera.rotation.y += 0.0002;

    // Update star positions for twinkling/movement effect
    if (stars.length > 0 && scene.children.length > 0) {
        const positions = scene.children[0].geometry.attributes.position.array;

        for (let i = 0; i < stars.length; i++) {
            const idx = i * 3;
            stars[i].z += stars[i].velocity;

            // Reset star position if it goes too far
            if (stars[i].z > 1000) {
                stars[i].z = -1000;
                positions[idx + 2] = stars[i].z;
            } else {
                positions[idx + 2] = stars[i].z;
            }
        }

        scene.children[0].geometry.attributes.position.needsUpdate = true;
    }

    // Render the scene
    if (renderer) {
        renderer.render(scene, camera);
    }
}

// Animate stars based on mouse movement
function animateStars(e) {
    if (!e || !camera) return;

    const mouseX = e.clientX - window.innerWidth / 2;
    const mouseY = e.clientY - window.innerHeight / 2;

    camera.position.x += (mouseX * spaceSettings.movementSpeed - camera.position.x) * 0.01;
    camera.position.y += (-mouseY * spaceSettings.movementSpeed - camera.position.y) * 0.01;

    camera.lookAt(scene.position);
}


// Resize canvas when window size changes
function resizeCanvas() {
    if (pdfDoc) {
        // For mobile, adjust scale automatically for better viewing
        if (isMobile && scale > 1.0) {
            scale = 1.0;
            updateZoomLevel();
        }

        queueRenderPage(pageNum);
    }
}

// Handle keyboard shortcuts
function handleKeyDown(e) {
    if (!pdfDoc) return; // Only handle keypresses if PDF is loaded

    switch (e.key) {
        case 'ArrowLeft':
            onPrevPage();
            break;
        case 'ArrowRight':
            onNextPage();
            break;
        case '+':
        case '=':
            if (scale < 3.0) {
                scale += 0.25;
                updateZoomLevel();
                queueRenderPage(pageNum);
            }
            break;
        case '-':
            if (scale > 0.5) {
                scale -= 0.25;
                updateZoomLevel();
                queueRenderPage(pageNum);
            }
            break;
        case 'f':
        case 'F':
            toggleFullscreen();
            break;
    }
}

// Show loader properly
function showLoader() {
    loader.classList.add('active');
}

// Hide loader properly
function hideLoader() {
    loader.classList.remove('active');
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target ? e.target.files[0] : e;

    if (file && file.type === 'application/pdf') {
        const fileName = file.name || 'document.pdf';
        fileNameElement.textContent = fileName;

        // Store original file for direct download
        window.originalFile = file;

        // Show loader
        showLoader();

        // Read the file
        const fileReader = new FileReader();

        fileReader.onload = function (event) {
            const typedArray = new Uint8Array(event.target.result);
            pdfData = typedArray; // Store for later use

            // Load the PDF using PDF.js
            loadPDF(typedArray);
        };

        fileReader.readAsArrayBuffer(file);

        // Hide drop area
        dropArea.style.display = 'none';

        // Show navigation arrows
        leftArrow.style.display = 'flex';
        rightArrow.style.display = 'flex';
    } else {
        showError('Please select a valid PDF file.');
    }
}

// Load the PDF document
function loadPDF(data) {
    // Create a loading message and show progress
    const loadingMessage = document.querySelector('.pdf-viewer-loader-text');
    loadingMessage.innerHTML = 'Loading PDF...<br><span id="load-progress">0%</span>';
    const loadProgress = document.getElementById('load-progress');

    // Use a worker to load PDF in background
    const loadingTask = pdfjsLib.getDocument({
        data: data,
        // Enable streaming for large PDFs
        rangeChunkSize: 65536,
        disableAutoFetch: false,
        disableStream: false,
        // Show loading progress
        onProgress: function (progress) {
            if (progress.total > 0) {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                loadProgress.textContent = percent + '%';
            }
        }
    });

    loadingTask.promise.then(function (pdf) {
        pdfDoc = pdf;
        totalPagesText.textContent = pdf.numPages;

        // Enable controls immediately
        enableControls();

        // Render the first page at high priority
        pageNum = 1;
        renderPage(pageNum, true);

        // Pre-load a few more pages in the background (for faster navigation)
        preloadNextPages(2);

        // Generate thumbnails more efficiently
        generateThumbnailsEfficiently(pdf);

    }).catch(function (error) {
        console.error('Error loading PDF:', error);
        showError('Error loading PDF: ' + error.message);
        hideLoader();
    });
}

// Preload next few pages for faster navigation
function preloadNextPages(count) {
    if (!pdfDoc) return;

    // Only preload if we have pages to preload
    const startPage = pageNum + 1;
    const endPage = Math.min(startPage + count - 1, pdfDoc.numPages);

    // Preload pages with low priority (won't block main rendering)
    for (let i = startPage; i <= endPage; i++) {
        // Just fetch the page object, it will be cached
        pdfDoc.getPage(i).then(() => {
            console.log(`Preloaded page ${i}`);
        }).catch(e => {
            console.log(`Could not preload page ${i}:`, e);
        });
    }
}

// Render a page with optional high priority
function renderPage(num, highPriority = false) {
    pageRendering = true;

    // Only show loader for high priority pages or if loader is already active
    if (highPriority || loader.classList.contains('active')) {
        showLoader();
    }

    pdfDoc.getPage(num).then(function (page) {
        // Calculate the scale based on the viewport
        const viewport = page.getViewport({ scale: scale, rotation: rotation });

        // Set canvas dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // For mobile devices, ensure PDF fits screen width
        if (isMobile) {
            const containerWidth = document.querySelector('.pdf-container').clientWidth - 20; // 20px padding
            const scaleFactor = containerWidth / viewport.width;

            if (scaleFactor < 1) {
                canvas.style.width = '100%';
                canvas.style.height = 'auto';
            } else {
                canvas.style.width = '';
                canvas.style.height = '';
            }
        } else {
            canvas.style.width = '';
            canvas.style.height = '';
        }

        // Render PDF page into canvas context
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
            intent: highPriority ? 'display' : 'print',
            renderInteractiveForms: false // Disable form rendering for speed
        };

        const renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function () {
            pageRendering = false;
            hideLoader();

            // Update active thumbnail
            updateActiveThumbnail();

            // Update navigation arrows visibility based on page number
            updateNavigationArrows();

            // If we're on a desktop and this is a high priority render (initial load),
            // preload the next couple of pages for faster navigation
            if (highPriority && !isMobile) {
                preloadNextPages(3);
            }

            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        }).catch(function (error) {
            console.error('Error rendering page:', error);
            pageRendering = false;
            hideLoader();
            showError('Error rendering page: ' + error.message);
        });
    });

    // Update page counters
    currentPageText.textContent = num;
}

// Update navigation arrows visibility
function updateNavigationArrows() {
    if (pdfDoc) {
        leftArrow.style.opacity = pageNum <= 1 ? '0.3' : '0.7';
        leftArrow.style.pointerEvents = pageNum <= 1 ? 'none' : 'auto';

        rightArrow.style.opacity = pageNum >= pdfDoc.numPages ? '0.3' : '0.7';
        rightArrow.style.pointerEvents = pageNum >= pdfDoc.numPages ? 'none' : 'auto';
    }
}

// Queue rendering of a page
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// Display previous page
function onPrevPage() {
    if (pageNum <= 1 || !pdfDoc) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

// Display next page
function onNextPage() {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

// Update zoom level display
function updateZoomLevel() {
    zoomLevelText.textContent = Math.round(scale * 100) + '%';
}

// Generate thumbnails more efficiently
function generateThumbnailsEfficiently(pdf) {
    thumbnailsContainer.innerHTML = '';

    // For mobile, only load visible thumbnails at the beginning
    const initialThumbnailsToLoad = isMobile ? Math.min(5, pdf.numPages) : pdf.numPages;
    let loadedThumbnails = 0;

    // Generate placeholder thumbnails first for quick visual feedback
    for (let i = 1; i <= pdf.numPages; i++) {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        thumbnail.setAttribute('data-page', i);

        // Add placeholder content
        const placeholderCanvas = document.createElement('div');
        placeholderCanvas.className = 'thumbnail-placeholder';
        placeholderCanvas.style.width = '100%';
        placeholderCanvas.style.aspectRatio = '0.707'; // A4 ratio
        placeholderCanvas.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';

        const pageNumDiv = document.createElement('div');
        pageNumDiv.className = 'thumbnail-number';
        pageNumDiv.textContent = i;

        thumbnail.appendChild(placeholderCanvas);
        thumbnail.appendChild(pageNumDiv);
        thumbnailsContainer.appendChild(thumbnail);

        // Add click event to thumbnail
        thumbnail.addEventListener('click', function () {
            pageNum = parseInt(this.getAttribute('data-page'));
            queueRenderPage(pageNum);

            // Close sidebar on mobile
            if (isMobile) {
                sidebar.classList.remove('open');
            }
        });

        // Mark the first thumbnail as active
        if (i === 1) {
            thumbnail.classList.add('active');
        }
    }

    // Function to load actual thumbnails
    function loadThumbnail(index) {
        if (index > pdf.numPages) return;

        // Get the placeholder thumbnail
        const thumbnail = thumbnailsContainer.querySelector(`.thumbnail[data-page="${index}"]`);
        if (!thumbnail) return;

        // Load the actual page
        pdf.getPage(index).then(function (page) {
            // If thumbnail was already loaded or element no longer exists, skip
            if (thumbnail.querySelector('canvas')) return;

            const placeholderElement = thumbnail.querySelector('.thumbnail-placeholder');
            if (!placeholderElement) return;

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Scale down the viewport for the thumbnail
            const viewport = page.getViewport({ scale: 0.1 }); // Reduced scale for better performance
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render page to the thumbnail canvas
            page.render({
                canvasContext: context,
                viewport: viewport
            }).promise.then(function () {
                // Replace placeholder with canvas
                thumbnail.replaceChild(canvas, placeholderElement);

                // Load next thumbnail after short delay
                loadedThumbnails++;

                // Continue loading more thumbnails
                if (loadedThumbnails < pdf.numPages) {
                    setTimeout(() => loadThumbnail(loadedThumbnails + 1), 50);
                }
            }).catch(e => {
                console.log(`Could not render thumbnail ${index}:`, e);
                // Try next thumbnail if this one fails
                setTimeout(() => loadThumbnail(index + 1), 50);
            });
        }).catch(e => {
            console.log(`Could not load page ${index} for thumbnail:`, e);
            // Try next thumbnail if this one fails
            setTimeout(() => loadThumbnail(index + 1), 50);
        });
    }

    // Begin loading initial thumbnails
    for (let i = 1; i <= Math.min(initialThumbnailsToLoad, pdf.numPages); i++) {
        setTimeout(() => loadThumbnail(i), i * 100);
    }

    // Add scroll event for lazy loading more thumbnails on mobile
    if (isMobile) {
        const thumbnailScrollHandler = function () {
            // If we've loaded all thumbnails, remove the scroll listener
            if (loadedThumbnails >= pdf.numPages) {
                thumbnailsContainer.removeEventListener('scroll', thumbnailScrollHandler);
                return;
            }

            // Load next batch of thumbnails when user scrolls
            if (thumbnailsContainer.scrollLeft + thumbnailsContainer.clientWidth > thumbnailsContainer.scrollWidth * 0.7) {
                const nextBatchSize = 3;
                const nextStartIndex = loadedThumbnails + 1;
                const nextEndIndex = Math.min(nextStartIndex + nextBatchSize - 1, pdf.numPages);

                for (let i = nextStartIndex; i <= nextEndIndex; i++) {
                    if (i <= pdf.numPages) {
                        setTimeout(() => loadThumbnail(i), (i - nextStartIndex) * 100);
                    }
                }
            }
        };

        thumbnailsContainer.addEventListener('scroll', thumbnailScrollHandler);
    }

    // Update mobile display
    updateThumbnailDisplay();
}

// Update the active thumbnail
function updateActiveThumbnail() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumbnail) => {
        const page = parseInt(thumbnail.getAttribute('data-page'));
        if (page === pageNum) {
            thumbnail.classList.add('active');

            // Scroll the active thumbnail into view
            if (isMobile) {
                thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else {
            thumbnail.classList.remove('active');
        }
    });
}

// Toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('open');

    // Update thumbnails when sidebar is opened
    if (sidebar.classList.contains('open')) {
        setTimeout(() => {
            updateThumbnailDisplay();
        }, 300); // Wait for transition to complete
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Enable controls after PDF is loaded
function enableControls() {
    downloadBtn.disabled = false;
    printBtn.disabled = false;
    zoomInBtn.disabled = false;
    zoomOutBtn.disabled = false;
    prevPageBtn.disabled = false;
    nextPageBtn.disabled = false;
    rotateBtn.disabled = false;
    fullscreenBtn.disabled = false;
}

// Download the PDF
function downloadPDF() {
    console.log('Download button clicked');
    showLoader(); // Show loader while preparing download

    // Method 1: Use the original file if available (most reliable)
    if (window.originalFile) {
        try {
            const url = URL.createObjectURL(window.originalFile);
            const filename = fileNameElement.textContent.trim() !== 'No file selected' ?
                fileNameElement.textContent : 'document.pdf';

            downloadWithLink(url, filename);
            return;
        } catch (error) {
            console.error('Error downloading original file:', error);
            // Fall through to alternative methods
        }
    }

    // Method 2: Use the stored PDF data blob
    if (pdfData) {
        try {
            const blob = new Blob([pdfData], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const filename = fileNameElement.textContent.trim() !== 'No file selected' ?
                fileNameElement.textContent : 'document.pdf';

            downloadWithLink(url, filename);
            return;
        } catch (error) {
            console.error('Error downloading from stored data:', error);
            // Fall through to alternative methods
        }
    }

    // Method 3: Use the same data that was initially loaded
    // Convert binary data to base64
    try {
        if (pdfData) {
            const binary = [];
            const bytes = new Uint8Array(pdfData);
            for (let i = 0; i < bytes.byteLength; i++) {
                binary.push(String.fromCharCode(bytes[i]));
            }
            const base64 = 'data:application/pdf;base64,' + window.btoa(binary.join(''));
            const filename = fileNameElement.textContent.trim() !== 'No file selected' ?
                fileNameElement.textContent : 'document.pdf';

            downloadWithLink(base64, filename);
            return;
        }
    } catch (error) {
        console.error('Error with base64 conversion:', error);
        // Continue to fallback method
    }

    // Method 4: Last resort - try to download the current page as PNG
    if (canvas && ctx) {
        try {
            const dataURL = canvas.toDataURL('image/png');
            const filename = (fileNameElement.textContent.trim() !== 'No file selected' ?
                fileNameElement.textContent.replace('.pdf', '') : 'document') + '_page' + pageNum + '.png';

            downloadWithLink(dataURL, filename);
            showError('Only the current page was downloaded as PNG. Could not download the complete PDF.');
            return;
        } catch (error) {
            console.error('Error downloading canvas content:', error);
            hideLoader();
            showError('Unable to download the PDF. ' + error.message);
        }
    }

    // If all methods fail, show an error
    hideLoader();
    showError('No PDF data available. Please load a PDF first.');
}

// Helper function to download using a link
function downloadWithLink(url, filename) {
    // Create temporary link
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);

    // Trigger download
    setTimeout(() => {
        a.click();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            hideLoader();
        }, 100);
    }, 100);
}

// Print the PDF
function printPDF() {
    if (!pdfData) return;

    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;

    document.body.appendChild(iframe);

    iframe.onload = () => {
        iframe.contentWindow.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
        }, 1000);
    };
}

// Set up drag and drop
function setupDragAndDrop() {
    const preventDefaults = e => {
        e.preventDefault();
        e.stopPropagation();
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('active');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('active');
        }, false);
    });

    dropArea.addEventListener('drop', e => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        handleFileSelect(file);
    });
}

// Show error modal
function showError(message) {
    errorMessage.textContent = message;
    errorModal.classList.add('show');
    hideLoader(); // Ensure loader is hidden on error
}

// Initialize the application
window.addEventListener('load', init); 