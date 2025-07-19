"use client";

const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "bebrave",
};

const AUTH_STORAGE_KEY = "admin_authenticated";

export function authenticateAdmin(username: string, password: string): boolean {
    return (
        username === ADMIN_CREDENTIALS.username &&
        password === ADMIN_CREDENTIALS.password
    );
}

export function setAuthSession(): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
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