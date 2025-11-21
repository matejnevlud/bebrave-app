"use client";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin",
};

const AUTH_STORAGE_KEY = "admin_authenticated";

export function authenticateAdmin(username: string, password: string): boolean {
  return (
    (username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password) ||
    (username === "lektor" && password === "belektor")
  );
}

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
