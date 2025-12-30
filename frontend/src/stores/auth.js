import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'admin'
    },
    actions: {
        async login(email, password) {
            try {
                const response = await api.post('/login', { email, password });
                this.token = response.data.accessToken;
                this.user = {
                    id: response.data.id,
                    email: response.data.email,
                    role: response.data.role
                };

                localStorage.setItem('token', this.token);
                localStorage.setItem('user_role', this.user.role);

                return true;
            } catch (error) {
                console.error("Login failed", error);
                return false;
            }
        },
        async register(email, password) {
            try {
                await api.post('/register', { email, password });
                return true;
            } catch (error) {
                throw error.response.data.message;
            }
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
        }
    }
});