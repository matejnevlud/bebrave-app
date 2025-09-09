import { NextRequest, NextResponse } from "next/server";

import { EmailInvoiceService } from "@/lib/services/email-invoice";
import { isAdminRequest } from "@/lib/server-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id);

    if (isNaN(invoiceId)) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 },
      );
    }

    // Check if this is an admin request
    const isAdmin = isAdminRequest(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { recipientEmail } = await request.json();

    // Send invoice email
    const success = await EmailInvoiceService.sendInvoiceEmail(
      invoiceId,
      recipientEmail,
    );

    if (success) {
      return NextResponse.json(
        {
          message: "Invoice email sent successfully",
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        {
          error: "Failed to send invoice email",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error sending invoice email:", error);

    return NextResponse.json(
      { error: "Failed to send invoice email" },
      { status: 500 },
    );
  }
}

// Send invoice reminder
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id);

    if (isNaN(invoiceId)) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 },
      );
    }

    // Send invoice reminder
    const success = await EmailInvoiceService.sendInvoiceReminder(invoiceId);

    if (success) {
      return NextResponse.json(
        {
          message: "Invoice reminder sent successfully",
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        {
          error: "Failed to send invoice reminder",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error sending invoice reminder:", error);

    return NextResponse.json(
      { error: "Failed to send invoice reminder" },
      { status: 500 },
    );
  }
}
