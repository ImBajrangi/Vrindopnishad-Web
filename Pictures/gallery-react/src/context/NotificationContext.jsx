import React, { createContext, useContext, useState, useCallback } from 'react';
import gsap from 'gsap';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        const newNotif = { id, message, type };

        setNotifications(prev => [...prev.slice(-2), newNotif]); // Keep max 3

        // Auto remove
        setTimeout(() => {
            removeNotification(id);
        }, duration);

        // Play sound like in vanilla version
        playNotificationSound(type);
    }, []);

    const removeNotification = useCallback((id) => {
        const element = document.getElementById(`notif-${id}`);
        if (element) {
            gsap.to(element, {
                x: 100,
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                ease: "back.in(1.7)",
                onComplete: () => {
                    setNotifications(prev => prev.filter(n => n.id !== id));
                }
            });
        } else {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    }, []);

    const playNotificationSound = (type) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const context = new AudioContext();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            switch (type) {
                case 'success':
                    oscillator.frequency.setValueAtTime(880, context.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(660, context.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.1, context.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
                    break;
                case 'error':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(300, context.currentTime);
                    gainNode.gain.setValueAtTime(0.1, context.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
                    break;
                case 'warning':
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(440, context.currentTime);
                    gainNode.gain.setValueAtTime(0.1, context.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
                    break;
                default:
                    oscillator.frequency.setValueAtTime(520, context.currentTime);
                    gainNode.gain.setValueAtTime(0.08, context.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
            }

            oscillator.start();
            oscillator.stop(context.currentTime + 0.5);
        } catch (e) {
            // Silently fail
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="notification-container">
                {notifications.map(notif => (
                    <NotificationItem
                        key={notif.id}
                        notif={notif}
                        onHide={() => removeNotification(notif.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

const NotificationItem = ({ notif, onHide }) => {
    const itemRef = React.useRef(null);

    React.useEffect(() => {
        gsap.fromTo(itemRef.current, {
            x: 100,
            opacity: 0,
            scale: 0.8
        }, {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
    }, []);

    const typeIcons = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle'
    };

    const typeTitles = {
        info: 'Information',
        success: 'Success',
        error: 'Error',
        warning: 'Warning'
    };

    const colors = {
        info: '#4a6fff',
        success: '#3ec74f',
        error: '#ff5a6a',
        warning: '#ffb347'
    };

    return (
        <div
            id={`notif-${notif.id}`}
            ref={itemRef}
            className={`notification ${notif.type} ${['success', 'error'].includes(notif.type) ? 'glow' : ''}`}
            style={{ '--notification-color': colors[notif.type] }}
        >
            <div className="notification-icon">
                <i className={`fas ${typeIcons[notif.type]}`}></i>
            </div>
            <div className="notification-content">
                <div className="notification-title">{typeTitles[notif.type]}</div>
                <div className="notification-message">{notif.message}</div>
            </div>
        </div>
    );
};
