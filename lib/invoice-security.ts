import crypto from "crypto";

// Secret key for invoice access tokens - should be in environment variables in production
const INVOICE_SECRET =
    process.env.INVOICE_SECRET || "bebrave-invoice-secret-key-2024";

/**
 * Generates a secure hash for invoice access
 * Uses invoice ID, customer email, and creation timestamp for security
 */
export function generateInvoiceAccessToken(
    invoiceId: number,
    customerEmail: string,
    createdAt: Date,
): string {
    const data = `${invoiceId}:${customerEmail}:${createdAt.getTime()}:${INVOICE_SECRET}`;

    return crypto
        .createHash("sha256")
        .update(data)
        .digest("hex")
        .substring(0, 32); // Use first 32 characters for shorter URLs
}

/**
 * Validates an invoice access token
 */
export function validateInvoiceAccessToken(
    invoiceId: number,
    customerEmail: string,
    createdAt: Date,
    providedToken: string,
): boolean {
    const expectedToken = generateInvoiceAccessToken(
        invoiceId,
        customerEmail,
        createdAt,
    );

    // Ensure both tokens have the same length for timing-safe comparison
    if (expectedToken.length !== providedToken.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(expectedToken),
        Buffer.from(providedToken),
    );
}

/**
 * Generates a secure PDF URL for an invoice
 */
export function generateSecureInvoicePdfUrl(
    baseUrl: string,
    invoiceId: number,
    customerEmail: string,
    createdAt: Date,
): string {
    const token = generateInvoiceAccessToken(invoiceId, customerEmail, createdAt);

    return `${baseUrl}/api/invoices/${invoiceId}/pdf?token=${token}`;
}
