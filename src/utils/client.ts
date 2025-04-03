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

class ClientError<TCause = unknown> extends Error {
  readonly code: ClientErrorCode;

  constructor(message: string, cause: TCause, code: ClientErrorCode) {
    super(message);
    this.cause = cause;
    this.code = code;
    this.name = "ClientError";
  }
}

type HttpRequest = {
  method: Method;
  path: string;
  params?: unknown;
  data?: unknown;
  responseSchema: z.ZodTypeAny;
  signal?: AbortSignal;
};

class HttpClient {
  private readonly _http: Axios;

  constructor(baseUrl: string) {
    this._http = HttpClient.initHttp(baseUrl);
  }

  private static initHttp(baseUrl: string): Axios {
    const http = axios.create({
      baseURL: baseUrl,
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

  readonly request = async <TResponse>({
    method,
    path,
    params,
    data,
    responseSchema,
    signal,
  }: HttpRequest) => {
    console.debug(
      "[client]",
      method.toUpperCase(),
      path,
      ", params:",
      params,
      "...",
    );

    let response: AxiosResponse<TResponse>;
    try {
      response = await this._http.request<TResponse>({
        method,
        url: path,
        params,
        data,
        signal,
      });

      console.debug(
        "[client]",
        method.toUpperCase(),
        path,
        "-",
        response.status,
        response.statusText,
      );
    } catch (error) {
      throw this.handleError(method, path, params, error);
    }

    try {
      return responseSchema.parse(response.data) as TResponse;
    } catch (error) {
      console.error(
        "[client] Response parsing failed",
        method.toUpperCase(),
        path,
        ", params:",
        params,
        response.data,
        error,
      );
      throw new ClientError(
        "Response parsing failed",
        error,
        ClientErrorCode.Failed,
      );
    }
  };

  private readonly handleError = (
    method: Method,
    path: string,
    params: unknown,
    error: unknown,
  ): ClientError => {
    if (axios.isCancel(error)) {
      console.debug(
        "[client] Request cancelled",
        method.toUpperCase(),
        path,
        ", params:",
        params,
      );

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
        ", params:",
        params,
        error,
      );
      throw new ClientError("Request failed", error, ClientErrorCode.Failed);
    }
  };
}

abstract class BaseClient {
  protected readonly _http: HttpClient;

  constructor(http: HttpClient) {
    this._http = http;
  }
}

class MembersClient extends BaseClient {
  constructor(http: HttpClient) {
    super(http);
  }

  readonly getAll = async (year: number, signal?: AbortSignal) =>
    await this._http.request<MemberPublicInfos>({
      method: "GET",
      path: "/api/v1/members",
      params: { year: year },
      responseSchema: MemberPublicInfosSchema,
      signal,
    });
}

class LicenceInfosClient extends BaseClient {
  constructor(http: HttpClient) {
    super(http);
  }

  readonly getAll = async (signal?: AbortSignal) =>
    await this._http.request<LicenceDetailedInfos>({
      method: "GET",
      path: "/api/v1/licence-infos",
      responseSchema: LicenceDetailedInfosSchema,
      signal,
    });
}

class HelpersClient extends BaseClient {
  constructor(http: HttpClient) {
    super(http);
  }

  readonly getPermissions = async (signal?: AbortSignal) =>
    await this._http.request<HelpersAppPermissions>({
      method: "GET",
      path: "/api/v1/helpers/permissions",
      responseSchema: HelpersAppPermissionsSchema,
      signal,
    });

  readonly getTaskCategories = async (signal?: AbortSignal) =>
    await this._http.request<HelperTaskCategories>({
      method: "GET",
      path: "/api/v1/helpers/task-categories",
      responseSchema: HelperTaskCategoriesSchema,
      signal,
    });

  readonly getTasks = async (
    year: number | null = null,
    signal?: AbortSignal,
  ) =>
    await this._http.request<HelperTasks>({
      method: "GET",
      path: "/api/v1/helpers/tasks",
      params: { year: year },
      responseSchema: HelperTasksSchema,
      signal,
    });

  readonly getTaskById = async (id: number, signal?: AbortSignal) =>
    await this._http.request<HelperTask>({
      method: "GET",
      path: `/api/v1/helpers/tasks/${id}`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  readonly createTask = async (
    data: HelperTaskCreationRequest,
    signal?: AbortSignal,
  ) =>
    await this._http.request<HelperTask>({
      method: "POST",
      path: "/api/v1/helpers/tasks",
      data,
      responseSchema: HelperTaskSchema,
      signal,
    });

  readonly updateTask = async (
    id: number,
    data: HelperTaskUpdateRequest,
    signal?: AbortSignal,
  ) =>
    await this._http.request<HelperTask>({
      method: "PUT",
      path: `/api/v1/helpers/tasks/${id}`,
      data,
      responseSchema: HelperTaskSchema,
      signal,
    });

  readonly setCaptain = async (
    id: number,
    memberId: number,
    signal?: AbortSignal,
  ) =>
    await this._http.request<HelperTask>({
      method: "PUT",
      path: `/api/v1/helpers/tasks/${id}/captain/${memberId}`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  readonly removeCaptain = async (id: number, signal?: AbortSignal) =>
    await this._http.request<HelperTask>({
      method: "DELETE",
      path: `/api/v1/helpers/tasks/${id}/captain`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  readonly addHelper = async (
    id: number,
    memberId: number,
    signal?: AbortSignal,
  ) =>
    await this._http.request<HelperTask>({
      method: "PUT",
      path: `/api/v1/helpers/tasks/${id}/helpers/${memberId}`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  readonly removeHelper = async (
    id: number,
    memberId: number,
    signal?: AbortSignal,
  ) =>
    await this._http.request<HelperTask>({
      method: "DELETE",
      path: `/api/v1/helpers/tasks/${id}/helpers/${memberId}`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  readonly signUpAsCaptain = async (id: number, signal?: AbortSignal) =>
    await this._http.request<HelperTask>({
      method: "POST",
      path: `/api/v1/helpers/tasks/${id}/sign-up-as-captain`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  readonly signUpAsHelper = async (id: number, signal?: AbortSignal) =>
    await this._http.request<HelperTask>({
      method: "POST",
      path: `/api/v1/helpers/tasks/${id}/sign-up-as-helper`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  readonly markAsDone = async (
    id: number,
    data: HelperTaskMarkAsDoneRequest,
    signal?: AbortSignal,
  ) =>
    await this._http.request<HelperTask>({
      method: "POST",
      path: `/api/v1/helpers/tasks/${id}/mark-as-done`,
      data,
      responseSchema: HelperTaskSchema,
      signal,
    });

  readonly validate = async (
    id: number,
    data: HelperTaskValidationRequest,
    signal?: AbortSignal,
  ) =>
    await this._http.request<HelperTask>({
      method: "POST",
      path: `/api/v1/helpers/tasks/${id}/validate`,
      data,
      responseSchema: HelperTaskSchema,
      signal,
    });
}

const httpClient = new HttpClient(config.yccHullUrl);

const client = {
  members: new MembersClient(httpClient),
  licenceInfos: new LicenceInfosClient(httpClient),
  helpers: new HelpersClient(httpClient),
};

export default client;
