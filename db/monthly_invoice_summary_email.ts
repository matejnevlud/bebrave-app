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
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
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
        
        <!-- Content -->
        <tr>
          <td style="padding:0 40px 24px 40px;">
            <p style="margin:0 0 16px 0;font-size:14px;">Dobrý den,</p>
            <p style="margin:0 0 16px 0;font-size:14px;">zasílame Vám měsíční přehled faktur za {{month_year}}.</p>
            
            <!-- Quick Summary -->
            <div style="background:#f0f9ff;border:1px solid #3b82f6;border-radius:6px;padding:16px 20px;margin:20px 0;">
              <p style="margin:0 0 8px 0;font-size:14px;color:#1f2937;"><strong>📊 Shrnutí za {{month_year}}:</strong></p>
              <ul style="margin:0;padding-left:20px;font-size:13px;color:#374151;">
                <li>Celkem faktur: <strong>{{total_invoices}}</strong></li>
                <li>Celková částka: <strong>{{total_amount_with_vat}} Kč</strong> (včetně DPH)</li>
                <li>Změna oproti předchozímu měsíci: <strong style="{{percentage_change_color}}">{{percentage_change}}</strong></li>
              </ul>
            </div>

            <!-- PDF Attachment Notice -->
            <div style="background:#f0fdf4;border:1px solid #22c55e;border-radius:6px;padding:16px 20px;margin:20px 0;">
              <p style="margin:0 0 8px 0;font-size:14px;color:#1f2937;"><strong>📎 Příloha:</strong></p>
              <p style="margin:0;font-size:13px;color:#374151;">Detailní přehled najdete v příloze tohoto e-mailu ve formátu PDF. Obsahuje:</p>
              <ul style="margin:8px 0 0 0;padding-left:20px;font-size:13px;color:#374151;">
                <li>Přehled podle typu lekcí</li>
                <li>Přehled podle způsobu platby</li>
                <li>Analýza DPH</li>
                <li>Porovnání s předchozím měsícem</li>
              </ul>
            </div>

            <p style="margin:16px 0 0 0;font-size:14px;">V případě jakýchkoli dotazů nás neváhejte kontaktovat.</p>
          </td>
        </tr>

        <!-- Footer section -->
        <tr>
          <td style="padding:0 40px 32px 40px;">
            <p style="font-size:14px;margin:16px 0 0 0;color:#666;text-align:center;">
              Vygenerováno automaticky dne {{generation_date}}.
            </p>
            <p style="font-size:14px;margin:8px 0 0 0;color:#000;text-align:center;">
              <strong>Tým BeBrave Studio</strong>
            </p>
            <p style="font-size:12px;margin:8px 0 0 0;color:#666;text-align:center;">
              📧 info@bebravestudio.cz | 📞 +420 731 906 623
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