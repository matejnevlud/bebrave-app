import { PDFInvoiceService } from "./pdf-invoice";
import { createResendClient } from "./resend";

import { generateSecureInvoicePdfUrl } from "@/lib/invoice-security";
import { getInvoice } from "@/db/actions";

export class EmailInvoiceService {
  /**
   * Send invoice email with PDF attachment
   */
  static async sendInvoiceEmail(
    invoiceId: number,
    recipientEmail?: string,
  ): Promise<boolean> {
    try {
      // Get invoice with full details
      const invoice = await getInvoice(invoiceId);

      if (!invoice) {
        console.error("Invoice not found:", invoiceId);

        return false;
      }

      // Use provided email or customer email
      const email = recipientEmail || invoice.customerEmail;

      if (!email) {
        console.error("No email address provided for invoice:", invoiceId);

        return false;
      }

      // Use remote PDF URL for email attachment
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://bebravestudio.cz";

      const pdfUrl = generateSecureInvoicePdfUrl(
        baseUrl,
        invoice.id,
        invoice.customerEmail,
        invoice.createdAt,
      );
      const fileName = PDFInvoiceService.generateInvoiceFileName(
        invoice.invoiceNumber,
      );

      // Prepare email content
      const emailSubject = `Faktura ${invoice.invoiceNumber} - BeBrave Studio`;
      const emailHtml = this.generateInvoiceEmailHTML(invoice);

      // Send email with PDF attachment using remote URL
      const result = await createResendClient().emails.send({
        from: "BeBrave Studio <info@bebravestudio.cz>",
        to: [email],
        subject: emailSubject,
        html: emailHtml,
        attachments: [
          {
            path: pdfUrl,
            filename: fileName,
          },
        ],
      });

      console.log("Invoice email sent successfully:", result);

      return true;
    } catch (error) {
      console.error("Error sending invoice email:", error);

      return false;
    }
  }

  /**
   * Generate email HTML for invoice
   */
  private static generateInvoiceEmailHTML(invoice: any): string {
    const formatAmount = (amountInCents: number) => {
      return `${(amountInCents / 100).toFixed(2)} Kč`;
    };

    const formatDate = (date: Date | string) => {
      return new Date(date).toLocaleDateString("cs-CZ");
    };

    const statusText =
      invoice.status === "paid"
        ? "uhrazena"
        : invoice.status === "issued"
          ? "vystavena"
          : "zrušena";

    return `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faktura ${invoice.invoiceNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .invoice-info {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .invoice-number {
            font-size: 18px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        .details {
            margin-bottom: 15px;
        }
        .details strong {
            color: #1f2937;
        }
        .amount {
            font-size: 20px;
            font-weight: bold;
            color: #16a34a;
            text-align: center;
            padding: 15px;
            background-color: #f0f9ff;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
            color: #6b7280;
        }
        .cta {
            text-align: center;
            margin: 20px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-paid { background-color: #dcfce7; color: #16a34a; }
        .status-issued { background-color: #fef3c7; color: #d97706; }
        .status-cancelled { background-color: #fee2e2; color: #dc2626; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">BeBrave Studio</div>
        <p>Fitness & Wellness Studio</p>
    </div>

    <div class="invoice-info">
        <div class="invoice-number">Faktura č. ${invoice.invoiceNumber}</div>
        
        <div class="details">
            <strong>Vystaveno:</strong> ${formatDate(invoice.issueDate)}<br>
            <strong>Stav:</strong> <span class="status-badge status-${invoice.status}">${statusText}</span>
        </div>

        <div class="details">
            <strong>Zákazník:</strong> ${invoice.customerName}<br>
            ${invoice.customerAddress ? `<strong>Adresa:</strong> ${invoice.customerAddress}<br>` : ""}
            <strong>E-mail:</strong> ${invoice.customerEmail}
            ${invoice.customerPhone ? `<br><strong>Telefon:</strong> ${invoice.customerPhone}` : ""}
        </div>

        <div class="details">
            <strong>Služba:</strong> ${invoice.description}<br>
            <strong>Lekce:</strong> ${invoice.reservation.class.classType.name}<br>
            <strong>Trenér:</strong> ${invoice.reservation.class.trainer.name}<br>
            <strong>Datum:</strong> ${formatDate(invoice.reservation.class.date)} v ${invoice.reservation.class.time}
        </div>

        <div class="details" style="margin-top: 15px; padding: 10px; background-color: #f9fafb; border-radius: 6px;">
            <strong>Rozklad ceny:</strong><br>
            Cena bez DPH: ${formatAmount(invoice.amount)}<br>
            DPH ${invoice.vatRate || 21}%: ${formatAmount(invoice.vatAmount || 0)}<br>
            <strong>Celkem včetně DPH: ${formatAmount(invoice.totalAmount)}</strong>
        </div>

        <div class="amount">
            Celková částka: ${formatAmount(invoice.totalAmount)}
        </div>
    </div>

    <div class="cta">
        <p><strong>Faktura je přiložena jako PDF soubor.</strong></p>
        ${invoice.status === "issued" ? "<p>Prosím uhraďte fakturu do splatnosti.</p>" : ""}
        ${invoice.status === "paid" ? "<p>Děkujeme za úhradu!</p>" : ""}
    </div>

    <div class="footer">
        <p><strong>BeBrave Studio</strong><br>
        Fitness & Wellness Studio<br>
        Email: info@bebravestudio.cz | Tel: +420 123 456 789</p>
        
        <p style="margin-top: 15px;">
            Děkujeme za vaši důvěru a těšíme se na další spolupráci!
        </p>
    </div>
</body>
</html>
    `;
  }

  /**
   * Send invoice reminder email
   */
  static async sendInvoiceReminder(invoiceId: number): Promise<boolean> {
    try {
      const invoice = await getInvoice(invoiceId);

      if (!invoice || invoice.status !== "issued") {
        console.error("Invoice not found or not in issued status:", invoiceId);

        return false;
      }

      const reminderSubject = `Připomínka faktury ${invoice.invoiceNumber} - BeBrave Studio`;
      const reminderHtml = this.generateReminderEmailHTML(invoice);

      const result = await createResendClient().emails.send({
        from: "BeBrave Studio <info@bebravestudio.cz>",
        to: [invoice.customerEmail],
        subject: reminderSubject,
        html: reminderHtml,
      });

      console.log("Invoice reminder sent successfully:", result);

      return true;
    } catch (error) {
      console.error("Error sending invoice reminder:", error);

      return false;
    }
  }

  /**
   * Generate reminder email HTML
   */
  private static generateReminderEmailHTML(invoice: any): string {
    const formatAmount = (amountInCents: number) => {
      return `${(amountInCents / 100).toFixed(2)} Kč`;
    };

    const formatDate = (date: Date | string) => {
      return new Date(date).toLocaleDateString("cs-CZ");
    };

    return `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Připomínka faktury</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #fef3c7;
            border-radius: 8px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .reminder-content {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .amount {
            font-size: 20px;
            font-weight: bold;
            color: #d97706;
            text-align: center;
            padding: 15px;
            background-color: #fef3c7;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">BeBrave Studio</div>
        <p>Připomínka úhrady faktury</p>
    </div>

    <div class="reminder-content">
        <p>Dobrý den ${invoice.customerName},</p>
        
        <p>rádi bychom Vás upozornili na neuhrazenou fakturu:</p>
        
        <p><strong>Faktura č.:</strong> ${invoice.invoiceNumber}<br>
        <strong>Vystaveno:</strong> ${formatDate(invoice.issueDate)}<br>
        <strong>Služba:</strong> ${invoice.description}</p>

        <div class="amount">
            Částka k úhradě: ${formatAmount(invoice.totalAmount)}
        </div>

        <p>Prosím uhraďte fakturu v nejbližší možné době. Pokud jste již fakturu uhradili, tuto zprávu ignorujte.</p>
        
        <p>V případě dotazů nás neváhejte kontaktovat.</p>
    </div>

    <div class="footer">
        <p><strong>BeBrave Studio</strong><br>
        Email: info@bebravestudio.cz | Tel: +420 123 456 789</p>
        
        <p style="margin-top: 15px;">
            Děkujeme za pochopení!
        </p>
    </div>
</body>
</html>
    `;
  }
}
