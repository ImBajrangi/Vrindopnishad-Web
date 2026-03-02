/**
 * Animations for Vrindopnishad
 * Handles scroll animations, cursor effects, and other dynamic elements
 */

{
    // DOM Elements - Block scoped to prevent global conflict
    const scrollProgress = document.querySelector('.scroll-progress');
    const bgElements = document.querySelectorAll('.bg-element');
    const projectItems = document.querySelectorAll('.project-item');
    const imageHover = document.querySelector('.image-hover');
    const staggeredItems = document.querySelectorAll('.staggered-item');
    const revealElements = document.querySelectorAll('.reveal-element');
    const horizontalSection = document.querySelector('.horizontal-section');
    const horizontalContent = document.querySelector('.horizontal-content');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    const heroTitle = document.querySelectorAll('.hero-title .row span');
    const heroSubtitle = document.querySelector('.hero-subtitle span');
    const textElements = document.querySelectorAll('.animate-text');
    const colorShiftElements = document.querySelectorAll('.color-shift');
    const menuOverlay = document.querySelector('.menu-overlay');
    const navClose = document.querySelector('.nav-close');
    const magneticElements = document.querySelectorAll('.magnetic');


    // Initialize custom cursor with elastic spring effect
    function initCursor() {
        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');

        if (!cursor || !cursorFollower) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;
        let followerX = mouseX;
        let followerY = mouseY;

        // Speed and physics variables
        let cursorSpeed = 0.3;
        let followerSpeed = 0.15;
        let springFactor = 0.08;

        // Track last cursor position for smoother movement
        let lastCursorX = cursorX;
        let lastCursorY = cursorY;

        // Update cursor position with animation frame
        function updateCursor() {
            // Smooth cursor movement with easing
            cursorX += (mouseX - cursorX) * cursorSpeed;
            cursorY += (mouseY - cursorY) * cursorSpeed;

            // Calculate follower movement with spring physics
            const dx = mouseX - followerX;
            const dy = mouseY - followerY;

            followerX += dx * springFactor;
            followerY += dy * springFactor;

            // Check for active states
            const isHovering = cursor.classList.contains('hover');
            const isClicking = cursor.classList.contains('click');
            const isMagneticHover = cursor.classList.contains('magnetic-hover');
            const isMagneticClick = cursor.classList.contains('magnetic-click');

            // Determine the appropriate transform based on state
            let cursorTransform = 'translate(-50%, -50%)';
            let followerTransform = 'translate(-50%, -50%)';

            if (isClicking) {
                cursorTransform += ' scale(0.8)';
                followerTransform += ' scale(0.8)';
            } else if (isHovering) {
                cursorTransform += ' scale(1.5)';
                followerTransform += ' scale(1.5)';
            }

            // Apply the calculated positions
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) ${cursorTransform}`;
            cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) ${followerTransform}`;

            // Save last position
            lastCursorX = cursorX;
            lastCursorY = cursorY;

            // Continue the animation loop
            requestAnimationFrame(updateCursor);
        }

        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Show cursor if it was hidden
            if (cursor.style.opacity !== '1') {
                cursor.style.opacity = '1';
                cursorFollower.style.opacity = '0.5';
            }
        }, { passive: true });

        // Handle click state
        document.addEventListener('mousedown', (e) => {
            // Only apply if not clicking on a magnetic element (handled separately)
            if (!e.target.closest('.magnetic')) {
                cursor.classList.add('click');
                cursorFollower.classList.add('click');
            }
        });

        document.addEventListener('mouseup', (e) => {
            // Only apply if not clicking on a magnetic element (handled separately)
            if (!e.target.closest('.magnetic')) {
                cursor.classList.remove('click');
                cursorFollower.classList.remove('click');
            }
        });

        // Handle hover states
        function setupHoverEffects() {
            const interactiveElements = document.querySelectorAll('a, button, .btn, .project-item, .tree-node, .dev-toggle-btn, input, select, textarea, .filter-toggle, .filter-close');

            interactiveElements.forEach(element => {
                // Skip magnetic elements as they're handled separately
                if (element.classList.contains('magnetic')) return;

                element.addEventListener('mouseenter', () => {
                    cursor.classList.add('hover');
                    cursorFollower.classList.add('hover');
                });

                element.addEventListener('mouseleave', () => {
                    cursor.classList.remove('hover');
                    cursorFollower.classList.remove('hover');
                });
            });
        }

        // Handle cursor visibility
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            cursorFollower.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            cursorFollower.style.opacity = '0.5';
        });

        // Start the animation loop
        updateCursor();

        // Initialize hover effects after DOM is fully loaded
        if (document.readyState === 'complete') {
            setupHoverEffects();
        } else {
            window.addEventListener('load', setupHoverEffects);
        }

        // Hide default cursor
        document.documentElement.style.cursor = 'none';
    }

    // Initialize scroll progress indicator
    function initScrollProgress() {
        if (!scrollProgress) return;

        const updateScrollProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.offsetHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;

            scrollProgress.style.width = `${scrollPercent}%`;

            // Add glow effect when scrolling fast
            if (Math.abs(lastScrollTop - scrollTop) > 50) {
                scrollProgress.classList.add('glow');

                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    scrollProgress.classList.remove('glow');
                }, 200);
            }
        };

        let lastScrollTop = 0;
        let scrollTimeout;

        window.addEventListener('scroll', () => {
            requestAnimationFrame(updateScrollProgress);
            lastScrollTop = window.scrollY;
        });
    }

    // Initialize parallax background elements
    function initParallaxBg() {
        if (bgElements.length === 0) return;

        const moveBackground = () => {
            const scrollTop = window.scrollY;

            bgElements.forEach(element => {
                const speed = element.getAttribute('data-speed') || 0.1;
                const scrollSpeed = element.getAttribute('data-scroll-speed') || 0.05;

                // Mouse movement parallax
                const x = (mouseX - window.innerWidth / 2) * speed;
                const y = (mouseY - window.innerHeight / 2) * speed;

                // Scroll parallax
                const scrollY = scrollTop * scrollSpeed;

                element.style.transform = `translate(${x}px, ${y + scrollY}px)`;
            });
        };

        let mouseX = 0;
        let mouseY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            requestAnimationFrame(moveBackground);
        });

        window.addEventListener('scroll', () => {
            requestAnimationFrame(moveBackground);
        });
    }

    // Initialize project image hover effect
    function initProjectHover() {
        if (!projectItems.length || !imageHover) return;

        projectItems.forEach(item => {
            const image = item.getAttribute('data-image');

            if (!image) return;

            item.addEventListener('mouseenter', () => {
                // Set image source
                const img = imageHover.querySelector('img');
                img.src = image;

                // Show image hover
                imageHover.classList.add('visible');

                // Move image with cursor
                const moveImage = (e) => {
                    imageHover.style.left = `${e.clientX}px`;
                    imageHover.style.top = `${e.clientY}px`;
                };

                window.addEventListener('mousemove', moveImage);

                // Store the event listener for removal
                item.moveImageListener = moveImage;
            });

            item.addEventListener('mouseleave', () => {
                // Hide image hover
                imageHover.classList.remove('visible');

                // Remove event listener
                if (item.moveImageListener) {
                    window.removeEventListener('mousemove', item.moveImageListener);
                }
            });
        });
    }

    // Initialize staggered animations
    function initStaggeredAnimations() {
        if (!staggeredItems.length) return;

        const staggeredLists = document.querySelectorAll('.staggered-list');

        staggeredLists.forEach(list => {
            const items = list.querySelectorAll('.staggered-item');

            const observer = new IntersectionObserver((entries) => {
                let delay = 0;

                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, delay);

                        delay += 100;

                        // Unobserve after animation
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            items.forEach(item => {
                observer.observe(item);
            });
        });
    }

    // Initialize reveal animations
    function initRevealAnimations() {
        if (!revealElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // Unobserve after revealing
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Initialize horizontal scroll section
    function initHorizontalScroll() {
        if (!horizontalSection || !horizontalContent) return;

        // Add a class to indicate horizontal scrolling is enabled
        horizontalSection.classList.add('horizontal-scroll-enabled');

        // Initial scroll position
        let lastScrollY = window.scrollY;
        let ticking = false;
        let animationFrameId;
        let isSmallScreen = window.innerWidth <= 768;

        const scrollHorizontal = () => {
            // Skip on mobile devices where we use vertical scrolling instead
            if (isSmallScreen) {
                horizontalContent.style.transform = 'none';
                return;
            }

            const sectionRect = horizontalSection.getBoundingClientRect();

            // Check if section is in view
            if (sectionRect.top < window.innerHeight && sectionRect.bottom > 0) {
                // Mark as in viewport for styling
                horizontalSection.classList.add('in-viewport');

                // Calculate scroll progress (0 to 1) with more reliable formula
                // This ensures smoother animation throughout the entire scroll range
                const viewportHeight = window.innerHeight;
                const scrollStart = sectionRect.top - viewportHeight;
                const scrollDistance = sectionRect.height + viewportHeight;
                const scrolled = Math.abs(scrollStart);
                const progress = Math.max(0, Math.min(1, scrolled / scrollDistance));

                // Calculate translation with proper width measurement
                // This accounts for the actual content width vs. viewport width
                const contentWidth = horizontalContent.scrollWidth || horizontalContent.offsetWidth;
                const containerWidth = window.innerWidth;
                const maxTranslate = Math.max(0, contentWidth - containerWidth);
                const translateX = progress * maxTranslate;

                // Use hardware acceleration and minimal transition for smoother performance
                horizontalContent.style.transform = `translate3d(-${translateX}px, 0, 0)`;
                horizontalContent.style.transition = ticking ? 'transform 0.05s ease-out' : 'none';

                // Add active class when in viewport for additional styling
                horizontalSection.classList.add('in-viewport');
            } else {
                horizontalSection.classList.remove('in-viewport');
            }

            ticking = false;
        };

        // Handle scroll event with requestAnimationFrame for performance
        window.addEventListener('scroll', () => {
            lastScrollY = window.scrollY;

            if (!ticking) {
                // Use requestAnimationFrame to limit frequency of updates
                animationFrameId = requestAnimationFrame(scrollHorizontal);
                ticking = true;
            }
        });

        // Handle resize events to ensure correct calculations
        window.addEventListener('resize', () => {
            // Cancel any pending animation frame
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }

            // Update small screen flag
            isSmallScreen = window.innerWidth <= 768;

            // Reset transform on small screens
            if (isSmallScreen) {
                horizontalContent.style.transform = 'none';
                horizontalContent.style.transition = 'none';
            } else {
                // Recalculate immediately on resize for larger screens
                scrollHorizontal();
            }
        });

        // Call immediately
        scrollHorizontal();
    }

    // Initialize mobile menu functionality
    function initMobileMenu() {
        if (!mobileMenuBtn || !nav) return;

        function openMenu() {
            mobileMenuBtn.classList.add('active');
            document.body.classList.add('menu-open');
            nav.classList.add('active');
            nav.setAttribute('aria-hidden', 'false');

            // Add animation delay to menu items
            const menuItems = nav.querySelectorAll('li');
            menuItems.forEach((item, index) => {
                item.style.transitionDelay = `${0.1 + index * 0.05}s`;
            });
        }

        function closeMenu() {
            mobileMenuBtn.classList.remove('active');
            document.body.classList.remove('menu-open');
            nav.classList.remove('active');
            nav.setAttribute('aria-hidden', 'true');

            // Remove animation delay
            const menuItems = nav.querySelectorAll('li');
            menuItems.forEach(item => {
                item.style.transitionDelay = '0s';
            });
        }

        // Toggle menu on button click
        mobileMenuBtn.addEventListener('click', () => {
            if (nav.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }

            // Add click pulse effect to cursor
            if (cursor) {
                cursor.classList.add('pulse');
                setTimeout(() => cursor.classList.remove('pulse'), 500);
            }
        });

        // Close menu on navigation item click
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when clicking the close button
        if (navClose) {
            navClose.addEventListener('click', closeMenu);
        }

        // Close menu when clicking the overlay
        if (menuOverlay) {
            menuOverlay.addEventListener('click', closeMenu);
        }

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // Initialize text mask reveal animations
    function initTextMaskReveal() {
        const textMasks = document.querySelectorAll('.text-mask');

        if (!textMasks.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');

                    // Unobserve after revealing
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        textMasks.forEach(mask => {
            observer.observe(mask);
        });
    }

    // Initialize fade-up animations
    function initFadeUpAnimations() {
        const fadeElements = document.querySelectorAll('.fade-up');

        if (!fadeElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Initialize all animations for the page
    function initAnimations() {
        // Custom cursor
        initCursor();

        // Scroll progress indicator
        initScrollProgress();

        // Background parallax
        initParallaxBg();

        // Project hover effect
        initProjectHover();

        // Staggered animations
        initStaggeredAnimations();

        // Text reveal animations
        initRevealAnimations();

        // Horizontal scroll
        initHorizontalScroll();

        // Mobile menu
        initMobileMenu();

        // Text mask reveal
        initTextMaskReveal();

        // Fade up animations
        initFadeUpAnimations();

        // Initialize notifications
        initNotifications();

        // Add page loaded class after initial animations
        setTimeout(() => {
            document.body.classList.add('page-loaded');

            // Show welcome notification after page is loaded
            showNotification('Welcome to Vrindopnishad', 'success', {
                appName: 'Vrindopnishad',
                duration: 5000
            });
        }, 2000);
    }

    // Initialize all animations when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Initializing animations and cursor effects...');
        initCursor();
    });
}

// Export functions for potential use in other scripts
// export {
//     initCursor,
//     initScrollProgress,
//     initParallaxBg,
//     initProjectHover,
//     initStaggeredAnimations,
//     initRevealAnimations,
//     initHorizontalScroll,
//     initMobileMenu,
//     initTextMaskReveal,
//     initFadeUpAnimations,
//     initAnimations
// };

/**
 * Notifications System
 * Adapted from modern-notifications.js
 */
function initNotifications() {
    // Create notifications container if it doesn't exist
    let notifications = document.getElementById('notifications');
    if (!notifications) {
        notifications = document.createElement('div');
        notifications.id = 'notifications';
        notifications.className = 'notifications';
        document.body.appendChild(notifications);
    }
}

// Play notification sound based on type
function playNotificationSound(type) {
    // Create audio context only when needed to comply with autoplay policies
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    try {
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        // Configure sound based on notification type
        switch (type) {
            case 'success':
                // Success: Pleasant high-pitched ding
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1200, context.currentTime); // Higher frequency
                oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
                break;
            case 'error':
                // Error: Two-tone alert sound
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(400, context.currentTime);
                oscillator.frequency.setValueAtTime(350, context.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
                break;
            default: // info
                // Info: Soft ping sound
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, context.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        }

        // Connect the nodes and start
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start(context.currentTime);

        // Stop the sound after duration
        oscillator.stop(context.currentTime + 0.3);

        // Add vibration for mobile devices
        if (window.navigator && window.navigator.vibrate) {
            try {
                window.navigator.vibrate(50);
            } catch (e) {
                // Silently fail if vibration API not supported
            }
        }
    } catch (e) {
        console.log('Audio notification error:', e);
        // Fallback to basic Audio API
        try {
            const audio = new Audio();
            switch (type) {
                case 'success':
                    audio.src = './sounds/success.mp3';
                    break;
                case 'error':
                    audio.src = './sounds/error.mp3';
                    break;
                default:
                    audio.src = './sounds/info.mp3';
            }
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio playback failed:', e));
        } catch (e) {
            console.log('Fallback audio failed:', e);
        }
    }
}

/**
 * Shows a notification with the specified message and type
 * @param {string} message - The message to display
 * @param {string} type - The type of notification: 'success', 'error', or 'info'
 * @param {Object} options - Additional options
 */
function showNotification(message, type = 'info', options = {}) {
    options = options || {};

    // Get or create notifications container
    let notifications = document.getElementById('notifications');

    if (!notifications) {
        // Create notifications container if it doesn't exist
        notifications = document.createElement('div');
        notifications.id = 'notifications';
        notifications.className = 'notifications';
        document.body.appendChild(notifications);
    }

    // Play notification sound
    playNotificationSound(type);

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Get current time
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${hours >= 12 ? 'PM' : 'AM'}`;

    // Use default or custom app name and icon
    let appName = options.appName || '';
    let icon = options.icon || '';

    if (!appName || !icon) {
        if (type === 'success') {
            appName = options.appName || 'Success';
            icon = options.icon || '<i class="fas fa-check"></i>';
        } else if (type === 'error') {
            appName = options.appName || 'Alert';
            icon = options.icon || '<i class="fas fa-exclamation"></i>';
        } else {
            appName = options.appName || 'Info';
            icon = options.icon || '<i class="fas fa-info"></i>';
        }
    }

    // Create notification header
    const header = document.createElement('div');
    header.className = 'notification-header';
    header.innerHTML = `
        <div class="notification-app-icon">${icon}</div>
        <div class="notification-app-name">${appName}</div>
        <div class="notification-time">${formattedTime}</div>
    `;

    // Create notification content
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.innerHTML = `<span>${message}</span>`;

    // Add close button to notification
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.addEventListener('click', () => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });

    notification.appendChild(header);
    notification.appendChild(content);
    notification.appendChild(closeBtn);
    notifications.appendChild(notification);

    // Mobile device haptic feedback (if available)
    if (window.navigator && window.navigator.vibrate) {
        try {
            window.navigator.vibrate(50);
        } catch (e) {
            // Silently fail if vibration API not supported
        }
    }

    // Get custom duration or use default
    const duration = options.duration || 3000;

    // Auto remove after delay
    const timeoutId = setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);

    // If user hovers, pause the auto-removal
    notification.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
    });

    // Resume auto-removal on mouse leave
    notification.addEventListener('mouseleave', () => {
        const newTimeoutId = setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 1500);

        // Store the new timeout ID
        notification.dataset.timeoutId = newTimeoutId;
    });

    return notification;
} 
