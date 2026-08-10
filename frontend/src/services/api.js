const API_BASE_URL = 'https://wastepickupschedulerapi.onrender.com/api';

/**
 * Helper to fetch data with automatic Authorization header handling.
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
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'An error occurred during request processing');
    }

    return result;
  } catch (error) {
    console.error(`[API Request Failed] ${method} ${endpoint}:`, error.message);
    throw error;
  }
}
