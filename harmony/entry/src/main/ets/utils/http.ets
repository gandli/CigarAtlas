/**
 * HTTP 请求工具类
 */
import http from '@ohos.net.http';

export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  data?: object;
  timeout?: number;
}

export interface Response<T> {
  code: number;
  message: string;
  data: T;
}

const BASE_URL = 'https://api.cigaratlas.com/v1';
const DEFAULT_TIMEOUT = 30000;

/**
 * 发起 HTTP 请求
 */
export async function request<T>(config: RequestConfig): Promise<Response<T>> {
  const httpRequest = http.createHttp();

  try {
    const url = config.url.startsWith('http') ? config.url : BASE_URL + config.url;
    const method = config.method || 'GET';
    const timeout = config.timeout || DEFAULT_TIMEOUT;

    const response = await httpRequest.request(url, {
      method: method === 'GET' ? http.RequestMethod.GET :
             method === 'POST' ? http.RequestMethod.POST :
             method === 'PUT' ? http.RequestMethod.PUT :
             http.RequestMethod.DELETE,
      header: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      extraData: config.data ? JSON.stringify(config.data) : undefined,
      connectTimeout: timeout,
      readTimeout: timeout
    });

    if (response.responseCode === 200) {
      return JSON.parse(response.result as string) as Response<T>;
    } else {
      throw new Error(`HTTP Error: ${response.responseCode}`);
    }
  } finally {
    httpRequest.destroy();
  }
}

/**
 * GET 请求
 */
export async function get<T>(url: string, headers?: Record<string, string>): Promise<Response<T>> {
  return request<T>({ url, method: 'GET', headers });
}

/**
 * POST 请求
 */
export async function post<T>(url: string, data: object, headers?: Record<string, string>): Promise<Response<T>> {
  return request<T>({ url, method: 'POST', data, headers });
}

/**
 * PUT 请求
 */
export async function put<T>(url: string, data: object, headers?: Record<string, string>): Promise<Response<T>> {
  return request<T>({ url, method: 'PUT', data, headers });
}

/**
 * DELETE 请求
 */
export async function del<T>(url: string, headers?: Record<string, string>): Promise<Response<T>> {
  return request<T>({ url, method: 'DELETE', headers });
}