/**
 * Base API Client connecting the React Frontend to the Local Express Backend
 * The backend runs on port 5000 internally inside the Electron shell.
 */
const BASE_URL = 'http://localhost:5000/api';

export const apiClient = {
  async get(endpoint: string) {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error(`GET ${endpoint} failed with status ${res.status}`);
    return res.json();
  },
  
  async post(endpoint: string, body: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${endpoint} failed with status ${res.status}`);
    return res.json();
  },

  async patch(endpoint: string, body: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PATCH ${endpoint} failed with status ${res.status}`);
    return res.json();
  },

  async put(endpoint: string, body: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PUT ${endpoint} failed with status ${res.status}`);
    return res.json();
  },

  async delete(endpoint: string) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`DELETE ${endpoint} failed with status ${res.status}`);
    return res.json();
  }
};

export const eventsApi = {
  getAll: () => apiClient.get('/events'),
  create: (data: any) => apiClient.post('/events', data),
  update: (id: string | number, data: any) => apiClient.put(`/events/${id}`, data),
  delete: (id: string | number) => apiClient.delete(`/events/${id}`),
};
