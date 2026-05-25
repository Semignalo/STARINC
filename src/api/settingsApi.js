import apiClient from './client';

export const settingsApi = {
    getAppearance: async () => {
        const response = await apiClient.get('/appearance');
        return response.data;
    },

    getPaymentInfo: async () => {
        const response = await apiClient.get('/settings/payment');
        return response.data;
    },

    getSystemSettings: async () => {
        const response = await apiClient.get('/settings/system');
        return response.data;
    }
};

export const testimonialsApi = {
    getAll: () => apiClient.get('/testimonials').then(r => r.data),
};

export const adminTestimonialsApi = {
    getAll:   ()       => apiClient.get('/admin/testimonials').then(r => r.data),
    create:   (data)   => apiClient.post('/admin/testimonials', data).then(r => r.data),
    update:   (id, d)  => apiClient.put(`/admin/testimonials/${id}`, d).then(r => r.data),
    remove:   (id)     => apiClient.delete(`/admin/testimonials/${id}`).then(r => r.data),
    reorder:  (items)  => apiClient.put('/admin/testimonials/reorder', { items }).then(r => r.data),
};

export const adminSettingsApi = {
    getSettings: async () => {
        const response = await apiClient.get('/admin/settings');
        return response.data;
    },

    updateSettings: async (settings) => {
        const response = await apiClient.put('/admin/settings', { settings });
        return response.data;
    },

    getAppearance: async () => {
        const response = await apiClient.get('/admin/appearance');
        return response.data;
    },

    updateAppearance: async (settings) => {
        const response = await apiClient.put('/admin/appearance', { settings });
        return response.data;
    },

    /**
     * Upload file (video/image) ke Laravel storage.
     * Mengembalikan { url: string } berisi public URL file yang diupload.
     * @param {File} file - File object dari input
     * @param {string} folder - Subfolder di storage (e.g. 'appearance')
     * @param {function} onProgress - Callback (percent: number) => void
     */
    uploadFile: async (file, folder = 'appearance', onProgress = null, driver = null) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        if (driver) formData.append('driver', driver);

        const response = await apiClient.post('/admin/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            },
        });
        return response.data;
    },
};
