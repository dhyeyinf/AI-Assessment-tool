// utils/axiosConfig.ts
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000', // Replace with your backend URL
    withCredentials: true, // If your backend uses cookies, keep this
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
