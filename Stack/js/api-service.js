/**
 * API Service for Vrindopnishad
 * 
 * This file provides functions to interact with the backend API.
 *

// Base URL for API calls
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : 'https://api.vrindopnishad.com/api';

// Default headers for API requests
const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

/**
 * Get authentication token from local storage
 *
const getToken = () => localStorage.getItem('vrindopnishad_token');

/**
 * Set authentication token in local storage
 *
const setToken = (token) => {
    if (token) {
        localStorage.setItem('vrindopnishad_token', token);
    } else {
        localStorage.removeItem('vrindopnishad_token');
    }
};

/**
 * Check if user is authenticated
 *
const isAuthenticated = () => !!getToken();

/**
 * Get authenticated user data
 *
const getAuthUser = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                ...DEFAULT_HEADERS,
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to get user data');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error getting authenticated user:', error);
        return null;
    }
};

/**
 * Login user
 *
const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        setToken(data.token);
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

/**
 * Logout user
 *
const logout = () => {
    setToken(null);
};

/**
 * Get all books
 *
const getBooks = async (filters = {}) => {
    try {
        // Convert filters to query string
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(val => queryParams.append(key, val));
            } else if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        
        const response = await fetch(`${API_BASE_URL}/books${queryString}`, {
            method: 'GET',
            headers: DEFAULT_HEADERS
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching books:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get a specific book by ID
 *
const getBookById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${id}`, {
            method: 'GET',
            headers: DEFAULT_HEADERS
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch book');
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching book with ID ${id}:`, error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all collections
 *
const getCollections = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/collections`, {
            method: 'GET',
            headers: DEFAULT_HEADERS
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch collections');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching collections:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get a specific collection by ID
 *
const getCollectionById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
            method: 'GET',
            headers: DEFAULT_HEADERS
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch collection');
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching collection with ID ${id}:`, error);
        return { success: false, error: error.message };
    }
};

/**
 * Search books
 *
const searchBooks = async (query) => {
    try {
        const response = await fetch(`${API_BASE_URL}/books/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: DEFAULT_HEADERS
        });
        
        if (!response.ok) {
            throw new Error('Failed to search books');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error searching books:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check API status
 *
const checkApiStatus = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/status`, {
            method: 'GET',
            headers: DEFAULT_HEADERS
        });
        
        if (!response.ok) {
            throw new Error('API status check failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error checking API status:', error);
        return { 
            success: false, 
            server: 'unreachable',
            databases: {
                mongodb: 'unknown',
                mysql: 'unknown',
                postgresql: 'unknown'
            }
        };
    }
};

// Create ApiService global object
window.ApiService = {
    getToken,
    setToken,
    isAuthenticated,
    getAuthUser,
    login,
    logout,
    getBooks,
    getBookById,
    getCollections,
    getCollectionById,
    searchBooks,
    checkApiStatus
};*/
