/**
 * GCTP API Service
 * Centralized HTTP client with automatic JWT token injection,
 * error handling, and offline-resilient demo fallback for presentations.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('gctp_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // ------------------------------------------------------------------
  // Authentication Endpoints
  // ------------------------------------------------------------------
  async register(full_name, email, password, confirm_password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password, confirm_password }),
    });
    return handleResponse(response);
  },

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateProfile(full_name) {
    const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ full_name }),
    });
    return handleResponse(response);
  },

  async changePassword(current_password, new_password, confirm_password) {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ current_password, new_password, confirm_password }),
    });
    return handleResponse(response);
  },

  // ------------------------------------------------------------------
  // AI Tools Endpoints
  // ------------------------------------------------------------------
  async generateContent(params) {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },

  async transformText(params) {
    const response = await fetch(`${API_BASE_URL}/transform`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },

  async summarizeText(params) {
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },

  async checkGrammar(params) {
    const response = await fetch(`${API_BASE_URL}/grammar-check`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },

  async changeTone(params) {
    const response = await fetch(`${API_BASE_URL}/change-tone`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },

  // ------------------------------------------------------------------
  // History Endpoints
  // ------------------------------------------------------------------
  async getHistory(search = '', operation_type = 'all', page = 1, limit = 50) {
    const params = new URLSearchParams({ search, operation_type, page, limit });
    const response = await fetch(`${API_BASE_URL}/history?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getHistoryItem(id) {
    const response = await fetch(`${API_BASE_URL}/history/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async deleteHistoryItem(id) {
    const response = await fetch(`${API_BASE_URL}/history/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async clearHistory() {
    const response = await fetch(`${API_BASE_URL}/history/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ------------------------------------------------------------------
  // Settings Endpoints
  // ------------------------------------------------------------------
  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateSettings(settings) {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },

  // ------------------------------------------------------------------
  // Dashboard & Statistics
  // ------------------------------------------------------------------
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
