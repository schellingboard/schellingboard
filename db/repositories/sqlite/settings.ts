import {
  DEFAULT_PROXY_SIGN_IN,
  type ProxySignIn,
  type ProxySignInState,
} from "@schellingboard/domain/proxy-sign-in";
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "@schellingboard/domain/site-settings";
import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import * as schema from "../../schema";
import type { SettingsRepository } from "../interfaces";

type DB = BetterSQLite3Database<typeof schema>;

// The settings table always holds at most one row, identified by this id.
const SINGLETON_ID = "singleton";

export class SqliteSettingsRepository implements SettingsRepository {
  constructor(private readonly db: DB) {}

  async get(): Promise<SiteSettings> {
    const row = this.db
      .select()
      .from(schema.siteSettings)
      .where(eq(schema.siteSettings.id, SINGLETON_ID))
      .get();
    if (!row) return { ...DEFAULT_SITE_SETTINGS };
    return {
      title: row.title,
      description: row.description,
      mapImageUrl: row.mapImageUrl,
    };
  }

  async update(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.get();
    const next: SiteSettings = { ...current, ...patch };
    this.db
      .insert(schema.siteSettings)
      .values({ id: SINGLETON_ID, ...next })
      .onConflictDoUpdate({
        target: schema.siteSettings.id,
        set: next,
      })
      .run();
    return next;
  }

  private row() {
    return this.db
      .select()
      .from(schema.siteSettings)
      .where(eq(schema.siteSettings.id, SINGLETON_ID))
      .get();
  }

  async getProxySignIn(): Promise<ProxySignInState> {
    const row = this.row();
    if (!row) return { ...DEFAULT_PROXY_SIGN_IN, secretSet: false };
    return {
      enabled: row.proxyEnabled,
      headerName: row.proxyHeader,
      addresses: row.proxyAddresses,
      logoutUrl: row.proxyLogoutUrl,
      siteAdmins: row.proxySiteAdmins,
      secretSet: row.proxySecretHash !== null,
    };
  }

  async getProxySecretHash(): Promise<string | null> {
    return this.row()?.proxySecretHash ?? null;
  }

  async updateProxySignIn(
    patch: Partial<ProxySignIn>
  ): Promise<ProxySignInState> {
    const next = { ...(await this.getProxySignIn()), ...patch };
    const columns = {
      proxyEnabled: next.enabled,
      proxyHeader: next.headerName,
      proxyAddresses: next.addresses,
      proxyLogoutUrl: next.logoutUrl,
      proxySiteAdmins: next.siteAdmins,
    };
    this.db
      .insert(schema.siteSettings)
      .values({ id: SINGLETON_ID, ...columns })
      .onConflictDoUpdate({ target: schema.siteSettings.id, set: columns })
      .run();
    return this.getProxySignIn();
  }

  async setProxySecretHash(hash: string | null): Promise<void> {
    this.db
      .insert(schema.siteSettings)
      .values({ id: SINGLETON_ID, proxySecretHash: hash })
      .onConflictDoUpdate({
        target: schema.siteSettings.id,
        set: { proxySecretHash: hash },
      })
      .run();
  }
}
