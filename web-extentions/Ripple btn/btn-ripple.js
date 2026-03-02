function initializeFullCoverageRipple() {
    const rippleButtons = document.querySelectorAll('.ripple-btn');
    
    rippleButtons.forEach(button => {
        let isHovering = false;
        let rippleTimeout = null;

        button.addEventListener('mouseenter', function(e) {
            isHovering = true;
            
            if (rippleTimeout) {
                clearTimeout(rippleTimeout);
            }

            // Calculate entry position
            const rect = button.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            // Set ripple starting position
            button.style.setProperty('--ripple-x', x + '%');
            button.style.setProperty('--ripple-y', y + '%');

            // Start expanding
            button.classList.remove('ripple-shrinking');
            button.classList.add('ripple-expanding');

            console.log(`Ripple starts at: ${x.toFixed(1)}%, ${y.toFixed(1)}%`);
        });

        // Update position during hover for dynamic effect
        button.addEventListener('mousemove', function(e) {
            if (isHovering) {
                const rect = button.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                // Keep updating the center point
                button.style.setProperty('--ripple-x', x + '%');
                button.style.setProperty('--ripple-y', y + '%');
            }
        });

        button.addEventListener('mouseleave', function(e) {
            isHovering = false;

            // Calculate exact exit position
            const rect = button.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            // Set final position for shrinking
            button.style.setProperty('--ripple-x', x + '%');
            button.style.setProperty('--ripple-y', y + '%');

            // Start shrinking
            button.classList.remove('ripple-expanding');
            button.classList.add('ripple-shrinking');

            console.log(`Ripple ends at: ${x.toFixed(1)}%, ${y.toFixed(1)}%`);

            // Clean up after shrinking completes
            rippleTimeout = setTimeout(function() {
                button.classList.remove('ripple-shrinking');
                button.style.removeProperty('--ripple-x');
                button.style.removeProperty('--ripple-y');
            }, 500); // Match the shrinking duration
        });
    });
}

// Slider functionality (completely unaffected)
function slideLeft() {
    const slider = document.getElementById('slider-track');
    slider.scrollBy({ left: -220, behavior: 'smooth' });
}

function slideRight() {
    const slider = document.getElementById('slider-track');
    slider.scrollBy({ left: 220, behavior: 'smooth' });
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', function() {
    initializeFullCoverageRipple();
});