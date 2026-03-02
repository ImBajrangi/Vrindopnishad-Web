// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const adminLogin = document.getElementById('adminLogin');
    const adminPanel = document.getElementById('adminPanel');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'admin' && password === 'admin123') {
            adminLogin.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            localStorage.setItem('adminLoggedIn', 'true');
            showNotification('Welcome back, Admin!', 'success');
        } else {
            showNotification('Invalid credentials', 'error');
        }
    });

    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        adminLogin.classList.add('hidden');
        adminPanel.classList.remove('hidden');
    }

    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('adminLoggedIn');
        adminLogin.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        showNotification('Logged out successfully', 'info');
    });

    // Notification helper function
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-app-icon"></div>
                <span class="notification-app-name">Admin Panel</span>
                <span class="notification-time">Just now</span>
            </div>
            <div class="notification-content">
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        // Add to notifications container
        let container = document.querySelector('.notifications');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notifications';
            document.body.appendChild(container);
        }
        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        });
    }
}); 