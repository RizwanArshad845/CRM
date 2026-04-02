const BASE_URL = 'http://localhost:5000/api';

/**
 * Standardized API fetch wrapper for Electron environment.
 * Handles base URL, JSON headers, and (eventually) the JWT token.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Get token from localStorage (if exists)
    const token = localStorage.getItem('crm_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${url}]:`, error);
        throw error;
    }
}
