// Enhanced Hatom Custom Cursor JavaScript: Morphing, Hotspots & Advanced Animation
// Author: AI | Date: 2026-08-22
// See HTML for all required class/id names

class EnhancedCursor {
    constructor() {
        this.cursorDot = document.getElementById('cursorDot');
        this.cursorOutline = document.getElementById('cursorOutline');
        this.cursorGlow = document.getElementById('cursorGlow');
        this.cursorSvg = document.getElementById('cursorSvg');
        this.cursorPath = document.getElementById('cursorPath');
        this.cursorTooltip = document.getElementById('cursorTooltip');
        this.mouse = { x: 0, y: 0 };
        this.dotPos = { x: 0, y: 0 };
        this.outlinePos = { x: 0, y: 0 };
        this.isOverHotspot = false;
        this.activeShape = 'circle';
        this.activeAnimation = '';
        this.dotSpeed = 0.75;
        this.outlineSpeed = 0.10;
        this.setup();
    }
    setup() {
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
        document.addEventListener('mouseleave', this.hide.bind(this));
        document.addEventListener('mouseenter', this.show.bind(this));
        this.bindHotspots();
        this.animate();
        this.show();
    }
    setShape(shape, animation) {
        // Remove prior classes
        this.cursorDot.className = 'cursor-dot';
        this.cursorOutline.className = 'cursor-outline';
        // For SVG
        this.cursorSvg.style.opacity = '0';
        // Handle shape
        switch(shape) {
            case 'triangle':
                this.cursorDot.classList.add('triangle');
                this.cursorOutline.classList.add('triangle');
                this.activeShape = 'triangle'; break;
            case 'star':
                this.cursorDot.classList.add('star');
                this.cursorOutline.classList.add('star');
                this.activeShape = 'star'; break;
            case 'heart':
                this.cursorDot.classList.add('heart');
                this.cursorOutline.classList.add('heart');
                this.activeShape = 'heart'; break;
            case 'diamond':
                this.cursorDot.classList.add('diamond');
                this.cursorOutline.classList.add('diamond');
                this.activeShape = 'diamond'; break;
            case 'lightning':
                this.cursorDot.classList.add('lightning');
                this.cursorOutline.classList.add('lightning');
                this.activeShape = 'lightning'; break;
            case 'gravity':
            case 'attractor':
            case 'warp':
                this.cursorDot.classList.add(shape);
                this.cursorOutline.classList.add(shape);
                this.activeShape = shape; break;
            default:
                this.cursorDot.classList.remove('triangle','star','heart','diamond','lightning','gravity','attractor','warp');
                this.cursorOutline.classList.remove('triangle','star','heart','diamond','lightning','gravity','attractor','warp');
                this.activeShape = 'circle';
        }
        // Animate SVG if any
        if(['star','heart','diamond','triangle','lightning'].includes(shape)) {
            this.cursorSvg.style.opacity = '1';
            let paths = {
                'circle': 'M20,20 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0',
                'triangle': 'M20 6 L34 34 L6 34 Z',
                'star': 'M20 5 L24.755 17.245 L38 15 L27 23.5 L31.755 35.755 L20 27 L8.245 35.755 L13 23.5 L2 15 L15.245 17.245 Z',
                'heart': 'M20 34 L10 24 Q4 18 10 12 Q16 6 20 12 Q24 6 30 12 Q36 18 30 24 Z',
                'diamond': 'M20 4 L36 20 L20 36 L4 20 Z',
                'lightning': 'M12 4 L28 18 L18 18 L28 36 L12 22 L22 22 Z',
            };
            this.cursorPath.setAttribute('d', paths[shape] || paths['circle']);
            this.cursorSvg.style.opacity = '1';
        } else {
            this.cursorSvg.style.opacity = '0';
        }
        this.activeAnimation = animation;
    }
    bindHotspots() {
        document.querySelectorAll('.cursor-hotspot').forEach(hotspot => {
            hotspot.addEventListener('mouseenter', e => {
                let s = hotspot.getAttribute('data-shape');
                let a = hotspot.getAttribute('data-animation');
                let tip = hotspot.getAttribute('data-tooltip');
                this.setShape(s, a);
                this.isOverHotspot = true;
                this.showTooltip(tip);
            });
            hotspot.addEventListener('mouseleave', e => {
                this.setShape('circle');
                this.isOverHotspot = false;
                this.hideTooltip();
            });
        });
    }
    showTooltip(txt) {
        if(this.cursorTooltip) {
            this.cursorTooltip.textContent = txt || '';
            this.cursorTooltip.classList.add('show');
        }
    }
    hideTooltip() {
        if(this.cursorTooltip) this.cursorTooltip.classList.remove('show');
    }
    show() {
        this.cursorDot.style.opacity = '1';
        this.cursorOutline.style.opacity = '1';
        this.cursorGlow.style.opacity = '1';
        this.cursorSvg.style.opacity = (this.activeShape !== 'circle' ? '1' : '0');
        if(this.cursorTooltip && this.isOverHotspot) this.cursorTooltip.classList.add('show');
    }
    hide() {
        this.cursorDot.style.opacity = '0';
        this.cursorOutline.style.opacity = '0';
        this.cursorGlow.style.opacity = '0';
        this.cursorSvg.style.opacity = '0';
        if(this.cursorTooltip) this.cursorTooltip.classList.remove('show');
    }
    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        // Move tooltip w/ cursor
        if(this.cursorTooltip && this.isOverHotspot) {
            this.cursorTooltip.style.left = (e.clientX + 36)+'px';
            this.cursorTooltip.style.top = (e.clientY - 30)+'px';
        }
    }
    animate() {
        // Smoothly interpolate position
        this.dotPos.x += (this.mouse.x - this.dotPos.x) * this.dotSpeed;
        this.dotPos.y += (this.mouse.y - this.dotPos.y) * this.dotSpeed;
        this.outlinePos.x += (this.mouse.x - this.outlinePos.x) * this.outlineSpeed;
        this.outlinePos.y += (this.mouse.y - this.outlinePos.y) * this.outlineSpeed;
        // Move elements
        this.cursorDot.style.transform = `translate3d(${this.dotPos.x}px,${this.dotPos.y}px,0)`;
        this.cursorOutline.style.transform = `translate3d(${this.outlinePos.x}px,${this.outlinePos.y}px,0)`;
        this.cursorGlow.style.transform = `translate3d(${this.outlinePos.x}px,${this.outlinePos.y}px,0)`;
        this.cursorSvg.style.transform = `translate3d(${this.outlinePos.x-20}px,${this.outlinePos.y-20}px,0)`;
        requestAnimationFrame(this.animate.bind(this));
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    window.enhancedCursor = new EnhancedCursor();
});