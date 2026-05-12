import { useState, useCallback } from 'react';
import { getErrorMessage } from '../api/client';

/**
 * Custom hook for standardized API call state management.
 * Handles loading, error, and data state consistently across the app.
 *
 * @param {Function} apiFn - The API function to call
 * @param {Object} options
 * @param {Function} [options.onSuccess] - Callback on success
 * @param {Function} [options.onError] - Callback on error
 * @param {*} [options.initialData] - Initial data value
 */
export function useApi(apiFn, options = {}) {
    const { onSuccess, onError, initialData = null } = options;
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiFn(...args);
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const message = getErrorMessage(err);
            setError(message);
            onError?.(err, message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFn, onSuccess, onError]);

    const reset = useCallback(() => {
        setData(initialData);
        setError(null);
        setLoading(false);
    }, [initialData]);

    return { data, loading, error, execute, reset, setData };
}

export default useApi;
