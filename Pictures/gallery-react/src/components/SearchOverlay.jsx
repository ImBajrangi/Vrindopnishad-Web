import React, { useState, useEffect, useRef } from 'react';
import { X, Search as SearchIcon } from 'lucide-react';

const SearchOverlay = ({ active, onClose, collectionsData, onItemClick }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        if (active && inputRef.current) {
            inputRef.current.focus();
        }
    }, [active]);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        const allItems = Object.values(collectionsData).flatMap(category =>
            category.items || []
        );

        const filtered = allItems.filter(item =>
            (item.title && item.title.toLowerCase().includes(query.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(query.toLowerCase())) ||
            (Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
        ).slice(0, 10);

        setResults(filtered);
    }, [query, collectionsData]);

    if (!active) return null;

    return (
        <div className={`search-overlay active`} onClick={(e) => e.target.classList.contains('search-overlay') && onClose()}>
            <div className="search-container">
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="Search collections..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <div className="search-results">
                    {results.length > 0 ? (
                        results.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="search-result-item"
                                onClick={() => onItemClick(item)}
                            >
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                                <span className="category-tag">{item.category || 'Collection'}</span>
                            </div>
                        ))
                    ) : query.length >= 2 ? (
                        <p style={{ padding: '1rem', color: '#ccc' }}>No results found</p>
                    ) : null}
                </div>
            </div>
            <button className="icon-btn" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '5%' }}>
                <X size={24} color="white" />
            </button>
        </div>
    );
};

export default SearchOverlay;
