import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

// 1. Create the instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://auth.feelora-dev.com', // Set this in the .env file
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add the "Request Interceptor" to inject the token into headers before each request
// Before any request is sent, this function runs.
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // A. Get the current valid session from Amplify
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      // B. If there is a token, inject it into the headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching auth session', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. (Optional) Add a "Response Interceptor" for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      console.warn('Unauthorized! Redirecting to login...');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
