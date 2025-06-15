export const reservationEmail = `
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
                <td style="padding:8px 0;width:120px;"><strong>Kdy:</strong></td>
                <td style="padding:8px 0;">{{date}} v {{time}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;"><strong>Kde:</strong></td>
                <td style="padding:8px 0;">Důlní 3394/4, 702 00 Moravská Ostrava a Přívoz</td>
              </tr>
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
                <td style="padding:8px 0;">Hotově nebo kartou na místě</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Guidelines section -->
        <tr>
          <td style="padding:0 40px 24px 40px;">
            <h2 style="font-size:16px;margin:0 0 12px 0;">Aby šlo všechno hladce</h2>
            <ol style="margin:0 0 0 20px;padding:0;font-size:14px;color:#000;">
              <li style="margin-bottom:8px;">Přijďte prosím <strong>nejméně 15&nbsp;minut před začátkem</strong>, ať se stihnete převléknout a osvěžit v Recharge&nbsp;Baru.</li>
              <li style="margin-bottom:8px;">Do sálu vstupujte bez bot – nechte je v botníku.</li>
              <li style="margin-bottom:8px;">Rezervaci lze <strong>zrušit zdarma do 6&nbsp;h před lekcí</strong>.</li>
              <li>Lekce se koná při min. počtu 3 účastníků. V opačném případě vám nejpozději 6&nbsp;h předem dáme vědět a částku vrátíme.</li>
            </ol>
          </td>
        </tr>
        <!-- Footer section -->
        <tr>
          <td style="padding:0 40px 24px 40px;">
            <p style="font-size:14px;margin:0 0 16px 0;color:#000;">Ve studiu jsme se snažili připravit vše pro vaše maximální pohodlí. Proto věříme, že se u nás budete cítit jako doma !</p>
            <p style="font-size:14px;margin:0 0 16px 0;color:#000;">Máte otázky? Odpovězte na tento e-mail nebo nám zavolejte na <a href="tel:603 111 002" style="color:#0066cc;text-decoration:none;">603 111 002</a>.</p>
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