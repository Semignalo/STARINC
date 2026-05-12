import apiClient from './client';

export const networkApi = {
    getReferralInfo: async () => {
        const response = await apiClient.get('/user/referral-link');
        return response.data.data;
    },

    getCommissions: async (page = 1) => {
        const response = await apiClient.get(`/user/commissions?page=${page}`);
        return response.data;
    }
};
