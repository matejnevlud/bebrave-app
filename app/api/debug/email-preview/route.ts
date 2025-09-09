import {NextRequest, NextResponse} from "next/server";

import {reservationEmail} from "@/db/reservation_email";
import {picnicReservationEmail} from "@/db/picnic_reservation_email";

export async function GET(request: NextRequest) {
    const {searchParams} = new URL(request.url);
    const type = searchParams.get("type") || "reservation";

    // Sample data for template rendering
    const sampleData = {
        studio_name: "BeBrave Studio",
        first_name: "Jana",
        date: "pátek 8. srpna 2025",
        time: "17:00",
        class_name:
            type === "picnic" ? "LES MILLS CORE & PICNIC" : "Les Mills BodyPump",
        trainer_name: "Petra Nováková",
        price: "350 Kč",
        payment_method: "Platební karta",
        invoice_info: `
      <tr>
        <td style="padding:0 40px 24px 40px;">
          <h2 style="font-size:16px;margin:0 0 12px 0;">Faktura</h2>
          <p style="font-size:14px;margin:0 0 8px 0;color:#000;">Číslo faktury: <strong>2025001</strong></p>
          <p style="font-size:14px;margin:0;color:#000;">
            <a href="#" style="color:#0066cc;text-decoration:none;">Stáhnout PDF</a> | 
            <a href="#" style="color:#0066cc;text-decoration:none;">Poslat e-mailem</a>
          </p>
        </td>
      </tr>
    `,
    };

    let emailTemplate: string;

    switch (type) {
        case "picnic":
            emailTemplate = picnicReservationEmail;
            break;
        case "reservation":
        default:
            emailTemplate = reservationEmail;
            break;
    }

    // Replace template variables with sample data
    let renderedEmail = emailTemplate;

    Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");

        renderedEmail = renderedEmail.replace(regex, value);
    });

    return new NextResponse(renderedEmail, {
        headers: {
            "Content-Type": "text/html",
        },
    });
}
