export const monthlyInvoiceSummaryEmail = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <title>Měsíční přehled faktur – {{month_year}}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;">
<!-- Background wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;line-height: 1.6">
  <tr>
    <td align="center">
      <!-- Card -->
      <table role="presentation" width="700" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px 40px;text-align: center;">
            <!-- Logo link -->
            <a href="https://bebravestudio.cz" style="display:inline-block;margin-bottom:26px;">
              <img src="https://bebravestudio.cz/loga/bebrave_black.png" alt="BeBrave Studio logo" style="max-width:320px;height:auto;border:0;" />
            </a>
            <h1 style="text-align:center;margin:0;font-size:24px;color:#000;">Měsíční přehled faktur</h1>
            <p style="text-align:center;margin:8px 0 0 0;font-size:16px;color:#666;">{{month_year}}</p>
          </td>
        </tr>
        
        <!-- Summary section -->
        <tr>
          <td style="padding:0 40px 24px 40px;">
            <h2 style="font-size:18px;margin:0 0 16px 0;color:#000;">Celkový přehled</h2>
            <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:4px;">
              <tr style="background:#f8f8f8;">
                <td style="font-weight:bold;border-bottom:1px solid #e0e0e0;">Celkový počet faktur:</td>
                <td style="text-align:right;border-bottom:1px solid #e0e0e0;">{{total_invoices}}</td>
              </tr>
              <tr>
                <td style="font-weight:bold;border-bottom:1px solid #e0e0e0;">Celková částka bez DPH:</td>
                <td style="text-align:right;border-bottom:1px solid #e0e0e0;">{{total_amount_without_vat}} Kč</td>
              </tr>
              <tr style="background:#f8f8f8;">
                <td style="font-weight:bold;border-bottom:1px solid #e0e0e0;">Celková částka DPH:</td>
                <td style="text-align:right;border-bottom:1px solid #e0e0e0;">{{total_vat_amount}} Kč</td>
              </tr>
              <tr>
                <td style="font-weight:bold;font-size:16px;">Celková částka s DPH:</td>
                <td style="text-align:right;font-weight:bold;font-size:16px;">{{total_amount_with_vat}} Kč</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Breakdown by class type -->
        <tr>
          <td style="padding:0 40px 24px 40px;">
            <h2 style="font-size:18px;margin:0 0 16px 0;color:#000;">Přehled podle typu lekcí</h2>
            <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:4px;">
              <tr style="background:#f0f0f0;">
                <th style="text-align:left;border-bottom:2px solid #e0e0e0;font-weight:bold;">Typ lekce</th>
                <th style="text-align:center;border-bottom:2px solid #e0e0e0;font-weight:bold;">Počet</th>
                <th style="text-align:right;border-bottom:2px solid #e0e0e0;font-weight:bold;">Částka bez DPH</th>
                <th style="text-align:right;border-bottom:2px solid #e0e0e0;font-weight:bold;">DPH</th>
                <th style="text-align:right;border-bottom:2px solid #e0e0e0;font-weight:bold;">Celkem s DPH</th>
              </tr>
              {{class_type_breakdown}}
            </table>
          </td>
        </tr>

        <!-- Breakdown by payment method -->
        <tr>
          <td style="padding:0 40px 24px 40px;">
            <h2 style="font-size:18px;margin:0 0 16px 0;color:#000;">Přehled podle způsobu platby</h2>
            <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:4px;">
              <tr style="background:#f0f0f0;">
                <th style="text-align:left;border-bottom:2px solid #e0e0e0;font-weight:bold;">Způsob platby</th>
                <th style="text-align:center;border-bottom:2px solid #e0e0e0;font-weight:bold;">Počet</th>
                <th style="text-align:right;border-bottom:2px solid #e0e0e0;font-weight:bold;">Částka bez DPH</th>
                <th style="text-align:right;border-bottom:2px solid #e0e0e0;font-weight:bold;">DPH</th>
                <th style="text-align:right;border-bottom:2px solid #e0e0e0;font-weight:bold;">Celkem s DPH</th>
              </tr>
              {{payment_method_breakdown}}
            </table>
          </td>
        </tr>

        <!-- VAT breakdown -->
        <tr>
          <td style="padding:0 40px 24px 40px;">
            <h2 style="font-size:18px;margin:0 0 16px 0;color:#000;">Přehled DPH</h2>
            <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:4px;">
              <tr style="background:#f0f0f0;">
                <th style="text-align:left;border-bottom:2px solid #e0e0e0;font-weight:bold;">Sazba DPH</th>
                <th style="text-align:center;border-bottom:2px solid #e0e0e0;font-weight:bold;">Počet faktur</th>
                <th style="text-align:right;border-bottom:2px solid #e0e0e0;font-weight:bold;">Základ daně</th>
                <th style="text-align:right;border-bottom:2px solid #e0e0e0;font-weight:bold;">DPH</th>
                <th style="text-align:right;border-bottom:2px solid #e0e0e0;font-weight:bold;">Celkem</th>
              </tr>
              {{vat_breakdown}}
            </table>
          </td>
        </tr>

        <!-- Monthly comparison -->
        <tr>
          <td style="padding:0 40px 24px 40px;">
            <h2 style="font-size:18px;margin:0 0 16px 0;color:#000;">Porovnání s předchozím měsícem</h2>
            <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:4px;">
              <tr style="background:#f8f8f8;">
                <td style="font-weight:bold;border-bottom:1px solid #e0e0e0;">Změna počtu faktur:</td>
                <td style="text-align:right;border-bottom:1px solid #e0e0e0;{{invoice_change_color}}">{{invoice_count_change}}</td>
              </tr>
              <tr>
                <td style="font-weight:bold;border-bottom:1px solid #e0e0e0;">Změna celkové částky:</td>
                <td style="text-align:right;border-bottom:1px solid #e0e0e0;{{revenue_change_color}}">{{revenue_change}}</td>
              </tr>
              <tr style="background:#f8f8f8;">
                <td style="font-weight:bold;">Změna v procentech:</td>
                <td style="text-align:right;{{percentage_change_color}}">{{percentage_change}}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer section -->
        <tr>
          <td style="padding:0 40px 32px 40px;">
            <p style="font-size:14px;margin:16px 0 0 0;color:#666;text-align:center;">
              Tento přehled byl automaticky vygenerován dne {{generation_date}}.
            </p>
            <p style="font-size:14px;margin:8px 0 0 0;color:#666;text-align:center;">
              <strong>Tým BeBrave Studio</strong>
            </p>
          </td>
        </tr>
        
        <!-- Legal -->
        <tr>
          <td style="background:#f4f4f4;padding:16px 40px;text-align:center;font-size:12px;color:#666666;">
            Tento e-mail obsahuje důvěrné finanční informace. Pokud jste jej obdrželi omylem, kontaktujte nás.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`;