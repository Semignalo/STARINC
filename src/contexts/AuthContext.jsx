/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const signup = useCallback(async (userData) => {
        const data = await authApi.register({
            ...userData,
            password_confirmation: userData.password,
        });
        // Register no longer returns a token — user must verify email first
        return data; // { message, email }
    }, []);

    const login = useCallback(async (email, password) => {
        const data = await authApi.login(email, password);
        localStorage.setItem('auth_token', data.token);
        setCurrentUser(data.user);
        setUserData(data.user);
        setUserRole(data.user.role || 'regular');
        return data.user;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (e) {
            console.error('Logout failed on backend:', e);
        } finally {
            localStorage.removeItem('auth_token');
            setCurrentUser(null);
            setUserData(null);
            setUserRole(null);
        }
    }, []);

    const updateProfile = useCallback(async (data) => {
        const response = await authApi.updateProfile(data);
        setUserData(response.user);
        setCurrentUser(response.user);
    }, []);

    const updatePasswordAction = useCallback(async (currentPassword, newPassword) => {
        await authApi.updatePassword({
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: newPassword
        });
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const data = await authApi.getProfile();
                    setCurrentUser(data.user);
                    setUserData(data.user);
                    setUserRole(data.user.role || 'regular');
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                    localStorage.removeItem('auth_token');
                    setCurrentUser(null);
                    setUserData(null);
                    setUserRole(null);
                }
            }
            setLoading(false);
        };
        fetchProfile();

        // Re-validate token when user returns to tab after being away
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    try {
                        const data = await authApi.getProfile();
                        setCurrentUser(data.user);
                        setUserData(data.user);
                        setUserRole(data.user.role || 'regular');
                    } catch (error) {
                        console.error("Token re-validation failed", error);
                        localStorage.removeItem('auth_token');
                        setCurrentUser(null);
                        setUserData(null);
                        setUserRole(null);
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const value = useMemo(() => ({
        currentUser,
        userData,
        userRole,
        signup,
        login,
        logout,
        updateProfile,
        updatePassword: updatePasswordAction
    }), [currentUser, userData, userRole, signup, login, logout, updateProfile, updatePasswordAction]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
