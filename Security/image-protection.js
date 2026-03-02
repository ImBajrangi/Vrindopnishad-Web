/**
 * Advanced Image Protection System
 * Prevents common methods of image downloading and copying
 */
class ImageProtector {
    constructor(options = {}) {
        this.options = {
            disableRightClick: true,
            disableDragging: true,
            disableSelection: true,
            addWatermark: true,
            watermarkText: '© Vrindopnishad',
            useCanvas: false,
            watermarkOpacity: 0.7,
            ...options
        };

        this.init();
    }

    init() {
        // Exclude hero section and header from any protection
        this.excludedSections = ['.hero-section', 'header', '.header', '.hero-buttons', '.popup-modal'];

        this.protectImages();
        this.addGlobalListeners();
        if (this.options.addWatermark) {
            this.addWatermarks();
        }

        // Ensure buttons are always clickable after protection is applied
        this.ensureButtonsClickable();
    }

    ensureButtonsClickable() {
        // Force all buttons to be clickable
        const buttons = document.querySelectorAll('button, .btn, .ripple-btn, a');
        buttons.forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.cursor = 'pointer';
        });

        // Remove any protection layers that might be overlapping buttons
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const protectionLayers = heroSection.querySelectorAll('.image-protection-layer, .protected-image-wrapper');
            protectionLayers.forEach(layer => layer.remove());
        }
    }

    protectImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Skip images in excluded sections (hero, header, etc.)
            const isExcluded = this.excludedSections.some(selector => img.closest(selector));
            if (isExcluded) {
                return;
            }

            // Skip if already protected
            if (img.closest('.protected-image-wrapper')) {
                return;
            }

            // Basic protection attributes
            img.style.cssText += `
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                pointer-events: none;
                -webkit-user-drag: none;
                -moz-user-drag: none;
                -ms-user-drag: none;
            `;

            // Prevent dragging
            img.setAttribute('draggable', 'false');

            // Add loading="lazy" if not present
            if (!img.getAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }

            // Create wrapper div for additional protection
            const wrapper = document.createElement('div');
            wrapper.className = 'protected-image-wrapper';
            wrapper.style.cssText = `
                position: relative;
                display: inline-block;
                overflow: hidden;
            `;

            // Move img into wrapper
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);

            // Add protection layer - but make sure it doesn't block buttons
            const protectionLayer = document.createElement('div');
            protectionLayer.className = 'image-protection-layer';
            protectionLayer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: auto;
                z-index: 1;
            `;
            wrapper.appendChild(protectionLayer);
        });
    }

    addWatermarks() {
        const images = document.querySelectorAll('.protected-image-wrapper');
        images.forEach(wrapper => {
            const watermark = document.createElement('div');
            watermark.className = 'image-watermark';
            watermark.textContent = this.options.watermarkText;
            watermark.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 24px;
                color: rgba(255, 255, 255, ${this.options.watermarkOpacity});
                white-space: nowrap;
                pointer-events: none;
                z-index: 9;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                font-family: Arial, sans-serif;
                font-weight: bold;
                user-select: none;
                -webkit-user-select: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            wrapper.appendChild(watermark);

            // Show watermark on hover
            wrapper.addEventListener('mouseenter', () => {
                watermark.style.opacity = '1';
            });
            wrapper.addEventListener('mouseleave', () => {
                watermark.style.opacity = '0';
            });
        });
    }

    addGlobalListeners() {
        // Prevent right-click on images
        if (this.options.disableRightClick) {
            document.addEventListener('contextmenu', (e) => {
                if (e.target.tagName === 'IMG' || e.target.closest('.protected-image-wrapper')) {
                    e.preventDefault();
                    this.showProtectionMessage();
                }
            });
        }

        // Prevent keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
            }
            // Ctrl/Cmd + Shift + I or F12
            if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'i' || e.key === 'F12')) {
                e.preventDefault();
            }
            // Ctrl/Cmd + C
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && (e.target.tagName === 'IMG' || e.target.closest('.protected-image-wrapper'))) {
                e.preventDefault();
            }
        });

        // Prevent drag and drop
        if (this.options.disableDragging) {
            document.addEventListener('dragstart', (e) => {
                if (e.target.tagName === 'IMG' || e.target.closest('.protected-image-wrapper')) {
                    e.preventDefault();
                }
            });
        }

        // Prevent selection
        if (this.options.disableSelection) {
            document.addEventListener('selectstart', (e) => {
                if (e.target.tagName === 'IMG' || e.target.closest('.protected-image-wrapper')) {
                    e.preventDefault();
                }
            });
        }
    }

    showProtectionMessage() {
        const existingMessage = document.querySelector('.protection-message');
        if (existingMessage) {
            return;
        }

        const message = document.createElement('div');
        message.className = 'protection-message';
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                z-index: 10000;
                font-family: Arial, sans-serif;
                max-width: 80%;
            ">
                <i class="fas fa-shield-alt" style="font-size: 24px; color: #ffd700; margin-bottom: 10px;"></i>
                <h3 style="margin: 10px 0;">Image Protected</h3>
                <p style="margin: 10px 0;">This image is protected by copyright.</p>
                <button onclick="this.parentElement.remove()" style="
                    background: #ffd700;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 5px;
                    margin-top: 10px;
                    cursor: pointer;
                    color: black;
                ">OK</button>
            </div>
        `;
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// Initialize protection when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageProtector({
        watermarkText: '© Vrindopnishad ' + new Date().getFullYear(),
        watermarkOpacity: 0.5
    });
});
