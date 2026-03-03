import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const Hero = () => {
    const { showNotification } = useNotifications();
    const [currentBg, setCurrentBg] = useState(0);
    const backgrounds = [
        '/Pictures/gallery-react/public/class/v-logo-rounded/android-chrome-512x512.png', // Placeholder for actual hero backgrounds
        '/Pictures/gallery-react/src/assets/react.svg'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg(prev => (prev + 1) % backgrounds.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleExplore = () => {
        showNotification('Exploring divine collections...', 'info');
        document.querySelector('.featured-collections')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="hero">
            <div className="hero-content">
                <span className="hero-label">Curated Gallery</span>
                <h1 className="hero-heading">
                    Chitra Vrinda:<br />
                    <span className="hero-accent">Divine art that inspires</span>
                </h1>
                <p className="hero-text">
                    A carefully curated collection of spiritual photography and sacred artworks from Vrindavan.
                </p>
                <button
                    className="ripple-btn orange hero-cta-btn"
                    onClick={handleExplore}
                >
                    <span className="btn-text">
                        Explore Collection
                        <ArrowRight size={18} style={{ marginLeft: '12px' }} />
                    </span>
                </button>
            </div>
            <div className="hero-visual">
                <div className="hero-image-wrapper">
                    <div
                        className="hero-image active"
                        style={{ backgroundImage: `url(${backgrounds[currentBg]})`, transition: 'background-image 1s ease-in-out' }}
                    ></div>
                    <div className="hero-image-overlay"></div>
                </div>
                <div className="hero-image-label">
                    <span className="label-category">Featured</span>
                    <span className="label-title">Sacred Vrindavan</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
