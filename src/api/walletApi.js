import apiClient from './client';

export const walletApi = {
    getWallet: async (page = 1) => {
        const response = await apiClient.get('/user/wallet', { params: { page } });
        return response.data;
    },

    requestWithdrawal: async (data) => {
        const response = await apiClient.post('/user/wallet/withdraw', data);
        return response.data;
    },
};
