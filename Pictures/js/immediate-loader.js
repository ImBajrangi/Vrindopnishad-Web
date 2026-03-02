// Load all images immediately
function loadAllImagesImmediately() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        }
    });
}

// Call this function when DOM is loaded
document.addEventListener('DOMContentLoaded', loadAllImagesImmediately);