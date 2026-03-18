import axios from 'axios';
import { API_URL } from '$env/static/private';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export const withAuth = (token: string | undefined) => {
    if (!token) return {};
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};


export default apiClient;