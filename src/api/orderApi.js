import apiClient from './client';

export const orderApi = {
    checkout: async (data) => {
        // data: { customer_info: {name, phone, address, city, postal_code}, items: [{product_id, variant_id, quantity}] }
        const response = await apiClient.post('/checkout', data);
        return response.data;
    },

    getMyOrders: async (page = 1) => {
        const response = await apiClient.get('/user/orders', { params: { page } });
        return response.data; // returns paginated data
    },

    getInvoice: async (orderNumber) => {
        const response = await apiClient.get(`/orders/${orderNumber}/invoice`);
        return response.data;
    },

    cancelOrder: async (orderNumber) => {
        const response = await apiClient.post(`/orders/${orderNumber}/cancel`);
        return response.data;
    },

    uploadPaymentProof: async (orderId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiClient.post(`/orders/${orderId}/payment-proof`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

export const adminOrderApi = {
    getOrders: async (params = {}) => {
        const response = await apiClient.get('/admin/orders', { params });
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await apiClient.put(`/admin/orders/${id}/status`, { status });
        return response.data;
    },

    reviewPayment: async (id, status, notes = '') => {
        const response = await apiClient.put(`/admin/orders/${id}/payment`, { status, notes });
        return response.data;
    },

    updateTracking: async (id, trackingNumber, shippingProvider = '') => {
        const response = await apiClient.put(`/admin/orders/${id}/tracking`, {
            tracking_number: trackingNumber,
            shipping_provider: shippingProvider
        });
        return response.data;
    }
};
