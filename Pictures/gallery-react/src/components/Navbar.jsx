import React, { useState, useEffect } from 'react';
import { User, Search, Menu, ChevronDown, X } from 'lucide-react';

const Navbar = ({ onSearchClick, myListCount }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '../../Home/main/home.html' },
        { name: 'Gallery', href: 'Gallery.html', active: true },
        { name: 'Collections', href: '../../Stack/main/stack.html' },
        { name: 'About', href: '../../about code/main/about.html' },
    ];

    const categories = [
        { name: 'Featured', href: '#featured-slider' },
        { name: 'Popular', href: '#popular-slider' },
        { name: 'Rapper Style', href: '#rapper-slider' },
        { name: 'Anime & Art', href: '#anime-slider' },
        { name: 'Dark Aesthetic', href: '#dark-slider' },
        { name: 'Warrior Styles', href: '#warrior-slider' },
    ];

    return (
        <>
            <header className={`header ${isScrolled ? 'scrolled' : ''}`} id="header">
                <a href="/" className="logo">
                    <img src="https://vrindopnishad.in/class/logo/v-logo-transparent.png" alt="Chitra Vrinda" className="logo-img" />
                    <span className="logo-text">Chitra Vrinda</span>
                </a>

                <nav className="nav-menu">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className={`nav-link ${link.active ? 'active' : ''}`}
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="nav-dropdown">
                        <button className="nav-link dropdown-trigger">
                            Browse <ChevronDown size={14} />
                        </button>
                        <div className="dropdown-menu">
                            {categories.map((cat) => (
                                <a key={cat.name} href={cat.href} className="dropdown-item">
                                    {cat.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </nav>

                <div className="header-actions">
                    <button className="icon-btn" id="user-auth-btn" aria-label="User Account">
                        <User size={20} />
                    </button>
                    <button className="icon-btn" onClick={onSearchClick} aria-label="Search">
                        <Search size={20} />
                    </button>
                    <button
                        className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menu"
                    >
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`} id="mobile-nav-overlay">
                <nav className="mobile-nav">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className={`mobile-link ${link.active ? 'active' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>
                <div className="mobile-footer">
                    <p>© 2026 Chitra Vrinda</p>
                </div>
            </div>
        </>
    );
};

export default Navbar;
