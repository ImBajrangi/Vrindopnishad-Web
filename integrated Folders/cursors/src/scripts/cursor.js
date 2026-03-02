import { detect } from 'detect-browser';

class CursorEmitter {
  constructor() {
    this.browser = detect();
    this.cursorDot = document.querySelector('.cursor-dot');
    this.cursorCircle = document.querySelector('.cursor-circle');
    this.svgCursors = {
      check: document.getElementById('svg-cursor-check'),
      close: document.getElementById('svg-cursor-close'),
      notAllowed: document.getElementById('svg-cursor-notallowed')
    };
    
    this.cursorX = 0;
    this.cursorY = 0;
    this.currentFrame = null;
    
    this.init();
  }
  
  init() {
    if (this.browser.type !== 'browser' || 'ontouchstart' in window) {
      this.disableCursor();
      return;
    }
    
    this.bindEvents();
    this.animate();
  }
  
  bindEvents() {
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    
    // Button events
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => this.handleButtonHover(btn));
      btn.addEventListener('mouseleave', () => this.resetCursor());
    });
    
    // Text events
    document.querySelectorAll('.test-text').forEach(text => {
      text.addEventListener('mouseenter', () => this.setTextCursor());
      text.addEventListener('mouseleave', () => this.resetCursor());
    });
  }
  
  handleMouseMove(e) {
    this.cursorX = e.clientX;
    this.cursorY = e.clientY;
    
    // Update dot position immediately
    this.cursorDot.style.left = `${this.cursorX}px`;
    this.cursorDot.style.top = `${this.cursorY}px`;
    
    // Update SVG cursors if visible
    Object.values(this.svgCursors).forEach(cursor => {
      if (cursor.style.display !== 'none') {
        cursor.style.left = `${this.cursorX}px`;
        cursor.style.top = `${this.cursorY}px`;
      }
    });
  }
  
  animate() {
    const ease = 0.15;
    
    const circleX = parseFloat(this.cursorCircle.style.left) || this.cursorX;
    const circleY = parseFloat(this.cursorCircle.style.top) || this.cursorY;
    
    this.cursorCircle.style.left = `${circleX + (this.cursorX - circleX) * ease}px`;
    this.cursorCircle.style.top = `${circleY + (this.cursorY - circleY) * ease}px`;
    
    this.currentFrame = requestAnimationFrame(this.animate.bind(this));
  }
  
  handleButtonHover(btn) {
    this.hideDefaultCursor();
    
    if (btn.classList.contains('success')) {
      this.showSvgCursor('check');
    } else if (btn.classList.contains('close')) {
      this.showSvgCursor('close');
    } else if (btn.classList.contains('disabled')) {
      this.showSvgCursor('notAllowed');
    }
  }
  
  showSvgCursor(type) {
    this.hideAllSvgCursors();
    const cursor = this.svgCursors[type];
    cursor.style.display = 'block';
    // Force reflow
    cursor.offsetHeight;
    cursor.classList.add('active');
  }
  
  hideAllSvgCursors() {
    Object.values(this.svgCursors).forEach(cursor => {
      cursor.classList.remove('active');
      setTimeout(() => {
        if (!cursor.classList.contains('active')) {
          cursor.style.display = 'none';
        }
      }, 300);
    });
  }
  
  setTextCursor() {
    this.cursorDot.classList.add('text');
    this.cursorCircle.classList.add('text');
  }
  
  resetCursor() {
    this.showDefaultCursor();
    this.hideAllSvgCursors();
    this.cursorDot.classList.remove('text');
    this.cursorCircle.classList.remove('text');
  }
  
  hideDefaultCursor() {
    this.cursorDot.style.opacity = '0';
    this.cursorCircle.style.opacity = '0';
  }
  
  showDefaultCursor() {
    setTimeout(() => {
      this.cursorDot.style.opacity = '1';
      this.cursorCircle.style.opacity = '1';
    }, 150);
  }
  
  disableCursor() {
    this.cursorDot.style.display = 'none';
    this.cursorCircle.style.display = 'none';
    Object.values(this.svgCursors).forEach(cursor => {
      cursor.style.display = 'none';
    });
    document.body.style.cursor = 'auto';
  }
}

// Initialize cursor
new CursorEmitter();