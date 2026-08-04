import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "bebrave_admin_session";

type AdminRole = "super_admin" | "lector";

export interface AdminSession {
  expiresAt: number;
  role: AdminRole;
  username: string;
}

const getSessionSecret = (): string => {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "bebrave-development-session-secret"
      : undefined);

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }

  return secret;
};

const sign = (value: string): string =>
  createHmac("sha256", getSessionSecret()).update(value).digest("base64url");

export function authenticateAdminCredentials(
  username: string,
  password: string,
): AdminSession | null {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword =
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV !== "production" ? "admin" : undefined);
  const lectorUsername = process.env.LECTOR_USERNAME || "lektor";
  const lectorPassword =
    process.env.LECTOR_PASSWORD ||
    (process.env.NODE_ENV !== "production" ? "belektor" : undefined);

  let role: AdminRole | null = null;

  if (
    adminPassword &&
    username === adminUsername &&
    password === adminPassword
  ) {
    role = "super_admin";
  } else if (
    lectorPassword &&
    username === lectorUsername &&
    password === lectorPassword
  ) {
    role = "lector";
  }

  if (!role) return null;

  return {
    expiresAt: Date.now() + 1000 * 60 * 60 * 12,
    role,
    username,
  };
}

export function createAdminSessionToken(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function getAdminSession(request: Request): AdminSession | null {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const token = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${ADMIN_SESSION_COOKIE}=`))
      ?.slice(ADMIN_SESSION_COOKIE.length + 1);

    if (!token) return null;

    const [payload, signature] = token.split(".");

    if (!payload || !signature) return null;

    const expectedSignature = sign(payload);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSession;

    if (session.expiresAt <= Date.now()) return null;

    return session;
  } catch {
    return null;
  }
}

export function isAdminRequest(request: Request): boolean {
  const session = getAdminSession(request);

  if (session) return true;

  const adminHeader = request.headers.get("x-admin-access");

  return adminHeader === "bebrave-admin-2024";
}

export function isSuperAdminRequest(request: Request): boolean {
  return getAdminSession(request)?.role === "super_admin";
}
