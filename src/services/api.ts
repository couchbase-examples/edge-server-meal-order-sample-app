export const api = {
  fetch: async (endpoint: string, options: RequestInit = {}) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa('seatuser:password'),
    };

    const response = await fetch(`${endpoint}`, {
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