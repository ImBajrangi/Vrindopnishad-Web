class CustomCursor {
    constructor() {
        // Initialize elements
        this.cursorDot = document.querySelector('.cursor-dot');
        this.cursorCircle = document.querySelector('.cursor-circle');
        this.svgCursors = {
            check: document.getElementById('svg-cursor-check'),
            close: document.getElementById('svg-cursor-close'),
            notAllowed: document.getElementById('svg-cursor-notallowed')
        };

        this.cursorX = 0;
        this.cursorY = 0;

        // Initialize if not touch device
        if (!('ontouchstart' in window)) {
            this.init();
        } else {
            this.disableCursor();
        }
    }

    init() {
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            this.cursorX = e.clientX;
            this.cursorY = e.clientY;

            // Update dot position immediately
            if (this.cursorDot) {
                this.cursorDot.style.left = `${this.cursorX}px`;
                this.cursorDot.style.top = `${this.cursorY}px`;
            }

            // Update SVG cursors if visible
            // Object.values(this.svgCursors).forEach(cursor => {
            //     if (cursor.style.display !== 'none') {
            //         cursor.style.left = `${this.cursorX}px`;
            //         cursor.style.top = `${this.cursorY}px`;
            //     }
            // });
        });

        // Smooth circle animation
        this.animateCircle();

        // Add interactive elements
        this.addInteractiveElements();

        // Add click events
        this.addClickEvents();

        // Handle window events
        this.handleWindowEvents();
    }

    animateCircle() {
        if (!this.cursorCircle) return;
        const ease = 0.15;
        const circleX = parseFloat(this.cursorCircle.style.left) || this.cursorX;
        const circleY = parseFloat(this.cursorCircle.style.top) || this.cursorY;

        this.cursorCircle.style.left = `${circleX + (this.cursorX - circleX) * ease}px`;
        this.cursorCircle.style.top = `${circleY + (this.cursorY - circleY) * ease}px`;

        requestAnimationFrame(this.animateCircle.bind(this));
    }

    addInteractiveElements() {
        // Event delegation for hover states (handles dynamic elements like cookie banner)
        document.addEventListener('mouseover', (e) => {
            // Buttons and Links
            const hoverable = e.target.closest('a, button, .btn, .cookie-btn, .magnetic, input[type="submit"]');
            if (hoverable) {
                this.cursorDot.classList.add('hover');
                this.cursorCircle.classList.add('hover');
                return; // Prioritize hover over text
            }

            // Text elements
            const textable = e.target.closest('p, h1, h2, h3, h4, h5, h6, span, li, input, textarea');
            if (textable) {
                if (this.cursorDot) {
                    this.cursorDot.classList.add('text');
                }
                if (this.cursorCircle) {
                    this.cursorCircle.classList.add('text');
                }
            }
        });

        document.addEventListener('mouseout', (e) => {
            // Buttons and Links
            const hoverable = e.target.closest('a, button, .btn, .cookie-btn, .magnetic, input[type="submit"]');
            if (hoverable) {
                // Only remove if we are leaving the hoverable element entirely
                if (!e.relatedTarget || !e.relatedTarget.closest || !hoverable.contains(e.relatedTarget)) {
                    this.cursorDot.classList.remove('hover');
                    this.cursorCircle.classList.remove('hover');
                }
            }

            // Text elements
            const textable = e.target.closest('p, h1, h2, h3, h4, h5, h6, span, li, input, textarea');
            if (textable) {
                // Only remove if we are leaving the textable element entirely
                if (!e.relatedTarget || !e.relatedTarget.closest || !textable.contains(e.relatedTarget)) {
                    this.cursorDot.classList.remove('text');
                    this.cursorCircle.classList.remove('text');
                }
            }
        });
    }

    addClickEvents() {
        // Mouse down (click start)
        document.addEventListener('mousedown', (e) => {
            this.cursorDot.classList.add('click');
            this.cursorCircle.classList.add('click');
        });

        // Mouse up (click end)
        document.addEventListener('mouseup', (e) => {
            this.cursorDot.classList.remove('click');
            this.cursorCircle.classList.remove('click');
        });

        // Handle touch events for mobile
        document.addEventListener('touchstart', (e) => {
            this.cursorDot.classList.add('click');
            this.cursorCircle.classList.add('click');
        });

        document.addEventListener('touchend', (e) => {
            this.cursorDot.classList.remove('click');
            this.cursorCircle.classList.remove('click');
        });
    }

    handleWindowEvents() {
        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            this.cursorDot.style.opacity = '0';
            this.cursorCircle.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            if (this.cursorDot) this.cursorDot.style.opacity = '1';
            if (this.cursorCircle) this.cursorCircle.style.opacity = '1';
        });
    }

    disableCursor() {
        if (this.cursorDot) this.cursorDot.style.display = 'none';
        if (this.cursorCircle) this.cursorCircle.style.display = 'none';
        Object.values(this.svgCursors).forEach(cursor => {
            if (cursor) cursor.style.display = 'none';
        });
        document.body.style.cursor = 'auto';
    }
}

// Initialize cursor
new CustomCursor();
