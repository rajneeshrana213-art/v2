import axios from 'axios';

export const axiosInstance = axios.create({});

export function apiConnector<TResponse = unknown>(
  method: string,
  url: string,
  bodyData?: unknown,
  headers?: Record<string, string>,
  params?: Record<string, string | number | boolean | undefined | null>,
) {
  return axiosInstance<TResponse>({
    method,
    url,
    data: bodyData ?? undefined,
    headers,
    params: params ?? undefined,
  });
}

