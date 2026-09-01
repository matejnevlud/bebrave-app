import type {
  NexiOperation,
  NexiRefundAction,
  NexiRefundResponse,
} from "@/lib/services/nexi";

import { NextRequest, NextResponse } from "next/server";
import { and, eq, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  invoicesTable,
  paymentRefundsTable,
  reservationsTable,
} from "@/db/schema";
import { nexiPaymentService } from "@/lib/services/nexi";
import { getAdminSession, isSuperAdminRequest } from "@/lib/server-auth";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const findRefundAction = (
  actions: NexiRefundAction[],
): NexiRefundAction | null =>
  actions.find((action) => action.action === "REFUND") || null;

const isCompletedRefund = (operation: NexiOperation): boolean =>
  operation.operationResult === "REFUNDED" ||
  operation.operationResult === "EXECUTED";

const getOperationPriority = (operation: NexiOperation): number => {
  if (operation.operationType === "CAPTURE") return 0;
  if (operation.operationType === "AUTHORIZATION") return 1;

  return 2;
};

const getHostedPagePaymentId = (
  hostedPageUrl: string | null,
): string | null => {
  if (!hostedPageUrl) return null;

  try {
    const url = new URL(hostedPageUrl);

    return (
      url.searchParams.get("paymentid") || url.searchParams.get("paymentId")
    );
  } catch {
    return null;
  }
};

const findRefundableOperation = async (
  orderId: string,
  candidateOperationIds: string[],
): Promise<NexiOperation | null> => {
  const [orderOperationsResult, matchingOperationsResult] =
    await Promise.allSettled([
      nexiPaymentService.getOrderOperations(orderId),
      nexiPaymentService.findOrderOperations(orderId),
    ]);
  const orderOperations =
    orderOperationsResult.status === "fulfilled"
      ? orderOperationsResult.value
      : [];
  const matchingOperations =
    matchingOperationsResult.status === "fulfilled"
      ? matchingOperationsResult.value
      : [];
  const candidateOperations: NexiOperation[] = candidateOperationIds.map(
    (operationId) => ({ operationId }),
  );

  if (orderOperationsResult.status === "rejected") {
    console.warn("Unable to load XPay order operations", {
      error: orderOperationsResult.reason,
      orderId,
    });
  }
  if (matchingOperationsResult.status === "rejected") {
    console.warn("Unable to search XPay operations", {
      error: matchingOperationsResult.reason,
      orderId,
    });
  }

  const uniqueOperations = Array.from(
    new Map(
      [...orderOperations, ...matchingOperations, ...candidateOperations].map(
        (operation) => [operation.operationId, operation],
      ),
    ).values(),
  ).sort((first, second) => {
    const priorityDifference =
      getOperationPriority(first) - getOperationPriority(second);

    if (priorityDifference !== 0) return priorityDifference;

    return (second.operationTime || "").localeCompare(
      first.operationTime || "",
    );
  });

  for (const operation of uniqueOperations) {
    try {
      const actions = await nexiPaymentService.getRefundActions(
        operation.operationId,
      );

      if (findRefundAction(actions)) return operation;
    } catch (error) {
      console.warn(
        `Unable to load XPay actions for ${operation.operationType || "unknown"} operation`,
        error,
      );
    }
  }

  if (uniqueOperations.length > 0) {
    console.warn(
      "No refundable XPay operation found",
      uniqueOperations.map((operation) => ({
        operationResult: operation.operationResult,
        operationType: operation.operationType,
      })),
    );
  }

  return null;
};

const getReservationAndCapture = async (reservationId: number) => {
  const reservation = await db.query.reservationsTable.findFirst({
    where: eq(reservationsTable.id, reservationId),
  });

  if (!reservation) throw new Error("Reservation not found");
  if (reservation.paymentMethod !== "credit_card") {
    throw new Error("Only card payments can be refunded through XPay");
  }
  if (!reservation.paymentTransactionId) {
    throw new Error("Reservation has no XPay order ID");
  }

  let captureOperationId = reservation.paymentOperationId;

  if (!captureOperationId) {
    const hostedPagePaymentId = getHostedPagePaymentId(
      reservation.paymentHostedPageUrl,
    );
    const refundableOperation = await findRefundableOperation(
      reservation.paymentTransactionId,
      hostedPagePaymentId ? [hostedPagePaymentId] : [],
    );

    if (!refundableOperation) {
      throw new Error(
        "No refundable XPay payment was found for this reservation",
      );
    }

    captureOperationId = refundableOperation.operationId;
    await db
      .update(reservationsTable)
      .set({ paymentOperationId: captureOperationId, updatedAt: new Date() })
      .where(eq(reservationsTable.id, reservation.id));
  }

  return { captureOperationId, reservation };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSuperAdminRequest(request)) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;
    const reservationId = Number(id);

    if (!Number.isInteger(reservationId)) {
      return NextResponse.json(
        { error: "Invalid reservation ID" },
        { status: 400 },
      );
    }

    const { captureOperationId } =
      await getReservationAndCapture(reservationId);
    const actions =
      await nexiPaymentService.getRefundActions(captureOperationId);
    const refundAction = findRefundAction(actions);

    if (!refundAction) {
      return NextResponse.json(
        { error: "XPay does not currently allow a refund for this payment" },
        { status: 409 },
      );
    }

    const defaultAmount = Number(refundAction.defaultAmount);
    const maxAmount = Number(refundAction.maxAmount);
    const minAmount = Number(refundAction.minAmount);

    if (![defaultAmount, maxAmount, minAmount].every(Number.isFinite)) {
      throw new Error("XPay returned invalid refund limits");
    }

    return NextResponse.json({
      captureOperationId,
      currency: refundAction.currency,
      defaultAmount,
      maxAmount,
      minAmount,
    });
  } catch (error) {
    console.error("Error loading XPay refund availability:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Refund lookup failed",
      },
      { status: 502 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSuperAdminRequest(request)) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 },
    );
  }

  try {
    const session = getAdminSession(request);
    const { id } = await params;
    const reservationId = Number(id);
    const body = (await request.json()) as {
      amount?: number;
      description?: string;
      requestId?: string;
    };

    if (!Number.isInteger(reservationId)) {
      return NextResponse.json(
        { error: "Invalid reservation ID" },
        { status: 400 },
      );
    }
    if (!Number.isInteger(body.amount) || Number(body.amount) <= 0) {
      return NextResponse.json(
        { error: "Refund amount must be a positive integer" },
        { status: 400 },
      );
    }
    if (!body.requestId || !UUID_PATTERN.test(body.requestId)) {
      return NextResponse.json(
        { error: "A valid refund request ID is required" },
        { status: 400 },
      );
    }

    const existingRefund = await db.query.paymentRefundsTable.findFirst({
      where: eq(paymentRefundsTable.idempotencyKey, body.requestId),
    });

    if (existingRefund?.status === "completed") {
      return NextResponse.json({ refund: existingRefund });
    }
    if (
      existingRefund &&
      (existingRefund.reservationId !== reservationId ||
        existingRefund.amount !== Number(body.amount))
    ) {
      return NextResponse.json(
        { error: "Refund request ID was already used" },
        { status: 409 },
      );
    }

    const { captureOperationId, reservation } =
      await getReservationAndCapture(reservationId);
    let refund = existingRefund;
    let currency = existingRefund?.currency;
    let description =
      existingRefund?.description ||
      body.description?.trim().slice(0, 500) ||
      `Refund for BeBrave reservation ${reservation.id}`;

    if (
      existingRefund &&
      existingRefund.captureOperationId !== captureOperationId
    ) {
      return NextResponse.json(
        { error: "Refund request belongs to another XPay operation" },
        { status: 409 },
      );
    }

    if (!refund) {
      const actions =
        await nexiPaymentService.getRefundActions(captureOperationId);
      const refundAction = findRefundAction(actions);

      if (!refundAction) {
        return NextResponse.json(
          { error: "XPay does not currently allow a refund for this payment" },
          { status: 409 },
        );
      }

      const minAmount = Number(refundAction.minAmount);
      const maxAmount = Number(refundAction.maxAmount);

      if (Number(body.amount) < minAmount || Number(body.amount) > maxAmount) {
        return NextResponse.json(
          {
            error: `Refund must be between ${minAmount} and ${maxAmount} minor currency units`,
          },
          { status: 400 },
        );
      }

      currency = refundAction.currency;
      [refund] = await db
        .insert(paymentRefundsTable)
        .values({
          amount: Number(body.amount),
          captureOperationId,
          currency,
          description,
          idempotencyKey: body.requestId,
          requestedBy: session?.username || "admin",
          reservationId,
        })
        .returning();
    }

    if (!refund || !currency) {
      throw new Error("Refund could not be initialized");
    }

    let refundResponse: NexiRefundResponse;
    let refundOperation: NexiOperation;

    try {
      refundResponse = await nexiPaymentService.refundOperation(
        captureOperationId,
        Number(body.amount),
        currency,
        description,
        body.requestId,
      );

      await db
        .update(paymentRefundsTable)
        .set({
          error: null,
          refundOperationId: refundResponse.operationId,
          status: "pending",
          updatedAt: new Date(),
        })
        .where(eq(paymentRefundsTable.id, refund.id));

      refundOperation = await nexiPaymentService.getOperation(
        refundResponse.operationId,
      );
    } catch (error) {
      await db
        .update(paymentRefundsTable)
        .set({
          error: error instanceof Error ? error.message : "Refund failed",
          status: "unknown",
          updatedAt: new Date(),
        })
        .where(eq(paymentRefundsTable.id, refund.id));

      throw error;
    }
    const isCompleted = isCompletedRefund(refundOperation);

    if (!isCompleted) {
      return NextResponse.json(
        {
          operationId: refundResponse.operationId,
          status: refundOperation.operationResult || "PENDING",
        },
        { status: 202 },
      );
    }

    await db.transaction(async (transaction) => {
      const completedRefunds = await transaction
        .update(paymentRefundsTable)
        .set({ status: "completed", updatedAt: new Date() })
        .where(
          and(
            eq(paymentRefundsTable.id, refund.id),
            ne(paymentRefundsTable.status, "completed"),
          ),
        )
        .returning({ id: paymentRefundsTable.id });

      if (completedRefunds.length > 0) {
        const updatedReservations = await transaction
          .update(reservationsTable)
          .set({
            paymentStatus: sql<string>`CASE WHEN ${reservationsTable.refundedAmount} + ${Number(body.amount)} >= COALESCE(${reservationsTable.paymentAmount}, 0) THEN 'refunded' ELSE 'partially_refunded' END`,
            refundedAmount: sql`${reservationsTable.refundedAmount} + ${Number(body.amount)}`,
            updatedAt: new Date(),
          })
          .where(eq(reservationsTable.id, reservationId))
          .returning({ paymentStatus: reservationsTable.paymentStatus });
        const paymentStatus =
          updatedReservations[0]?.paymentStatus || "partially_refunded";

        await transaction
          .update(invoicesTable)
          .set({
            status: paymentStatus,
            updatedAt: new Date(),
          })
          .where(eq(invoicesTable.reservationId, reservationId));
      }
    });

    return NextResponse.json({
      amount: Number(body.amount),
      currency,
      operationId: refundResponse.operationId,
      status: "REFUNDED",
    });
  } catch (error) {
    console.error("Error refunding XPay payment:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Refund failed" },
      { status: 502 },
    );
  }
}
