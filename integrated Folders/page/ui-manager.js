// UI Management functionality
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggle = document.getElementById('toggle-theme');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light</span>';
        }
        
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light</span>';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Dark</span>';
            }
        });
    }

    // Page management
    const managePagesBtn = document.getElementById('manage-pages');
    const pageManagementModal = document.getElementById('page-management');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    managePagesBtn.addEventListener('click', function() {
        pageManagementModal.classList.remove('hidden');
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            pageManagementModal.classList.add('hidden');
        });
    });

    // Media library
    const mediaLibraryBtn = document.getElementById('media-library');
    const mediaLibraryModal = document.getElementById('media-library-modal');

    mediaLibraryBtn.addEventListener('click', function() {
        mediaLibraryModal.classList.remove('hidden');
    });

    // Initialize GSAP animations
    gsap.from('.main-content', {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: 'power2.out'
    });

    gsap.from('.related-content', {
        opacity: 0,
        x: 20,
        duration: 1,
        delay: 0.5,
        ease: 'power2.out'
    });

    // Lazy load images
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}); 