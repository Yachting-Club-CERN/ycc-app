import axios, {Axios, AxiosError, AxiosResponse, Method} from 'axios';
import config from 'config';
import {LicenceDetailedInfos, MemberPublicInfos} from 'model/dtos';
import {
  HelperTask,
  HelperTaskCategories,
  HelperTaskCreationRequestDto,
  HelperTasks,
} from 'model/helpers-dtos';

enum ClientErrorCode {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
}

class ClientError<T = unknown> extends Error {
  readonly code: ClientErrorCode;

  constructor(message: string, cause: T, code: ClientErrorCode) {
    super(message);
    this.cause = cause;
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
      baseURL: config.yccHullUrl,
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

  //
  // Helpers
  //
  getHelperTaskCategories = async (signal?: AbortSignal) =>
    await this.getData<HelperTaskCategories>(
      '/api/v0/helpers/task-categories',
      null,
      signal
    );

  getHelperTasks = async (signal?: AbortSignal) =>
    await this.getData<HelperTasks>('/api/v0/helpers/tasks', null, signal);

  getHelperTaskById = async (id: number, signal?: AbortSignal) =>
    await this.getData<HelperTask>(`/api/v0/helpers/tasks/${id}`, null, signal);

  createHelperTask = async (
    task: HelperTaskCreationRequestDto,
    signal?: AbortSignal
  ) =>
    await this.postForData<HelperTask, HelperTaskCreationRequestDto>(
      '/api/v0/helpers/tasks',
      null,
      task,
      signal
    );

  subscribeToHelperTaskAsCaptain = async (id: number, signal?: AbortSignal) =>
    await this.postForData<HelperTask, {}>(
      `/api/v0/helpers/tasks/${id}/subscribe-as-captain`,
      null,
      {},
      signal
    );

  subscribeToHelperTaskAsHelper = async (id: number, signal?: AbortSignal) =>
    await this.postForData<HelperTask, {}>(
      `/api/v0/helpers/tasks/${id}/subscribe-as-helper`,
      null,
      {},
      signal
    );

  //
  // Licences
  //
  getLicenceInfos = async (signal?: AbortSignal) =>
    await this.getData<LicenceDetailedInfos>(
      '/api/v0/licence-infos',
      null,
      signal
    );

  //
  // Members
  //
  getMembers = async (year: number, signal?: AbortSignal) =>
    await this.getData<MemberPublicInfos>(
      '/api/v0/members',
      {year: year},
      signal
    );

  //
  // General
  //
  private getData = async <T>(
    path: string,
    params: unknown,
    signal?: AbortSignal
  ) => (await this.get<T>(path, params, signal)).data;

  private get = async <T>(
    path: string,
    params: unknown,
    signal?: AbortSignal
  ) => await this.request<T, undefined>('GET', path, params, undefined, signal);

  private postForData = async <T, D = T>(
    path: string,
    params: unknown,
    requestData: D,
    signal?: AbortSignal
  ) => (await this.post<T, D>(path, params, requestData, signal)).data;

  private post = async <T, D = T>(
    path: string,
    params: unknown,
    requestData: D,
    signal?: AbortSignal
  ) => await this.request<T, D>('POST', path, params, requestData, signal);

  private request = async <T, D = T>(
    method: Method,
    path: string,
    params?: unknown,
    requestData?: D,
    signal?: AbortSignal
  ) => {
    console.debug(`[client] ${method} ${path} ...`);

    try {
      const request = this._http.request<T, AxiosResponse<T>, D>({
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
