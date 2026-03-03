import React from 'react';
import { X, Star, Play, Info, Share2, Plus, Check } from 'lucide-react';

const PopupModal = ({ item, onClose, onToggleMyList, isInList }) => {
    if (!item) return null;

    return (
        <div className={`popup-modal active`} onClick={(e) => e.target.classList.contains('popup-modal') && onClose()}>
            <div className="popup-content">
                <button className="popup-close" onClick={onClose}>
                    <X size={24} />
                </button>
                <div
                    className="popup-hero"
                    style={{ backgroundImage: `url(${item.image})` }}
                ></div>
                <div className="popup-info">
                    <div className="popup-header">
                        <h1 className="popup-title">{item.title}</h1>
                        <div className="popup-rating">
                            <Star size={16} fill="currentColor" />
                            <span>{item.rating ? item.rating.toFixed(1) : '4.5'}</span>
                        </div>
                    </div>
                    <div className="popup-meta">
                        <span className="popup-year">{item.year || '2026'}</span>
                        <span className="popup-count">{item.count || item.itemCount || 0} items</span>
                        <span className="popup-category">{item.category || 'Collection'}</span>
                    </div>
                    <p className="popup-description">{item.description || 'No description available.'}</p>
                    <div className="popup-actions">
                        <button
                            className="popup-btn popup-btn-primary"
                            onClick={() => {
                                sessionStorage.setItem('collectionData', JSON.stringify(item));
                                window.location.href = `collection-details.html?id=${item.id}`;
                            }}
                        >
                            <Play size={18} fill="currentColor" style={{ marginRight: '8px' }} /> View Collection
                        </button>
                        <button
                            className="popup-btn popup-btn-secondary"
                            onClick={() => onToggleMyList(item)}
                        >
                            {isInList ? (
                                <><Check size={18} style={{ marginRight: '8px' }} /> In My List</>
                            ) : (
                                <><Plus size={18} style={{ marginRight: '8px' }} /> Add to My List</>
                            )}
                        </button>
                        <button className="popup-btn popup-btn-outline">
                            <Share2 size={18} style={{ marginRight: '8px' }} /> Share
                        </button>
                    </div>
                    <div className="popup-stats">
                        <div className="stat-item">
                            <span className="stat-number">{item.count || item.itemCount || 0}</span>
                            <span className="stat-label">Items</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{item.views ? item.views.toLocaleString() : '1.2K'}</span>
                            <span className="stat-label">Views</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{Math.floor(Math.random() * 500) + 100}</span>
                            <span className="stat-label">Likes</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopupModal;
