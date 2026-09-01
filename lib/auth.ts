"use client";

const AUTH_STORAGE_KEY = "admin_authenticated";
const ROLE_STORAGE_KEY = "role";

export function setAuthSession(username: string, role?: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    localStorage.setItem("username", username);
    if (role) localStorage.setItem(ROLE_STORAGE_KEY, role);
  }
}

export function clearAuthSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function isSuperAdmin(): boolean {
  if (typeof window === "undefined") return false;

  return (
    localStorage.getItem(ROLE_STORAGE_KEY) === "super_admin" ||
    localStorage.getItem("username") === "admin"
  );
}

/**
 * Verifies the httpOnly admin session cookie is still valid. The localStorage
 * flag never expires, so without this check the UI stays "logged in" after the
 * 12h cookie expires and every admin API call fails with 403.
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/auth/session", {
      cache: "no-store",
    });

    if (!response.ok) {
      clearAuthSession();

      return false;
    }

    const session = (await response.json()) as {
      role?: string;
      username?: string;
    };

    if (session.username) setAuthSession(session.username, session.role);

    return true;
  } catch {
    // Network hiccup - keep the current session rather than logging out.
    return true;
  }
}
