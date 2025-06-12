import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';
export const BASE_URL_IP = '127.0.0.1:8000';

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Needed for sending HttpOnly cookies
});

// Request interceptor to attach access token
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token is expired and this is the first retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Create a clean axios instance to refresh token (no interceptors)
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh-token/`,
          {},
          {
            withCredentials: true, // Include HttpOnly cookie
          }
        );
        const newAccessToken = refreshResponse.data.access;

        // Save new token and retry original request
        localStorage.setItem('access_token', newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return axios(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Utility to manually read a cookie
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

// API functions
export const postSignUp = (data: FormData) => {
  return api.post('auth/register/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const postLogin = (data: Record<string, any>) => {
  return api.post('auth/login/', data);
};

export const getConversationWithUser = async (userEmail) => {
  try {
    const response = await api.get(`conversations/with/${userEmail}/`);
    return response.data.id;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

export default api;
