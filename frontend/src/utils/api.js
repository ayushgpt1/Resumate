/**
 * Utility functions for making API calls to the backend
 */

// Get API URL from environment variables or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Make a GET request to the API
 * @param {string} endpoint - API endpoint path
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response data
 */
export const apiGet = async (endpoint, params = {}) => {
  try {
    // Build query string from params
    const queryString = Object.keys(params).length 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    
    const response = await fetch(`${API_URL}${endpoint}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.statusText}. ${errorText || ''}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in GET request to ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Fetch all job roles from the backend
 * @param {string} token Authentication token
 * @returns {Promise<Array>} Array of role objects
 */
export const fetchRoles = async (token) => {
  try {
    const response = await fetch(`${API_URL}/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch roles: ${response.statusText}. ${errorText || ''}`);
    }

    const data = await response.json();
    
    // Process date strings to ensure consistent formatting
    const processedRoles = data.results.map(role => ({
      ...role,
      created_date: role.created_date || new Date().toISOString().split('T')[0] // Default to today if missing
    }));
    
    return processedRoles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

/**
 * Fetch candidates for a specific role
 * @param {string} token Authentication token
 * @param {string} roleName Name of the role
 * @returns {Promise<Array>} Array of candidate objects
 */
export const fetchCandidatesByRole = async (token, roleName) => {
  try {
    // Encode the role name to handle special characters in the URL
    const encodedRoleName = encodeURIComponent(roleName);
    const response = await fetch(`${API_URL}/candidates_for_role/${encodedRoleName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch candidates: ${response.statusText}. ${errorText || ''}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Error fetching candidates for role ${roleName}:`, error);
    throw error;
  }
};

/**
 * Delete a job role by name
 * @param {string} token Authentication token
 * @param {string} roleName Name of the role to delete
 * @returns {Promise<Object>} Response data
 */
export const deleteRole = async (token, roleName) => {
  try {
    const encodedRoleName = encodeURIComponent(roleName);
    const response = await fetch(`${API_URL}/roles/${encodedRoleName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete role: ${response.statusText}. ${errorText || ''}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error deleting role ${roleName}:`, error);
    throw error;
  }
};

/**
 * Delete a candidate by ID
 * @param {string} token Authentication token
 * @param {number} candidateId ID of the candidate to delete
 * @returns {Promise<Object>} Response data
 */
export const deleteCandidate = async (token, candidateId) => {
  try {
    const response = await fetch(`${API_URL}/candidates/${candidateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete candidate: ${response.statusText}. ${errorText || ''}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error deleting candidate ${candidateId}:`, error);
    throw error;
  }
};
