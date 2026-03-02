/**
 * Hatom Custom Cursor System - Exact Clone Implementation
 * Advanced cursor with WebGL effects, particle trails, and smooth interactions
 */

class HatomCursor {
    constructor() {
        // Core elements
        this.cursorDot = document.getElementById('cursorDot');
        this.cursorOutline = document.getElementById('cursorOutline');
        this.cursorTrail = document.getElementById('cursorTrail');
        this.particlesContainer = document.getElementById('particles-container');
        this.canvas = document.getElementById('webgl-canvas');
        
        // Mouse tracking
        this.mouse = { x: 0, y: 0 };
        this.lastMouse = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        
        // Cursor following positions
        this.dotPos = { x: 0, y: 0 };
        this.outlinePos = { x: 0, y: 0 };
        
        // Animation settings
        this.dotSpeed = 0.8;
        this.outlineSpeed = 0.15;
        this.isPressed = false;
        this.currentCursorType = 'default';
        
        // Particle system
        this.particles = [];
        this.maxParticles = 15;
        this.particleCreationRate = 0.3;
        
        // WebGL setup
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.distortionMesh = null;
        
        // Touch device detection
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (!this.isTouchDevice) {
            this.init();
        }
    }
    
    init() {
        this.setupWebGL();
        this.bindEvents();
        this.animate();
        console.log('Hatom Cursor System Initialized');
    }
    
    setupWebGL() {
        if (!this.canvas) return;
        
        try {
            // Initialize Three.js scene
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: this.canvas, 
                alpha: true,
                antialias: true 
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            
            this.createDistortionEffect();
            
        } catch (error) {
            console.warn('WebGL not supported, using fallback cursor effects');
        }
    }
    
    createDistortionEffect() {
        // Vertex shader
        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        
        // Fragment shader with liquid distortion
        const fragmentShader = `
            uniform vec2 uMouse;
            uniform float uTime;
            uniform vec2 uVelocity;
            uniform float uIntensity;
            varying vec2 vUv;
            
            // Noise function for organic distortion
            vec3 mod289(vec3 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            
            vec4 mod289(vec4 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            
            vec4 permute(vec4 x) {
                return mod289(((x*34.0)+1.0)*x);
            }
            
            vec4 taylorInvSqrt(vec4 r) {
                return 1.79284291400159 - 0.85373472095314 * r;
            }
            
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                
                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
                
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);
                
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                
                i = mod289(i);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                
                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;
                
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);
                
                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                
                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);
                
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                
                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                
                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);
                
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }
            
            void main() {
                vec2 uv = vUv;
                vec2 mouseUv = (uMouse + 1.0) * 0.5;
                
                float distance = length(uv - mouseUv);
                float influence = smoothstep(0.3, 0.0, distance);
                
                if (influence > 0.0) {
                    float noise = snoise(vec3(uv * 10.0, uTime * 0.5));
                    vec2 distortion = normalize(uv - mouseUv) * influence * uIntensity;
                    distortion += vec2(noise) * 0.01 * influence;
                    distortion *= length(uVelocity) * 5.0 + 1.0;
                    
                    uv += distortion;
                }
                
                // Create ripple effect
                float ripple = sin(distance * 20.0 - uTime * 2.0) * influence * 0.02;
                uv += normalize(uv - mouseUv) * ripple;
                
                // Liquid color effect
                vec3 color = vec3(0.1, 0.1, 0.2);
                color += influence * vec3(0.3, 0.6, 1.0) * 0.5;
                color += ripple * vec3(1.0, 0.5, 0.8);
                
                gl_FragColor = vec4(color, influence * 0.3);
            }
        `;
        
        // Create shader material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uMouse: { value: new THREE.Vector2(-1, -1) },
                uTime: { value: 0 },
                uVelocity: { value: new THREE.Vector2(0, 0) },
                uIntensity: { value: 0.1 }
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        // Create geometry and mesh
        const geometry = new THREE.PlaneGeometry(2, 2);
        this.distortionMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.distortionMesh);
        
        this.camera.position.z = 1;
    }
    
    bindEvents() {
        // Mouse events
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Window events
        window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
        
        // Element hover events
        this.bindHoverEvents();
    }
    
    bindHoverEvents() {
        // Get all elements with cursor data attributes
        const cursorElements = document.querySelectorAll('[data-cursor]');
        
        cursorElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const cursorType = e.target.getAttribute('data-cursor');
                this.setCursorType(cursorType);
            });
            
            element.addEventListener('mouseleave', () => {
                this.setCursorType('default');
            });
        });
        
        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => this.setCursorType('pointer'));
            link.addEventListener('mouseleave', () => this.setCursorType('default'));
        });
        
        // Interactive elements
        const interactiveElements = document.querySelectorAll('button, a, input, textarea, select');
        interactiveElements.forEach(element => {
            if (!element.getAttribute('data-cursor')) {
                element.addEventListener('mouseenter', () => this.setCursorType('pointer'));
                element.addEventListener('mouseleave', () => this.setCursorType('default'));
            }
        });
    }
    
    handleMouseMove(e) {
        // Update mouse position
        this.lastMouse.x = this.mouse.x;
        this.lastMouse.y = this.mouse.y;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        // Calculate velocity
        this.velocity.x = this.mouse.x - this.lastMouse.x;
        this.velocity.y = this.mouse.y - this.lastMouse.y;
        
        // Create particles based on velocity
        if (Math.abs(this.velocity.x) > 2 || Math.abs(this.velocity.y) > 2) {
            if (Math.random() < this.particleCreationRate) {
                this.createParticle();
            }
        }
        
        // Update WebGL uniforms
        if (this.distortionMesh) {
            const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            
            this.distortionMesh.material.uniforms.uMouse.value.set(mouseX, mouseY);
            this.distortionMesh.material.uniforms.uVelocity.value.set(
                this.velocity.x * 0.01,
                this.velocity.y * 0.01
            );
        }
    }
    
    handleMouseDown() {
        this.isPressed = true;
        this.cursorDot.style.transform = `translate(-50%, -50%) scale(0.8)`;
        this.cursorOutline.style.transform = `translate(-50%, -50%) scale(1.2)`;
    }
    
    handleMouseUp() {
        this.isPressed = false;
        this.cursorDot.style.transform = `translate(-50%, -50%) scale(1)`;
        this.cursorOutline.style.transform = `translate(-50%, -50%) scale(1)`;
    }
    
    handleMouseLeave() {
        this.cursorDot.style.opacity = '0';
        this.cursorOutline.style.opacity = '0';
    }
    
    handleResize() {
        if (this.renderer && this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    setCursorType(type) {
        // Remove all cursor type classes
        this.cursorDot.className = 'cursor-dot';
        this.cursorOutline.className = 'cursor-outline';
        
        // Add new cursor type class
        if (type !== 'default') {
            this.cursorDot.classList.add(type);
            this.cursorOutline.classList.add(type);
        }
        
        this.currentCursorType = type;
        
        // Update WebGL intensity based on cursor type
        if (this.distortionMesh) {
            let intensity = 0.1;
            switch (type) {
                case 'view': intensity = 0.3; break;
                case 'drag': intensity = 0.25; break;
                case 'pointer': intensity = 0.2; break;
                case 'text': intensity = 0.05; break;
                default: intensity = 0.1; break;
            }
            this.distortionMesh.material.uniforms.uIntensity.value = intensity;
        }
    }
    
    createParticle() {
        if (this.particles.length >= this.maxParticles) {
            // Remove oldest particle
            const oldParticle = this.particles.shift();
            if (oldParticle.element && oldParticle.element.parentNode) {
                oldParticle.element.parentNode.removeChild(oldParticle.element);
            }
        }
        
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random offset from cursor position
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        particle.style.left = (this.mouse.x + offsetX) + 'px';
        particle.style.top = (this.mouse.y + offsetY) + 'px';
        
        // Random color based on cursor type
        let color = 'rgba(255, 255, 255, 0.6)';
        switch (this.currentCursorType) {
            case 'pointer': color = 'rgba(255, 107, 107, 0.8)'; break;
            case 'view': color = 'rgba(69, 183, 209, 0.8)'; break;
            case 'drag': color = 'rgba(243, 156, 18, 0.8)'; break;
            case 'text': color = 'rgba(78, 205, 196, 0.8)'; break;
            case 'loading': color = 'rgba(155, 89, 182, 0.8)'; break;
        }
        particle.style.background = color;
        
        this.particlesContainer.appendChild(particle);
        
        // Store particle reference
        const particleObj = {
            element: particle,
            createdAt: Date.now()
        };
        this.particles.push(particleObj);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
            const index = this.particles.findIndex(p => p.element === particle);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }, 1000);
    }
    
    updateCursorPosition() {
        // Smooth cursor following with different speeds
        this.dotPos.x += (this.mouse.x - this.dotPos.x) * this.dotSpeed;
        this.dotPos.y += (this.mouse.y - this.dotPos.y) * this.dotSpeed;
        
        this.outlinePos.x += (this.mouse.x - this.outlinePos.x) * this.outlineSpeed;
        this.outlinePos.y += (this.mouse.y - this.outlinePos.y) * this.outlineSpeed;
        
        // Apply transforms with hardware acceleration
        this.cursorDot.style.transform = `translate3d(${this.dotPos.x - 4}px, ${this.dotPos.y - 4}px, 0)`;
        this.cursorOutline.style.transform = `translate3d(${this.outlinePos.x - 20}px, ${this.outlinePos.y - 20}px, 0)`;
        
        // Show cursors when mouse moves
        if (this.cursorDot.style.opacity !== '1') {
            this.cursorDot.style.opacity = '1';
            this.cursorOutline.style.opacity = '1';
        }
    }
    
    animate() {
        // Update cursor positions
        this.updateCursorPosition();
        
        // Update WebGL scene
        if (this.renderer && this.scene && this.camera && this.distortionMesh) {
            this.distortionMesh.material.uniforms.uTime.value += 0.016; // ~60fps
            
            // Smooth velocity decay
            this.distortionMesh.material.uniforms.uVelocity.value.multiplyScalar(0.95);
            
            this.renderer.render(this.scene, this.camera);
        }
        
        // Continue animation loop
        requestAnimationFrame(this.animate.bind(this));
    }
    
    // Public methods
    destroy() {
        // Clean up event listeners
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mouseleave', this.handleMouseLeave);
        window.removeEventListener('resize', this.handleResize);
        
        // Clean up WebGL
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Clean up particles
        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        this.particles = [];
        
        console.log('Hatom Cursor System Destroyed');
    }
    
    updateSettings(settings) {
        if (settings.dotSpeed !== undefined) this.dotSpeed = settings.dotSpeed;
        if (settings.outlineSpeed !== undefined) this.outlineSpeed = settings.outlineSpeed;
        if (settings.maxParticles !== undefined) this.maxParticles = settings.maxParticles;
        if (settings.particleCreationRate !== undefined) this.particleCreationRate = settings.particleCreationRate;
    }
}

// Utility functions
class CursorUtils {
    static detectWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }
    
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    static getDevicePixelRatio() {
        return Math.min(window.devicePixelRatio || 1, 2);
    }
    
    static throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }
}

// Initialize the cursor system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check for required elements
    const requiredElements = ['cursorDot', 'cursorOutline', 'cursorTrail', 'particles-container', 'webgl-canvas'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.warn('Missing required elements:', missingElements);
        return;
    }
    
    // Initialize cursor system
    window.hatomCursor = new HatomCursor();
    
    // Optional: Add performance monitoring
    if (window.performance && performance.mark) {
        performance.mark('cursor-init-complete');
        console.log('Cursor system initialized at:', performance.now() + 'ms');
    }
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', function() {
    if (window.hatomCursor) {
        if (document.visibilityState === 'hidden') {
            // Pause animations when page is not visible
            window.hatomCursor.updateSettings({ 
                particleCreationRate: 0,
                dotSpeed: 0.1,
                outlineSpeed: 0.05
            });
        } else {
            // Resume normal animations
            window.hatomCursor.updateSettings({ 
                particleCreationRate: 0.3,
                dotSpeed: 0.8,
                outlineSpeed: 0.15
            });
        }
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HatomCursor, CursorUtils };
}

// Expose to window for global access
window.HatomCursor = HatomCursor;
window.CursorUtils = CursorUtils;