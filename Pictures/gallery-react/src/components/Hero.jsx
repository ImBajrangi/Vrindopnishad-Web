import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
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
                    onClick={() => document.querySelector('.featured-collections')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <span className="btn-text">
                        Explore Collection
                        <ArrowRight size={18} style={{ marginLeft: '12px' }} />
                    </span>
                </button>
            </div>
            <div className="hero-visual">
                <div className="hero-image-wrapper">
                    <div className="hero-image"></div>
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
