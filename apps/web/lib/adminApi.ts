import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Backend ilə cookie (HttpOnly) mübadiləsi üçün
});

// Access token yaddaşda saxlanılır (React state vasitəsilə)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

adminApi.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // HttpOnly cookie avtomatik göndəriləcək
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        
        if (data.success && data.data.accessToken) {
          const newToken = data.data.accessToken;
          setAccessToken(newToken);

          // Yeni token ilə sorğunu yenidən göndər
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return adminApi(originalRequest);
        }
      } catch (refreshError) {
        setAccessToken(null);
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;
