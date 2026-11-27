import type { ApiClient } from "@schellingboard/api-client";

export type ProxySignInInput = {
  enabled: boolean;
  headerName: string;
  addresses: string[];
  logoutUrl: string;
  siteAdmins: boolean;
};

export function adminProxySignInCalls(api: ApiClient) {
  const headers = (key: string) => ({ "Idempotency-Key": key });
  return {
    save: (body: ProxySignInInput, key: string) =>
      api.PUT("/api/v1/admin/proxy-sign-in", { body, headers: headers(key) }),
    makeSecret: (key: string) =>
      api.POST("/api/v1/admin/proxy-sign-in/secret", {
        headers: headers(key),
      }),
    removeSecret: (key: string) =>
      api.DELETE("/api/v1/admin/proxy-sign-in/secret", {
        headers: headers(key),
      }),
  };
}

export type AdminProxySignInCalls = ReturnType<typeof adminProxySignInCalls>;
