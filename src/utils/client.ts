import axios, { Axios, AxiosResponse, Method } from "axios";
import * as z from "zod";

import config from "@/config";
import {
  AuditLogEntries,
  AuditLogEntriesDeleteRequest,
  AuditLogEntriesSchema,
  AuditLogEntry,
  AuditLogEntrySchema,
} from "@/model/audit-log-dtos";
import {
  LicenceDetailedInfos,
  LicenceDetailedInfosSchema,
  MemberPublicInfos,
  MemberPublicInfosSchema,
} from "@/model/dtos";
import {
  AttachmentMetadata,
  AttachmentMetadataArray,
  AttachmentMetadataArraySchema,
  AttachmentMetadataSchema,
  HelpersAppPermission,
  HelpersAppPermissionGrantRequest,
  HelpersAppPermissions,
  HelpersAppPermissionSchema,
  HelpersAppPermissionsSchema,
  HelpersAppPermissionUpdateRequest,
  HelperTask,
  HelperTaskCategories,
  HelperTaskCategoriesSchema,
  HelperTaskCreationRequest,
  HelperTaskMarkAsDoneRequest,
  HelperTasks,
  HelperTaskSchema,
  HelperTasksSchema,
  HelperTaskUpdateRequest,
  HelperTaskValidationRequest,
} from "@/model/helpers-dtos";

enum ClientErrorCode {
  Cancelled = "CANCELLED",
  Failed = "FAILED",
}

class ClientError<TCause = unknown> extends Error {
  public readonly code: ClientErrorCode;

  public constructor(message: string, cause: TCause, code: ClientErrorCode) {
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
  responseSchema: z.ZodType | null;
  signal?: AbortSignal | undefined;
};

class HttpClient {
  private readonly _http: Axios;

  public constructor(baseUrl: string) {
    this._http = HttpClient.initHttp(baseUrl);
  }

  private static initHttp(baseUrl: string): Axios {
    const http = axios.create({
      baseURL: baseUrl,
    });

    http.interceptors.request.use(
      (config) => {
        const token = globalThis.oauth2Token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: Error) => {
        throw error;
      },
    );

    return http;
  }

  public readonly request = async <TResponse>({
    method,
    path,
    params,
    data,
    responseSchema,
    signal,
  }: HttpRequest): Promise<TResponse> => {
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
        ...(signal ? { signal } : {}),
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
      return responseSchema === null
        ? (undefined as unknown as TResponse)
        : (responseSchema.parse(response.data) as TResponse);
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

  public readonly requestUpload = async <TResponse>({
    path,
    data,
    responseSchema,
    signal,
  }: {
    path: string;
    data: FormData;
    responseSchema: z.ZodType;
    signal?: AbortSignal | undefined;
  }): Promise<TResponse> => {
    console.debug("[client]", "POST", path, "(upload) ...");

    let response: AxiosResponse;
    try {
      response = await this._http.request({
        method: "POST",
        url: path,
        data,
        ...(signal ? { signal } : {}),
      });

      console.debug(
        "[client]",
        "POST",
        path,
        "(upload) -",
        response.status,
        response.statusText,
      );
    } catch (error) {
      throw this.handleError("POST", path, undefined, error);
    }

    try {
      return responseSchema.parse(response.data) as TResponse;
    } catch (error) {
      console.error(
        "[client] Response parsing failed",
        "POST",
        path,
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

  public readonly requestBlob = async ({
    path,
    signal,
  }: {
    path: string;
    signal?: AbortSignal | undefined;
  }): Promise<Blob> => {
    console.debug("[client]", "GET", path, "(blob) ...");

    try {
      const response = await this._http.request<Blob>({
        method: "GET",
        url: path,
        responseType: "blob",
        ...(signal ? { signal } : {}),
      });

      console.debug(
        "[client]",
        "GET",
        path,
        "(blob) -",
        response.status,
        response.statusText,
      );

      return response.data;
    } catch (error) {
      throw this.handleError("GET", path, undefined, error);
    }
  };

  public readonly requestUploadBlob = async ({
    path,
    data,
    signal,
  }: {
    path: string;
    data: FormData;
    signal?: AbortSignal | undefined;
  }): Promise<Blob> => {
    console.debug("[client]", "POST", path, "(upload blob) ...");

    try {
      const response = await this._http.request<Blob>({
        method: "POST",
        url: path,
        data,
        responseType: "blob",
        ...(signal ? { signal } : {}),
      });

      console.debug(
        "[client]",
        "POST",
        path,
        "(upload blob) -",
        response.status,
        response.statusText,
      );

      return response.data;
    } catch (error) {
      throw this.handleError("POST", path, undefined, error);
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

  public constructor(http: HttpClient) {
    this._http = http;
  }
}

class AuditLogClient extends BaseClient {
  public readonly getEntries = async (
    signal?: AbortSignal,
  ): Promise<AuditLogEntries> =>
    await this._http.request<AuditLogEntries>({
      method: "GET",
      path: "/api/v1/audit-log/entries",
      responseSchema: AuditLogEntriesSchema,
      signal,
    });

  public readonly getEntryById = async (
    id: number,
    signal?: AbortSignal,
  ): Promise<AuditLogEntry> =>
    await this._http.request<AuditLogEntry>({
      method: "GET",
      path: `/api/v1/audit-log/entries/${id}`,
      responseSchema: AuditLogEntrySchema,
      signal,
    });

  public readonly deleteEntries = async (
    request: AuditLogEntriesDeleteRequest,
    signal?: AbortSignal,
  ): Promise<void> => {
    await this._http.request<undefined>({
      method: "DELETE",
      path: "/api/v1/audit-log/entries",
      responseSchema: null,
      data: request,
      signal,
    });
  };
}

class HelpersClient extends BaseClient {
  public readonly getPermissions = async (
    signal?: AbortSignal,
  ): Promise<HelpersAppPermissions> =>
    await this._http.request<HelpersAppPermissions>({
      method: "GET",
      path: "/api/v1/helpers/permissions",
      responseSchema: HelpersAppPermissionsSchema,
      signal,
    });

  public readonly grantPermission = async (
    request: HelpersAppPermissionGrantRequest,
    signal?: AbortSignal,
  ): Promise<HelpersAppPermission> =>
    await this._http.request<HelpersAppPermission>({
      method: "POST",
      path: "/api/v1/helpers/permissions",
      data: request,
      responseSchema: HelpersAppPermissionSchema,
      signal,
    });

  public readonly updatePermission = async (
    memberId: number,
    request: HelpersAppPermissionUpdateRequest,
    signal?: AbortSignal,
  ): Promise<HelpersAppPermission> =>
    await this._http.request<HelpersAppPermission>({
      method: "PUT",
      path: `/api/v1/helpers/permissions/${memberId}`,
      data: request,
      responseSchema: HelpersAppPermissionSchema,
      signal,
    });

  public readonly revokePermission = async (
    memberId: number,
    signal?: AbortSignal,
  ): Promise<void> => {
    await this._http.request<undefined>({
      method: "DELETE",
      path: `/api/v1/helpers/permissions/${memberId}`,
      responseSchema: null,
      signal,
    });
  };

  public readonly getTaskCategories = async (
    signal?: AbortSignal,
  ): Promise<HelperTaskCategories> =>
    await this._http.request<HelperTaskCategories>({
      method: "GET",
      path: "/api/v1/helpers/task-categories",
      responseSchema: HelperTaskCategoriesSchema,
      signal,
    });

  public readonly getTasks = async (
    year: number | null = null,
    signal?: AbortSignal,
  ): Promise<HelperTasks> =>
    await this._http.request<HelperTasks>({
      method: "GET",
      path: "/api/v1/helpers/tasks",
      params: { year: year },
      responseSchema: HelperTasksSchema,
      signal,
    });

  public readonly getTaskById = async (
    id: number,
    signal?: AbortSignal,
  ): Promise<HelperTask> =>
    await this._http.request<HelperTask>({
      method: "GET",
      path: `/api/v1/helpers/tasks/${id}`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  public readonly createTask = async (
    data: HelperTaskCreationRequest,
    signal?: AbortSignal,
  ): Promise<HelperTask> =>
    await this._http.request<HelperTask>({
      method: "POST",
      path: "/api/v1/helpers/tasks",
      data,
      responseSchema: HelperTaskSchema,
      signal,
    });

  public readonly updateTask = async (
    id: number,
    data: HelperTaskUpdateRequest,
    signal?: AbortSignal,
  ): Promise<HelperTask> =>
    await this._http.request<HelperTask>({
      method: "PUT",
      path: `/api/v1/helpers/tasks/${id}`,
      data,
      responseSchema: HelperTaskSchema,
      signal,
    });

  public readonly setCaptain = async (
    id: number,
    memberId: number,
    signal?: AbortSignal,
  ): Promise<HelperTask> =>
    await this._http.request<HelperTask>({
      method: "PUT",
      path: `/api/v1/helpers/tasks/${id}/captain/${memberId}`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  public readonly removeCaptain = async (
    id: number,
    signal?: AbortSignal,
  ): Promise<HelperTask> =>
    await this._http.request<HelperTask>({
      method: "DELETE",
      path: `/api/v1/helpers/tasks/${id}/captain`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  public readonly addHelper = async (
    id: number,
    memberId: number,
    signal?: AbortSignal,
  ): Promise<HelperTask> =>
    await this._http.request<HelperTask>({
      method: "PUT",
      path: `/api/v1/helpers/tasks/${id}/helpers/${memberId}`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  public readonly removeHelper = async (
    id: number,
    memberId: number,
    signal?: AbortSignal,
  ): Promise<HelperTask> =>
    await this._http.request<HelperTask>({
      method: "DELETE",
      path: `/api/v1/helpers/tasks/${id}/helpers/${memberId}`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  public readonly signUpAsCaptain = async (
    id: number,
    signal?: AbortSignal,
  ): Promise<HelperTask> =>
    await this._http.request<HelperTask>({
      method: "POST",
      path: `/api/v1/helpers/tasks/${id}/sign-up-as-captain`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  public readonly signUpAsHelper = async (
    id: number,
    signal?: AbortSignal,
  ): Promise<HelperTask> =>
    await this._http.request<HelperTask>({
      method: "POST",
      path: `/api/v1/helpers/tasks/${id}/sign-up-as-helper`,
      responseSchema: HelperTaskSchema,
      signal,
    });

  public readonly markAsDone = async (
    id: number,
    data: HelperTaskMarkAsDoneRequest,
    signal?: AbortSignal,
  ): Promise<HelperTask> =>
    await this._http.request<HelperTask>({
      method: "POST",
      path: `/api/v1/helpers/tasks/${id}/mark-as-done`,
      data,
      responseSchema: HelperTaskSchema,
      signal,
    });

  public readonly validate = async (
    id: number,
    data: HelperTaskValidationRequest,
    signal?: AbortSignal,
  ): Promise<HelperTask> =>
    await this._http.request<HelperTask>({
      method: "POST",
      path: `/api/v1/helpers/tasks/${id}/validate`,
      data,
      responseSchema: HelperTaskSchema,
      signal,
    });

  public readonly getAttachments = async (
    taskId: number,
    signal?: AbortSignal,
  ): Promise<AttachmentMetadataArray> =>
    await this._http.request<AttachmentMetadataArray>({
      method: "GET",
      path: `/api/v1/helpers/tasks/${taskId}/attachments`,
      responseSchema: AttachmentMetadataArraySchema,
      signal,
    });

  public readonly downloadAttachment = async (
    taskId: number,
    attachmentId: number,
    signal?: AbortSignal,
  ): Promise<Blob> =>
    await this._http.requestBlob({
      path: `/api/v1/helpers/tasks/${taskId}/attachments/${attachmentId}`,
      signal,
    });

  public readonly uploadAttachment = async (
    taskId: number,
    file: Blob,
    fileName: string,
    description: string | null,
    signal?: AbortSignal,
  ): Promise<AttachmentMetadata> => {
    const formData = new FormData();
    formData.append("file", file, fileName);
    if (description !== null) {
      formData.append("description", description);
    }

    return await this._http.requestUpload<AttachmentMetadata>({
      path: `/api/v1/helpers/tasks/${taskId}/attachments`,
      data: formData,
      responseSchema: AttachmentMetadataSchema,
      signal,
    });
  };

  public readonly deleteAttachment = async (
    taskId: number,
    attachmentId: number,
    signal?: AbortSignal,
  ): Promise<void> => {
    await this._http.request<undefined>({
      method: "DELETE",
      path: `/api/v1/helpers/tasks/${taskId}/attachments/${attachmentId}`,
      responseSchema: null,
      signal,
    });
  };

  public readonly transcodeAttachment = async (
    file: Blob,
    fileName: string,
    signal?: AbortSignal,
  ): Promise<Blob> => {
    const formData = new FormData();
    formData.append("file", file, fileName);

    return await this._http.requestUploadBlob({
      path: "/api/v1/helpers/attachments/transcode",
      data: formData,
      signal,
    });
  };
}

class LicenceInfosClient extends BaseClient {
  public readonly getAll = async (
    signal?: AbortSignal,
  ): Promise<LicenceDetailedInfos> =>
    await this._http.request<LicenceDetailedInfos>({
      method: "GET",
      path: "/api/v1/licence-infos",
      responseSchema: LicenceDetailedInfosSchema,
      signal,
    });
}

class MembersClient extends BaseClient {
  public readonly getAll = async (
    year: number,
    signal?: AbortSignal,
  ): Promise<MemberPublicInfos> =>
    await this._http.request<MemberPublicInfos>({
      method: "GET",
      path: "/api/v1/members",
      params: { year: year },
      responseSchema: MemberPublicInfosSchema,
      signal,
    });
}

const httpClient = new HttpClient(config.yccHullUrl);

const client = {
  auditLog: new AuditLogClient(httpClient),
  helpers: new HelpersClient(httpClient),
  licenceInfos: new LicenceInfosClient(httpClient),
  members: new MembersClient(httpClient),
};

export default client;
