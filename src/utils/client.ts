import axios, {Axios, Method} from 'axios';
import {MemberPublicInfos} from 'model/dtos';

// TODO Move to config
const BACKEND_ROOT_URL = 'http://localhost:8000';

enum ClientErrorCode {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
}

class ClientError<T = unknown> extends Error {
  readonly code: ClientErrorCode;

  constructor(message: string, cause: T, code: ClientErrorCode) {
    super(message, {cause: cause});
    this.code = code;
  }
}

class Client {
  private _http: Axios;

  constructor() {
    this._http = Client.initHttp();
  }

  private static initHttp(): Axios {
    const http = axios.create({
      baseURL: BACKEND_ROOT_URL,
    });

    http.interceptors.request.use(
      config => {
        const token = window.oauth2Token;
        if (token) {
          config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    return http;
  }

  getMembers = (year?: number, signal?: AbortSignal) =>
    this.getData<MemberPublicInfos>('/api/v0/members', {year: year}, signal);

  private getData = async <T>(
    path: string,
    params?: unknown,
    signal?: AbortSignal
  ) => (await this.get<T>(path, params, signal)).data;

  private get = <T>(path: string, params?: unknown, signal?: AbortSignal) =>
    this.request<T>('GET', path, params, undefined, signal);

  private request = async <T>(
    method: Method,
    path: string,
    params?: unknown,
    requestData?: T,
    signal?: AbortSignal
  ) => {
    console.debug(`[client] ${method} ${path} ...`);

    try {
      const request = this._http.request<T>({
        method: method,
        url: path,
        params: params,
        data: requestData,
        signal: signal,
      });

      const response = await request;

      console.debug(
        `[client] ${method} ${path} - ${response.status} ${response.statusText}`
      );

      return response;
    } catch (error) {
      throw this.handleError(method, path, error);
    }
  };

  private handleError = (method: string, path: string, error: unknown) => {
    if (axios.isCancel(error)) {
      console.debug('[client] Request cancelled', method.toUpperCase(), path);

      throw new ClientError(
        'Request cancelled',
        error,
        ClientErrorCode.Cancelled
      );
    } else {
      console.error(
        '[client] Request failed',
        method.toUpperCase(),
        path,
        error
      );
      throw new ClientError('Request failed', error, ClientErrorCode.Failed);
    }
  };
}

const client = new Client();

export default client;
