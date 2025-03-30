import axios, { Axios, AxiosResponse, Method } from "axios";
import { z } from "zod";

import config from "@/config";
import {
  LicenceDetailedInfos,
  LicenceDetailedInfosSchema,
  MemberPublicInfos,
  MemberPublicInfosSchema,
} from "@/model/dtos";
import {
  HelperTask,
  HelperTaskCategories,
  HelperTaskCategoriesSchema,
  HelperTaskCreationRequest,
  HelperTaskMarkAsDoneRequest,
  HelperTaskSchema,
  HelperTaskUpdateRequest,
  HelperTaskValidationRequest,
  HelperTasks,
  HelperTasksSchema,
  HelpersAppPermissions,
  HelpersAppPermissionsSchema,
} from "@/model/helpers-dtos";

enum ClientErrorCode {
  Cancelled = "CANCELLED",
  Failed = "FAILED",
}

class ClientError<T = unknown> extends Error {
  readonly code: ClientErrorCode;

  constructor(message: string, cause: T, code: ClientErrorCode) {
    super(message);
    this.cause = cause;
    this.code = code;
    this.name = "ClientError";
  }
}

class Client {
  private readonly _http: Axios;

  constructor() {
    this._http = Client.initHttp();
  }

  private static initHttp(): Axios {
    const http = axios.create({
      baseURL: config.yccHullUrl,
    });

    http.interceptors.request.use(
      (config) => {
        const token = window.oauth2Token;
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error: Error) => {
        return Promise.reject(error);
      },
    );

    return http;
  }

  //
  // Helpers
  //
  getHelpersAppPermissions = async (signal?: AbortSignal) =>
    await this.getData<HelpersAppPermissions>(
      HelpersAppPermissionsSchema,
      "/api/v1/helpers/permissions",
      null,
      signal,
    );

  getHelperTaskCategories = async (signal?: AbortSignal) =>
    await this.getData<HelperTaskCategories>(
      HelperTaskCategoriesSchema,
      "/api/v1/helpers/task-categories",
      null,
      signal,
    );

  getHelperTasks = async (year: number | null = null, signal?: AbortSignal) =>
    await this.getData<HelperTasks>(
      HelperTasksSchema,
      "/api/v1/helpers/tasks",
      { year: year },
      signal,
    );

  getHelperTaskById = async (id: number, signal?: AbortSignal) =>
    await this.getData<HelperTask>(
      HelperTaskSchema,
      `/api/v1/helpers/tasks/${id}`,
      null,
      signal,
    );

  createHelperTask = async (
    task: HelperTaskCreationRequest,
    signal?: AbortSignal,
  ) =>
    await this.postForData<HelperTask, HelperTaskCreationRequest>(
      HelperTaskSchema,
      "/api/v1/helpers/tasks",
      null,
      task,
      signal,
    );

  updateHelperTask = async (
    id: number,
    task: HelperTaskUpdateRequest,
    signal?: AbortSignal,
  ) =>
    await this.putForData<HelperTask, HelperTaskUpdateRequest>(
      HelperTaskSchema,
      `/api/v1/helpers/tasks/${id}`,
      null,
      task,
      signal,
    );

  signUpForHelperTaskAsCaptain = async (id: number, signal?: AbortSignal) =>
    await this.postForData<HelperTask, object>(
      HelperTaskSchema,
      `/api/v1/helpers/tasks/${id}/sign-up-as-captain`,
      null,
      {},
      signal,
    );

  signUpForHelperTaskAsHelper = async (id: number, signal?: AbortSignal) =>
    await this.postForData<HelperTask, object>(
      HelperTaskSchema,
      `/api/v1/helpers/tasks/${id}/sign-up-as-helper`,
      null,
      {},
      signal,
    );

  markHelperTaskAsDone = async (
    id: number,
    request: HelperTaskMarkAsDoneRequest,
    signal?: AbortSignal,
  ) =>
    await this.postForData<HelperTask, object>(
      HelperTaskSchema,
      `/api/v1/helpers/tasks/${id}/mark-as-done`,
      null,
      request,
      signal,
    );

  validateHelperTask = async (
    id: number,
    request: HelperTaskValidationRequest,
    signal?: AbortSignal,
  ) =>
    await this.postForData<HelperTask, object>(
      HelperTaskSchema,
      `/api/v1/helpers/tasks/${id}/validate`,
      null,
      request,
      signal,
    );

  //
  // Licences
  //
  getLicenceInfos = async (signal?: AbortSignal) =>
    await this.getData<LicenceDetailedInfos>(
      LicenceDetailedInfosSchema,
      "/api/v1/licence-infos",
      null,
      signal,
    );

  //
  // Members
  //
  getMembers = async (year: number, signal?: AbortSignal) =>
    await this.getData<MemberPublicInfos>(
      MemberPublicInfosSchema,
      "/api/v1/members",
      { year: year },
      signal,
    );

  //
  // General
  //
  private readonly getData = async <T>(
    schema: z.ZodType,
    path: string,
    params: unknown,
    signal?: AbortSignal,
  ) => {
    const response = await this.get<T>(path, params, signal);
    return schema.parse(response.data) as T;
  };

  private readonly get = async <T>(
    path: string,
    params: unknown,
    signal?: AbortSignal,
  ) => await this.request<T, undefined>("GET", path, params, undefined, signal);

  private readonly postForData = async <T, D = T>(
    schema: z.ZodType,
    path: string,
    params: unknown,
    requestData: D,
    signal?: AbortSignal,
  ) => {
    const response = await this.post<T, D>(path, params, requestData, signal);
    return schema.parse(response.data) as T;
  };

  private readonly post = async <T, D = T>(
    path: string,
    params: unknown,
    requestData: D,
    signal?: AbortSignal,
  ) => await this.request<T, D>("POST", path, params, requestData, signal);

  private readonly putForData = async <T, D = T>(
    schema: z.ZodType,
    path: string,
    params: unknown,
    requestData: D,
    signal?: AbortSignal,
  ) => {
    const response = await this.put<T, D>(path, params, requestData, signal);
    return schema.parse(response.data) as T;
  };

  private readonly put = async <T, D = T>(
    path: string,
    params: unknown,
    requestData: D,
    signal?: AbortSignal,
  ) => await this.request<T, D>("PUT", path, params, requestData, signal);

  private readonly request = async <T, D = T>(
    method: Method,
    path: string,
    params?: unknown,
    requestData?: D,
    signal?: AbortSignal,
  ) => {
    console.debug(`[client] ${method} ${path} ...`, params);

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
        `[client] ${method} ${path} - ${response.status} ${response.statusText}`,
      );

      return response;
    } catch (error) {
      throw this.handleError(method, path, error);
    }
  };

  private readonly handleError = (
    method: string,
    path: string,
    error: unknown,
  ): ClientError => {
    if (axios.isCancel(error)) {
      console.debug("[client] Request cancelled", method.toUpperCase(), path);

      throw new ClientError(
        "Request cancelled",
        error,
        ClientErrorCode.Cancelled,
      );
    } else {
      console.error(
        "[client] Request failed",
        method.toUpperCase(),
        path,
        error,
      );
      throw new ClientError("Request failed", error, ClientErrorCode.Failed);
    }
  };
}

const client = new Client();

export default client;
