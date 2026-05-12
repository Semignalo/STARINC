import apiClient from './client';

export const authApi = {
    // Before authenticating with Sanctum, it's generally good practice to hit the CSRF cookie endpoint,
    // though for stateless tokens it might not be strictly necessary depending on Laravel config. 
    // We'll call login directly to get the Sanctum Token.
    
    login: async (email, password) => {
        const response = await apiClient.post('/login', { email, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await apiClient.post('/register', userData);
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post('/logout');
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get('/user/profile');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await apiClient.put('/user/profile', data);
        return response.data;
    },

    updatePassword: async (data) => {
        const response = await apiClient.put('/user/password', data);
        return response.data;
    },

    lookupReferral: async (code) => {
        const response = await apiClient.get(`/referral/${code}`);
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await apiClient.post('/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (data) => {
        const response = await apiClient.post('/reset-password', data);
        return response.data;
    },

    resendVerification: async (email) => {
        const response = await apiClient.post('/email/resend', { email });
        return response.data;
    },
};
