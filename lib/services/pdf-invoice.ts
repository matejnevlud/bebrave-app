import puppeteer from "puppeteer";

import {Invoice} from "@/db/schema";

export interface InvoiceData {
    invoice: Invoice & {
        reservation: {
            class: {
                classType: { name: string };
                trainer: { name: string };
                date: string;
                time: string;
            };
        };
    };
    companyInfo: {
        name: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
        ico: string;
        dic: string;
        email: string;
        phone: string;
    };
}

export class PDFInvoiceService {
    private static readonly COMPANY_INFO = {
        name: "BeBrave Studio",
        address: "Důlní 3394/4",
        city: "Moravská Ostrava a Přívoz",
        postalCode: "702 00",
        country: "Česká republika",
        ico: "12345678", // Replace with actual IČO
        dic: "CZ12345678", // Replace with actual DIČ
        email: "info@bebravestudio.cz",
        phone: "+420 731 906 623",
    };

    /**
     * Generate PDF invoice as buffer
     */
    static async generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
        const html = this.generateInvoiceHTML(invoiceData);

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        try {
            const page = await browser.newPage();

            await page.setContent(html, {waitUntil: "networkidle0"});

            const pdfBuffer = await page.pdf({
                format: "A4",
                margin: {top: "1cm", bottom: "1cm", left: "1cm", right: "1cm"},
                displayHeaderFooter: false,
                printBackground: true,
            });

            return pdfBuffer as any;
        } finally {
            await browser.close();
        }
    }

    /**
     * Generate invoice HTML template
     */
    private static generateInvoiceHTML(invoiceData: InvoiceData): string {
        const {invoice, companyInfo} = invoiceData;
        const reservation = invoice.reservation;
        const classInfo = reservation.class;

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
    <title>Faktura ${invoice.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .invoice {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .company-details {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.4;
        }
        
        .invoice-info {
            text-align: right;
            flex: 1;
        }
        
        .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .invoice-number {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 15px;
        }
        
        .invoice-dates {
            font-size: 14px;
            color: #6b7280;
        }
        
        .billing-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .billing-section {
            flex: 1;
        }
        
        .billing-section h3 {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .billing-details {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
        }
        
        .billing-details strong {
            color: #1f2937;
            font-weight: 600;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table th {
            background-color: #f9fafb;
            font-weight: bold;
            color: #1f2937;
        }
        
        .items-table td {
            color: #6b7280;
        }
        
        .text-right {
            text-align: right;
        }
        
        .total-section {
            margin-left: auto;
            width: 300px;
            border: 1px solid #e5e7eb;
            background-color: #f9fafb;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .total-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 16px;
            background-color: #e5e7eb;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
        }
        
        .payment-info {
            margin-top: 30px;
            padding: 15px;
            background-color: #f0f9ff;
            border-left: 4px solid #3b82f6;
        }
        
        .payment-info h4 {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .payment-info p {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="invoice">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-name">${companyInfo.name}</div>
                <div class="company-details">
                    ${companyInfo.address}<br>
                    ${companyInfo.postalCode} ${companyInfo.city}<br>
                    ${companyInfo.country}<br><br>
                    IČO: ${companyInfo.ico}<br>
                    DIČ: ${companyInfo.dic}<br>
                    Email: ${companyInfo.email}<br>
                    Tel: ${companyInfo.phone}
                </div>
            </div>
            <div class="invoice-info">
                <div class="invoice-title">FAKTURA</div>
                <div class="invoice-number">č. ${invoice.invoiceNumber}</div>
                <div class="invoice-dates">
                    <div>Datum vystavení: ${formatDate(invoice.issueDate)}</div>
                    ${invoice.dueDate ? `<div>Datum splatnosti: ${formatDate(invoice.dueDate)}</div>` : ""}
                </div>
            </div>
        </div>

        <!-- Billing Information -->
        <div class="billing-info">
            <div class="billing-section">
                <h3>Dodavatel</h3>
                <div class="billing-details">
                    Altin JM Group s.r.o.<br>
                    Myslivecká 2370<br>
                    735 32 Rychvald<br>
                    ${companyInfo.country}<br>
                    IČO: 25366955<br>
                    DIČ: CZ25366955
                </div>
            </div>
            <div class="billing-section">
                <h3>Odběratel</h3>
                <div class="billing-details">
                    <strong>${invoice.customerName}</strong><br>
                    ${invoice.customerAddress ? `${invoice.customerAddress}<br>` : ""}
                    <strong>Email:</strong> ${invoice.customerEmail}<br>
                    ${invoice.customerPhone ? `<strong>Tel:</strong> ${invoice.customerPhone}` : ""}
                </div>
            </div>
        </div>

        <!-- DUZP and Payment Method Section -->
        <div style="margin-bottom: 20px; font-size: 15px;">
            <strong>DUZP:</strong> ${invoice.duzp ? formatDate(invoice.duzp) : formatDate(classInfo.date)}<br>
            <strong>Způsob platby:</strong> 
            ${invoice.paymentMethod === "on_site" ? "Platba na místě" : invoice.paymentMethod === "credit_card" ? "Kreditní karta" : invoice.paymentMethod === "qr_payment" ? "QR platba" : invoice.paymentMethod === "customer_credit" ? "Kredit zákazníka" : invoice.paymentMethod || "Nespecifikováno"}
        </div>
        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Popis služby</th>
                    <th>Datum</th>
                    <th>Čas</th>
                    <th>Trenér</th>
                    <th class="text-right">Cena</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>${classInfo.classType.name}</strong><br>
                        <small>${invoice.description}</small>
                    </td>
                    <td>${formatDate(classInfo.date)}</td>
                    <td>${classInfo.time}</td>
                    <td>${classInfo.trainer.name}</td>
                    <td class="text-right">${formatAmount(invoice.amount)}</td>
                </tr>
            </tbody>
        </table>

        <!-- Total Section -->
        <div class="total-section">
            <div class="total-row">
                <span>Cena bez DPH:</span>
                <span>${formatAmount(invoice.amount)}</span>
            </div>
            <div class="total-row">
                <span>DPH ${invoice.vatRate || 21}%:</span>
                <span>${formatAmount(invoice.vatAmount || 0)}</span>
            </div>
            <div class="total-row">
                <span>Celkem k úhradě:</span>
                <span>${formatAmount(invoice.totalAmount)}</span>
            </div>
        </div>

        <!-- Payment Information -->
        <div class="payment-info">
            <h4>Informace o platbě</h4>
            <p><strong>Status:</strong> ${invoice.status === "paid" ? "Uhrazeno" : invoice.status === "issued" ? "Vystaveno" : "Stornováno"}</p>
            ${invoice.status === "paid" ? "<p><strong>Platba byla úspěšně zpracována.</strong></p>" : ""}
            ${invoice.status === "issued" ? "<p><strong>Faktura čeká na uhrazení.</strong></p>" : ""}
            <p style="margin-top: 10px; font-size: 11px; color: #6b7280;"><strong>Poznámka:</strong> Jsme plátci DPH. Ceny všech našich služeb jsou uváděny včetně DPH.</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Děkujeme za vaši důvěru a těšíme se na další spolupráci!</p>
            <p>${companyInfo.name} | ${companyInfo.email} | ${companyInfo.phone}</p>
        </div>
    </div>
</body>
</html>
    `;
    }

    /**
     * Generate invoice file name
     */
    static generateInvoiceFileName(invoiceNumber: number): string {
        return `faktura-${invoiceNumber}.pdf`;
    }

    /**
     * Save PDF to file system (optional)
     */
    static async saveInvoicePDF(
        invoiceData: InvoiceData,
        filePath: string,
    ): Promise<void> {
        const pdfBuffer = await this.generateInvoicePDF(invoiceData);
        const fs = require("fs");

        fs.writeFileSync(filePath, pdfBuffer);
    }

    /**
     * Get default company info
     */
    static getDefaultCompanyInfo() {
        return this.COMPANY_INFO;
    }
}
