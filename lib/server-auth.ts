// Server-side authentication utilities
// Simple admin access validation for API requests
export function isAdminRequest(request: Request): boolean {
    // Check for admin access header - simple approach since admin is already authenticated
    const adminHeader = request.headers.get("x-admin-access");

    return adminHeader === "bebrave-admin-2024";
}