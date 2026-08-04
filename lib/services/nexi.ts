// Nexi XPay Payment Service
// Integration with Nexi XPay CEE for hosted payment pages

// Generate UUID v4 for Correlation-Id
function generateUUIDv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}

export interface PaymentSessionData {
  amount: number; // Amount in CZK cents
  orderId: string;
  description: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  resultUrl: string;
  cancelUrl: string;
  notificationUrl: string;
}

export interface PaymentSessionResponse {
  hostedPage: string;
  securityToken: string;
  orderId: string;
  amount: string;
  currency: string;
  warnings?: string[];
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  error?: string;
}

export interface NexiOperation {
  operationAmount?: string;
  operationCurrency?: string;
  operationId: string;
  operationResult?: string;
  operationTime?: string;
  operationType?: string;
  orderId?: string;
}

export interface NexiRefundAction {
  action: string;
  currency: string;
  defaultAmount: string;
  maxAmount: string;
  minAmount: string;
}

export interface NexiRefundResponse {
  operationId: string;
  operationTime: string;
}

export class NexiPaymentService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly environment: string;

  constructor() {
    this.environment = process.env.NEXI_ENVIRONMENT || "test";
    this.apiKey = process.env.NEXI_API_KEY || "";
    this.baseUrl =
      process.env.NEXI_API_URL ||
      (this.environment === "test"
        ? "https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1"
        : "https://xpay.nexigroup.com/api/phoenix-0.0/psp/api/v1");
  }

  /**
   * Create a payment session with Nexi XPay
   */
  async createPaymentSession(
    data: PaymentSessionData,
  ): Promise<PaymentSessionResponse> {
    const correlationId = generateUUIDv4();

    const orderData = {
      paymentSession: {
        actionType: "PAY",
        amount: data.amount.toString(),
        currency: "CZK",
        language: "CZE",
        resultUrl: data.resultUrl,
        cancelUrl: data.cancelUrl,
        notificationUrl: data.notificationUrl,
        captureType: "IMPLICIT",
      },
      order: {
        orderId: data.orderId,
        amount: data.amount.toString(),
        currency: "CZK",
        description: data.description,
        customField: "bebrave-studio-reservation",
        customerInfo: {
          cardHolderName: data.customerInfo.name,
          cardHolderEmail: data.customerInfo.email,
          mobilePhone: data.customerInfo.phone,
          mobilePhoneCountryCode: "+420",
          billingAddress: {
            name: data.customerInfo.name,
            street: data.customerInfo.address || "Customer Address",
            city: data.customerInfo.city || "Prague",
            postCode: data.customerInfo.postalCode || "11000",
            country: "CZE",
            additionalInfo: "",
            province: "00",
          },
        },
      },
    };

    console.log(orderData);

    try {
      const response = await fetch(`${this.baseUrl}/orders/hpp`, {
        method: "POST",
        headers: {
          "X-API-KEY": this.apiKey,
          "Content-Type": "application/json",
          "Correlation-Id": correlationId,
          "x-plugin-name": "BeBrave Studio",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`Nexi API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      return {
        hostedPage: result.hostedPage,
        securityToken: result.securityToken,
        orderId: data.orderId,
        amount: data.amount.toString(),
        currency: "CZK",
        warnings: result.warnings || [],
      };
    } catch (error) {
      console.error("Error creating Nexi payment session:", error);
      throw new Error(
        `Failed to create payment session: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getOrderOperations(orderId: string): Promise<NexiOperation[]> {
    const result = await this.request<{ operations?: NexiOperation[] }>(
      `/orders/${encodeURIComponent(orderId)}`,
    );

    return result.operations || [];
  }

  async findOrderOperations(orderId: string): Promise<NexiOperation[]> {
    const query = new URLSearchParams({ orderId });
    const result = await this.request<{ operations?: NexiOperation[] }>(
      `/operations?${query.toString()}`,
    );

    return result.operations || [];
  }

  async getOperation(operationId: string): Promise<NexiOperation> {
    return this.request<NexiOperation>(
      `/operations/${encodeURIComponent(operationId)}`,
    );
  }

  async getRefundActions(operationId: string): Promise<NexiRefundAction[]> {
    const result = await this.request<{ actions?: NexiRefundAction[] }>(
      `/operations/${encodeURIComponent(operationId)}/actions`,
    );

    return result.actions || [];
  }

  async refundOperation(
    operationId: string,
    amount: number,
    currency: string,
    description: string,
    idempotencyKey: string,
  ): Promise<NexiRefundResponse> {
    return this.request<NexiRefundResponse>(
      `/operations/${encodeURIComponent(operationId)}/refunds`,
      {
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency,
          description,
        }),
      },
    );
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.apiKey) throw new Error("NEXI_API_KEY is not configured");

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "Correlation-Id": generateUUIDv4(),
        "X-API-KEY": this.apiKey,
        ...init?.headers,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(`Nexi API Error: ${response.status} - ${errorBody}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Verify payment result from Nexi
   */
  async verifyPaymentResult(
    transactionId: string,
    securityToken: string,
  ): Promise<PaymentResult> {
    try {
      // In a real implementation, you would call Nexi's API to verify the payment
      // For now, we'll implement basic verification logic

      // This is a placeholder - in production you'd call Nexi's verification API
      const response = await fetch(`${this.baseUrl}/orders/${transactionId}`, {
        method: "GET",
        headers: {
          "X-API-KEY": this.apiKey,
          "Content-Type": "application/json",
          "Correlation-Id": generateUUIDv4(),
        },
      });

      if (response.ok) {
        const result = await response.json();

        return {
          success: true,
          transactionId: result.transactionId,
          amount: result.amount,
          currency: result.currency,
          status: result.status,
        };
      } else {
        return {
          success: false,
          error: "Payment verification failed",
        };
      }
    } catch (error) {
      console.error("Error verifying payment:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Parse payment result from URL parameters
   */
  parsePaymentResult(searchParams: URLSearchParams): PaymentResult {
    const status = searchParams.get("status");
    const transactionId = searchParams.get("transactionId");
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency");

    if (status === "success" || status === "authorized") {
      return {
        success: true,
        transactionId: transactionId || undefined,
        amount: amount ? parseInt(amount) : undefined,
        currency: currency || undefined,
        status: status,
      };
    } else {
      return {
        success: false,
        status: status || "failed",
        error: searchParams.get("error") || "Payment failed",
      };
    }
  }

  /**
   * Get payment status from transaction ID
   */
  async getPaymentStatus(transactionId: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/orders/${transactionId}/status`,
        {
          method: "GET",
          headers: {
            "X-API-KEY": this.apiKey,
            "Content-Type": "application/json",
            "Correlation-Id": generateUUIDv4(),
          },
        },
      );

      if (response.ok) {
        const result = await response.json();

        return result.status || "unknown";
      } else {
        return "failed";
      }
    } catch (error) {
      console.error("Error getting payment status:", error);

      return "failed";
    }
  }

  /**
   * Format amount for display
   */
  formatAmount(amountInCents: number): string {
    return `${(amountInCents / 100).toFixed(2)} CZK`;
  }

  /**
   * Convert CZK to cents
   */
  convertToCents(amountInCzk: number): number {
    return Math.round(amountInCzk * 100);
  }
}

// Export singleton instance
export const nexiPaymentService = new NexiPaymentService();
