// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    // Initialize animations
    // initializeAnimations();

    // Initialize filter functionality
    // initializeFilters();

    // Initialize lightbox
    // initializeLightbox();


    // Initialize search functionality
    // initializeSearch();

    // Initialize download functionality
    // initializeDownload();

    // Initialize tools menu
    // initializeToolsMenu();

    // Initialize magnetic effects
    // initializeMagneticEffect();
});

// Animation functions
function initializeAnimations() {
    const imageCards = document.querySelectorAll('.image-card');

    imageCards.forEach((card) => {
        gsap.fromTo(card, {
            opacity: 0,
            y: 50,
            rotateX: 10,
        }, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
                trigger: card,
                start: "top bottom-=100",
                end: "top center",
                toggleActions: "play none none none",
                markers: false,
                scrub: 0.5,
            }
        });
    });
}

// Filter functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const imageCards = document.querySelectorAll('.image-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Get filter value
            const filterValue = button.getAttribute('data-filter');

            // Filter images
            imageCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });

            // Refresh ScrollTrigger
            ScrollTrigger.refresh();
        });
    });
}

// Lightbox functionality
function initializeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    const lightboxContent = document.querySelector('.lightbox-content');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const viewBtns = document.querySelectorAll('.view-btn');

    // Add download button to lightbox content (not directly to body)
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'lightbox-download-btn';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
    downloadBtn.title = 'Download image';
    lightboxContent.appendChild(downloadBtn);

    let currentIndex = 0;
    const images = document.querySelectorAll('.image-card img');

    // Open lightbox when view button is clicked
    viewBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            openLightbox(index);
        });
    });

    // Open lightbox function
    function openLightbox(index) {
        currentIndex = index;
        const imgSrc = images[index].getAttribute('src');
        const imgAlt = images[index].getAttribute('alt');

        lightboxImg.setAttribute('src', imgSrc);
        lightboxCaption.textContent = imgAlt;

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Initialize magnetic effect after lightbox is opened
        setTimeout(() => {
            addMagneticEffectToLightboxButtons();
        }, 300);
    }

    // Download image from lightbox
    downloadBtn.addEventListener('click', () => {
        const imgSrc = lightboxImg.getAttribute('src');
        const imgAlt = lightboxCaption.textContent.replace(/\s+/g, '_').toLowerCase() || 'image';

        // Handle the download using the download helper function
        downloadImage(imgSrc, imgAlt);

        // Add animation to the button
        gsap.from(downloadBtn, {
            rotate: 360,
            scale: 0.5,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
    });

    // Close lightbox
    closeLightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    // Click outside to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Next image
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        const imgSrc = images[currentIndex].getAttribute('src');
        const imgAlt = images[currentIndex].getAttribute('alt');

        // Add transition effect
        gsap.to(lightboxImg, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                lightboxImg.setAttribute('src', imgSrc);
                lightboxCaption.textContent = imgAlt;
                gsap.to(lightboxImg, {
                    opacity: 1,
                    duration: 0.2
                });
            }
        });
    });

    // Previous image
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        const imgSrc = images[currentIndex].getAttribute('src');
        const imgAlt = images[currentIndex].getAttribute('alt');

        // Add transition effect
        gsap.to(lightboxImg, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                lightboxImg.setAttribute('src', imgSrc);
                lightboxCaption.textContent = imgAlt;
                gsap.to(lightboxImg, {
                    opacity: 1,
                    duration: 0.2
                });
            }
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'ArrowRight') {
            nextBtn.click();
        } else if (e.key === 'ArrowLeft') {
            prevBtn.click();
        } else if (e.key === 'Escape') {
            closeLightbox.click();
        }
    });
}


// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const imageCards = document.querySelectorAll('.image-card');

    searchInput.addEventListener('input', () => {
        const searchValue = searchInput.value.toLowerCase();

        imageCards.forEach(card => {
            const imgAlt = card.querySelector('img').getAttribute('alt').toLowerCase();

            if (imgAlt.includes(searchValue)) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // Refresh ScrollTrigger
        ScrollTrigger.refresh();
    });
}

// Download functionality
function initializeDownload() {
    const downloadButtons = document.querySelectorAll('.download-btn');

    downloadButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Get the parent image card
            const imageCard = this.closest('.image-card');
            // Get the image source
            const imgSrc = imageCard.querySelector('img').src;
            // Get image alt text to use as filename
            const imgAlt = imageCard.querySelector('img').alt.replace(/\s+/g, '_').toLowerCase() || 'image';

            // Use the download helper function
            downloadImage(imgSrc, imgAlt);

            // Add animation to the button
            gsap.from(this, {
                rotate: 360,
                scale: 0.5,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
        });
    });
}

// Helper function to download images
function downloadImage(imgSrc, fileName) {
    // Create notification
    showNotification('Downloading image...', 'info');

    // For testing purposes, we'll check if manual download is needed
    const isAllowedURL = checkAllowedURL(imgSrc);

    if (!isAllowedURL) {
        // Images from these domains need special handling
        showNotification('Opening direct download link...', 'info');
        window.open(imgSrc, '_blank');
        return;
    }

    // First try the direct approach which works in most cases for modern browsers
    directDownload(imgSrc, fileName);
}

// Check if URL is from a domain that allows CORS
function checkAllowedURL(url) {
    try {
        const hostname = new URL(url).hostname;
        // Some image services don't allow CORS, so we'll just open them in a new tab
        const disallowedDomains = [
            'alphacoders.com',
            'images.alphacoders.com',
            'images2.alphacoders.com',
            'images3.alphacoders.com',
            'images4.alphacoders.com',
            'images5.alphacoders.com',
            'images6.alphacoders.com',
            'images7.alphacoders.com',
            'images8.alphacoders.com',
            'freepik.com',
            'img.freepik.com'
        ];

        return !disallowedDomains.some(domain => hostname.includes(domain));
    } catch (e) {
        console.error('Error checking URL:', e);
        return true; // Default to trying
    }
}

function directDownload(imgSrc, fileName) {
    // Create a temporary image element
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous'; // Try to request CORS access

    tempImg.onload = function () {
        try {
            // Create canvas and draw image
            const canvas = document.createElement('canvas');
            canvas.width = tempImg.width;
            canvas.height = tempImg.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(tempImg, 0, 0);

            // Try to get data URL
            const dataURL = canvas.toDataURL('image/png');

            // Check if we got a valid data URL (if not, it means CORS issues)
            if (dataURL.indexOf('data:image/png') === 0) {
                // Create download link with data URL
                const downloadLink = document.createElement('a');
                downloadLink.href = dataURL;
                downloadLink.download = `${fileName}_${Date.now()}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                showNotification('Download successful!', 'success');
            } else {
                throw new Error('Failed to get data URL - CORS issue');
            }
        } catch (error) {
            console.error('Canvas data URL error:', error);
            // Try proxy method
            proxyDownload(imgSrc, fileName);
        }
    };

    tempImg.onerror = function () {
        console.error('Failed to load image directly');
        // Try proxy method
        proxyDownload(imgSrc, fileName);
    };

    // Set source and attempt to load image
    tempImg.src = imgSrc;

    // If the image is already cached this might not trigger onload
    if (tempImg.complete || tempImg.complete === undefined) {
        tempImg.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        tempImg.src = imgSrc;
    }
}

function proxyDownload(imgSrc, fileName) {
    // Use a CORS proxy to bypass cross-origin restrictions
    const corsProxyUrl = 'https://api.allorigins.win/raw?url=';
    const proxyImgSrc = corsProxyUrl + encodeURIComponent(imgSrc);

    // Create a temporary image element to download via canvas
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';

    tempImg.onload = function () {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = tempImg.width;
        canvas.height = tempImg.height;

        // Draw image on canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(tempImg, 0, 0);

        // Convert to data URL and download
        try {
            canvas.toBlob(function (blob) {
                if (blob) {
                    // Create object URL from blob
                    const blobUrl = URL.createObjectURL(blob);

                    // Create download link
                    const downloadLink = document.createElement('a');
                    downloadLink.href = blobUrl;
                    downloadLink.download = `${fileName}_${Date.now()}.png`;
                    document.body.appendChild(downloadLink);

                    // Trigger download
                    downloadLink.click();

                    // Clean up
                    setTimeout(() => {
                        URL.revokeObjectURL(blobUrl);
                        document.body.removeChild(downloadLink);
                    }, 100);

                    showNotification('Download successful!', 'success');
                } else {
                    throw new Error('Failed to create blob');
                }
            }, 'image/png');
        } catch (error) {
            console.error('Canvas download error:', error);
            blobDownload(imgSrc, fileName);
        }
    };

    tempImg.onerror = function () {
        console.error('Failed to load image with CORS proxy');
        blobDownload(imgSrc, fileName);
    };

    // Set source with proxy
    try {
        tempImg.src = proxyImgSrc;
    } catch (error) {
        console.error('Error setting proxy source:', error);
        blobDownload(imgSrc, fileName);
    }
}

function blobDownload(imgSrc, fileName) {
    // Try using fetch with proper CORS headers
    fetch(imgSrc, {
        mode: 'cors',
        headers: {
            'Origin': window.location.origin
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = `${fileName}_${Date.now()}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
                document.body.removeChild(downloadLink);
            }, 100);

            showNotification('Download successful!', 'success');
        })
        .catch(error => {
            console.error('Blob download error:', error);
            fallbackDownload(imgSrc, fileName);
        });
}

function fallbackDownload(imgSrc, fileName) {
    // Try image service proxy as last resort
    const imageServiceProxy = 'https://images.weserv.nl/?url=';

    // Encode the image URL for the proxy
    const encodedImgUrl = encodeURIComponent(imgSrc);
    const proxyUrl = imageServiceProxy + encodedImgUrl;

    // Create a fallback download link
    const downloadLink = document.createElement('a');
    downloadLink.href = proxyUrl;
    downloadLink.download = `${fileName}_${Date.now()}.png`;
    downloadLink.target = '_blank'; // Open in new tab as fallback
    document.body.appendChild(downloadLink);

    // Click to download or open
    downloadLink.click();

    // Clean up
    setTimeout(() => {
        document.body.removeChild(downloadLink);
    }, 100);

    showNotification('Opening image in new tab. Please save manually.', 'info');
}

// Notification function
function showNotification(message, type = 'info', duration = 3000) {
    // Check if notification container exists, if not create it
    let notificationContainer = document.querySelector('.notification-container');

    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    // Define notification title and icon based on type
    let title = 'Information';
    let icon = 'fa-info-circle';

    switch (type) {
        case 'success':
            title = 'Success';
            icon = 'fa-check-circle';
            break;
        case 'error':
            title = 'Error';
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            title = 'Warning';
            icon = 'fa-exclamation-triangle';
            break;
        default:
            title = 'Information';
            icon = 'fa-info-circle';
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Create icon element
    const iconElement = document.createElement('div');
    iconElement.className = 'notification-icon';
    iconElement.innerHTML = `<i class="fas ${icon}"></i>`;

    // Create content container
    const contentElement = document.createElement('div');
    contentElement.className = 'notification-content';

    // Create title element
    const titleElement = document.createElement('div');
    titleElement.className = 'notification-title';
    titleElement.textContent = title;

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;

    // Assemble notification
    contentElement.appendChild(titleElement);
    contentElement.appendChild(messageElement);
    notification.appendChild(iconElement);
    notification.appendChild(contentElement);

    // Add glow effect if it's success or error
    if (type === 'success' || type === 'error') {
        notification.classList.add('glow');
    }

    // Add star animation for cosmic effect (random number of stars)
    addCosmicStars(notification);

    // Add to container
    notificationContainer.appendChild(notification);

    // Sound effect for notifications
    playNotificationSound(type);

    // Auto remove after duration
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 600);
    }, duration);
}

// Add cosmic stars to the notification
function addCosmicStars(notification) {
    // Create between 2-4 stars
    const starCount = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');

        // Random position
        const left = Math.random() * 90 + 5; // 5-95%
        const top = Math.random() * 90 + 5; // 5-95%

        // Random size
        const size = Math.random() * 3 + 1; // 1-4px

        // Random animation duration
        const duration = Math.random() * 2 + 2; // 2-4s

        // Style the star
        star.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: ${top}%;
            width: ${size}px;
            height: ${size}px;
            background-color: white;
            border-radius: 50%;
            opacity: 0;
            box-shadow: 0 0 ${size * 2}px ${size}px rgba(255, 255, 255, 0.7);
            animation: twinkle ${duration}s infinite alternate ease-in-out;
            z-index: 1;
        `;

        // Add the star to the notification
        notification.appendChild(star);
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

        // Configure sound based on notification type - space themed
        switch (type) {
            case 'success':
                // Success: Higher pitched bell-like sound
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(660, context.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
                break;
            case 'error':
                // Error: Low sci-fi alert
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(300, context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(150, context.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.2, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
                break;
            case 'warning':
                // Warning: Computer alert sound
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(440, context.currentTime);
                oscillator.frequency.setValueAtTime(220, context.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(440, context.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
                break;
            default: // info
                // Info: Soft cosmic ping
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(520, context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(480, context.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.15, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        }

        // Connect the nodes and start
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start();

        // Stop the sound after duration
        oscillator.stop(context.currentTime + 0.7);
    } catch (e) {
        console.log('Audio notification error:', e);
        // Silently fail if browser doesn't support audio
    }
}

// Tools Menu functionality
function initializeToolsMenu() {
    const toolsIcon = document.querySelector('.tools-icon');
    const toolsMenu = document.querySelector('.tools-menu');
    const toolsMenuClose = document.querySelector('.tools-menu-close');
    const toolItems = document.querySelectorAll('.tool-item');

    if (!toolsIcon || !toolsMenu || !toolsMenuClose) return;

    // Open tools menu
    toolsIcon.addEventListener('click', () => {
        // Add animation to icon before opening menu
        toolsIcon.classList.add('pulse-animation');

        // Rotate icon when clicked
        toolsIcon.style.transform = 'rotate(90deg) scale(1.8)';

        // Delay opening the menu slightly for better UX
        setTimeout(() => {
            toolsMenu.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }, 200);
    });

    // Close tools menu
    toolsMenuClose.addEventListener('click', () => {
        toolsMenu.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling

        // Remove pulse animation and reset rotation
        setTimeout(() => {
            toolsIcon.classList.remove('pulse-animation');
            toolsIcon.style.transform = '';
        }, 300);
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toolsMenu.classList.contains('active')) {
            toolsMenu.classList.remove('active');
            document.body.style.overflow = '';

            setTimeout(() => {
                toolsIcon.classList.remove('pulse-animation');
                toolsIcon.style.transform = '';
            }, 300);
        }
    });

    // Add hover rotation effect
    toolsIcon.addEventListener('mouseenter', () => {
        if (!toolsMenu.classList.contains('active')) {
            gsap.to(toolsIcon, {
                rotation: 300,
                scale: 1.15,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    });

    toolsIcon.addEventListener('mouseleave', () => {
        if (!toolsMenu.classList.contains('active')) {
            gsap.to(toolsIcon, {
                rotation: -300,
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    });

    // Handle tool item hover effects
    toolItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const bgColor = item.getAttribute('data-bg-color');
            const textColor = item.getAttribute('data-text-color');

            if (bgColor && textColor) {
                item.style.backgroundColor = bgColor;
                item.style.color = textColor;

                // Change icon color
                const icon = item.querySelector('.tool-icon i');
                if (icon) {
                    icon.style.color = textColor;
                }

                // Apply styles to child elements
                const h3 = item.querySelector('h3');
                const p = item.querySelector('p');

                if (h3) h3.style.color = textColor;
                if (p) p.style.color = textColor;
            }
        });

        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = '';
            item.style.color = '';

            // Reset icon color
            const icon = item.querySelector('.tool-icon i');
            if (icon) {
                icon.style.color = '';
            }

            // Reset styles for child elements
            const h3 = item.querySelector('h3');
            const p = item.querySelector('p');

            if (h3) h3.style.color = '';
            if (p) p.style.color = '';
        });
    });
}

// Magnetic effect for all elements
function initializeMagneticEffect() {
    const magneticElements = document.querySelectorAll('.magnetic');

    magneticElements.forEach(elem => {
        // Get magnetic strength attribute
        const strength = parseFloat(elem.getAttribute('data-magnetic-strength')) || 0.3;

        // Modify strength based on element type for better UX
        let adjustedStrength = strength;
        if (elem.classList.contains('logo')) {
            adjustedStrength = strength * 0.3; // Reduce effect for logo
        } else if (elem.classList.contains('search-box')) {
            adjustedStrength = strength * 0.2; // Reduce effect for search box
        } else if (elem.classList.contains('filter-btn')) {
            adjustedStrength = strength * 0.5; // Medium effect for filter buttons
        } else if (elem.classList.contains('social-link')) {
            adjustedStrength = strength * 0.4; // Medium effect for social links
        }

        // Ensure icons are centered properly by checking and correcting the HTML structure
        const icons = elem.querySelectorAll('i');
        icons.forEach(icon => {
            // Make sure parent has position relative if it's not already set
            if (window.getComputedStyle(elem).position === 'static') {
                elem.style.position = 'relative';
            }

            // Ensure icon has flex alignment if not already set
            if (window.getComputedStyle(icon).display !== 'flex') {
                icon.style.display = 'flex';
                icon.style.alignItems = 'center';
                icon.style.justifyContent = 'center';
            }
        });

        // Disable hover effect entirely on mobile/touch devices
        if (window.matchMedia('(hover: none)').matches) {
            return;
        }

        elem.addEventListener('mousemove', (e) => {
            const rect = elem.getBoundingClientRect();
            const relX = e.clientX - rect.left - rect.width / 2;
            const relY = e.clientY - rect.top - rect.height / 2;

            // Limit movement to avoid excessive animation
            const maxMove = 10 * adjustedStrength;
            const limitedX = Math.max(Math.min(relX * adjustedStrength, maxMove), -maxMove);
            const limitedY = Math.max(Math.min(relY * adjustedStrength, maxMove), -maxMove);

            gsap.to(elem, {
                duration: 0.3,
                x: limitedX,
                y: limitedY,
                ease: 'power2.out'
            });

            // Add slight rotation based on mouse position
            if (!elem.classList.contains('tools-icon') &&
                !elem.classList.contains('logo') &&
                !elem.classList.contains('search-box')) {
                // Skip for elements that shouldn't rotate much
                const rotationStrength = adjustedStrength * 5;
                const maxRotation = 10 * adjustedStrength; // Limit max rotation
                const rotationX = Math.max(Math.min(relY * rotationStrength * -0.5, maxRotation), -maxRotation);
                const rotationY = Math.max(Math.min(relX * rotationStrength * 0.5, maxRotation), -maxRotation);

                gsap.to(elem, {
                    duration: 0.3,
                    rotationX: rotationX,
                    rotationY: rotationY,
                    ease: 'power2.out'
                });
            } else if (elem.classList.contains('logo')) {
                // Very subtle rotation for logo
                const rotationStrength = adjustedStrength * 2;
                const rotationY = Math.max(Math.min(relX * rotationStrength * 0.2, 5), -5);

                gsap.to(elem, {
                    duration: 0.3,
                    rotationY: rotationY,
                    ease: 'power2.out'
                });
            }
        });

        elem.addEventListener('mouseleave', () => {
            gsap.to(elem, {
                duration: 0.7,
                x: 0,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                ease: 'elastic.out(1, 0.3)'
            });
        });

        // Add magnetic effect to child elements for better visual separation
        // Only apply to specific elements that look good with this effect
        if (elem.classList.contains('action-btn') ||
            elem.classList.contains('theme-toggle') ||
            elem.classList.contains('tools-icon') ||
            elem.classList.contains('social-link')) {

            const children = elem.querySelectorAll('i, svg');
            if (children.length > 0) {
                elem.addEventListener('mousemove', (e) => {
                    const rect = elem.getBoundingClientRect();
                    const relX = e.clientX - rect.left - rect.width / 2;
                    const relY = e.clientY - rect.top - rect.height / 2;

                    // Limit movement for child elements too
                    const maxMove = 8 * adjustedStrength;
                    const limitedX = Math.max(Math.min(relX * adjustedStrength * 0.8, maxMove), -maxMove);
                    const limitedY = Math.max(Math.min(relY * adjustedStrength * 0.8, maxMove), -maxMove);

                    children.forEach(child => {
                        gsap.to(child, {
                            duration: 0.3,
                            x: limitedX,
                            y: limitedY,
                            ease: 'power2.out'
                        });
                    });
                });

                elem.addEventListener('mouseleave', () => {
                    children.forEach(child => {
                        gsap.to(child, {
                            duration: 0.7,
                            x: 0,
                            y: 0,
                            ease: 'elastic.out(1, 0.3)'
                        });
                    });
                });
            }
        }
    });

    // Fix any layout issues after magnetic effects have been applied
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    });
}

// Add magnetic effect to lightbox buttons
function addMagneticEffectToLightboxButtons() {
    const magneticElements = document.querySelectorAll('.lightbox-btn, .close-lightbox, .lightbox-download-btn');

    magneticElements.forEach(elem => {
        // Use different strength for different buttons
        let strength = 0.3;
        if (elem.classList.contains('close-lightbox')) {
            strength = 0.2;
        } else if (elem.classList.contains('lightbox-download-btn')) {
            strength = 0.25;
        }

        elem.addEventListener('mousemove', (e) => {
            const rect = elem.getBoundingClientRect();
            const relX = e.clientX - rect.left - rect.width / 2;
            const relY = e.clientY - rect.top - rect.height / 2;

            // Limit maximum movement
            const maxMove = 10;
            const limitedX = Math.max(Math.min(relX * strength, maxMove), -maxMove);
            const limitedY = Math.max(Math.min(relY * strength, maxMove), -maxMove);

            // Apply transform to button
            if (elem.classList.contains('lightbox-btn')) {
                // For prev/next buttons, maintain vertical centering
                gsap.to(elem, {
                    x: limitedX,
                    duration: 0.3,
                    ease: "power2.out"
                });
            } else {
                // For other buttons
                gsap.to(elem, {
                    x: limitedX,
                    y: limitedY,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }

            // Apply separate transform to icon for enhanced effect
            const icon = elem.querySelector('i');
            if (icon) {
                gsap.to(icon, {
                    x: limitedX * 1.2,
                    y: limitedY * 1.2,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });

        elem.addEventListener('mouseleave', () => {
            // Reset button position with elastic animation
            gsap.to(elem, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.3)"
            });

            // Reset icon position
            const icon = elem.querySelector('i');
            if (icon) {
                gsap.to(icon, {
                    x: 0,
                    y: 0,
                    duration: 0.7,
                    ease: "elastic.out(1, 0.3)"
                });
            }
        });
    });
}

