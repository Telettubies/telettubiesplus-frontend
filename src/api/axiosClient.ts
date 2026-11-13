import axios from 'axios';
import { attachInterceptors } from './interceptors';
import { getEnvVar } from '@/shared/utils/mockSwitch';

const baseURL = getEnvVar('VITE_API_BASE_URL') || 'http://localhost:8000/api';

export const axiosClient = axios.create({
  baseURL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

attachInterceptors(axiosClient);
