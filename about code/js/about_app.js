/**
 * Vrindopnishad About - Advanced Animations
 * Inspired by: GSAP, Lenis, Split Text, Gliding Cards
 * Optimized for Mobile Performance
 */

gsap.registerPlugin(ScrollTrigger);

// Mobile detection - disable heavy effects
const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ========== Lenis Smooth Scroll ==========
let lenis;

function initLenis() {
    // Skip Lenis on mobile for better native scroll performance
    if (isMobile) return;

    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

// ========== Split Text Animation ==========
function splitTextIntoChars(element) {
    if (!element) return [];
    const text = element.textContent;
    element.innerHTML = '';
    const chars = [];

    for (let char of text) {
        const span = document.createElement('span');
        span.className = 'char';
        span.style.display = 'inline-block';
        span.textContent = char === ' ' ? '\u00A0' : char;
        element.appendChild(span);
        chars.push(span);
    }

    return chars;
}

// ========== Preloader ==========
class Preloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.counter = document.getElementById('counter');
        this.circle = document.querySelector('.preloader-circle');

        if (!this.preloader) return;
        this.init();
    }

    init() {
        // Faster preloader on mobile
        const duration = isMobile ? 1 : 2;

        const tl = gsap.timeline({
            onComplete: () => this.hide()
        });

        // Counter and circle animation
        tl.to(this.counter, {
            innerText: 100,
            duration: duration,
            snap: { innerText: 1 },
            ease: 'power2.inOut'
        })
            .to(this.circle, {
                strokeDashoffset: 0,
                duration: duration,
                ease: 'power2.inOut'
            }, 0);
    }

    hide() {
        gsap.to(this.preloader, {
            yPercent: -100,
            duration: 0.8,
            ease: 'power3.inOut',
            onComplete: () => {
                this.preloader.classList.add('hidden');
                initPageAnimations();
            }
        });
    }
}

// ========== Custom Cursor ==========
class Cursor {
    constructor() {
        this.cursor = document.getElementById('cursor');
        this.glow = document.getElementById('cursor-glow');

        if (!this.cursor || !this.glow || window.innerWidth < 768) return;

        this.pos = { x: 0, y: 0 };
        this.mouse = { x: 0, y: 0 };

        this.init();
    }

    init() {
        document.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        this.render();
    }

    render() {
        this.pos.x += (this.mouse.x - this.pos.x) * 0.15;
        this.pos.y += (this.mouse.y - this.pos.y) * 0.15;

        this.cursor.style.left = `${this.mouse.x}px`;
        this.cursor.style.top = `${this.mouse.y}px`;

        this.glow.style.left = `${this.pos.x}px`;
        this.glow.style.top = `${this.pos.y}px`;

        requestAnimationFrame(() => this.render());
    }
}

// ========== Navigation ==========
function initNavigation() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('mobile-menu');

    // Scroll effect
    ScrollTrigger.create({
        start: 'top -50',
        onUpdate: self => {
            if (self.scroll() > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    });

    // Mobile menu toggle
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
            document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
        });

        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

// ========== Parallax Layers (Desktop Only) ==========
function initParallax() {
    if (isMobile) return; // Skip on mobile for performance

    const layers = document.querySelectorAll('[data-speed]');

    layers.forEach(layer => {
        const speed = parseFloat(layer.dataset.speed);

        gsap.to(layer, {
            yPercent: speed * 100,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    });
}

// ========== SVG Path Draw on Scroll (Desktop Only) ==========
function initSVGPathDraw() {
    if (isMobile) return; // Skip on mobile for performance

    // Hero path
    const heroPath = document.querySelector('.hero-path');
    if (heroPath) {
        gsap.to(heroPath, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });
    }

    // Section paths
    const drawPaths = gsap.utils.toArray('.draw-path');
    drawPaths.forEach(path => {
        gsap.to(path, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: path.closest('section'),
                start: 'top 80%',
                end: 'bottom 20%',
                scrub: 1
            }
        });
    });
}

// ========== Hero Animations ==========
function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-badge', {
        opacity: 0,
        y: 30,
        duration: 1
    })
        .from('.word', {
            yPercent: 100,
            opacity: 0,
            duration: 1,
            stagger: 0.1
        }, '-=0.5')
        .from('.hero-subtitle', {
            opacity: 0,
            y: 20,
            duration: 0.8
        }, '-=0.4')
        .from('.hero-cta', {
            opacity: 0,
            y: 20,
            duration: 0.8
        }, '-=0.4')
        .from('.scroll-indicator', {
            opacity: 0,
            duration: 1
        }, '-=0.2');
}

// ========== Card 3D Tilt ==========
function initCardTilt() {
    const cards = document.querySelectorAll('[data-tilt]');

    if (window.innerWidth < 768) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });
}

// ========== Scroll Reveal Animations ==========
function initScrollReveals() {
    // Section headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: header,
                start: 'top 80%'
            }
        });
    });

    // Philosophy cards
    gsap.utils.toArray('.philosophy-card').forEach((card, i) => {
        gsap.from(card, {
            opacity: 0,
            y: 60,
            duration: 0.8,
            delay: i * 0.15,
            scrollTrigger: {
                trigger: '.philosophy-grid',
                start: 'top 70%'
            }
        });
    });

    // Stats
    gsap.utils.toArray('.stat-card').forEach((card, i) => {
        gsap.from(card, {
            opacity: 0,
            y: 40,
            scale: 0.9,
            duration: 0.6,
            delay: i * 0.1,
            scrollTrigger: {
                trigger: '.stats-grid',
                start: 'top 80%'
            }
        });
    });

    // Work items
    gsap.utils.toArray('.work-item').forEach((item, i) => {
        gsap.from(item, {
            opacity: 0,
            x: -40,
            duration: 0.8,
            delay: i * 0.1,
            scrollTrigger: {
                trigger: item,
                start: 'top 85%'
            }
        });
    });

    // Team cards
    gsap.utils.toArray('.team-card').forEach((card, i) => {
        gsap.from(card, {
            opacity: 0,
            y: 50,
            duration: 0.6,
            delay: i * 0.1,
            scrollTrigger: {
                trigger: '.team-grid',
                start: 'top 70%'
            }
        });
    });
}

// ========== Counter Animation ==========
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');

    counters.forEach(counter => {
        const value = parseInt(counter.dataset.count);

        ScrollTrigger.create({
            trigger: counter,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(counter, {
                    innerText: value,
                    duration: 2,
                    ease: 'power2.out',
                    snap: { innerText: 1 }
                });
            },
            once: true
        });
    });
}

// ========== Smooth Scroll ==========
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') return;

            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const y = target.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });
}

// ========== Page Animations (after preloader) ==========
function initPageAnimations() {
    initParallax();
    initSVGPathDraw();
    initHeroAnimations();
    initCardTilt();
    initScrollReveals();
    initCounters();
    initGlidingCards();
    initTextReveal();
}

// ========== Gliding Cards Effect ==========
function initGlidingCards() {
    const cards = gsap.utils.toArray('.philosophy-card, .team-card, .stat-card');

    cards.forEach((card, i) => {
        const direction = i % 2 === 0 ? -1 : 1;

        gsap.from(card, {
            x: direction * 100,
            opacity: 0,
            rotation: direction * 5,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });
}

// ========== Text Reveal on Scroll ==========
function initTextReveal() {
    if (isMobile) return;

    const titles = document.querySelectorAll('.gradient-text');

    titles.forEach(title => {
        const chars = splitTextIntoChars(title);

        gsap.from(chars, {
            yPercent: 100,
            opacity: 0,
            duration: 0.8,
            stagger: 0.03,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: title,
                start: 'top 80%'
            }
        });
    });
}

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    new Preloader();
    new Cursor();
    initNavigation();
    initSmoothScroll();
});

// Refresh on resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});
