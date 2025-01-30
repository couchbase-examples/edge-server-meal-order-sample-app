const BASE_URL = import.meta.env.DEV
  ? '' 
  : import.meta.env.VITE_API_BASE_URL;

export const api = {
  fetch: async (endpoint: string, options: RequestInit = {}) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa('seatuser:password'),
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};