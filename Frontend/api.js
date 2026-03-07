import axios from 'axios';

// Create an instance of axios with a base URL
const API = axios.create({
    baseURL: 'http://localhost:8000/api',
});

// Add a request interceptor to include the auth token in headers
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If the error is 401 (Unauthorized) and it's not from a login or register request
        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath.includes('/Login') || currentPath.includes('/Register') || currentPath.includes('/admin-login');

            if (!isAuthPage) {
                console.warn('Session expired or invalid. Clearing auth data.');
                // Clear authentication data from both storages
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('userRole');
                sessionStorage.removeItem('loginTime');

                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                localStorage.removeItem('loginTime');
            }
        }
        return Promise.reject(error);
    }
);

export default API;
