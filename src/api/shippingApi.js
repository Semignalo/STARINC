import apiClient from './client';

export const shippingApi = {
    getProvinces: async () => {
        const response = await apiClient.get('/shipping/provinces');
        return response.data;
    },

    getCities: async (provinceId) => {
        const response = await apiClient.get(`/shipping/cities/${provinceId}`);
        return response.data;
    },

    getCost: async (cityId, items) => {
        const response = await apiClient.post('/shipping/cost', { city_id: cityId, items });
        return response.data;
    },
};
