// --- This script is embedded for demo purposes ---
// --- In your real project, this code would be in 'asset-manager.js' ---

// --- This is the content for asset-manager.js ---

// 1. DEFINE ALL YOUR ASSETS HERE
// We now use objects to define assets, allowing for custom attributes.
const pageAssets = {
  // 'common' assets load on EVERY page
  common: {
    css: [
      {
        href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css',
        attributes: {
          integrity: 'sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==',
          crossorigin: 'anonymous',
          referrerpolicy: 'no-referrer'
        }
      },
      { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' },
      {
        href: '/Vrindopnishad%20Web/web-extentions/Custom%20Cursor/custom-cursor.css',
        attributes: { class: 'css' }
      },
      { href: '/Vrindopnishad%20Web/web-extentions/Cookie%20Consent/cookie-consent.css' }
    ],
    js: [
      {
        src: '/Vrindopnishad%20Web/web-extentions/Custom%20Cursor/custom-cursor.js',
        attributes: { defer: true } // 'defer' is ok for a standalone script
      },
      { src: '/Vrindopnishad%20Web/web-extentions/Cookie%20Consent/cookie-consent.js' }
    ]
  },

  // 'gallery' assets for Gallery.html
  gallery: {
    css: [
      { href: 'https://fonts.googleapis.com/css2?family=Protest+Strike&display=swap' },
      {
        href: '/Vrindopnishad%20Web/Pictures/css/claude-collection.css',
        attributes: { class: 'style' }
      },
      { href: '/Vrindopnishad%20Web/Pictures/css/hero-video.css' },
      { href: '/Vrindopnishad%20Web/web-extentions/Ripple btn/btn-ripple.css' }
    ],
    js: [
      { src: '/Vrindopnishad%20Web/Pictures/js/collection-page-fix.js' },
      { src: '/Vrindopnishad%20Web/web-extentions/Ripple btn/btn-ripple.js' }
    ]
  },

  // 'photos' assets for photos.html
  photos: {
    css: [
      { href: '/Vrindopnishad%20Web/Pictures/css/pic-collection.css' },
      { href: '/Vrindopnishad%20Web/Pictures/css/lazy-load.css' }
    ],
    js: [
      { src: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js' },
      { src: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js' },
      { src: '/Vrindopnishad%20Web/Pictures/js/immediate-loader.js' },
      { src: '/Vrindopnishad%20Web/Pictures/js/pic-collection.js' },
      { src: '/Vrindopnishad%20Web/Pictures/js/pic-simple.js' },
      { src: '/Vrindopnishad%20Web/Pictures/js/notifications.js' },
      { src: '/Vrindopnishad%20Web/Security/disable-right-click.js' },
      { src: '/Vrindopnishad%20Web/Security/image-protection.js' },
      { src: '/Vrindopnishad%20Web/Security/watermark.js' },
      { src: '/Vrindopnishad%20Web/web-extentions/links/link-handler.js' }
    ]
  },

  // 'home' assets for Home.html
  index: {
    css: [
      {
        href: 'https://fonts.googleapis.com/css2?family=Anton&display=swap',
        attributes: { rel: 'stylesheet' }
      },
      { href: '/Vrindopnishad%20Web/Home/css/styles.css' },
      { href: '/Vrindopnishad%20Web/Home/css/image-hover.css' },
      {
        href: '/Vrindopnishad%20Web/web-extentions/Custom Cursor/custom-cursor.css',
        attributes: { class: 'stylesheet' }
      },
      {
        href: "https://fonts.googleapis.com/css2?family=Anton&display=swap",
        attributes: { rel: 'stylesheet' }
      },
      {
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
        attributes: { rel: 'stylesheet' }
      }
    ],
    js: [
      { src: '/Vrindopnishad%20Web/Home/js/animations.js' },
      { src: '/Vrindopnishad%20Web/Home/js/effects.js' },
      { src: '/Vrindopnishad%20Web/Home/js/image-hover.js' },
      {
        src: '/Vrindopnishad%20Web/web-extentions/Custom%20Cursor/custom-cursor.js',
        attributes: { defer: true }
      }
    ]
  }
};

// 2. HELPER FUNCTIONS TO LOAD FILES (UPGRADED)

/**
 * Creates and appends a CSS <link> tag to the <head>.
 * @param {object | string} asset - The asset object (or string for simple href).
 */
function loadCss(asset) {
  // Standardize: if asset is just a string, convert to object
  const assetObj = typeof asset === 'string' ? { href: asset } : asset;
  if (!assetObj.href) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet'; // Default
  link.href = assetObj.href;

  // Apply all custom attributes
  if (assetObj.attributes) {
    for (const [key, value] of Object.entries(assetObj.attributes)) {
      link.setAttribute(key, value);
    }
  }

  link.onerror = () => console.error(`Failed to load CSS: ${assetObj.href}`);
  document.head.appendChild(link);
  console.log(`Loading CSS: ${assetObj.href}`);
}

/**
 * Creates and appends a JS <script> tag to the <body>.
 * @param {object | string} asset - The asset object (or string for simple src).
 */
function loadJs(asset) {
  // Standardize: if asset is just a string, convert to object
  const assetObj = typeof asset === 'string' ? { src: asset } : asset;
  if (!assetObj.src) return;

  const script = document.createElement('script');
  script.src = assetObj.src;

  // *** FIX ***
  // REMOVED 'script.defer = true;'
  // This ensures scripts load and execute in the order they are added,
  // which is required for dependencies like GSAP -> ScrollTrigger

  // Apply all custom attributes
  if (assetObj.attributes) {
    for (const [key, value] of Object.entries(assetObj.attributes)) {
      if (typeof value === 'boolean') {
        script[key] = value; // Handle boolean properties like defer, async, nomodule
      } else {
        script.setAttribute(key, value); // Handle string properties like type, integrity
      }
    }
  }

  script.onload = () => {
    console.log(`Loaded JS: ${assetObj.src}`);
  };
  script.onerror = () => console.error(`Failed to load JS: ${assetObj.src}`);

  // Since the <script> tags in the HTML are at the end of the <body>,
  // document.body is guaranteed to exist. We can append directly.
  document.body.appendChild(script);
  console.log(`Loading JS: ${assetObj.src}`);
}

// 3. THE MAIN FUNCTION TO CALL FROM YOUR HTML (Unchanged)

/**
 * Loads all 'common' assets and all assets for a specific page.
 * @param {string} pageName - The key from pageAssets (e.g., 'gallery', 'pictures', 'home').
 */
function loadPageAssets(pageName) {
  console.log(`Loading assets for: ${pageName}`);

  // Always load common assets
  const common = pageAssets.common;
  if (common) {
    common.css.forEach(loadCss);
    common.js.forEach(loadJs);
  }

  // Load page-specific assets
  const page = pageAssets[pageName];
  if (page) {
    page.css.forEach(loadCss);
    page.js.forEach(loadJs);
  } else {
    console.warn(`No assets found for page: ${pageName}`);
  }
}