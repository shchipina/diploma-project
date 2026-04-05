import axios from 'axios';
import { generateTraceId } from '../utils/logger';
import logger from '../utils/logger';
import { getCurrentLanguage } from '../i18n/config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const traceId = generateTraceId();
    config.headers['X-Trace-ID'] = traceId;

    const language = getCurrentLanguage();
    config.headers['Accept-Language'] = language;

    logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      traceId,
      params: config.params,
    });

    return config;
  },
  (error) => {
    logger.error('API Request Error', error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    const traceId = response.headers['x-trace-id'];
    logger.debug(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      traceId,
    });

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const traceId = error.response?.headers?.['x-trace-id'];
    const errorData = error.response?.data;

    logger.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error, {
      status: error.response?.status,
      errorId: errorData?.errorId,
      errorCode: errorData?.errorCode,
      traceId,
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        logger.debug('Attempting to refresh access token');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        logger.info('Access token refreshed successfully');
        return api(originalRequest);
      } catch (refreshError) {
        logger.warn('Token refresh failed, redirecting to auth page');
        localStorage.removeItem('accessToken');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
