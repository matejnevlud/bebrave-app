import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export interface MonthlySummaryData {
    month: string;
    year: number;
    totalInvoices: number;
    totalAmountWithoutVat: number;
    totalVatAmount: number;
    totalAmountWithVat: number;
    classTypeBreakdown: Array<{
        name: string;
        count: number;
        amountWithoutVat: number;
        vatAmount: number;
        totalAmount: number;
    }>;
    paymentMethodBreakdown: Array<{
        method: string;
        methodLabel: string;
        count: number;
        amountWithoutVat: number;
        vatAmount: number;
        totalAmount: number;
    }>;
    vatBreakdown: Array<{
        rate: number;
        count: number;
        baseAmount: number;
        vatAmount: number;
        totalAmount: number;
    }>;
    previousMonthComparison: {
        invoiceCountChange: number;
        revenueChange: number;
        percentageChange: number;
    };
}

export class PDFMonthlySummaryService {
    private static readonly COMPANY_INFO = {
        name: "BeBrave Studio s.r.o.",
        address: "Důlní 3394/4",
        city: "Moravská Ostrava a Přívoz",
        postalCode: "702 00",
        country: "Česká republika",
        ico: "19863624",
        dic: "CZ19863624",
        email: "info@bebravestudio.cz",
        phone: "+420 731 906 623",
    };

    static formatCurrency(amountInCents: number): string {
        return (amountInCents / 100).toLocaleString('cs-CZ', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    static formatPercentage(value: number): string {
        const sign = value > 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    }

    static generateMonthlySummaryHTML(data: MonthlySummaryData): string {
        const { COMPANY_INFO } = this;
        
        // Build table rows for each section
        const classTypeRows = data.classTypeBreakdown.map(item => `
            <tr>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0;">${item.name}</td>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0; text-align:center;">${item.count}</td>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0; text-align:right;">${this.formatCurrency(item.amountWithoutVat)} Kč</td>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0; text-align:right;">${this.formatCurrency(item.vatAmount)} Kč</td>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0; text-align:right;">${this.formatCurrency(item.totalAmount)} Kč</td>
            </tr>
        `).join('');

        const paymentMethodRows = data.paymentMethodBreakdown.map(item => `
            <tr>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0;">${item.methodLabel}</td>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0; text-align:center;">${item.count}</td>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0; text-align:right;">${this.formatCurrency(item.amountWithoutVat)} Kč</td>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0; text-align:right;">${this.formatCurrency(item.vatAmount)} Kč</td>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0; text-align:right;">${this.formatCurrency(item.totalAmount)} Kč</td>
            </tr>
        `).join('');

        const vatRows = data.vatBreakdown.map(item => `
            <tr>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0;">${item.rate}%</td>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0; text-align:center;">${item.count}</td>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0; text-align:right;">${this.formatCurrency(item.baseAmount)} Kč</td>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0; text-align:right;">${this.formatCurrency(item.vatAmount)} Kč</td>
                <td style="padding:8px; border-bottom:1px solid #e0e0e0; text-align:right;">${this.formatCurrency(item.totalAmount)} Kč</td>
            </tr>
        `).join('');

        // Determine colors for trends
        const invoiceChangeColor = data.previousMonthComparison.invoiceCountChange > 0 ? '#16a34a' : 
                                  data.previousMonthComparison.invoiceCountChange < 0 ? '#dc2626' : '#000';
        const revenueChangeColor = data.previousMonthComparison.revenueChange > 0 ? '#16a34a' : 
                                  data.previousMonthComparison.revenueChange < 0 ? '#dc2626' : '#000';
        const percentageChangeColor = data.previousMonthComparison.percentageChange > 0 ? '#16a34a' : 
                                     data.previousMonthComparison.percentageChange < 0 ? '#dc2626' : '#000';

        return `
        <!DOCTYPE html>
        <html lang="cs">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Měsíční přehled faktur - ${data.month} ${data.year}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    font-size: 12px; 
                    line-height: 1.4; 
                    margin: 10px;
                    color: #000;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 2px solid #000;
                    padding-bottom: 20px;
                }
                .company-info {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .company-name { 
                    font-size: 18px; 
                    font-weight: bold; 
                    margin-bottom: 5px;
                }
                .summary-title {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 20px 0 10px 0;
                }
                .section { 
                    margin-bottom: 25px; 
                }
                .section-title { 
                    font-size: 14px; 
                    font-weight: bold; 
                    margin-bottom: 10px;
                    background-color: #f5f5f5;
                    padding: 8px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 15px;
                }
                th, td { 
                    padding: 8px; 
                    text-align: left; 
                    border-bottom: 1px solid #e0e0e0;
                }
                th { 
                    background-color: #f0f0f0; 
                    font-weight: bold;
                    border-bottom: 2px solid #000;
                }
                .summary-table {
                    border: 1px solid #000;
                }
                .summary-table td {
                    border-bottom: 1px solid #ccc;
                }
                .total-row {
                    font-weight: bold;
                    background-color: #f8f8f8;
                }
                .trend-positive { color: #16a34a; }
                .trend-negative { color: #dc2626; }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px solid #ccc;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-info">
                    <div class="company-name">${COMPANY_INFO.name}</div>
                    <div>${COMPANY_INFO.address}, ${COMPANY_INFO.postalCode} ${COMPANY_INFO.city}</div>
                    <div>IČO: ${COMPANY_INFO.ico} | DIČ: ${COMPANY_INFO.dic}</div>
                    <div>${COMPANY_INFO.email} | ${COMPANY_INFO.phone}</div>
                </div>
                <div class="summary-title">Měsíční přehled faktur - ${data.month} ${data.year}</div>
            </div>

            <!-- Class Type Breakdown -->
            <div class="section">
                <div class="section-title">Přehled podle typu lekcí</div>
                <table>
                    <thead>
                        <tr>
                            <th>Typ lekce</th>
                            <th style="text-align: center;">Počet</th>
                            <th style="text-align: right;">Částka bez DPH</th>
                            <th style="text-align: right;">DPH</th>
                            <th style="text-align: right;">Celkem s DPH</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${classTypeRows}
                    </tbody>
                </table>
            </div>

            <!-- Payment Method Breakdown -->
            <div class="section">
                <div class="section-title">Přehled podle způsobu platby</div>
                <table>
                    <thead>
                        <tr>
                            <th>Způsob platby</th>
                            <th style="text-align: center;">Počet</th>
                            <th style="text-align: right;">Částka bez DPH</th>
                            <th style="text-align: right;">DPH</th>
                            <th style="text-align: right;">Celkem s DPH</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paymentMethodRows}
                    </tbody>
                </table>
            </div>

            <!-- VAT Breakdown -->
            <div class="section">
                <div class="section-title">Přehled DPH</div>
                <table>
                    <thead>
                        <tr>
                            <th>Sazba DPH</th>
                            <th style="text-align: center;">Počet faktur</th>
                            <th style="text-align: right;">Základ daně</th>
                            <th style="text-align: right;">DPH</th>
                            <th style="text-align: right;">Celkem</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vatRows}
                    </tbody>
                </table>
            </div>

            <!-- Monthly Comparison -->
            <div class="section">
                <div class="section-title">Porovnání s předchozím měsícem</div>
                <table class="summary-table">
                    <tr>
                        <td style="font-weight: bold;">Změna počtu faktur:</td>
                        <td style="text-align: right; color: ${invoiceChangeColor};">
                            ${data.previousMonthComparison.invoiceCountChange >= 0 ? '+' : ''}${data.previousMonthComparison.invoiceCountChange}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Změna celkové částky:</td>
                        <td style="text-align: right; color: ${revenueChangeColor};">
                            ${data.previousMonthComparison.revenueChange >= 0 ? '+' : ''}${this.formatCurrency(Math.abs(data.previousMonthComparison.revenueChange))} Kč
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Změna v procentech:</td>
                        <td style="text-align: right; color: ${percentageChangeColor};">
                            ${this.formatPercentage(data.previousMonthComparison.percentageChange)}
                        </td>
                    </tr>
                </table>
            </div>

            <div class="footer">
                Vygenerováno dne ${new Date().toLocaleDateString('cs-CZ')} | ${COMPANY_INFO.name}
            </div>
        </body>
        </html>
        `;
    }

    static async generatePDF(data: MonthlySummaryData): Promise<string> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            const html = this.generateMonthlySummaryHTML(data);
            
            await page.setContent(html, {
                waitUntil: 'networkidle0'
            });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '20mm',
                    right: '15mm',
                    bottom: '20mm',
                    left: '15mm'
                },
                printBackground: true
            });

            // Validate PDF buffer
            console.log(`📊 PDF Buffer info: length=${pdfBuffer.length} bytes, type=${typeof pdfBuffer}`);
            
            // Debug: Save PDF to disk for inspection
            try {
                const debugDir = path.join(process.cwd(), 'debug');
                if (!fs.existsSync(debugDir)) {
                    fs.mkdirSync(debugDir, { recursive: true });
                }
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const debugFileName = `monthly_summary_${data.month}_${data.year}_${timestamp}.pdf`;
                const debugFilePath = path.join(debugDir, debugFileName);
                
                fs.writeFileSync(debugFilePath, pdfBuffer);
                console.log(`📄 Debug PDF saved to: ${debugFilePath}`);
                console.log(`📏 File size: ${fs.statSync(debugFilePath).size} bytes`);
                
                // Also save HTML for debugging
                const htmlFileName = `monthly_summary_${data.month}_${data.year}_${timestamp}.html`;
                const htmlFilePath = path.join(debugDir, htmlFileName);
                fs.writeFileSync(htmlFilePath, html, 'utf8');
                console.log(`📝 Debug HTML saved to: ${htmlFilePath}`);
                
                // Verify the PDF starts with correct PDF header
                const pdfHeader = pdfBuffer.slice(0, 4).toString();
                console.log(`📋 PDF header: ${pdfHeader} (should be %PDF)`);


                return fs.readFileSync(debugFilePath).toString('base64');
                
            } catch (debugError) {
                console.error('⚠️ Failed to save debug files:', debugError);
            }

            // Return the PDF buffer as a base64 string
            // @ts-ignore
            return pdfBuffer.toString('base64');
        } finally {
            await browser.close();
        }
    }

    static generatePDFFileName(month: string, year: number): string {
        return `Mesicni_prehled_faktur_${month}_${year}.pdf`;
    }
}