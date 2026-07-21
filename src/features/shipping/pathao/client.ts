/**
 * Pathao Courier Merchant API client (sandbox + production).
 * Docs: merchant Pathao developer portal / Hermes API.
 */

export type PathaoTokenResponse = {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token?: string;
};

export type PathaoStore = {
  store_id: number;
  store_name: string;
  store_address: string;
  is_active: number;
  city_id: number;
  zone_id: number;
  hub_id: number;
};

export type PathaoCity = { city_id: number; city_name: string };
export type PathaoZone = { zone_id: number; zone_name: string };
export type PathaoArea = { area_id: number; area_name: string; home_delivery_available?: number };

export type PathaoCreateOrderInput = {
  store_id: number;
  merchant_order_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: number;
  recipient_zone: number;
  recipient_area: number;
  delivery_type: number;
  item_type: number;
  special_instruction?: string;
  item_quantity: number;
  item_weight: number;
  amount_to_collect: number;
  item_description: string;
};

export type PathaoCreateOrderResult = {
  consignment_id: string | number;
  merchant_order_id?: string;
  order_status?: string;
  delivery_fee?: number;
};

type PathaoConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
};

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

export function getPathaoConfig(): PathaoConfig | null {
  const baseUrl = process.env.PATHAO_BASE_URL?.trim();
  const clientId = process.env.PATHAO_CLIENT_ID?.trim();
  const clientSecret = process.env.PATHAO_CLIENT_SECRET?.trim();
  const username = process.env.PATHAO_USERNAME?.trim();
  const password = process.env.PATHAO_PASSWORD?.trim();

  if (!baseUrl || !clientId || !clientSecret || !username || !password) {
    return null;
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), clientId, clientSecret, username, password };
}

export function isPathaoConfigured() {
  return getPathaoConfig() != null;
}

export function getDefaultPathaoStoreId() {
  const raw = process.env.PATHAO_STORE_ID?.trim();
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

async function pathaoFetch<T>(
  path: string,
  init: RequestInit & { accessToken?: string } = {}
): Promise<T> {
  const config = getPathaoConfig();
  if (!config) {
    throw new Error("Pathao is not configured. Set PATHAO_* environment variables.");
  }

  const { accessToken, ...requestInit } = init;
  const headers = new Headers(requestInit.headers);
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && requestInit.body) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${config.baseUrl}${path}`, {
    ...requestInit,
    headers,
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as {
    message?: string;
    type?: string;
    code?: number;
    data?: unknown;
    errors?: unknown;
  };

  if (!res.ok) {
    const detail =
      typeof json.message === "string"
        ? json.message
        : `Pathao request failed (${res.status})`;
    throw new Error(detail);
  }

  return json as T;
}

export async function getPathaoAccessToken(forceRefresh = false) {
  const config = getPathaoConfig();
  if (!config) {
    throw new Error("Pathao is not configured.");
  }

  if (
    !forceRefresh &&
    cachedToken &&
    cachedToken.expiresAt > Date.now() + 60_000
  ) {
    return cachedToken.accessToken;
  }

  const json = await pathaoFetch<PathaoTokenResponse>(
    "/aladdin/api/v1/issue-token",
    {
      method: "POST",
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        username: config.username,
        password: config.password,
        grant_type: "password",
      }),
    }
  );

  cachedToken = {
    accessToken: json.access_token,
    expiresAt: Date.now() + Math.max(60, json.expires_in - 120) * 1000,
  };

  return cachedToken.accessToken;
}

type ListEnvelope<T> = {
  data?: { data?: T[] } | T[];
};

function unwrapList<T>(payload: ListEnvelope<T>): T[] {
  const data = payload.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function listPathaoStores() {
  const token = await getPathaoAccessToken();
  const json = await pathaoFetch<ListEnvelope<PathaoStore>>(
    "/aladdin/api/v1/stores",
    { accessToken: token }
  );
  return unwrapList(json).filter((store) => store.is_active === 1);
}

export async function listPathaoCities() {
  const token = await getPathaoAccessToken();
  const json = await pathaoFetch<ListEnvelope<PathaoCity>>(
    "/aladdin/api/v1/city-list",
    { accessToken: token }
  );
  return unwrapList(json);
}

export async function listPathaoZones(cityId: number) {
  const token = await getPathaoAccessToken();
  const json = await pathaoFetch<ListEnvelope<PathaoZone>>(
    `/aladdin/api/v1/cities/${cityId}/zone-list`,
    { accessToken: token }
  );
  return unwrapList(json);
}

export async function listPathaoAreas(zoneId: number) {
  const token = await getPathaoAccessToken();
  const json = await pathaoFetch<ListEnvelope<PathaoArea>>(
    `/aladdin/api/v1/zones/${zoneId}/area-list`,
    { accessToken: token }
  );
  return unwrapList(json);
}

export async function createPathaoOrder(input: PathaoCreateOrderInput) {
  const token = await getPathaoAccessToken();
  const json = await pathaoFetch<{
    message?: string;
    data?: PathaoCreateOrderResult;
  }>("/aladdin/api/v1/orders", {
    method: "POST",
    accessToken: token,
    body: JSON.stringify(input),
  });

  if (!json.data?.consignment_id) {
    throw new Error(json.message || "Pathao did not return a consignment id.");
  }

  return json.data;
}

export async function getPathaoOrderInfo(consignmentId: string) {
  const token = await getPathaoAccessToken();
  return pathaoFetch<{ data?: Record<string, unknown>; message?: string }>(
    `/aladdin/api/v1/orders/${encodeURIComponent(consignmentId)}`,
    { accessToken: token }
  );
}
