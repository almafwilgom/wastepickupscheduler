// Determine base API URL depending on environment or fallback
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Check if running on localhost during local dev
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return 'https://wastepickupschedulerapi.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Helper to fetch data with automatic Authorization header handling and safe JSON parsing.
 */
export async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const authToken = token || localStorage.getItem('waste_scheduler_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Extract response text safely before attempting JSON parsing
    const rawText = await response.text();
    let result = {};

    if (rawText && rawText.trim().length > 0) {
      try {
        result = JSON.parse(rawText);
      } catch (parseError) {
        console.error(`[API Parse Error] ${method} ${endpoint} returned non-JSON body:`, rawText);
        if (!response.ok) {
          throw new Error(`Server returned HTML/error response (Status ${response.status}: ${response.statusText}). Please check backend service deployment.`);
        }
        throw new Error(`Server response could not be parsed as JSON (Status ${response.status}).`);
      }
    }

    if (!response.ok) {
      throw new Error(result.message || `Request failed with status ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error(`[API Request Error] ${method} ${endpoint}:`, error.message);
    throw error;
  }
}
