import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Share2, Download, ShoppingBag, Heart, Check, ChevronRight } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const CollectionDetails = ({ data, onBack, onToggleMyList, isInList }) => {
    const { showNotification } = useNotifications();
    const [mainImage, setMainImage] = useState(data?.image);
    const [activeIndex, setActiveIndex] = useState(0);

    if (!data) return null;

    const handleDownload = (e, imgUrl, index) => {
        e.stopPropagation();
        showNotification(`Preparing download for image ${index + 1}...`, 'info');
        // Simple download logic
        const link = document.createElement('a');
        link.href = imgUrl;
        link.download = `vrinda-art-${data.id}-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: data.title,
                text: data.description,
                url: window.location.href,
            }).catch(() => {
                showNotification('Unable to share', 'error');
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            showNotification('Link copied to clipboard!', 'success');
        }
    };

    const images = Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.image];

    return (
        <div className="collection-details-view">
            <div className="product-container">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={20} /> Back to Gallery
                </button>

                <div className="product-grid">
                    <div className="gallery-section">
                        <div className="main-image-container">
                            <img src={mainImage} alt={data.title} className="main-image" />
                            <span className="image-badge">{data.category || 'Divine'}</span>
                        </div>
                        <div className="thumbnail-grid">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`thumbnail ${activeIndex === idx ? 'active' : ''}`}
                                    onClick={() => {
                                        setMainImage(img);
                                        setActiveIndex(idx);
                                    }}
                                >
                                    <img src={img} alt={`${data.title} thumbnail ${idx + 1}`} />
                                    <button
                                        className="thumbnail-download-btn"
                                        onClick={(e) => handleDownload(e, img, idx)}
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="product-info">
                        <span className="product-new">NEW COLLECTION 2026</span>
                        <h1 className="product-title">{data.title}</h1>
                        <h2 className="product-subtitle">Divine Vrindavan Art Series</h2>

                        <div className="product-rating">
                            <div className="stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < Math.floor(data.rating || 4.5) ? "currentColor" : "none"} />
                                ))}
                            </div>
                            <span className="rating-text">{(data.rating || 4.5).toFixed(1)} • {data.views || '1.2K'} views</span>
                        </div>

                        <div className="price-section">
                            <div className="price-label">Collection Access</div>
                            <div className="price">₹ {data.price || 'Free'}</div>
                            <p className="price-note">Experience the divine essence in ultra-high resolution.</p>
                        </div>

                        <div className="action-buttons">
                            <button className="btn btn-primary" onClick={() => showNotification('Feature coming soon: Full Collection Access', 'warning')}>
                                <ShoppingBag size={20} /> Buy Collection
                            </button>
                            <button
                                className={`btn ${isInList ? 'btn-success' : 'btn-secondary'}`}
                                onClick={() => onToggleMyList(data)}
                            >
                                {isInList ? <><Check size={20} /> In My List</> : <><Heart size={20} /> Add to My List</>}
                            </button>
                            <button className="btn btn-outline" onClick={handleShare}>
                                <Share2 size={20} /> Share this Divine Art
                            </button>
                        </div>

                        <div className="product-description">
                            <h3 className="description-title">About this Collection</h3>
                            <p className="description-text">{data.description || 'Experience the transcendental beauty of Vrindavan through this curated art collection.'}</p>

                            <ul className="features-list">
                                {Array.isArray(data.tags) && data.tags.map((tag, i) => (
                                    <li key={i}>
                                        <ChevronRight size={16} className="feature-icon" />
                                        <span>{tag}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectionDetails;
