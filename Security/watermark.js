/**
 * Advanced Watermark System for Gallery Images
 */
class WatermarkSystem {
    constructor(options = {}) {
        this.options = {
            text: '© Vrindopnishad',
            textColor: 'rgba(255, 245, 217, 0.8)',
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            angle: -45,
            density: 1, // Number of watermark repeats
            padding: 50, // Space between watermarks
            shadow: true,
            applyToExisting: true,
            animate: true,
            pattern: 'diagonal', // 'diagonal', 'grid', or 'single'
            ...options
        };

        this.init();
    }

    init() {
        if (this.options.applyToExisting) {
            this.applyToExistingImages();
        }
        this.observeNewImages();
    }

    createWatermarkCanvas() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set initial size
        canvas.width = 300;
        canvas.height = 300;
        
        // Set up text style
        ctx.font = `${this.options.fontSize} ${this.options.fontFamily}`;
        ctx.fillStyle = this.options.textColor;
        
        // Add shadow if enabled
        if (this.options.shadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        
        // Calculate text metrics
        const metrics = ctx.measureText(this.options.text);
        const textWidth = metrics.width;
        
        // Rotate and draw text
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(this.options.angle * Math.PI / 180);
        ctx.fillText(this.options.text, -textWidth/2, 0);
        
        return canvas;
    }

    createWatermarkPattern(img) {
        const patternCanvas = document.createElement('canvas');
        const pCtx = patternCanvas.getContext('2d');
        
        // Match image size
        patternCanvas.width = img.width || img.offsetWidth;
        patternCanvas.height = img.height || img.offsetHeight;
        
        const watermark = this.createWatermarkCanvas();
        const pattern = pCtx.createPattern(watermark, 'repeat');
        
        pCtx.fillStyle = pattern;
        
        switch(this.options.pattern) {
            case 'grid':
                this.createGridPattern(pCtx, patternCanvas.width, patternCanvas.height);
                break;
            case 'diagonal':
                this.createDiagonalPattern(pCtx, patternCanvas.width, patternCanvas.height);
                break;
            case 'single':
                this.createSingleWatermark(pCtx, patternCanvas.width, patternCanvas.height);
                break;
        }
        
        return patternCanvas;
    }

    createGridPattern(ctx, width, height) {
        const spacing = this.options.padding;
        for (let x = 0; x < width; x += spacing) {
            for (let y = 0; y < height; y += spacing) {
                ctx.save();
                ctx.translate(x, y);
                ctx.fillText(this.options.text, 0, 0);
                ctx.restore();
            }
        }
    }

    createDiagonalPattern(ctx, width, height) {
        const spacing = this.options.padding;
        const diagonal = Math.sqrt(width * width + height * height);
        const numWatermarks = Math.ceil(diagonal / spacing) * this.options.density;
        
        for (let i = 0; i < numWatermarks; i++) {
            ctx.save();
            ctx.translate(
                (width / 2) + (spacing * i - diagonal/2) * Math.cos(this.options.angle * Math.PI / 180),
                (height / 2) + (spacing * i - diagonal/2) * Math.sin(this.options.angle * Math.PI / 180)
            );
            ctx.rotate(this.options.angle * Math.PI / 180);
            ctx.fillText(this.options.text, 0, 0);
            ctx.restore();
        }
    }

    createSingleWatermark(ctx, width, height) {
        ctx.save();
        ctx.translate(width/2, height/2);
        ctx.rotate(this.options.angle * Math.PI / 180);
        const metrics = ctx.measureText(this.options.text);
        ctx.fillText(this.options.text, -metrics.width/2, 0);
        ctx.restore();
    }

    applyWatermark(img) {
        // Create container
        const container = document.createElement('div');
        container.className = 'watermarked-image-container';
        container.style.cssText = `
            position: relative;
            display: inline-block;
            overflow: hidden;
        `;

        // Position original image
        img.style.cssText = `
            display: block;
            width: 100%;
            height: auto;
        `;

        // Create watermark overlay
        const overlay = document.createElement('div');
        overlay.className = 'watermark-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Wait for image to load to get proper dimensions
        if (img.complete) {
            this.createAndApplyWatermarkOverlay(overlay, img);
        } else {
            img.onload = () => this.createAndApplyWatermarkOverlay(overlay, img);
        }

        // Insert elements
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
        container.appendChild(overlay);

        // Add hover effect if animation is enabled
        if (this.options.animate) {
            container.addEventListener('mouseenter', () => {
                overlay.style.opacity = '1';
            });
            container.addEventListener('mouseleave', () => {
                overlay.style.opacity = '0';
            });
        } else {
            overlay.style.opacity = '1';
        }
    }

    createAndApplyWatermarkOverlay(overlay, img) {
        const watermarkCanvas = this.createWatermarkPattern(img);
        overlay.style.background = `url(${watermarkCanvas.toDataURL('image/png')})`;
    }

    applyToExistingImages() {
        document.querySelectorAll('img:not(.watermarked)').forEach(img => {
            if (!img.closest('.watermarked-image-container')) {
                img.classList.add('watermarked');
                this.applyWatermark(img);
            }
        });
    }

    observeNewImages() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeName === 'IMG' && !node.classList.contains('watermarked')) {
                        node.classList.add('watermarked');
                        this.applyWatermark(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize watermark system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WatermarkSystem({
        text: '© Vrindopnishad ' + new Date().getFullYear(),
        textColor: 'rgba(255, 255, 255, 0.7)',
        fontSize: '16px',
        angle: -30,
        density: 1.5,
        pattern: 'diagonal',
        animate: true,
        shadow: true
    });
});
