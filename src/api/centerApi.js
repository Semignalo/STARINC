import apiClient from './client';

export const centerApi = {
    checkCenterName: async (name) => {
        const response = await apiClient.get('/starcenter-applications/check-name', { params: { name } });
        return response.data;
    },

    submitApplication: async (formData) => {
        const response = await apiClient.post('/starcenter-applications', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};
