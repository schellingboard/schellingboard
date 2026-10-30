import type { ApiClient } from "@schellingboard/api-client";
import type {
  changePasswordBodySchema,
  loginBodySchema,
  loginCodeBodySchema,
  resetBodySchema,
  unprotectBodySchema,
  usernameBodySchema,
} from "@schellingboard/contracts/auth";

export type LoginBody = (typeof loginBodySchema)["_input"];
export type TargetBody = (typeof loginCodeBodySchema)["_input"];
export type ResetBody = (typeof resetBodySchema)["_input"];
export type ChangePasswordBody = (typeof changePasswordBodySchema)["_input"];
export type UnprotectBody = (typeof unprotectBodySchema)["_input"];
export type UsernameBody = (typeof usernameBodySchema)["_input"];

/**
 * The sign-in screens wait for every answer, so none of these is a command.
 * The routes that set a cookie or mail a token take no idempotency key.
 */
export function signInCalls(api: ApiClient) {
  const keyed = (key: string) => ({ "Idempotency-Key": key });
  return {
    logIn: (body: LoginBody) => api.POST("/api/v1/auth/login", { body }),
    requestLoginCode: (body: TargetBody) =>
      api.POST("/api/v1/auth/login-code", { body }),
    requestResetLink: (body: TargetBody) =>
      api.POST("/api/v1/auth/reset-link", { body }),
    resetPassword: (body: ResetBody) =>
      api.POST("/api/v1/auth/reset", { body }),
    changePassword: (body: ChangePasswordBody, key: string) =>
      api.PUT("/api/v1/me/credentials/password", {
        body,
        headers: keyed(key),
      }),
    unprotect: (body: UnprotectBody) =>
      api.POST("/api/v1/me/credentials/unprotect", { body }),
    setUsername: (body: UsernameBody, key: string) =>
      api.PUT("/api/v1/me/credentials/username", {
        body,
        headers: keyed(key),
      }),
    revokeLoginSession: (id: string, key: string) =>
      api.DELETE("/api/v1/me/login-sessions/{id}", {
        params: { path: { id } },
        headers: keyed(key),
      }),
  };
}

export type SignInCalls = ReturnType<typeof signInCalls>;
