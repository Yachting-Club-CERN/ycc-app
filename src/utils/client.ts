import axios, {Axios, AxiosResponse, Method} from 'axios';
import config from 'config';
import {
  LicenceDetailedInfos,
  LicenceDetailedInfosSchema,
  MemberPublicInfos,
  MemberPublicInfosSchema,
} from 'model/dtos';
import {
  HelperTask,
  HelperTaskCategories,
  HelperTaskCategoriesSchema,
  HelperTaskMutationRequestDto,
  HelperTaskSchema,
  HelperTasks,
  HelperTasksSchema,
} from 'model/helpers-dtos';
import {z} from 'zod';

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
      HelperTaskCategoriesSchema,
      '/api/v1/helpers/task-categories',
      null,
      signal
    );

  getHelperTasks = async (signal?: AbortSignal) =>
    await this.getData<HelperTasks>(
      HelperTasksSchema,
      '/api/v1/helpers/tasks',
      null,
      signal
    );

  getHelperTaskById = async (id: number, signal?: AbortSignal) =>
    await this.getData<HelperTask>(
      HelperTaskSchema,
      `/api/v1/helpers/tasks/${id}`,
      null,
      signal
    );

  createHelperTask = async (
    task: HelperTaskMutationRequestDto,
    signal?: AbortSignal
  ) =>
    await this.postForData<HelperTask, HelperTaskMutationRequestDto>(
      HelperTaskSchema,
      '/api/v1/helpers/tasks',
      null,
      task,
      signal
    );

  updateHelperTask = async (
    id: number,
    task: HelperTaskMutationRequestDto,
    signal?: AbortSignal
  ) =>
    await this.putForData<HelperTask, HelperTaskMutationRequestDto>(
      HelperTaskSchema,
      `/api/v1/helpers/tasks/${id}`,
      null,
      task,
      signal
    );

  signUpForHelperTaskAsCaptain = async (id: number, signal?: AbortSignal) =>
    await this.postForData<HelperTask, {}>(
      HelperTaskSchema,
      `/api/v1/helpers/tasks/${id}/sign-up-as-captain`,
      null,
      {},
      signal
    );

  signUpForHelperTaskAsHelper = async (id: number, signal?: AbortSignal) =>
    await this.postForData<HelperTask, {}>(
      HelperTaskSchema,
      `/api/v1/helpers/tasks/${id}/sign-up-as-helper`,
      null,
      {},
      signal
    );

  //
  // Licences
  //
  getLicenceInfos = async (signal?: AbortSignal) =>
    await this.getData<LicenceDetailedInfos>(
      LicenceDetailedInfosSchema,
      '/api/v1/licence-infos',
      null,
      signal
    );

  //
  // Members
  //
  getMembers = async (year: number, signal?: AbortSignal) =>
    await this.getData<MemberPublicInfos>(
      MemberPublicInfosSchema,
      '/api/v1/members',
      {year: year},
      signal
    );

  //
  // General
  //
  private getData = async <T>(
    schema: z.ZodType,
    path: string,
    params: unknown,
    signal?: AbortSignal
  ): Promise<T> => {
    const response = await this.get<T>(path, params, signal);
    return schema.parse(response.data);
  };

  private get = async <T>(
    path: string,
    params: unknown,
    signal?: AbortSignal
  ) => await this.request<T, undefined>('GET', path, params, undefined, signal);

  private postForData = async <T, D = T>(
    schema: z.ZodType,
    path: string,
    params: unknown,
    requestData: D,
    signal?: AbortSignal
  ) => {
    const response = await this.post<T, D>(path, params, requestData, signal);
    return schema.parse(response.data);
  };

  private post = async <T, D = T>(
    path: string,
    params: unknown,
    requestData: D,
    signal?: AbortSignal
  ) => await this.request<T, D>('POST', path, params, requestData, signal);

  private putForData = async <T, D = T>(
    schema: z.ZodType,
    path: string,
    params: unknown,
    requestData: D,
    signal?: AbortSignal
  ) => {
    const response = await this.put<T, D>(path, params, requestData, signal);
    return schema.parse(response.data);
  };

  private put = async <T, D = T>(
    path: string,
    params: unknown,
    requestData: D,
    signal?: AbortSignal
  ) => await this.request<T, D>('PUT', path, params, requestData, signal);

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
