import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import { useAuthStore } from '@/store';

const defaultBaseURL = '/api';

const toLoginPage = () => {
  const { pathname, search } = window.location;
  if (pathname === '/login') return;
  const fromPath = encodeURIComponent(`${pathname}${search}`);
  window.location.replace(`/login?from=${fromPath}`);
};

const toForbiddenPage = () => window.location.replace('/403');

const noticeError = (config?: AxiosRequestConfig, msg: string = '请求失败') => {
  let isSilent = false;
  if (config) {
    isSilent = !!(config.headers && config.headers.silent);
    if (!isSilent) {
      message.error(msg);
    }
  } else {
    message.error(msg);
  }
};

const querystringify = (obj: Record<string, any>) => {
  return Object.keys(obj)
    .filter(key => obj[key] !== undefined)
    .map(key => `${key}=${encodeURIComponent(obj[key])}`)
    .join('&');
};

class Request {
  private instance: AxiosInstance;

  constructor(baseURL: string = defaultBaseURL) {
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      paramsSerializer: {
        serialize: (params: Record<string, any>) => {
          return querystringify(params);
        },
      },
    });

    this.instance.interceptors.request.use(
      (config) => {
        const { token } = useAuthStore.getState();
        if (token) {
          config.headers['X-JWT'] = token;
        }

        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data: responseData, config } = response
        if (config.responseType === 'arraybuffer') return responseData;

        const contentType = response.headers['content-type'];
        if (contentType === 'application/octet-stream') {
          return responseData;
        }

        const { data, code, msg } = responseData;

        // Compatible with non-standard response structure (no code field)
        // e.g. OpenAI compatible API or raw agent output
        if (code === undefined) {
          return Promise.resolve(responseData);
        }

        if (code !== 0) {
          noticeError(config, msg);
          return Promise.reject(new Error(msg));
        }

        return Promise.resolve(data);
      },
      (err: AxiosError) => {
        if (err.code === 'ECONNABORTED'
          && err.message.includes('timeout')
        ) {
          noticeError(err.config, '请求超时，请稍后重试');
          return Promise.reject(err);
        }

        if (err.response) {
          const { status, data } = err.response;
          if (status === 401) {
            const isLogout = err.config?.url?.includes('/auth/logout');
            if (!isLogout) {
              try {
                const { logout } = useAuthStore.getState();
                logout();
              } catch {}
              toLoginPage();
            }
          }
          else if (status === 403) {
            toForbiddenPage();
          }
          else {
            noticeError(err.config, (data as any)?.message ?? (data as any)?.msg);
          }
        } else {
          noticeError(err.config, err.message);
        }
        return Promise.reject(err);
      }
    );
  }

  request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request(config);
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const params = { ...config?.params, _t: Date.now() };
    return this.request({ ...config, params, url, method: 'GET' });
  }

  del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, url, method: 'DELETE' });
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, url, method: 'DELETE' });
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, url, method: 'POST', data });
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, url, method: 'PUT', data });
  }
}

const request = new Request();

export { request, Request };
