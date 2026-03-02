/**
 * Settings Functionality for Vrindopnishad Website
 * Controls the settings modal and user preferences
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize settings functionality
    initSettings();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
});

/**
 * Initialize settings functionality
 */
function initSettings() {
    // Create settings modal if it doesn't exist
    createSettingsModal();

    // Get settings button and add click handler
    const settingsItem = document.querySelector('.tool-item[data-bg-color="#4A4A4A"]:last-child');
    if (settingsItem) {
        const link = settingsItem.querySelector('.tool-link');
        if (link) {
            // Override default link behavior
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openSettingsModal();
            });
        }

        // Make the entire item clickable
        settingsItem.addEventListener('click', (e) => {
            e.preventDefault();
            openSettingsModal();
        });

        // Add tooltip with keyboard shortcut
        settingsItem.setAttribute('title', 'Settings (Ctrl+, or Cmd+,)');
        settingsItem.classList.add('has-tooltip');
    }

    // Set initial settings from localStorage
    loadSettings();
}

/**
 * Create settings modal element
 */
function createSettingsModal() {
    // Check if modal already exists
    if (document.getElementById('settings-modal')) {
        return;
    }

    // Create modal structure
    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'settings-modal';

    // Modal content
    modal.innerHTML = `
        <div class="settings-modal-content">
            <div class="settings-modal-header">
                <h2>सेटिंग्स</h2>
                <button class="settings-close" aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            
            <div class="settings-modal-body">
                
                <!-- Font Size Setting -->
                <div class="settings-section">
                    <h3>फ़ॉन्ट साइज़</h3>
                    <div class="settings-option">
                        <span>टेक्स्ट साइज़</span>
                        <div class="font-size-controls">
                            <button id="font-size-decrease" aria-label="Decrease font size">A-</button>
                            <span id="font-size-value">100%</span>
                            <button id="font-size-increase" aria-label="Increase font size">A+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Animation Setting -->
                <div class="settings-section">
                    <h3>एनिमेशन</h3>
                    <div class="settings-option">
                        <span>एनिमेशन दिखाएं</span>
                        <label class="switch">
                            <input type="checkbox" id="animations-toggle" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
                
                <!-- Effects Setting -->
                <div class="settings-section">
                    <h3>विजुअल इफेक्ट्स</h3>
                    <div class="settings-option">
                        <span>परछाई इफेक्ट्स</span>
                        <label class="switch">
                            <input type="checkbox" id="shadow-effects-toggle" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div class="settings-option">
                        <span>मैग्नेटिक इफेक्ट्स</span>
                        <label class="switch">
                            <input type="checkbox" id="magnetic-effects-toggle" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
                
                <!-- Reset Settings -->
                <div class="settings-section">
                    <button id="reset-settings" class="reset-settings-btn">सभी सेटिंग्स रीसेट करें</button>
                </div>
            </div>
            
            <div class="settings-modal-footer">
                <p>Vrindopnishad v1.0</p>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.appendChild(modal);

    // Add event listeners
    setupSettingsEventListeners();

    // Add modal styles
    addSettingsStyles();
}

/**
 * Setup all event listeners for settings modal
 */
function setupSettingsEventListeners() {
    // Close button
    const closeBtn = document.querySelector('.settings-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSettingsModal);
    }

    // Close on click outside
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeSettingsModal();
            }
        });
    }


    // Font size controls
    const decreaseBtn = document.getElementById('font-size-decrease');
    const increaseBtn = document.getElementById('font-size-increase');

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            changeFontSize(-10);
            saveSettings();
        });
    }

    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            changeFontSize(10);
            saveSettings();
        });
    }

    // Animations toggle
    const animationsToggle = document.getElementById('animations-toggle');
    if (animationsToggle) {
        animationsToggle.addEventListener('change', () => {
            toggleAnimations(animationsToggle.checked);
            saveSettings();
        });
    }

    // Shadow effects toggle
    const shadowToggle = document.getElementById('shadow-effects-toggle');
    if (shadowToggle) {
        shadowToggle.addEventListener('change', () => {
            toggleShadowEffects(shadowToggle.checked);
            saveSettings();
        });
    }

    // Magnetic effects toggle
    const magneticToggle = document.getElementById('magnetic-effects-toggle');
    if (magneticToggle) {
        magneticToggle.addEventListener('change', () => {
            toggleMagneticEffects(magneticToggle.checked);
            saveSettings();
        });
    }

    // Reset settings button
    const resetBtn = document.getElementById('reset-settings');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSettings);
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSettingsModal();
        }
    });
}

/**
 * Open settings modal
 */
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');

        // Close tools menu if open
        closeToolsMenu();
    }
}

/**
 * Close settings modal
 */
function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

/**
 * Close tools menu if open
 */
function closeToolsMenu() {
    const toolsMenu = document.querySelector('.tools-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    if (toolsMenu && toolsMenu.classList.contains('active')) {
        toolsMenu.classList.remove('active');
        document.body.classList.remove('menu-open');

        if (mobileMenuBtn) {
            mobileMenuBtn.classList.remove('active');
        }

        if (menuOverlay) {
            menuOverlay.style.opacity = '0';
            setTimeout(() => {
                menuOverlay.style.display = 'none';
            }, 400);
        }
    }
}


/**
 * Change font size
 */
function changeFontSize(delta) {
    // Get current font size
    const currentSize = parseInt(localStorage.getItem('fontSizePercent') || '100');

    // Calculate new size (within limits)
    const newSize = Math.min(Math.max(currentSize + delta, 80), 150);

    // Update UI
    const fontSizeValueEl = document.getElementById('font-size-value');
    if (fontSizeValueEl) {
        fontSizeValueEl.textContent = `${newSize}%`;
    }

    // Apply to root element
    document.documentElement.style.fontSize = `${newSize}%`;

    // Save to localStorage
    localStorage.setItem('fontSizePercent', newSize);
}

/**
 * Toggle animations
 */
function toggleAnimations(enable) {
    document.body.classList.toggle('no-animations', !enable);
}

/**
 * Toggle shadow effects
 */
function toggleShadowEffects(enable) {
    document.body.classList.toggle('no-shadows', !enable);
}

/**
 * Toggle magnetic effects
 */
function toggleMagneticEffects(enable) {
    document.body.classList.toggle('no-magnetic', !enable);
}

/**
 * Save all settings to localStorage
 */
function saveSettings() {
    const settings = {
        fontSizePercent: parseInt(localStorage.getItem('fontSizePercent') || '100'),
        animations: document.getElementById('animations-toggle')?.checked ?? true,
        shadowEffects: document.getElementById('shadow-effects-toggle')?.checked ?? true,
        magneticEffects: document.getElementById('magnetic-effects-toggle')?.checked ?? true
    };

    localStorage.setItem('siteSettings', JSON.stringify(settings));
}

/**
 * Load settings from localStorage
 */
function loadSettings() {
    // Get settings from localStorage or use defaults
    let settings = {
        fontSizePercent: 100,
        animations: true,
        shadowEffects: true,
        magneticEffects: true
    };

    try {
        const savedSettings = localStorage.getItem('siteSettings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
    } catch (e) {
        console.error('Error loading settings:', e);
    }

    // Apply settings


    // 2. Font size
    document.documentElement.style.fontSize = `${settings.fontSizePercent}%`;
    const fontSizeValueEl = document.getElementById('font-size-value');
    if (fontSizeValueEl) {
        fontSizeValueEl.textContent = `${settings.fontSizePercent}%`;
    }

    // 3. Animations
    const animationsToggle = document.getElementById('animations-toggle');
    if (animationsToggle) {
        animationsToggle.checked = settings.animations;
    }
    toggleAnimations(settings.animations);

    // 4. Shadow effects
    const shadowToggle = document.getElementById('shadow-effects-toggle');
    if (shadowToggle) {
        shadowToggle.checked = settings.shadowEffects;
    }
    toggleShadowEffects(settings.shadowEffects);

    // 5. Magnetic effects
    const magneticToggle = document.getElementById('magnetic-effects-toggle');
    if (magneticToggle) {
        magneticToggle.checked = settings.magneticEffects;
    }
    toggleMagneticEffects(settings.magneticEffects);
}

/**
 * Reset all settings to defaults
 */
function resetSettings() {
    // Default settings
    const defaults = {
        fontSizePercent: 100,
        animations: true,
        shadowEffects: true,
        magneticEffects: true
    };

    // Save defaults
    localStorage.setItem('siteSettings', JSON.stringify(defaults));

    // Apply defaults

    document.documentElement.style.fontSize = `${defaults.fontSizePercent}%`;
    const fontSizeValueEl = document.getElementById('font-size-value');
    if (fontSizeValueEl) {
        fontSizeValueEl.textContent = `${defaults.fontSizePercent}%`;
    }

    const animationsToggle = document.getElementById('animations-toggle');
    if (animationsToggle) {
        animationsToggle.checked = defaults.animations;
    }
    toggleAnimations(defaults.animations);

    const shadowToggle = document.getElementById('shadow-effects-toggle');
    if (shadowToggle) {
        shadowToggle.checked = defaults.shadowEffects;
    }
    toggleShadowEffects(defaults.shadowEffects);

    const magneticToggle = document.getElementById('magnetic-effects-toggle');
    if (magneticToggle) {
        magneticToggle.checked = defaults.magneticEffects;
    }
    toggleMagneticEffects(defaults.magneticEffects);
}

/**
 * Add settings styles to document
 */
function addSettingsStyles() {
    const styles = `
        /* Settings Modal */
        .settings-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            z-index: 10002;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .settings-modal.active {
            opacity: 1;
            visibility: visible;
        }
        
        .settings-modal-content {
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            background: rgba(28, 28, 28, 0.95);
            color: #fff;
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
            transform: translateY(20px);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .settings-modal.active .settings-modal-content {
            transform: translateY(0);
        }
        
        .settings-modal-header {
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .settings-modal-header h2 {
            font-size: 22px;
            margin: 0;
            font-weight: 600;
        }
        
        .settings-close {
            background: none;
            border: none;
            color: #fff;
            cursor: pointer;
            padding: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .settings-close:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.1);
        }
        
        .settings-modal-body {
            padding: 20px;
            overflow-y: auto;
            max-height: 70vh;
        }
        
        .settings-section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .settings-section:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        
        .settings-section h3 {
            font-size: 18px;
            margin: 0 0 15px 0;
            font-weight: 500;
            color: #D4AF37;
        }
        
        .settings-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .settings-option:last-child {
            margin-bottom: 0;
        }
        
        /* Switch styling */
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 26px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.1);
            transition: .4s;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
        }
        
        input:checked + .slider {
            background-color: #8E7F7F;
        }
        
        input:focus + .slider {
            box-shadow: 0 0 1px #8E7F7F;
        }
        
        input:checked + .slider:before {
            transform: translateX(24px);
        }
        
        .slider.round {
            border-radius: 34px;
        }
        
        .slider.round:before {
            border-radius: 50%;
        }
        
        /* Font size controls */
        .font-size-controls {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .font-size-controls button {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #fff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .font-size-controls button:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
        }
        
        #font-size-value {
            min-width: 50px;
            text-align: center;
            font-weight: 500;
        }
        
        /* Reset button */
        .reset-settings-btn {
            background: rgba(211, 47, 47, 0.2);
            color: #fff;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            width: 100%;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .reset-settings-btn:hover {
            background: rgba(211, 47, 47, 0.4);
            transform: translateY(-2px);
        }
        
        .settings-modal-footer {
            padding: 15px 20px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .settings-modal-footer p {
            margin: 0;
            font-size: 14px;
            opacity: 0.7;
        }
        
        /* Custom notification */
        .settings-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: rgba(33, 33, 33, 0.9);
            color: white;
            border-radius: 8px;
            font-size: 14px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 10003;
        }
        
        .settings-notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        /* Theme classes */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #121212;
                color: #f5f5f5;
            }
            
            .hero, .about, .projects {
                background-color: #121212;
            }
            
            .card, .project-item, .tool-item {
                background-color: rgba(255, 255, 255, 0.05);
            }
        }
        
        /* Animation classes */
        body.no-animations * {
            transition: none !important;
            animation: none !important;
        }
        
        /* Shadow classes */
        body.no-shadows * {
            box-shadow: none !important;
            text-shadow: none !important;
        }
        
        /* Magnetic effects classes */
        body.no-magnetic .magnetic {
            transform: none !important;
        }
        
        body.no-magnetic .magnetic::after {
            display: none !important;
        }
        
        /* Mobile optimizations */
        @media (max-width: 480px) {
            .settings-modal-content {
                width: 95%;
                max-height: 95vh;
            }
            
            .settings-modal-header h2 {
                font-size: 18px;
            }
            
            .settings-section h3 {
                font-size: 16px;
            }
            
            .settings-notification {
                left: 20px;
                right: 20px;
                text-align: center;
            }
        }
    `;

    // Create style element
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

// Add CSS class for preventing body scrolling when modal is open
document.head.insertAdjacentHTML('beforeend', `
    <style>
        body.modal-open {
            overflow: hidden;
        }
    </style>
`);

/**
 * Setup keyboard shortcuts for settings
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Open settings with Ctrl+, or Cmd+,
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            openSettingsModal();
        }
    });
} 