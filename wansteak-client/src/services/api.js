import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    },
});

api.interceptors.request.use((config) => {
    // Take token from localStorage
    const token = localStorage.getItem('admin_token');

    // If token exists, insert into header Authorization
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;