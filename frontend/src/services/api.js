import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || '';
const cleanUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

const api = axios.create({
    baseURL: cleanUrl ? `${cleanUrl}/api` : '/api',
});

// Interceptor untuk menyematkan JWT Token pada setiap request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor untuk merespons token kadaluarsa (401)
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        // Jika unauthorized, hapus token dan kembali ke login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default api;
