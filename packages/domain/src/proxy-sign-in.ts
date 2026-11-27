export const PROXY_SECRET_HEADER = "x-schellingboard-proxy-secret";

export const DEFAULT_PROXY_HEADER = "X-Forwarded-Email";

const REFUSED_HEADERS = new Set([
  "cookie",
  "authorization",
  "host",
  "forwarded",
  "x-forwarded-for",
  PROXY_SECRET_HEADER,
]);

const HEADER_TOKEN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

export type ProxySignIn = {
  enabled: boolean;
  headerName: string;
  /** IPs or CIDR ranges of the proxy, compared with the socket address. */
  addresses: string[];
  logoutUrl: string;
  siteAdmins: boolean;
};

export type ProxySignInState = ProxySignIn & { secretSet: boolean };

export const DEFAULT_PROXY_SIGN_IN: ProxySignIn = {
  enabled: false,
  headerName: DEFAULT_PROXY_HEADER,
  addresses: [],
  logoutUrl: "",
  siteAdmins: false,
};

/** Null when `name` may carry the person's email. */
export function proxyHeaderNameProblem(name: string): string | null {
  if (!HEADER_TOKEN.test(name)) return "Not a valid header name";
  if (REFUSED_HEADERS.has(name.toLowerCase()))
    return "This header carries something else than an email";
  return null;
}
