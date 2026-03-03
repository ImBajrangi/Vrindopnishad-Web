import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setTimeout(() => setIsVisible(true), 2000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-consent active">
            <div className="cookie-content">
                <div className="cookie-icon">
                    <i className="fas fa-cookie-bite"></i>
                </div>
                <div className="cookie-text">
                    <h3>Cookie Policy</h3>
                    <p>We use divine cookies to enhance your spiritual browsing experience on Chitra Vrinda.</p>
                </div>
                <div className="cookie-actions">
                    <button className="cookie-btn accept" onClick={handleAccept}>Accept</button>
                    <button className="cookie-btn decline" onClick={handleDecline}>Decline</button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
