import axios from 'axios';
import useUserStore from '@/store/userStore';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the latest token
axiosInstance.interceptors.request.use(
  (config) => {
    const { token } = useUserStore.getState(); // Get token from Zustand
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
