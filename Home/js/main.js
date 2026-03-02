import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import 'splitting/dist/splitting-cells.css';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    // Smart Header Logic
    let lastScroll = 0;
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll <= 0) {
            header.classList.remove('hide');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('hide')) {
            // Scroll Down
            header.classList.add('hide');
        } else if (currentScroll < lastScroll && header.classList.contains('hide')) {
            // Scroll Up
            header.classList.remove('hide');
        }
        lastScroll = currentScroll;
    });

    // Enhanced Custom Cursor Logic
    const dot = document.querySelector('.cursor-dot');
    const circle = document.querySelector('.cursor-circle');

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let circleX = 0;
    let circleY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Dot follows immediately
        dotX = mouseX;
        dotY = mouseY;
        if (dot) {
            dot.style.left = `${dotX}px`;
            dot.style.top = `${dotY}px`;
        }

        // Circle follows with lag
        circleX += (mouseX - circleX) * 0.15;
        circleY += (mouseY - circleY) * 0.15;
        if (circle) {
            circle.style.left = `${circleX}px`;
            circle.style.top = `${circleY}px`;
        }

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Interactivity listeners
    const interactiveElements = document.querySelectorAll('a, button, .magnetic, .tools-icon');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));

    // Mobile Menu Logic
    const mobileMenuBtn = document.querySelector('.menu');
    const nav = document.querySelector('nav');
    const menuOverlay = document.querySelector('.menu-overlay');

    if (mobileMenuBtn && nav) {
        function openMenu() {
            mobileMenuBtn.classList.add('active');
            nav.classList.add('active');
            if (menuOverlay) menuOverlay.classList.add('active');
            document.body.classList.add('menu-open');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
            nav.setAttribute('aria-hidden', 'false');
        }

        function closeMenu() {
            mobileMenuBtn.classList.remove('active');
            nav.classList.remove('active');
            if (menuOverlay) menuOverlay.classList.remove('active');
            document.body.classList.remove('menu-open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            nav.setAttribute('aria-hidden', 'true');
        }

        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (nav.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

        const navClose = document.querySelector('.nav-close');
        if (navClose) {
            navClose.addEventListener('click', closeMenu);
        }

        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // Project Info Panel functionality
    const projectInfoPanel = document.getElementById('projectInfoPanel');
    const projectInfoClose = document.querySelector('.project-info-close');
    const projectInfoOverlay = document.querySelector('.project-info-overlay');

    const projectsData = {
        'Cosmic Art': {
            description: 'A mesmerizing exploration of cosmic energy and spiritual connections through digital artistry. This collection represents the synergy between ancient wisdom and modern creative expression.'
        },
        'Sacred Geometry': {
            description: 'Discover the profound beauty of sacred geometric patterns that underlie the fabric of our universe. Each piece reveals the mathematical harmony present in spiritual traditions.'
        },
        'Divine Expressions': {
            description: 'Capturing moments of divine presence and spiritual beauty through the lens. This photographic journey explores the sacred in everyday life.'
        },
        'Spiritual Transit': {
            description: 'A multimedia exploration of spiritual journeys and transformative experiences. This collection blends traditional and contemporary mediums to express the ineffable.'
        },
        'Ancient Wisdom': {
            description: 'Timeless teachings and profound insights from ancient spiritual traditions, preserved and presented for modern seekers of truth and enlightenment.'
        },
        'Modern Devotion': {
            description: 'Contemporary expressions of devotion and spiritual practice, bridging ancient traditions with digital age creativity and innovation.'
        }
    };

    if (projectInfoPanel) {
        document.querySelectorAll('.project-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const titleEl = item.querySelector('.project-title');
                const categoryEl = item.querySelector('.project-category');
                const image = item.getAttribute('data-image');
                const title = titleEl.textContent.trim();
                const projectData = projectsData[title] || {
                    description: 'Explore this beautiful collection that showcases the depth and beauty of spiritual artistry.'
                };

                const infoImage = document.querySelector('.project-info-image');
                const infoTitle = document.querySelector('.project-info-title');
                const infoCategory = document.querySelector('.project-info-category');
                const infoDescription = document.querySelector('.project-info-description');
                const infoLink = document.querySelector('.project-info-link');

                if (infoImage) infoImage.src = image;
                if (infoTitle) infoTitle.textContent = title;
                if (infoCategory) infoCategory.textContent = categoryEl.textContent.trim();
                if (infoDescription) infoDescription.textContent = projectData.description;
                if (infoLink) infoLink.href = item.querySelector('a').getAttribute('href');

                projectInfoPanel.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeProjectPanel = () => {
            projectInfoPanel.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (projectInfoClose) projectInfoClose.addEventListener('click', closeProjectPanel);
        if (projectInfoOverlay) projectInfoOverlay.addEventListener('click', closeProjectPanel);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && projectInfoPanel.classList.contains('active')) {
                closeProjectPanel();
            }
        });
    }

    // ========== Typography Animations (Cloned Logic) ==========
    const wrapElements = (elems, wrapType, wrapClass) => {
        elems.forEach(char => {
            const wrapEl = document.createElement(wrapType);
            wrapEl.classList = wrapClass;
            char.parentNode.appendChild(wrapEl);
            wrapEl.appendChild(char);
        });
    }

    const initTypography = () => {
        Splitting();

        // Initialize Lenis with snappier settings (matched to source)
        const lenis = new Lenis({
            lerp: 0.2,
            smoothWheel: true,
            syncTouch: true
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        lenis.on('scroll', ScrollTrigger.update);

        // Animation Effects
        const effects = {
            fx1: document.querySelectorAll('[data-effect1]'),
            fx2: document.querySelectorAll('[data-effect2]'),
            fx3: document.querySelectorAll('[data-effect3]'),
            fx4: document.querySelectorAll('[data-effect4]'),
            fx5: document.querySelectorAll('[data-effect5]'),
            fx6: document.querySelectorAll('[data-effect6]'),
            fx7: document.querySelectorAll('[data-effect7]'),
            fx8: document.querySelectorAll('[data-effect8]'),
            fx9: document.querySelectorAll('[data-effect9]'),
            fx10: document.querySelectorAll('[data-effect10]'),
            fx11: document.querySelectorAll('[data-effect11]'),
            fx12: document.querySelectorAll('[data-effect12]'),
            fx13: document.querySelectorAll('[data-effect13]'),
            fx14: document.querySelectorAll('[data-effect14]'),
            fx15: document.querySelectorAll('[data-effect15]')
        };

        // FX1
        effects.fx1.forEach(title => {
            const chars = title.querySelectorAll('.char');
            gsap.fromTo(chars, {
                'will-change': 'opacity, transform',
                opacity: 0, scale: 0.6,
                rotationZ: () => gsap.utils.random(-20, 20)
            }, {
                ease: 'power4', opacity: 1, scale: 1, rotation: 0,
                stagger: 0.4,
                scrollTrigger: { trigger: title, start: 'center+=20% bottom', end: '+=50%', scrub: true }
            });
        });

        // FX2
        effects.fx2.forEach(title => {
            const chars = title.querySelectorAll('.char');
            gsap.fromTo(chars, {
                'will-change': 'opacity, transform',
                opacity: 0, yPercent: 120, scaleY: 2.3, scaleX: 0.7, transformOrigin: '50% 0%'
            }, {
                duration: 1, ease: 'back.inOut(2)', opacity: 1, yPercent: 0,
                scaleY: 1, scaleX: 1, stagger: 0.03,
                scrollTrigger: { trigger: title, start: 'center bottom+=50%', end: 'bottom top+=40%', scrub: true }
            });
        });

        // FX3
        effects.fx3.forEach(title => {
            const chars = title.querySelectorAll('.char');
            gsap.fromTo(chars, { 'will-change': 'transform', transformOrigin: '50% 0%', scaleY: 0 }, {
                ease: 'back', opacity: 1, scaleY: 1, yPercent: 0, stagger: 0.03,
                scrollTrigger: { trigger: title, start: 'center bottom-=5%', end: 'top top-=20%', scrub: true }
            });
        });

        // FX4
        effects.fx4.forEach(title => {
            const words = title.querySelectorAll('.word');
            words.forEach(word => {
                const chars = word.querySelectorAll('.char');
                gsap.fromTo(chars, { 'will-change': 'opacity, transform', x: (p, _, arr) => 150 * (p - arr.length / 2) }, {
                    ease: 'power1.inOut', x: 0, stagger: { grid: 'auto', from: 'center' },
                    scrollTrigger: { trigger: word, start: 'center bottom+=30%', end: 'top top+=15%', scrub: true }
                });
            });
        });

        // FX5
        effects.fx5.forEach(title => {
            const chars = title.querySelectorAll('.char');
            gsap.fromTo(chars, {
                'will-change': 'opacity, transform', opacity: 0,
                xPercent: () => gsap.utils.random(-200, 200), yPercent: () => gsap.utils.random(-150, 150)
            }, {
                ease: 'power1.inOut', opacity: 1, xPercent: 0, yPercent: 0,
                stagger: { each: 0.05, grid: 'auto', from: 'random' },
                scrollTrigger: { trigger: title, start: 'center bottom+=10%', end: 'bottom center', scrub: 0.9 }
            });
        });

        // FX6
        effects.fx6.forEach(title => {
            const words = title.querySelectorAll('.word');
            words.forEach(word => {
                const chars = word.querySelectorAll('.char');
                chars.forEach(char => gsap.set(char.parentNode, { perspective: 2000 }));
                gsap.fromTo(chars, { 'will-change': 'opacity, transform', opacity: 0, rotationX: -90, yPercent: 50 }, {
                    ease: 'power1.inOut', opacity: 1, rotationX: 0, yPercent: 0, stagger: { each: 0.03, from: 0 },
                    scrollTrigger: { trigger: word, start: 'center bottom+=40%', end: 'bottom center-=30%', scrub: 0.9 }
                });
            });
        });

        // FX7
        effects.fx7.forEach(title => {
            const words = title.querySelectorAll('.word');
            words.forEach(word => {
                const chars = word.querySelectorAll('.char');
                chars.forEach(char => gsap.set(char.parentNode, { perspective: 2000 }));
                gsap.fromTo(chars, { 'will-change': 'opacity, transform', transformOrigin: '100% 50%', opacity: 0, rotationY: -90, z: -300 }, {
                    ease: 'expo', opacity: 1, rotationY: 0, z: 0, stagger: { each: 0.06, from: 'end' },
                    scrollTrigger: { trigger: word, start: 'bottom bottom+=20%', end: 'bottom top', scrub: 1 }
                });
            });
        });

        // FX8
        const lettersAndSymbols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '!', '@', '#', '$', '%', '^', '&', '*', '-', '_', '+', '=', ';', ':', '<', '>', ','];
        effects.fx8.forEach(title => {
            const chars = title.querySelectorAll('.char');
            chars.forEach((char, position) => {
                let initialHTML = char.innerHTML;
                gsap.fromTo(char, { opacity: 0 }, {
                    duration: 0.03, innerHTML: () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)],
                    repeat: 1, repeatRefresh: true, opacity: 1, repeatDelay: 0.03, delay: (position + 1) * 0.18,
                    onComplete: () => gsap.set(char, { innerHTML: initialHTML, delay: 0.03 }),
                    scrollTrigger: { trigger: title, start: 'top bottom', end: 'bottom center', toggleActions: "play resume resume reset", onEnter: () => gsap.set(char, { opacity: 0 }) }
                });
            });
        });

        // FX9
        effects.fx9.forEach(title => {
            const words = title.querySelectorAll('.word');
            words.forEach(word => {
                const chars = word.querySelectorAll('.char');
                gsap.fromTo(chars, { 'will-change': 'transform', scaleX: 0, x: (_, target) => window.innerWidth / 2 - target.offsetLeft - target.offsetWidth / 2 }, {
                    ease: 'power1.inOut', scaleX: 1, x: 0,
                    scrollTrigger: { trigger: word, start: 'top bottom', end: 'top top', scrub: true }
                });
            });
        });

        // FX10
        effects.fx10.forEach(title => {
            const chars = title.querySelectorAll('.char');
            gsap.fromTo(chars, { 'will-change': 'opacity', opacity: 0, filter: 'blur(20px)' }, {
                duration: 0.25, ease: 'power1.inOut', opacity: 1, filter: 'blur(0px)', stagger: { each: 0.05, from: 'random' },
                scrollTrigger: { trigger: title, start: 'top bottom', end: 'center center', toggleActions: "play resume resume reset" }
            });
        });

        // FX11
        effects.fx11.forEach(title => {
            const chars = title.querySelectorAll('.char');
            wrapElements(chars, 'span', 'char-wrap');
            gsap.fromTo(chars, { 'will-change': 'transform', transformOrigin: '0% 50%', xPercent: 105 }, {
                duration: 1, ease: 'expo', xPercent: 0, stagger: 0.042,
                scrollTrigger: { trigger: title, start: 'top bottom', end: 'top top+=10%', toggleActions: "play resume resume reset" }
            });
        });

        // FX12
        effects.fx12.forEach(title => {
            const chars = title.querySelectorAll('.char');
            wrapElements(chars, 'span', 'char-wrap');
            gsap.fromTo(chars, { 'will-change': 'transform', xPercent: -250, rotationZ: 45, scaleX: 6, transformOrigin: '100% 50%' }, {
                duration: 1, ease: 'power2', xPercent: 0, rotationZ: 0, scaleX: 1, stagger: -0.06,
                scrollTrigger: { trigger: title, start: 'top bottom+=10%', end: 'bottom top+=10%', scrub: true }
            });
        });

        // FX13
        effects.fx13.forEach(title => {
            const chars = title.querySelectorAll('.char');
            chars.forEach(char => gsap.set(char.parentNode, { perspective: 2000 }));
            gsap.fromTo(chars, { 'will-change': 'opacity, transform', opacity: 0, rotationY: 180, xPercent: -40, yPercent: 100 }, {
                ease: 'power4.inOut()', opacity: 1, rotationY: 0, xPercent: 0, yPercent: 0, stagger: { each: -0.03, from: 0 },
                scrollTrigger: { trigger: title, start: 'center bottom', end: 'bottom center-=30%', scrub: 0.9 }
            });
        });

        // FX14
        effects.fx14.forEach(title => {
            const chars = title.querySelectorAll('.char');
            gsap.timeline()
                .fromTo(title, { 'will-change': 'transform', xPercent: 100 }, {
                    ease: 'none', xPercent: 0, scrollTrigger: { trigger: title, scrub: true, start: 'center center', end: '+=100%', pin: title.parentNode }
                })
                .fromTo(chars, { 'will-change': 'transform', scale: 3, yPercent: -900 }, {
                    ease: 'back(2)', scale: 1, yPercent: 0, stagger: 0.05,
                    scrollTrigger: { trigger: title, start: 'center center', end: '+=100%', scrub: 1.9 }
                }, 0);
        });

        // FX15
        effects.fx15.forEach(title => {
            const chars = title.querySelectorAll('.char');
            chars.forEach(char => gsap.set(char.parentNode, { perspective: 2000 }));
            gsap.timeline()
                .fromTo(title, { 'will-change': 'transform', xPercent: -80 }, {
                    ease: 'none', xPercent: 0, scrollTrigger: { trigger: title, scrub: true, start: 'center center', end: '+=100%', pin: title.parentNode }
                })
                .fromTo(chars, { 'will-change': 'opacity, transform', transformOrigin: '50% 50% -200px', rotationX: 380, opacity: 0 }, {
                    ease: 'expo.inOut', rotationX: 0, z: 0, opacity: 1, stagger: -0.03,
                    scrollTrigger: { trigger: title, start: 'center center', end: '+=140%', scrub: 1.2 }
                }, 0);
        });
    };

    // Call initialization once fonts are ready for precise character splitting
    if (document.fonts) {
        document.fonts.ready.then(() => {
            initTypography();
        });
    } else {
        initTypography();
    }
});
