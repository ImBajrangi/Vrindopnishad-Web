import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="logo">
                        <img src="https://vrindopnishad.in/class/logo/v-logo-transparent.png" alt="Chitra Vrinda" className="logo-img" />
                        <span className="logo-text">Chitra Vrinda</span>
                    </div>
                    <p className="footer-tagline">Preserving the divine beauty of Vrindavan through sacred art and photography.</p>
                    <div className="social-links">
                        <a href="#" className="social-icon"><Facebook size={18} /></a>
                        <a href="#" className="social-icon"><Twitter size={18} /></a>
                        <a href="#" className="social-icon"><Instagram size={18} /></a>
                        <a href="#" className="social-icon"><Youtube size={18} /></a>
                    </div>
                </div>

                <div className="footer-links">
                    <h4 className="footer-title">Explore</h4>
                    <ul>
                        <li><a href="../../Home/main/home.html">Home</a></li>
                        <li><a href="Gallery.html">Gallery</a></li>
                        <li><a href="../../Stack/main/stack.html">Collections</a></li>
                        <li><a href="../../about code/main/about.html">About Us</a></li>
                    </ul>
                </div>

                <div className="footer-contact">
                    <h4 className="footer-title">Contact</h4>
                    <ul>
                        <li><MapPin size={16} /> Vrindavan, Uttar Pradesh</li>
                        <li><Phone size={16} /> +91 123 456 7890</li>
                        <li><Mail size={16} /> info@chitra-vrinda.com</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2026 Chitra Vrinda. All rights reserved.</p>
                <div className="footer-legal">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
