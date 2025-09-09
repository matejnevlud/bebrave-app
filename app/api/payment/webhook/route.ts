// Nexi Payment Webhook Handler
import {NextRequest, NextResponse} from "next/server";
import {eq} from "drizzle-orm";

import {db} from "@/db";
import {reservationsTable} from "@/db/schema";
import {processPaymentResult} from "@/db/actions";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Log webhook data for debugging
        console.log("Nexi webhook received:", body);

        // Extract relevant data from webhook
        const orderId = body.operation?.orderId || body.orderId;
        const transactionId = body.operation?.operationId || body.transactionId;
        const amount = body.operation?.operationAmount || body.amount;
        const currency = body.operation?.operationCurrency || body.currency;
        const status = body.operation?.operationResult || body.status;
        const operation = body.operation;

        if (!orderId) {
            console.error("Missing orderId in webhook", {
                bodyKeys: Object.keys(body),
                operationKeys: body.operation ? Object.keys(body.operation) : null,
                fullBody: body,
            });

            return NextResponse.json({error: "Missing orderId"}, {status: 400});
        }

        console.log("Extracted webhook data:", {
            orderId,
            transactionId,
            amount,
            currency,
            status,
            operationResult: body.operation?.operationResult,
        });

        // Find reservation by order ID (stored in paymentTransactionId)
        const reservation = await db.query.reservationsTable.findFirst({
            where: eq(reservationsTable.paymentTransactionId, orderId),
        });

        if (!reservation) {
            console.error("Reservation not found for orderId:", orderId);

            return NextResponse.json(
                {error: "Reservation not found"},
                {status: 404},
            );
        }

        // Parse payment result from webhook
        const paymentResult = {
            success:
                status === "EXECUTED" ||
                status === "authorized" ||
                status === "captured" ||
                status === "success",
            transactionId: transactionId,
            amount: amount,
            currency: currency,
            status: status,
            operation: operation,
        };

        // Process payment result
        const isSuccess = await processPaymentResult(reservation.id, paymentResult);

        if (isSuccess) {
            console.log(
                "Payment processed successfully for reservation:",
                reservation.id,
            );
        } else {
            console.error(
                "Payment processing failed for reservation:",
                reservation.id,
            );
        }

        // Return success response to Nexi
        return NextResponse.json({
            message: "Webhook processed successfully",
            reservationId: reservation.id,
            processed: isSuccess,
        });
    } catch (error) {
        console.error("Error processing webhook:", error);

        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            {status: 500},
        );
    }
}

// Handle GET requests for webhook testing
export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: "Nexi Payment Webhook Endpoint",
        timestamp: new Date().toISOString(),
        status: "active",
    });
}
