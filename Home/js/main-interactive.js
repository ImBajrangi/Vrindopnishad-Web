
// User Interaction & Welcome Notification
let hasUserInteracted = false;

['click', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, () => {
        hasUserInteracted = true;
    }, { once: true });
});

document.addEventListener('DOMContentLoaded', () => {
    // Welcome Notification
    setTimeout(() => {
        const hour = new Date().getHours();
        let greeting;

        if (hour >= 5 && hour < 12) {
            greeting = "Good Morning";
        } else if (hour >= 12 && hour < 17) {
            greeting = "Good Afternoon";
        } else if (hour >= 17 && hour < 22) {
            greeting = "Good Evening";
        } else {
            greeting = "Welcome";
        }

        if (typeof showNotification === 'function') {
            showNotification(`${greeting}! Welcome to Vrindopnishad 🙏`, 'success', {
                appName: 'Vrindopnishad',
                duration: 5000,
                playSound: true
            });
        }
    }, 2000);

    // Emergency fix for scrolling issues
    setInterval(() => {
        if (!document.querySelector('.tools-menu.active') &&
            !document.querySelector('nav.active')) {

            document.documentElement.style.removeProperty('overflow');
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('height');
            document.body.style.removeProperty('height');
            document.documentElement.style.overflowY = 'auto';
            document.body.style.overflowY = 'auto';
            document.body.classList.remove('tools-menu-open');
        }
    }, 1000);

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.tools-menu') &&
            !e.target.closest('.tools-icon') &&
            !e.target.closest('nav') &&
            !e.target.closest('.mobile-menu-btn')) {

            document.documentElement.style.overflowY = 'auto';
            document.body.style.overflowY = 'auto';
            document.body.classList.remove('tools-menu-open');
        }
    });

    // Smart Header Logic
    let lastScroll = 0;
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll <= 0) { header.classList.remove('hide'); return; }
        if (currentScroll > lastScroll && !header.classList.contains('hide')) {
            header.classList.add('hide');
        } else if (currentScroll < lastScroll && header.classList.contains('hide')) {
            header.classList.remove('hide');
        }
        lastScroll = currentScroll;
    });

    // Custom Cursor
    const dot = document.querySelector('.cursor-dot');
    const circle = document.querySelector('.cursor-circle');
    let mouseX = 0, mouseY = 0, circleX = 0, circleY = 0;
    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    function animateCursor() {
        if (dot) { dot.style.left = `${mouseX}px`; dot.style.top = `${mouseY}px`; }
        circleX += (mouseX - circleX) * 0.15;
        circleY += (mouseY - circleY) * 0.15;
        if (circle) { circle.style.left = `${circleX}px`; circle.style.top = `${circleY}px`; }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, .magnetic, .tools-icon').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));

    // Mobile Menu
    const mobileMenuBtn = document.querySelector('.menu');
    const nav = document.querySelector('nav');
    const menuOverlay = document.querySelector('.menu-overlay');
    if (mobileMenuBtn && nav) {
        function openMenu() {
            mobileMenuBtn.classList.add('active');
            if (nav) nav.classList.add('active');
            if (menuOverlay) menuOverlay.classList.add('active');
            document.body.classList.add('menu-open');
            if (nav) nav.setAttribute('aria-hidden', 'false');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
        }
        function closeMenu() {
            mobileMenuBtn.classList.remove('active');
            if (nav) nav.classList.remove('active');
            if (menuOverlay) menuOverlay.classList.remove('active');
            document.body.classList.remove('menu-open');
            if (nav) nav.setAttribute('aria-hidden', 'true');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
        mobileMenuBtn.addEventListener('click', (e) => { e.preventDefault(); nav.classList.contains('active') ? closeMenu() : openMenu(); });
        if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
        document.querySelectorAll('nav a').forEach(link => link.addEventListener('click', closeMenu));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('active')) closeMenu(); });
    }

    // Initialize typography animations after fonts and GSAP load
    // Note: TypeKit removed, using Google Fonts which load via CSS
    setTimeout(() => initTypography(), 500);
});

// Typography Animations
const wrapElements = (elems, wrapType, wrapClass) => {
    elems.forEach(char => { const wrapEl = document.createElement(wrapType); wrapEl.classList = wrapClass; char.parentNode.appendChild(wrapEl); wrapEl.appendChild(char); });
};

const initTypography = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Splitting === 'undefined') {
        console.warn('GSAP, ScrollTrigger, or Splitting not loaded yet. Retrying...');
        setTimeout(initTypography, 100);
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    Splitting();

    // Use requestAnimationFrame to ensure Splitting() DOM changes are settled 
    // before querying geometric properties like offsetLeft for animations.
    requestAnimationFrame(() => {
        // Get all effect titles
        const fx1Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect1]')];
        const fx2Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect2]')];
        const fx3Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect3]')];
        const fx4Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect4]')];
        const fx5Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect5]')];
        const fx6Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect6]')];
        const fx7Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect7]')];
        const fx8Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect8]')];
        const fx9Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect9]')];
        const fx10Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect10]')];
        const fx11Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect11]')];
        const fx12Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect12]')];
        const fx13Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect13]')];
        const fx14Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect14]')];
        const fx15Titles = [...document.querySelectorAll('.content__title[data-splitting][data-effect15]')];

        // FX1
        fx1Titles.forEach(title => {
            const chars = title.querySelectorAll('.char');
            gsap.fromTo(chars, { 'will-change': 'opacity, transform', opacity: 0, scale: 0.6, rotationZ: () => gsap.utils.random(-20, 20) },
                { ease: 'power4', opacity: 1, scale: 1, rotation: 0, stagger: 0.4, scrollTrigger: { trigger: title, start: 'center+=20% bottom', end: '+=50%', scrub: true } });
        });

        // FX2
        fx2Titles.forEach(title => {
            const chars = title.querySelectorAll('.char');
            gsap.fromTo(chars, { 'will-change': 'opacity, transform', opacity: 0, yPercent: 120, scaleY: 2.3, scaleX: 0.7, transformOrigin: '50% 0%' },
                { duration: 1, ease: 'back.inOut(2)', opacity: 1, yPercent: 0, scaleY: 1, scaleX: 1, stagger: 0.03, scrollTrigger: { trigger: title, start: 'center bottom+=50%', end: 'bottom top+=40%', scrub: true } });
        });

        // FX3
        fx3Titles.forEach(title => {
            const chars = title.querySelectorAll('.char');
            gsap.fromTo(chars, { 'will-change': 'transform', transformOrigin: '50% 0%', scaleY: 0 },
                { ease: 'back', opacity: 1, scaleY: 1, yPercent: 0, stagger: 0.03, scrollTrigger: { trigger: title, start: 'center bottom-=5%', end: 'top top-=20%', scrub: true } });
        });

        // FX4
        fx4Titles.forEach(title => {
            const words = title.querySelectorAll('.word');
            for (const word of words) {
                const chars = word.querySelectorAll('.char');
                gsap.fromTo(chars, { 'will-change': 'opacity, transform', x: (position, _, arr) => 150 * (position - arr.length / 2) },
                    { ease: 'power1.inOut', x: 0, stagger: { grid: 'auto', from: 'center' }, scrollTrigger: { trigger: word, start: 'center bottom+=30%', end: 'top top+=15%', scrub: true } });
            }
        });

        // FX5
        fx5Titles.forEach(title => {
            const chars = title.querySelectorAll('.char');
            gsap.fromTo(chars, { 'will-change': 'opacity, transform', opacity: 0, xPercent: () => gsap.utils.random(-200, 200), yPercent: () => gsap.utils.random(-150, 150) },
                { ease: 'power1.inOut', opacity: 1, xPercent: 0, yPercent: 0, stagger: { each: 0.05, grid: 'auto', from: 'random' }, scrollTrigger: { trigger: title, start: 'center bottom+=10%', end: 'bottom center', scrub: 0.9 } });
        });

        // FX6
        fx6Titles.forEach(title => {
            const words = title.querySelectorAll('.word');
            for (const word of words) {
                const chars = word.querySelectorAll('.char');
                chars.forEach(char => gsap.set(char.parentNode, { perspective: 2000 }));
                gsap.fromTo(chars, { 'will-change': 'opacity, transform', opacity: 0, rotationX: -90, yPercent: 50 },
                    { ease: 'power1.inOut', opacity: 1, rotationX: 0, yPercent: 0, stagger: { each: 0.03, from: 0 }, scrollTrigger: { trigger: word, start: 'center bottom+=40%', end: 'bottom center-=30%', scrub: 0.9 } });
            }
        });

        // FX7
        fx7Titles.forEach(title => {
            const words = title.querySelectorAll('.word');
            for (const word of words) {
                const chars = word.querySelectorAll('.char');
                chars.forEach(char => gsap.set(char.parentNode, { perspective: 2000 }));
                gsap.fromTo(chars, { 'will-change': 'opacity, transform', transformOrigin: '100% 50%', opacity: 0, rotationY: -90, z: -300 },
                    { ease: 'expo', opacity: 1, rotationY: 0, z: 0, stagger: { each: 0.06, from: 'end' }, scrollTrigger: { trigger: word, start: 'bottom bottom+=20%', end: 'bottom top', scrub: 1 } });
            }
        });

        // FX8
        const lettersAndSymbols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '!', '@', '#', '$', '%', '^', '&', '*', '-', '_', '+', '=', ';', ':', '<', '>', ','];
        fx8Titles.forEach(title => {
            const chars = title.querySelectorAll('.char');
            chars.forEach((char, position) => {
                let initialHTML = char.innerHTML;
                gsap.fromTo(char, { opacity: 0 },
                    { duration: 0.03, innerHTML: () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)], repeat: 1, repeatRefresh: true, opacity: 1, repeatDelay: 0.03, delay: (position + 1) * 0.18, onComplete: () => gsap.set(char, { innerHTML: initialHTML, delay: 0.03 }), scrollTrigger: { trigger: title, start: 'top bottom', end: 'bottom center', toggleActions: "play resume resume reset", onEnter: () => gsap.set(char, { opacity: 0 }) } });
            });
        });

        // FX9
        fx9Titles.forEach(title => {
            const words = title.querySelectorAll('.word');
            for (const word of words) {
                const chars = word.querySelectorAll('.char');
                gsap.fromTo(chars, { 'will-change': 'transform', scaleX: 0, x: (_, target) => window.innerWidth / 2 - target.offsetLeft - target.offsetWidth / 2 },
                    { ease: 'power1.inOut', scaleX: 1, x: 0, scrollTrigger: { trigger: word, start: 'top bottom', end: 'top top', scrub: true } });
            }
        });

        // FX10
        fx10Titles.forEach(title => {
            const chars = title.querySelectorAll('.char');
            gsap.fromTo(chars, { 'will-change': 'opacity', opacity: 0, filter: 'blur(20px)' },
                { duration: 0.25, ease: 'power1.inOut', opacity: 1, filter: 'blur(0px)', stagger: { each: 0.05, from: 'random' }, scrollTrigger: { trigger: title, start: 'top bottom', end: 'center center', toggleActions: "play resume resume reset" } });
        });

        // FX11
        fx11Titles.forEach(title => {
            const chars = title.querySelectorAll('.char');
            wrapElements(chars, 'span', 'char-wrap');
            gsap.fromTo(chars, { 'will-change': 'transform', transformOrigin: '0% 50%', xPercent: 105 },
                { duration: 1, ease: 'expo', xPercent: 0, stagger: 0.042, scrollTrigger: { trigger: title, start: 'top bottom', end: 'top top+=10%', toggleActions: "play resume resume reset" } });
        });

        // FX12
        fx12Titles.forEach(title => {
            const chars = title.querySelectorAll('.char');
            wrapElements(chars, 'span', 'char-wrap');
            gsap.fromTo(chars, { 'will-change': 'transform', xPercent: -250, rotationZ: 45, scaleX: 6, transformOrigin: '100% 50%' },
                { duration: 1, ease: 'power2', xPercent: 0, rotationZ: 0, scaleX: 1, stagger: -0.06, scrollTrigger: { trigger: title, start: 'top bottom+=10%', end: 'bottom top+=10%', scrub: true } });
        });

        // FX13
        fx13Titles.forEach(title => {
            const chars = title.querySelectorAll('.char');
            chars.forEach(char => gsap.set(char.parentNode, { perspective: 2000 }));
            gsap.fromTo(chars, { 'will-change': 'opacity, transform', opacity: 0, rotationY: 180, xPercent: -40, yPercent: 100 },
                { ease: 'power4.inOut()', opacity: 1, rotationY: 0, xPercent: 0, yPercent: 0, stagger: { each: -0.03, from: 0 }, scrollTrigger: { trigger: title, start: 'center bottom', end: 'bottom center-=30%', scrub: 0.9 } });
        });

        // FX14
        fx14Titles.forEach(title => {
            const chars = title.querySelectorAll('.char');
            gsap.timeline()
                .fromTo(title, { 'will-change': 'transform', xPercent: 100 }, { ease: 'none', xPercent: 0, scrollTrigger: { trigger: title, scrub: true, start: 'center center', end: '+=100%', pin: title.parentNode } })
                .fromTo(chars, { 'will-change': 'transform', scale: 3, yPercent: -900 }, { ease: 'back(2)', scale: 1, yPercent: 0, stagger: 0.05, scrollTrigger: { trigger: title, start: 'center center', end: '+=100%', scrub: 1.9 } }, 0);
        });

        // FX15
        fx15Titles.forEach(title => {
            const chars = title.querySelectorAll('.char');
            chars.forEach(char => gsap.set(char.parentNode, { perspective: 2000 }));
            gsap.timeline()
                .fromTo(title, { 'will-change': 'transform', xPercent: -80 }, { ease: 'none', xPercent: 0, scrollTrigger: { trigger: title, scrub: true, start: 'center center', end: '+=100%', pin: title.parentNode } })
                .fromTo(chars, { 'will-change': 'opacity, transform', transformOrigin: '50% 50% -200px', rotationX: 380, opacity: 0 }, { ease: 'expo.inOut', rotationX: 0, z: 0, opacity: 1, stagger: -0.03, scrollTrigger: { trigger: title, start: 'center center', end: '+=140%', scrub: 1.2 } }, 0);
        });
    });
};
