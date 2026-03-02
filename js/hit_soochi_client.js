/**
 * HitSoochi Client - Universal Search Optimization
 * Connects to the HitSoochi API for semantic search, recommendations, and suggestions
 */

const HitSoochi = (() => {
    // Configuration - Update this for production
    const CONFIG = {
        API_URL: 'http://localhost:8000',
        CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    };

    // Simple cache for suggestions
    const cache = new Map();

    /**
     * Make API request with error handling
     */
    async function apiRequest(endpoint, data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn(`HitSoochi: ${endpoint} failed:`, error.message);
            return null;
        }
    }

    /**
     * Optimize a search query with domain-specific context
     * @param {string} query - Raw user query
     * @returns {Promise<{original, optimized, intent, confidence, seo_keywords}>}
     */
    async function optimizeQuery(query) {
        if (!query || query.trim().length < 2) return null;
        return apiRequest('/optimize', { query });
    }

    /**
     * Get service recommendations based on query intent
     * @param {string} query - User query
     * @returns {Promise<{detected_intent, primary_recommendation, other_services}>}
     */
    async function getRecommendations(query) {
        if (!query || query.trim().length < 2) return null;
        return apiRequest('/recommend', { query });
    }

    /**
     * Get autocomplete suggestions for partial query
     * @param {string} partial - Partial query text
     * @param {number} limit - Max suggestions to return
     * @returns {Promise<{suggestions: [{text, score}]}>}
     */
    async function getSuggestions(partial, limit = 5) {
        if (!partial || partial.trim().length < 2) return null;

        // Check cache first
        const cacheKey = `suggest:${partial}:${limit}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.time < CONFIG.CACHE_DURATION) {
            return cached.data;
        }

        const result = await apiRequest('/suggest', { partial, limit });
        if (result) {
            cache.set(cacheKey, { data: result, time: Date.now() });
        }
        return result;
    }

    /**
     * Rank items by semantic relevance to query
     * @param {string} query - Search query
     * @param {Array<{title, description, category}>} items - Items to rank
     * @returns {Promise<{ranked_items}>}
     */
    async function rankResults(query, items) {
        if (!query || !items?.length) return null;
        return apiRequest('/rank', { query, items });
    }

    /**
     * Enhanced search with optimization, ranking, and recommendations
     * @param {string} query - Raw user query
     * @param {Array} items - Items to search through
     * @param {Object} options - Search options
     * @returns {Promise<{optimizedQuery, intent, rankedResults, recommendations}>}
     */
    async function enhancedSearch(query, items, options = {}) {
        const [optimized, recommendations] = await Promise.all([
            optimizeQuery(query),
            getRecommendations(query)
        ]);

        // Filter items locally first (basic matching)
        const searchLower = query.toLowerCase();
        let filtered = items.filter(item => {
            const titleMatch = item.title?.toLowerCase().includes(searchLower);
            const descMatch = item.desc?.toLowerCase().includes(searchLower);
            const tagMatch = item.tags?.some(t => t.toLowerCase().includes(searchLower));
            return titleMatch || descMatch || tagMatch;
        });

        // Rank filtered results semantically if we have results
        let rankedResults = filtered;
        if (filtered.length > 1) {
            const ranked = await rankResults(query, filtered.map(item => ({
                title: item.title || '',
                description: item.desc || '',
                category: item.tags?.join(' ') || ''
            })));

            if (ranked?.ranked_items) {
                // Map relevance scores back to original items
                rankedResults = ranked.ranked_items.map((rankedItem, idx) => ({
                    ...filtered[idx],
                    relevance_score: rankedItem.relevance_score
                })).sort((a, b) => b.relevance_score - a.relevance_score);
            }
        }

        return {
            original: query,
            optimizedQuery: optimized?.optimized || query,
            intent: optimized?.intent || 'GENERAL',
            confidence: optimized?.confidence || '0.00',
            rankedResults,
            recommendations
        };
    }

    /**
     * Create recommendation panel HTML
     */
    function createRecommendationHTML(recommendation) {
        if (!recommendation?.primary_recommendation) return '';

        const primary = recommendation.primary_recommendation;
        return `
            <div class="hit-soochi-recommendation" data-intent="${recommendation.detected_intent}">
                <div class="recommendation-primary">
                    <span class="rec-icon">${primary.icon}</span>
                    <div class="rec-content">
                        <strong>${primary.service}</strong>
                        <p>${primary.description}</p>
                    </div>
                    <a href="${primary.url}" class="rec-cta">${primary.cta}</a>
                </div>
            </div>
        `;
    }

    /**
     * Create suggestions dropdown HTML
     */
    function createSuggestionsHTML(suggestions) {
        if (!suggestions?.suggestions?.length) return '';

        return `
            <div class="hit-soochi-suggestions">
                ${suggestions.suggestions.map(s => `
                    <div class="suggestion-item" data-query="${s.text}">
                        <span class="suggestion-icon">🔍</span>
                        <span class="suggestion-text">${s.text}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Initialize HitSoochi for a search input element
     */
    function init(searchInputSelector, options = {}) {
        const input = document.querySelector(searchInputSelector);
        if (!input) {
            console.warn('HitSoochi: Search input not found:', searchInputSelector);
            return;
        }

        let suggestionsContainer = null;
        let debounceTimer = null;

        // Create suggestions container
        if (options.enableSuggestions !== false) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'hit-soochi-suggestions-container';
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(suggestionsContainer);

            // Handle input for suggestions
            input.addEventListener('input', async (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {
                    const value = e.target.value;
                    if (value.length >= 2) {
                        const suggestions = await getSuggestions(value);
                        suggestionsContainer.innerHTML = createSuggestionsHTML(suggestions);
                        suggestionsContainer.style.display = suggestions?.suggestions?.length ? 'block' : 'none';
                    } else {
                        suggestionsContainer.innerHTML = '';
                        suggestionsContainer.style.display = 'none';
                    }
                }, 200);
            });

            // Handle suggestion clicks
            suggestionsContainer.addEventListener('click', (e) => {
                const item = e.target.closest('.suggestion-item');
                if (item) {
                    input.value = item.dataset.query;
                    suggestionsContainer.style.display = 'none';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    if (options.onSearch) {
                        options.onSearch(item.dataset.query);
                    }
                }
            });

            // Hide suggestions on blur
            document.addEventListener('click', (e) => {
                if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                    suggestionsContainer.style.display = 'none';
                }
            });
        }

        console.log('🔍 HitSoochi initialized for:', searchInputSelector);
    }

    // Public API
    return {
        init,
        optimizeQuery,
        getRecommendations,
        getSuggestions,
        rankResults,
        enhancedSearch,
        createRecommendationHTML,
        createSuggestionsHTML,
        setApiUrl: (url) => { CONFIG.API_URL = url; }
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HitSoochi;
}
