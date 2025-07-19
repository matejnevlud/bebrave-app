import {NextRequest, NextResponse} from "next/server";

import {PDFInvoiceService} from "@/lib/services/pdf-invoice";
import {getInvoice} from "@/db/actions";
import {validateInvoiceAccessToken} from "@/lib/invoice-security";
import {isAdminRequest} from "@/lib/server-auth";

export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> },
) {
    try {
        const {id} = await params;
        const invoiceId = parseInt(id);
        const {searchParams} = new URL(request.url);
        const token = searchParams.get("token");

        if (isNaN(invoiceId)) {
            return NextResponse.json(
                {error: "Invalid invoice ID"},
                {status: 400},
            );
        }

        // Check if this is an admin request
        const isAdmin = isAdminRequest(request);

        if (!token && !isAdmin) {
            return NextResponse.json(
                {error: "Access token required"},
                {status: 401},
            );
        }

        // Get invoice with full details
        const invoice = await getInvoice(invoiceId);

        if (!invoice) {
            return NextResponse.json({error: "Invoice not found"}, {status: 404});
        }

        // Validate access token (skip validation for admin requests)
        if (!isAdmin && token) {
            const isValidToken = validateInvoiceAccessToken(
                invoiceId,
                invoice.customerEmail,
                invoice.createdAt,
                token,
            );

            if (!isValidToken) {
                return NextResponse.json(
                    {error: "Invalid or expired access token"},
                    {status: 403},
                );
            }
        }

        // Prepare invoice data for PDF generation
        const invoiceData = {
            invoice: {
                ...invoice,
                reservation: {
                    ...invoice.reservation,
                    paymentMethod: invoice.reservation.paymentMethod,
                },
            },
            companyInfo: PDFInvoiceService.getDefaultCompanyInfo(),
        };

        // Generate PDF
        const pdfBuffer = await PDFInvoiceService.generateInvoicePDF(invoiceData);
        const fileName = PDFInvoiceService.generateInvoiceFileName(
            invoice.invoiceNumber,
        );

        // Return PDF as response
        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${fileName}"`,
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        });
    } catch (error) {
        console.error("Error generating invoice PDF:", error);

        return NextResponse.json(
            {error: "Failed to generate invoice PDF"},
            {status: 500},
        );
    }
}
