import apiClient from './client';

export const productApi = {
    getProducts: async (params = {}) => {
        // params can include category, promo, search, page
        const response = await apiClient.get('/products', { params });
        return response.data; // returns paginated data: { data: [...], current_page: 1, ... }
    },

    getProduct: async (id) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    }
};

export const adminProductApi = {
    createProduct: async (data) => {
        const response = await apiClient.post('/admin/products', data);
        return response.data;
    },

    updateProduct: async (id, data) => {
        const response = await apiClient.put(`/admin/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await apiClient.delete(`/admin/products/${id}`);
        return response.data;
    },

    deleteMedia: async (productId, mediaId) => {
        const response = await apiClient.delete(`/admin/products/${productId}/media/${mediaId}`);
        return response.data;
    },

    reorderMedia: async (productId, order) => {
        const response = await apiClient.put(`/admin/products/${productId}/media/reorder`, { order });
        return response.data;
    },

    uploadMedia: async (id, files) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files[]', file));
        const response = await apiClient.post(`/admin/products/${id}/media`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    uploadPdf: async (id, file) => {
        const formData = new FormData();
        formData.append('pdf', file);
        const response = await apiClient.post(`/admin/products/${id}/pdf`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    removePdf: async (id) => {
        const response = await apiClient.delete(`/admin/products/${id}/pdf`);
        return response.data;
    },
};
