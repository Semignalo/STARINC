import apiClient from './client';

export const adminApi = {
    getDashboard: async () => {
        const response = await apiClient.get('/admin/dashboard');
        return response.data;
    },

    getUsers: async (page = 1, search = '') => {
        const response = await apiClient.get('/admin/users', { params: { page, search } });
        return response.data;
    },

    getNetworkTree: async () => {
        const response = await apiClient.get('/admin/network');
        return response.data;
    },

    updateUserRole: async (id, role) => {
        const response = await apiClient.put(`/admin/users/${id}/role`, { role });
        return response.data;
    },

    getCommissions: async (page = 1, status = '') => {
        const params = { page };
        if (status) params.status = status;
        const response = await apiClient.get('/admin/commissions', { params });
        return response.data;
    },

    payCommission: async (id) => {
        const response = await apiClient.put(`/admin/commissions/${id}/pay`);
        return response.data;
    },

    getUserDetail: async (id) => {
        const response = await apiClient.get(`/admin/users/${id}`);
        return response.data;
    },

    updateUserPassword: async (id, password, passwordConfirmation) => {
        const response = await apiClient.put(`/admin/users/${id}/password`, {
            password,
            password_confirmation: passwordConfirmation
        });
        return response.data;
    },

    updateUserStatus: async (id, status) => {
        const response = await apiClient.put(`/admin/users/${id}/status`, { status });
        return response.data;
    },

    getUserCommissions: async (id, page = 1) => {
        const response = await apiClient.get(`/admin/users/${id}/commissions`, { params: { page } });
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await apiClient.delete(`/admin/users/${id}`);
        return response.data;
    },

    bulkPayCommissions: async (commissionIds) => {
        const response = await apiClient.post('/admin/commissions/bulk-pay', { commission_ids: commissionIds });
        return response.data;
    },

    exportOrders: async (params = {}) => {
        const response = await apiClient.get('/admin/orders/export', { params });
        return response.data;
    },

    exportCommissions: async () => {
        const response = await apiClient.get('/admin/commissions/export');
        return response.data;
    },

    getApplications: async (page = 1, status = '') => {
        const params = { page };
        if (status) params.status = status;
        const response = await apiClient.get('/admin/starcenter-applications', { params });
        return response.data;
    },

    getApplication: async (id) => {
        const response = await apiClient.get(`/admin/starcenter-applications/${id}`);
        return response.data;
    },

    approveApplication: async (id) => {
        const response = await apiClient.post(`/admin/starcenter-applications/${id}/approve`);
        return response.data;
    },

    rejectApplication: async (id, reason) => {
        const response = await apiClient.post(`/admin/starcenter-applications/${id}/reject`, { reason });
        return response.data;
    },

    getApplicationDocumentUrl: (id, field) =>
        `${import.meta.env.VITE_API_URL}/admin/starcenter-applications/${id}/document?field=${field}`,

    getStarcenters: async (search = '') => {
        const response = await apiClient.get('/admin/users', {
            params: { search, role: 'starcenter', per_page: 20 },
        });
        return response.data;
    },

    createOrderForUser: async (payload) => {
        const response = await apiClient.post('/admin/orders', payload);
        return response.data;
    },
};

export const userCommissionsApi = {
    getMyCommissions: async (page = 1) => {
        const response = await apiClient.get('/user/commissions', { params: { page } });
        return response.data;
    },

    getReferralLink: async () => {
        const response = await apiClient.get('/user/referral-link');
        return response.data;
    }
};
