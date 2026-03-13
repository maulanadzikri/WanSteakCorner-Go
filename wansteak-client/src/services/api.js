import axios from 'axios';
import toast from 'react-hot-toast'

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

api.interceptors.response.use(
    (response) => {
        return response; // If the response succesful, just return as usual 
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // 1. Remove expired token
            localStorage.removeItem('admin_token');

            // 2. Tell the use to relog
            toast.error("Sesi Anda telah berakhir. Silakan login kembali.", {
                id: 'unauthorized-toast',
                duration: 4000,
            });

            // 3. Redirect to login page
            if (window.location.pathname !== '/login') {
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            }
        }

        return Promise.reject(error);   
    }
)

export default api;