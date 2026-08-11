import axios, { type InternalAxiosRequestConfig } from 'axios';

const SLOW_REQUEST_THRESHOLD_MS = 300;

// WeakMap to track request start times without polluting axios config objects
const requestStartTimes = new WeakMap<InternalAxiosRequestConfig, number>();

const client = axios.create({
  baseURL: '/api',
  withCredentials: true, // Crucial for session cookies
});

// Request Interceptor: Add Authorization header and start timing
client.interceptors.request.use(
  (config) => {
    requestStartTimes.set(config, Date.now());
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      // console.log("[API Client] Auth status checked");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("[API Client] Authorization header attached");
      } else {
        console.warn("[API Client] No access token found in localStorage");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Log timing and handle errors
client.interceptors.response.use(
  (response) => {
    const start = requestStartTimes.get(response.config);
    if (start !== undefined) {
      const duration = Date.now() - start;
      const method = (response.config.method || 'GET').toUpperCase();
      const url = response.config.url || '';
      const msg = `[PERF][API] ${method} ${url} - ${duration}ms`;
      if (duration >= SLOW_REQUEST_THRESHOLD_MS) {
        console.warn(msg);
      } else {
        console.info(msg);
      }
    }
    return response;
  },
  (error) => {
    // If we get a 401, it means the session is invalid/expired
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Optional: Redirect to login or let the component handle it
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;
export const setAccessToken = (token: string) => {}; // Legacy shim
export const getAccessToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("accessToken");
    }
    return null;
};
