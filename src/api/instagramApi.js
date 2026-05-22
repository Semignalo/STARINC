import apiClient from './client';

/**
 * Instagram API client — wrapper untuk endpoint /api/instagram/*
 */
export const instagramApi = {
    /**
     * Public: 5 post terbaru. Return:
     *   { configured: boolean, posts: Array<{id,type,image,video,permalink,caption,timestamp}> }
     */
    getPosts: async (limit = 5) => {
        const { data } = await apiClient.get('/instagram/posts', { params: { limit } });
        return data;
    },

    /** Admin: paksa refresh cache + fetch ulang */
    refresh: async () => {
        const { data } = await apiClient.post('/instagram/refresh');
        return data;
    },

    /** Admin: cek status token (valid/expired/error) */
    status: async () => {
        const { data } = await apiClient.get('/instagram/status');
        return data;
    },
};
