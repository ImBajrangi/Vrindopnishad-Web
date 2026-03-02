/**
 * Custom Physics-Based Cursor System
 * Add this JavaScript to your page
 * 
 * Usage:
 * 1. Include Advanced-cc.css in your <head>
 * 2. Include Advanced-cc.js before closing </body>
 * 3. Add cursor HTML elements to your page (see HTML snippet below)
 * 4. Call initCustomCursor() when DOM is ready
 * 
 * HTML Required:
 * <div class="cursor">
 *     <div class="cursor-core"></div>
 *     <div class="cursor-ring"></div>
 * </div>
 * <div class="cursor-connector"></div>
 * <div class="cursor-text"></div>
 */

class CustomCursor {
    constructor(config = {}) {
        // Configuration
        this.config = {
            springConstant: config.springConstant || 0.35,
            damping: config.damping || 0.75,
            mass: config.mass || 1,
            labelSpring: config.labelSpring || 0.18,
            labelDamping: config.labelDamping || 0.85,
            labelLerp: config.labelLerp || 0.12,
            maxTrails: config.maxTrails || 15,
            interactiveElements: config.interactiveElements || {
                'a': { text: 'Navigate', icon: '→' },
                'button': { text: 'Click', icon: '✦' },
                '.btn': { text: 'Click', icon: '✦' }
            }
        };

        // DOM elements
        this.cursor = document.querySelector('.cursor');
        this.cursorText = document.querySelector('.cursor-text');
        this.cursorConnector = document.querySelector('.cursor-connector');

        // Physics variables
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.cursorX = this.mouseX;
        this.cursorY = this.mouseY;
        this.velocityX = 0;
        this.velocityY = 0;

        // Label bar variables
        this.currentHoveredElement = null;
        this.labelX = 0;
        this.labelY = 0;
        this.labelVelX = 0;
        this.labelVelY = 0;
        this.labelDisplayX = 0;
        this.labelDisplayY = 0;
        this.connectorDisplayLength = 0;
        this.connectorDisplayAngle = 0;

        // Trail system
        this.trails = [];
        this.particleCounter = 0;

        // Check if mobile
        this.isMobile = window.innerWidth <= 768;
    }

    init() {
        if (this.isMobile) return;

        this.bindEvents();
        this.animate();
        this.setupInteractiveElements();
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            // Particle trail
            this.particleCounter++;
            if (this.particleCounter % 3 === 0) {
                this.createParticle(this.mouseX, this.mouseY);
            }
        });

        document.addEventListener('mousedown', () => {
            this.cursor.classList.add('click');
            // Create click particles
            for (let i = 0; i < 8; i++) {
                setTimeout(() => this.createParticle(this.cursorX, this.cursorY), i * 50);
            }
        });

        document.addEventListener('mouseup', () => {
            this.cursor.classList.remove('click');
        });
    }

    animate() {
        // Spring-damped harmonic motion for cursor
        const dx = this.mouseX - this.cursorX;
        const dy = this.mouseY - this.cursorY;

        const springForceX = dx * this.config.springConstant;
        const springForceY = dy * this.config.springConstant;
        const dampingForceX = -this.velocityX * this.config.damping;
        const dampingForceY = -this.velocityY * this.config.damping;

        const totalForceX = springForceX + dampingForceX;
        const totalForceY = springForceY + dampingForceY;

        const accelerationX = totalForceX / this.config.mass;
        const accelerationY = totalForceY / this.config.mass;

        this.velocityX += accelerationX;
        this.velocityY += accelerationY;

        this.cursorX += this.velocityX;
        this.cursorY += this.velocityY;

        this.cursor.style.left = this.cursorX + 'px';
        this.cursor.style.top = this.cursorY + 'px';

        // Update label bar
        this.updateLabel();

        // Trail system
        this.createTrail(this.cursorX, this.cursorY);
        this.updateTrails();

        requestAnimationFrame(() => this.animate());
    }

    updateLabel() {
        if (!this.currentHoveredElement) return;

        const rect = this.currentHoveredElement.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;

        // Spring physics
        const dx = targetX - this.labelX;
        const dy = targetY - this.labelY;
        const springForceX = dx * this.config.labelSpring;
        const springForceY = dy * this.config.labelSpring;
        const dampingForceX = -this.labelVelX * this.config.labelDamping;
        const dampingForceY = -this.labelVelY * this.config.labelDamping;

        this.labelVelX += springForceX + dampingForceX;
        this.labelVelY += springForceY + dampingForceY;
        this.labelX += this.labelVelX;
        this.labelY += this.labelVelY;

        // Calculate direction vector
        const dirX = this.labelX - this.cursorX;
        const dirY = this.labelY - this.cursorY;
        const distance = Math.sqrt(dirX * dirX + dirY * dirY);

        if (distance === 0) return;

        const normX = dirX / distance;
        const normY = dirY / distance;

        // Fixed connector length
        const connectorLength = Math.min(100, distance * 0.7);
        const connectorEndX = this.cursorX + normX * connectorLength;
        const connectorEndY = this.cursorY + normY * connectorLength;

        // Smart perpendicular positioning
        const offsetDistance = 35;
        let labelOffsetX, labelOffsetY;
        const isAbove = this.cursorY > targetY;

        if (Math.abs(dirX) < Math.abs(dirY)) {
            labelOffsetX = (dirX > 0 ? 1 : -1) * offsetDistance;
            labelOffsetY = 0;
        } else {
            labelOffsetX = 0;
            labelOffsetY = (isAbove ? -1 : 1) * offsetDistance;
        }

        const targetLabelX = connectorEndX + labelOffsetX;
        const targetLabelY = connectorEndY + labelOffsetY;

        // Smooth interpolation
        this.labelDisplayX += (targetLabelX - this.labelDisplayX) * this.config.labelLerp;
        this.labelDisplayY += (targetLabelY - this.labelDisplayY) * this.config.labelLerp;

        const targetAngle = Math.atan2(connectorEndY - this.cursorY, connectorEndX - this.cursorX) * (180 / Math.PI);
        this.connectorDisplayLength += (connectorLength - this.connectorDisplayLength) * this.config.labelLerp;

        // Smooth angle interpolation
        let angleDiff = targetAngle - this.connectorDisplayAngle;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        this.connectorDisplayAngle += angleDiff * this.config.labelLerp;

        // Apply positions
        this.cursorText.style.left = this.labelDisplayX + 'px';
        this.cursorText.style.top = this.labelDisplayY + 'px';
        this.cursorConnector.style.left = this.cursorX + 'px';
        this.cursorConnector.style.top = this.cursorY + 'px';
        this.cursorConnector.style.width = this.connectorDisplayLength + 'px';
        this.cursorConnector.style.transform = `rotate(${this.connectorDisplayAngle}deg)`;
    }

    createTrail(x, y) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = x + 'px';
        trail.style.top = y + 'px';
        document.body.appendChild(trail);

        this.trails.push({
            element: trail,
            life: 1.0
        });

        if (this.trails.length > this.config.maxTrails) {
            const oldTrail = this.trails.shift();
            oldTrail.element.remove();
        }
    }

    updateTrails() {
        this.trails.forEach((trail, index) => {
            trail.life *= 0.92;
            trail.element.style.opacity = trail.life;
            trail.element.style.transform = `translate(-50%, -50%) scale(${trail.life})`;

            if (trail.life < 0.01) {
                trail.element.remove();
                this.trails.splice(index, 1);
            }
        });
    }

    createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'cursor-particle';

        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let px = x;
        let py = y;
        let life = 1.0;

        particle.style.left = px + 'px';
        particle.style.top = py + 'px';
        document.body.appendChild(particle);

        const animateParticle = () => {
            py += vy + 0.5;
            px += vx;
            life *= 0.95;

            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.opacity = life;

            if (life > 0.05) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        };
        animateParticle();
    }

    magneticEffect(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = centerX - this.mouseX;
        const dy = centerY - this.mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const magnetRadius = 100;

        if (distance < magnetRadius) {
            const force = Math.pow(1 - distance / magnetRadius, 2);
            const pullX = dx * force * 0.3;
            const pullY = dy * force * 0.3;

            this.mouseX += pullX;
            this.mouseY += pullY;
        }
    }

    updateCursorText(text, icon) {
        this.cursorText.innerHTML = `<span class="cursor-text-icon">${icon}</span><span>${text}</span>`;
    }

    showCursorLabel(element) {
        this.currentHoveredElement = element;
        const rect = element.getBoundingClientRect();
        this.labelX = rect.left + rect.width / 2;
        this.labelY = rect.top + rect.height / 2;

        if (this.labelDisplayX === 0 && this.labelDisplayY === 0) {
            this.labelDisplayX = this.labelX;
            this.labelDisplayY = this.labelY;
        }

        this.labelVelX = 0;
        this.labelVelY = 0;
        this.cursorText.classList.add('active');
        this.cursorConnector.classList.add('active');
    }

    hideCursorLabel() {
        this.currentHoveredElement = null;
        this.cursorText.classList.remove('active');
        this.cursorConnector.classList.remove('active');
    }

    setupInteractiveElements() {
        Object.entries(this.config.interactiveElements).forEach(([selector, data]) => {
            document.querySelectorAll(selector).forEach(el => {
                el.addEventListener('mouseenter', () => {
                    this.cursor.classList.add('hover');
                    this.updateCursorText(data.text, data.icon);
                    this.showCursorLabel(el);
                });

                el.addEventListener('mouseleave', () => {
                    this.cursor.classList.remove('hover');
                    this.hideCursorLabel();
                });

                el.addEventListener('mousemove', () => {
                    this.magneticEffect(el);
                });
            });
        });
    }

    // Public method to add custom interactive elements after initialization
    addInteractiveElement(selector, text, icon) {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.classList.add('hover');
                this.updateCursorText(text, icon);
                this.showCursorLabel(el);
            });

            el.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('hover');
                this.hideCursorLabel();
            });

            el.addEventListener('mousemove', () => {
                this.magneticEffect(el);
            });
        });
    }
}

// Initialize cursor when DOM is ready
function initCustomCursor(config = {}) {
    if (window.innerWidth <= 768) return null; // Skip on mobile
    
    const cursor = new CustomCursor(config);
    cursor.init();
    return cursor;
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.customCursor = initCustomCursor();
    });
} else {
    window.customCursor = initCustomCursor();
}