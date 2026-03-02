// Enhanced image hover effect with custom cursor tracking
document.addEventListener('DOMContentLoaded', () => {
    const imageHover = document.querySelector('.image-hover');
    const projectItems = document.querySelectorAll('.project-item');
    const cursor = document.querySelector('.cursor-dot') || document.querySelector('.cursor-circle');

    if (!imageHover) {
        // Silent return if image hover container is not present on this page
        return;
    }

    // Clear any existing content
    imageHover.innerHTML = '';

    // Create single image element
    const img = document.createElement('img');
    img.className = 'hover-image';
    imageHover.appendChild(img);

    let isVisible = false;
    let rafId = null;

    function updateImagePosition(x, y) {
        // Directly update position without transition for perfect cursor tracking
        imageHover.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${isVisible ? '1' : '0.8'})`;
    }

    let ticking = false;
    let lastKnownX = 0;
    let lastKnownY = 0;

    function onMouseMove(e) {
        if (!isVisible) return;

        lastKnownX = e.clientX;
        lastKnownY = e.clientY;

        if (!ticking) {
            requestAnimationFrame(() => {
                const x = lastKnownX - (imageHover.offsetWidth / 2);
                const y = lastKnownY - (imageHover.offsetHeight / 2);
                updateImagePosition(x, y);
                ticking = false;
            });
            ticking = true;
        }
    }

    // Handle project item interactions
    projectItems.forEach(item => {
        const imagePath = item.getAttribute('data-image');
        if (!imagePath) {
            console.warn('Project item missing data-image attribute');
            return;
        }

        function showImage(e) {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            img.src = imagePath;
            isVisible = true;
            imageHover.classList.add('visible');

            // Set initial position immediately
            const x = e.clientX - (imageHover.offsetWidth / 2);
            const y = e.clientY - (imageHover.offsetHeight / 2);
            updateImagePosition(x, y);
        }

        function hideImage() {
            isVisible = false;
            imageHover.classList.remove('visible');
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        // Mouse events with passive option for better performance
        item.addEventListener('mouseenter', showImage, { passive: true });
        item.addEventListener('mouseleave', hideImage, { passive: true });
    });

    // Add mousemove listener to document for smooth tracking
    document.addEventListener('mousemove', onMouseMove, { passive: true });

    // Cleanup on page unload
    window.addEventListener('unload', () => {
        document.removeEventListener('mousemove', onMouseMove);
    });

    // Cleanup
    window.addEventListener('unload', () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
    });
});