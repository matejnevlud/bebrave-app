"use client";

const AUTH_STORAGE_KEY = "admin_authenticated";

export function setAuthSession(username: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    localStorage.setItem("username", username);
  }
}

export function clearAuthSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function isSuperAdmin(): boolean {
  if (typeof window === "undefined") return false;

  return localStorage.getItem("username") === "admin";
}
