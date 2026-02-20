const MARZBAN_ADDRESS = process.env.MARZBAN_ADDRESS!;
const MARZBAN_USERNAME = process.env.MARZBAN_USERNAME!;
const MARZBAN_PASSWORD = process.env.MARZBAN_PASSWORD!;

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const url = `${MARZBAN_ADDRESS}/api/admin/token`;
  console.log(`[Marzban] Authenticating at ${url}`);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: MARZBAN_USERNAME,
        password: MARZBAN_PASSWORD,
      }),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Marzban connection failed (${MARZBAN_ADDRESS}): ${msg}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Marzban auth failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + 55 * 60 * 1000;
  return cachedToken!;
}

function invalidateToken() {
  cachedToken = null;
  tokenExpiresAt = 0;
}

async function marzbanFetch(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const token = await getToken();
  const res = await fetch(`${MARZBAN_ADDRESS}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    invalidateToken();
    return marzbanFetch(path, options, false);
  }

  return res;
}

export interface MarzbanUser {
  username: string;
  status: string;
  used_traffic: number;
  data_limit: number | null;
  expire: number | null;
  subscription_url: string;
  links: string[];
  created_at: string;
}

export async function createMarzbanUser(
  username: string,
  options?: { expire?: number; status?: string }
): Promise<MarzbanUser> {
  const res = await marzbanFetch("/api/user", {
    method: "POST",
    body: JSON.stringify({
      username,
      proxies: { vless: { flow: "xtls-rprx-vision" } },
      inbounds: { vless: ["VLESS_REALITY"] },
      expire: options?.expire ?? 0,
      data_limit: 0,
      data_limit_reset_strategy: "no_reset",
      status: options?.status ?? "active",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Marzban create user failed: ${res.status} ${err}`);
  }

  return res.json();
}

export async function getMarzbanUser(
  username: string
): Promise<MarzbanUser | null> {
  const res = await marzbanFetch(`/api/user/${username}`);

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Marzban get user failed: ${res.status}`);
  }

  return res.json();
}

export async function deleteMarzbanUser(username: string): Promise<void> {
  const res = await marzbanFetch(`/api/user/${username}`, {
    method: "DELETE",
  });

  if (!res.ok && res.status !== 404) {
    const err = await res.text();
    throw new Error(`Marzban delete user failed: ${res.status} ${err}`);
  }
}

export async function updateMarzbanUser(
  username: string,
  data: {
    expire?: number;
    status?: string;
    data_limit?: number;
  }
): Promise<MarzbanUser> {
  const res = await marzbanFetch(`/api/user/${username}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Marzban update user failed: ${res.status} ${err}`);
  }

  return res.json();
}
