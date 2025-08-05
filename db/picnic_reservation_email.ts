export const picnicReservationEmail = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <title>Potvrzení rezervace lekce – {{studio_name}}</title>
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
              <img src="https://bebravestudio.cz/loga/bebrave_black.png" alt="{{studio_name}} logo" style="max-width:320px;height:auto;border:0;" />
            </a>
            <h1 style="text-align:center;margin:0;font-size:24px;color:#000;">Potvrzení rezervace</h1>
          </td>
        </tr>
        <!-- Details section -->
        <tr>
          <td style="padding:0 40px 24px 40px;">
            <p style="margin:0 0 16px 0;">Dobrý den {{first_name}}, potvrzujeme Vaši rezervaci:</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#000;">

              <tr>
                <td style="padding:8px 0;"><strong>Co:</strong></td>
                <td style="padding:8px 0;">{{class_name}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;"><strong>S&nbsp;kým:</strong></td>
                <td style="padding:8px 0;">{{trainer_name}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;"><strong>Cena:</strong></td>
                <td style="padding:8px 0;">{{price}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;"><strong>Platba:</strong></td>
                <td style="padding:8px 0;">{{payment_method}}</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Special picnic section -->
        <tr>
          <td style="padding:24px 40px 24px 40px;">
            <div style="background:#e8f5e8;border-radius:8px;padding:24px;border-left:4px solid #4CAF50;">
              <h2 style="font-size:16px;margin:0 0 16px 0;color:#2E7D32;">LES MILLS CORE & PICNIC</h2>
            <p style="margin:0 0 16px 0;font-size:14px;color:#000;">Děkujeme za tvou rezervaci na naší akci LES MILLS CORE & PICNIC!</p>
            <p style="margin:0 0 16px 0;font-size:14px;color:#000;">Rádi bychom tě poprosili, aby sis vybrala na piknik, které POKE BO si ráda dáš:</p>
            <p style="margin:0 0 16px 0;font-size:14px;color:#000;"><strong>BO LOSOS, BO TUŇÁK, BO KREVETY, BO KUŘE, BO HOVĚZÍ, BO VEGAN</strong></p>
            <p style="margin:0 0 16px 0;font-size:14px;color:#000;">a napiš nám prosím zpět tvůj výběr</p>
            <p style="margin:0 0 16px 0;font-size:14px;color:#000;"><strong>Sraz bude v pátek 8.8. v 16.50h u Divadla loutek</strong></p>
            <p style="margin:0 0 16px 0;font-size:14px;color:#000;">V případě jakýchkoliv otázek nám dej vědět</p>
            <p style="margin-bottom:0;font-size:14px;color:#000;"><strong>Těšíme se na tebe</strong></p>
            </div>
          </td>
        </tr>

        {{invoice_info}}
        <!-- Footer section -->
        <tr>
          <td style="padding:0 40px 24px 40px;">
            <p style="font-size:14px;margin:0 0 16px 0;color:#000;">Ve studiu jsme se snažili připravit vše pro vaše maximální pohodlí. Proto věříme, že se u nás budete cítit jako doma !</p>
            <p style="font-size:14px;margin:0 0 16px 0;color:#000;">Máte otázky? Odpovězte na tento e-mail nebo nám zavolejte na <a href="tel:731 906 623" style="color:#0066cc;text-decoration:none;">731 906 623</a>.</p>
            <p style="font-size:14px;margin:0;color:#000;"><strong>Tým BeBrave.</strong></p>
          </td>
        </tr>
        <!-- Legal -->
        <tr>
          <td style="background:#f4f4f4;padding:16px 40px;text-align:center;font-size:12px;color:#666666;">
            Pokud tento e-mail přišel omylem, ignorujte jej nebo nás kontaktujte.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`;