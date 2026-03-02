/**
 * Button Fixes for Vrindopnishad Website
 * This file fixes all button functionality across the site
 */

document.addEventListener('DOMContentLoaded', () => {
    // Fix 1: Menu button functionality
    fixMenuButtonFunctionality();
    
    // Fix 2: Tool items click area
    fixToolItemsClickArea();
    
    // Fix 3: Language buttons
    fixLanguageButtons();
    
    // Fix 4: Contact form submission
    fixContactFormSubmission();
    
    // Fix 5: Newsletter form submission
    fixNewsletterFormSubmission();
    
    // Fix 6: Magnetic buttons effect
    fixMagneticButtons();
    
    // Fix 7: Navigation menu links
    fixNavigationLinks();
    
    console.log('Button fixes applied successfully');
});

/**
 * Fix the menu button to properly open/close navigation menu
 */
function fixMenuButtonFunctionality() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    const navClose = document.querySelector('.nav-close');
    const menuOverlay = document.querySelector('.menu-overlay');
    const toolsMenu = document.querySelector('.tools-menu');
    const toolsMenuClose = document.querySelector('.tools-menu-close');
    
    if (!mobileMenuBtn || !toolsMenu) return;
    
    let menuState = 'closed';
    
    // Toggle menu function
    function toggleMenu(state) {
        // Close everything first
        nav.classList.remove('active');
        toolsMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        mobileMenuBtn.classList.remove('active');
        
        if (menuOverlay) {
            menuOverlay.style.opacity = '0';
            setTimeout(() => {
                menuOverlay.style.display = 'none';
            }, 400);
        }
        
        menuState = 'closed';
        
        // Now open the requested menu if not closed
        if (state === 'nav') {
            // Handle showing navigation menu
            menuOverlay.style.display = 'block';
            
            // Use setTimeout to ensure CSS transitions work properly
            setTimeout(() => {
                nav.classList.add('active');
                document.body.classList.add('menu-open');
                mobileMenuBtn.classList.add('active');
                menuOverlay.style.opacity = '1';
            }, 10);
            
            menuState = 'nav';
        } else if (state === 'tools') {
            // Handle showing tools menu
            menuOverlay.style.display = 'block';
            
            // Use setTimeout to ensure CSS transitions work properly
            setTimeout(() => {
                toolsMenu.classList.add('active');
                document.body.classList.add('menu-open');
                mobileMenuBtn.classList.add('active');
                menuOverlay.style.opacity = '1';
                
                // Initialize tool item effects when menu is opened
                if (typeof initToolItemEffects === 'function') {
                    initToolItemEffects();
                }
            }, 10);
            
            menuState = 'tools';
        }
    }

    // Mobile menu button click - now always opens tools menu
    mobileMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle between closed and tools menu
        if (menuState === 'closed') {
            toggleMenu('tools');
        } else {
            toggleMenu('closed');
        }
    });
    
    // Close nav when close button is clicked
    if (navClose) {
        navClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu('closed');
        });
    }
    
    // Close tools when close button is clicked
    if (toolsMenuClose) {
        toolsMenuClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu('closed');
        });
    }
    
    // Close menu when overlay is clicked
    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => toggleMenu('closed'));
    }
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleMenu('closed');
        }
    });
}

/**
 * Fix tool items to be properly clickable
 */
function fixToolItemsClickArea() {
    const toolItems = document.querySelectorAll('.tool-item');
    
    if (!toolItems.length) return;
    
    toolItems.forEach(item => {
        const link = item.querySelector('.tool-link');
        if (!link) return;
        
        // Make entire tool item clickable
        item.addEventListener('click', (e) => {
            // Only trigger if the click wasn't directly on the link
            if (e.target !== link) {
                e.preventDefault();
                // Get the URL from the link and navigate to it
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    window.location.href = href;
                }
            }
        });
        
        // Fix hover effects
        item.addEventListener('mouseenter', () => {
            const toolIcon = item.querySelector('.tool-icon');
            const toolInfo = item.querySelector('.tool-info');
            
            if (toolIcon) {
                toolIcon.style.transform = 'scale(1.1)';
                toolIcon.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }
            
            if (toolInfo) {
                toolInfo.style.transform = 'translateY(-5px)';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            const toolIcon = item.querySelector('.tool-icon');
            const toolInfo = item.querySelector('.tool-info');
            
            if (toolIcon) {
                toolIcon.style.transform = '';
                toolIcon.style.backgroundColor = '';
            }
            
            if (toolInfo) {
                toolInfo.style.transform = '';
            }
        });
        
        // Highlight active page
        if (link.getAttribute('href') === window.location.pathname.split('/').pop()) {
            item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            item.style.borderLeft = '3px solid #D4AF37';
        }
    });
}

/**
 * Fix language button functionality
 */
function fixLanguageButtons() {
    const languageBtns = document.querySelectorAll('.language-btn-tools, .language-btn-nav');
    
    if (!languageBtns.length) return;
    
    languageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.parentElement;
            const activeBtn = parent.querySelector('.active');
            
            if (activeBtn) {
                activeBtn.classList.remove('active');
            }
            
            btn.classList.add('active');
            
            // Store language preference
            const lang = btn.getAttribute('data-lang');
            if (lang) {
                localStorage.setItem('preferredLanguage', lang);
                console.log(`Language set to: ${lang}`);
                
                // You can add additional language switching logic here
                // This is a placeholder for actual language switching
                document.documentElement.setAttribute('lang', lang);
            }
        });
    });
    
    // Set initial language based on saved preference
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    document.querySelectorAll(`[data-lang="${savedLang}"]`).forEach(btn => {
        const parent = btn.parentElement;
        const activeBtn = parent.querySelector('.active');
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active');
    });
}

/**
 * Fix contact form submission
 */
function fixContactFormSubmission() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('name')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const message = document.getElementById('message')?.value || '';
        
        // Simple validation
        if (!name || !email || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Email validation
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission
        contactForm.classList.add('submitting');
        setTimeout(() => {
            contactForm.classList.remove('submitting');
            showNotification(`Thank you ${name}! Your message has been sent.`, 'success');
            contactForm.reset();
        }, 1000);
    });
}

/**
 * Fix newsletter form submission
 */
function fixNewsletterFormSubmission() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get email
        const email = document.getElementById('newsletter-email')?.value || '';
        
        // Simple validation
        if (!email) {
            showNotification('Please enter your email address', 'error');
            return;
        }
        
        // Email validation
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate subscription
        newsletterForm.classList.add('submitting');
        setTimeout(() => {
            newsletterForm.classList.remove('submitting');
            showNotification('Thank you for subscribing to our newsletter!', 'success');
            newsletterForm.reset();
        }, 1000);
    });
}

/**
 * Fix all magnetic buttons
 */
function fixMagneticButtons() {
    const magneticElements = document.querySelectorAll('.magnetic');
    
    if (!magneticElements.length) return;
    
    magneticElements.forEach(element => {
        // Add event listeners
        element.addEventListener('mouseenter', () => {
            // Reset any existing transition
            element.style.transition = '';
            initMagneticEffect(element);
        });
        
        element.addEventListener('mouseleave', () => {
            resetMagneticEffect(element);
        });
        
        // Add glow effect
        const glowStrength = element.classList.contains('btn') ? '10px' : '5px';
        element.addEventListener('mouseenter', () => {
            element.style.boxShadow = `0 0 ${glowStrength} rgba(255, 255, 255, 0.5)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.boxShadow = '';
        });
        
        // Add click effect
        element.addEventListener('mousedown', () => {
            element.classList.add('active');
            element.style.transform = 'scale(0.95)';
        });
        
        element.addEventListener('mouseup', () => {
            setTimeout(() => {
                element.classList.remove('active');
            }, 300);
            element.style.transform = '';
        });
    });
}

/**
 * Initialize magnetic effect for an element
 */
function initMagneticEffect(element) {
    const strength = 0.15; // Subtle effect
    
    const onMouseMove = (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Add subtle rotation for 3D feel
        const rotateX = y * -0.05;
        const rotateY = x * 0.05;
        
        // Use transform3d for better performance with subtle movement
        element.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    
    element.addEventListener('mousemove', onMouseMove, { passive: true });
    
    // Store the event handler for proper removal
    element._magneticHandler = onMouseMove;
}

/**
 * Reset magnetic effect
 */
function resetMagneticEffect(element) {
    if (element._magneticHandler) {
        element.removeEventListener('mousemove', element._magneticHandler);
    }
    // Smooth transition back to original position
    element.style.transition = 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)';
    element.style.transform = '';
    
    // Remove transition after reset to make next hover smooth
    setTimeout(() => {
        element.style.transition = '';
    }, 500);
}

/**
 * Fix navigation links in the main nav
 */
function fixNavigationLinks() {
    const navLinks = document.querySelectorAll('nav a');
    
    if (!navLinks.length) return;
    
    navLinks.forEach(link => {
        // Highlight active page
        if (link.getAttribute('href') === window.location.pathname.split('/').pop()) {
            link.classList.add('active');
        }
        
        // Fix click behavior
        link.addEventListener('click', (e) => {
            // If it's an anchor link, handle smooth scrolling
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                    
                    // Close menu after clicking
                    const nav = document.querySelector('nav');
                    if (nav && nav.classList.contains('active')) {
                        nav.classList.remove('active');
                        document.body.classList.remove('menu-open');
                        
                        const menuOverlay = document.querySelector('.menu-overlay');
                        if (menuOverlay) {
                            menuOverlay.style.opacity = '0';
                            setTimeout(() => {
                                menuOverlay.style.display = 'none';
                            }, 400);
                        }
                    }
                }
            }
        });
    });
}

/**
 * Utility function to show notifications
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Append to body
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }, 10);
}

/**
 * Utility function to validate email
 */
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Inject the notification styles
(function() {
    const style = document.createElement('style');
    style.textContent = notificationStyles;
    document.head.appendChild(style);
})(); 