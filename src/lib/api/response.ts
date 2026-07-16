import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
};

export type ApiErrorBody = {
  success: false;
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
};

export function apiOk<T>(
  data: T,
  init?: {
    status?: number;
    message?: string;
    meta?: Record<string, unknown>;
    headers?: HeadersInit;
  }
) {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    ...(init?.message ? { message: init.message } : {}),
    ...(init?.meta ? { meta: init.meta } : {}),
  };

  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: withCors(init?.headers),
  });
}

export function apiError(
  error: string,
  init?: {
    status?: number;
    code?: string;
    fieldErrors?: Record<string, string[]>;
    headers?: HeadersInit;
  }
) {
  const body: ApiErrorBody = {
    success: false,
    error,
    ...(init?.code ? { code: init.code } : {}),
    ...(init?.fieldErrors ? { fieldErrors: init.fieldErrors } : {}),
  };

  return NextResponse.json(body, {
    status: init?.status ?? 400,
    headers: withCors(init?.headers),
  });
}

export function apiOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: withCors(),
  });
}

function withCors(headers?: HeadersInit): Headers {
  const result = new Headers(headers);
  const origin = process.env.MOBILE_CORS_ORIGIN || "*";
  result.set("Access-Control-Allow-Origin", origin);
  result.set("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  result.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  result.set("Access-Control-Max-Age", "86400");
  return result;
}

export class ApiHttpError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    status = 400,
    options?: { code?: string; fieldErrors?: Record<string, string[]> }
  ) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.code = options?.code;
    this.fieldErrors = options?.fieldErrors;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiHttpError) {
    return apiError(error.message, {
      status: error.status,
      code: error.code,
      fieldErrors: error.fieldErrors,
    });
  }

  console.error("[api/v1]", error);
  return apiError("Internal server error", { status: 500, code: "INTERNAL" });
}
