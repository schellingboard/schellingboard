import { createHash, timingSafeEqual } from "node:crypto";
import { BlockList, isIP } from "node:net";

import {
  PROXY_SECRET_HEADER,
  type ProxySignInState,
} from "@schellingboard/domain/proxy-sign-in";

export type ProxyRequest = {
  /** The person's email as the proxy sent it; null when the header is absent. */
  email: string | null;
  /** Whether the secret and the address, as far as they are required, check out. */
  trusted: boolean;
};

export const hashProxySecret = (secret: string) =>
  createHash("sha256").update(secret).digest("hex");

const sameHash = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// `::ffff:a.b.c.d` is how a dual-stack socket reports an IPv4 peer.
export function normalizeAddress(address: string): string {
  const bare = address.split("%")[0].toLowerCase();
  return bare.startsWith("::ffff:") && isIP(bare.slice(7)) === 4
    ? bare.slice(7)
    : bare;
}

/** Null when `entry` is an IP address or a CIDR range. */
export function proxyAddressProblem(entry: string): string | null {
  const [address, bits, ...rest] = entry.split("/");
  const family = isIP(address);
  if (!family || rest.length > 0) return "Not an IP address or CIDR range";
  if (bits === undefined) return null;
  if (normalizeAddress(address) !== address.toLowerCase())
    return "Write an IPv4-mapped range as plain IPv4";
  const max = family === 4 ? 32 : 128;
  return /^\d+$/.test(bits) && Number(bits) <= max
    ? null
    : "Not an IP address or CIDR range";
}

function listOf(entries: string[]): BlockList {
  const list = new BlockList();
  for (const entry of entries) {
    const [address, bits] = entry.split("/");
    const family = isIP(address) === 4 ? "ipv4" : "ipv6";
    if (bits === undefined) list.addAddress(address, family);
    else list.addSubnet(address, Number(bits), family);
  }
  return list;
}

function addressTrusted(entries: string[], remote: string | undefined) {
  if (!remote) return false;
  const address = normalizeAddress(remote);
  const family = isIP(address);
  if (!family) return false;
  return listOf(entries.map(normalizeAddress)).check(
    address,
    family === 4 ? "ipv4" : "ipv6"
  );
}

/** What the proxy's header and trust checks say about one request, whoever it is for. */
export function inspectProxyRequest(
  settings: ProxySignInState,
  secretHash: string | null,
  headers: Headers,
  remoteAddress: string | undefined
): ProxyRequest | null {
  if (!settings.enabled) return null;
  const value = headers.get(settings.headerName)?.trim();
  const email = value ? value : null;
  const secretOk =
    secretHash === null ||
    sameHash(
      hashProxySecret(headers.get(PROXY_SECRET_HEADER) ?? ""),
      secretHash
    );
  const addressOk =
    settings.addresses.length === 0 ||
    addressTrusted(settings.addresses, remoteAddress);
  return { email, trusted: secretOk && addressOk };
}
