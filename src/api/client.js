import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    withCredentials: true, // For Sanctum CSRF cookies
});

// Interceptor: Inject token automatically
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor: Handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // 401: Token expired / not authenticated → redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }

        // 403: Access forbidden
        if (error.response?.status === 403) {
            import('sweetalert2').then(({ default: Swal }) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Akses Ditolak',
                    text: 'Anda tidak memiliki izin untuk mengakses resource ini.'
                });
            });
        }

        // 422: Validation errors → attach flat error messages to error object
        if (error.response?.status === 422) {
            const errors = error.response.data?.errors || {};
            // Flatten: { field: ["msg1","msg2"] } → "msg1\nmsg2"
            const firstMessages = Object.values(errors).map(msgs => msgs[0]);
            error.validationMessage = firstMessages.join('\n') || error.response.data?.message || 'Validasi gagal.';
            error.validationErrors = errors;
        }

        // 500+: Server error
        if (error.response?.status >= 500) {
            import('sweetalert2').then(({ default: Swal }) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Server Error',
                    text: 'Terjadi kesalahan di server. Silakan coba lagi nanti.'
                });
            });
        }

        return Promise.reject(error);
    }
);

/**
 * Extract a user-friendly error message from an Axios error.
 * Priority: validation message → response message → fallback
 */
export function getErrorMessage(error, fallback = 'Terjadi kesalahan. Silakan coba lagi.') {
    if (error?.validationMessage) return error.validationMessage;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return fallback;
}

export default apiClient;
