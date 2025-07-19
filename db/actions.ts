"use server";

import {desc, eq, max, sql} from "drizzle-orm";
import {Resend} from "resend";
import axios from "axios";

import {db} from "@/db";
import {
    Class,
    classesTable,
    ClassType,
    classTypesTable,
    ClassTypeWithRelations,
    ClassWithRelations,
    reservationsTable,
    Trainer,
    trainersTable,
    TrainerWithRelations,
    invoicesTable,
    Invoice,
} from "@/db/schema";
import {reservationEmail} from "@/db/reservation_email";
import {reservation500Email} from "@/db/reservation_500_email";
import {nexiPaymentService} from "@/lib/services/nexi";
import {PDFInvoiceService} from "@/lib/services/pdf-invoice";
import {generateSecureInvoicePdfUrl} from "@/lib/invoice-security";

// Keep inmemory last access token
const CLOUD_ID = process.env.CLOUD_ID || "373067553";
const REFRESH_TOKEN =
    process.env.REFRESH_TOKEN || "f4813dc9dd81ebcc58dbefa452a3295c";
var ACCESS_TOKEN: string | PromiseLike<string | null> | null = null;

export async function getTrainers(): Promise<TrainerWithRelations[]> {
    const data = await db.query.trainersTable.findMany({
        with: {
            trainerClassTypes: {
                with: {
                    classType: true,
                },
            },
            classes: {
                with: {
                    classType: true,
                    reservations: true,
                },
            },
        },
    });

    return data as TrainerWithRelations[];
}

export async function createTrainer(
    trainerData: Partial<Trainer>,
): Promise<TrainerWithRelations | null> {
    try {
        if (!trainerData.name || !trainerData.email) {
            throw new Error("Missing required fields to create a trainer");
        }

        const [newTrainer] = await db
            .insert(trainersTable)
            .values(trainerData as any)
            .returning();

        const trainerWithRelations = await db.query.trainersTable.findFirst({
            where: eq(trainersTable.id, newTrainer.id),
            with: {
                trainerClassTypes: {
                    with: {
                        classType: true,
                    },
                },
                classes: {
                    with: {
                        classType: true,
                        reservations: true,
                    },
                },
            },
        });

        return trainerWithRelations as TrainerWithRelations;
    } catch (error) {
        console.error("Error creating trainer:", error);
        throw new Error(
            "Nastala se chyba při vytváření trenéra. Zkuste to prosím znovu později.",
        );
    }
}

export async function updateTrainer(
    trainerId: number | undefined,
    trainerData: Partial<Trainer>,
): Promise<TrainerWithRelations | null> {
    try {
        if (!trainerId) {
            throw new Error("Trainer ID is required to update a trainer");
        }

        if (trainerData.id) delete trainerData.id;

        const updatedTrainer = await db
            .update(trainersTable)
            .set(trainerData)
            .where(eq(trainersTable.id, trainerId))
            .returning();

        if (updatedTrainer.length === 0) {
            return null;
        }

        const trainerWithRelations = await db.query.trainersTable.findFirst({
            where: eq(trainersTable.id, trainerId),
            with: {
                trainerClassTypes: {
                    with: {
                        classType: true,
                    },
                },
                classes: {
                    with: {
                        classType: true,
                        reservations: true,
                    },
                },
            },
        });

        return trainerWithRelations as TrainerWithRelations;
    } catch (error) {
        console.error("Error updating trainer:", error);
        throw new Error(
            "Nastala se chyba při aktualizaci trenéra. Zkuste to prosím znovu později.",
        );
    }
}

export async function deleteTrainer(trainerId: number): Promise<boolean> {
    try {
        const result = await db
            .delete(trainersTable)
            .where(eq(trainersTable.id, trainerId));

        return true;
    } catch (error) {
        console.error("Error deleting trainer:", error);
        throw new Error(
            "Nastala se chyba při mazání trenéra. Zkuste to prosím znovu později.",
        );
    }
}

export async function getClassTypes(): Promise<ClassTypeWithRelations[]> {
    const data = await db.query.classTypesTable.findMany({
        with: {
            trainerClassTypes: {
                with: {
                    trainer: true,
                },
            },
            classes: {
                with: {
                    trainer: true,
                    secondTrainer: true,
                    reservations: true,
                },
            },
        },
    });

    return data as any;
}

export async function getClasses(): Promise<ClassWithRelations[]> {
    let data = await db.query.classesTable.findMany({
        with: {
            classType: true,
            trainer: true,
            secondTrainer: true,
            reservations: true,
        },
    });

    // Sort classes by date and then by time, the time is in HH:MM format so it can be sorted as a string
    data = data.sort((a, b) => {
        const dateA = new Date(a.date + "T" + a.time);
        const dateB = new Date(b.date + "T" + b.time);

        return dateA.getTime() - dateB.getTime();
    });

    // Filter out classes that are in the past
    data = data.filter((classItem) => {
        const classDate = new Date(classItem.date + "T" + classItem.time);

        return classDate.getTime() >= Date.now();
    });

    return data as ClassWithRelations[];
}

export async function createClass(
    classData: Partial<Class>,
): Promise<ClassWithRelations | null> {
    try {
        // Ensure classData has all required fields
        if (
            !classData.classTypeId ||
            !classData.trainerId ||
            !classData.date ||
            !classData.time ||
            !classData.location ||
            !classData.capacity
        ) {
            throw new Error("Missing required fields to create a class");
        }

        console.log(classData);
        // Insert the new class into the database
        const [newClass] = await db
            .insert(classesTable)
            .values(classData as any)
            .returning();

        // Fetch the newly created class with relations
        const classWithRelations = await db.query.classesTable.findFirst({
            where: eq(classesTable.id, newClass.id),
            with: {
                classType: true,
                trainer: true,
                secondTrainer: true,
                reservations: true,
            },
        });

        return classWithRelations as ClassWithRelations;
    } catch (error) {
        console.error("Error creating class:", error);
        throw new Error(
            "Nastala se chyba při vytváření lekce. Zkuste to prosím znovu později.",
        );
    }
}

export async function updateClass(
    classId: number | undefined,
    classData: Partial<Class>,
): Promise<ClassWithRelations | null> {
    try {
        if (!classId) {
            throw new Error("Class ID is required to update a class");
        }

        //strip id from classData if it exists
        if (classData.id) delete classData.id;

        const updatedClass = await db
            .update(classesTable)
            .set(classData)
            .where(eq(classesTable.id, classId))
            .returning();

        if (updatedClass.length === 0) {
            return null;
        }

        // Fetch the updated class with relations
        const classWithRelations = await db.query.classesTable.findFirst({
            where: eq(classesTable.id, classId),
            with: {
                classType: true,
                trainer: true,
                secondTrainer: true,
                reservations: true,
            },
        });

        return classWithRelations as ClassWithRelations;
    } catch (error) {
        console.error("Error updating class:", error);
        throw new Error(
            "Nastala se chyba při aktualizaci lekce. Zkuste to prosím znovu později.",
        );
    }
}

export async function deleteClass(classId: number): Promise<boolean> {
    try {
        // Delete the class from the database
        const result = await db
            .delete(classesTable)
            .where(eq(classesTable.id, classId));

        return true;
    } catch (error) {
        console.error("Error deleting class:", error);
        throw new Error(
            "Nastala se chyba při mazání lekce. Zkuste to prosím znovu později.",
        );
    }
}

export async function createClassType(
    classTypeData: Partial<ClassType>,
): Promise<ClassTypeWithRelations | null> {
    try {
        // Ensure classTypeData has all required fields
        if (!classTypeData.name || !classTypeData.price) {
            throw new Error("Missing required fields to create a class type");
        }

        // Insert the new class type into the database
        const [newClassType] = await db
            .insert(classTypesTable)
            .values(classTypeData as any)
            .returning();

        // Fetch the newly created class type with relations
        const classTypeWithRelations = await db.query.classTypesTable.findFirst({
            where: eq(classTypesTable.id, newClassType.id),
            with: {
                trainerClassTypes: {
                    with: {
                        trainer: true,
                    },
                },
                classes: {
                    with: {
                        trainer: true,
                        secondTrainer: true,
                        reservations: true,
                    },
                },
            },
        });

        return classTypeWithRelations as any as ClassTypeWithRelations;
    } catch (error) {
        console.error("Error creating class type:", error);
        throw new Error(
            "Nastala se chyba při vytváření typu lekce. Zkuste to prosím znovu později.",
        );
    }
}

export async function updateClassType(
    classTypeId: number | undefined,
    classTypeData: Partial<ClassType>,
): Promise<ClassTypeWithRelations | null> {
    try {
        if (!classTypeId) {
            throw new Error("Class Type ID is required to update a class type");
        }

        //strip id from classTypeData if it exists
        if (classTypeData.id) delete classTypeData.id;

        const updatedClassType = await db
            .update(classTypesTable)
            .set(classTypeData)
            .where(eq(classTypesTable.id, classTypeId))
            .returning();

        if (updatedClassType.length === 0) {
            return null;
        }

        // Fetch the updated class type with relations
        const classTypeWithRelations = await db.query.classTypesTable.findFirst({
            where: eq(classTypesTable.id, classTypeId),
            with: {
                trainerClassTypes: {
                    with: {
                        trainer: true,
                    },
                },
                classes: {
                    with: {
                        trainer: true,
                        secondTrainer: true,
                        reservations: true,
                    },
                },
            },
        });

        return classTypeWithRelations as any as ClassTypeWithRelations;
    } catch (error) {
        console.error("Error updating class type:", error);
        throw new Error(
            "Nastala se chyba při aktualizaci typu lekce. Zkuste to prosím znovu později.",
        );
    }
}

export async function createReservation(
    classWithRelations: ClassWithRelations,
    userId?: string,
    userData?: any,
): Promise<boolean | string> {
    if (!userId && !userData) {
        throw new Error(
            "Either userId or userData must be provided to create a reservation",
        );
    }

    try {
        let dotyposUserId = userId ? String(userId) : null;

        // If userId is not provided, create a new customer in Dotypos
        if (!dotyposUserId) dotyposUserId = await dotyposCreateCustomer(userData);

        const paymentMethod = userData?.paymentMethod || "on_site";
        const amount = classWithRelations.classType.price;
        const amountInCents = nexiPaymentService.convertToCents(amount);
        // Note: For testing purposes, uncomment the line below to use 20 cents instead
        // const amountInCents = 20;

        // Handle different payment methods
        if (paymentMethod === "credit_card") {
            // Create reservation with pending payment status
            const [reservation] = await db
                .insert(reservationsTable)
                .values({
                    classId: classWithRelations.id,
                    userId: dotyposUserId,
                    status: "pending_payment",
                    firstName: userData?.firstName,
                    lastName: userData?.lastName,
                    email: userData?.email,
                    phone: userData?.phone,
                    paymentMethod: "credit_card",
                    paymentStatus: "pending",
                    paymentAmount: amountInCents,
                    paymentCurrency: "CZK",
                })
                .returning();

            // Create payment session with Nexi
            const baseUrl = process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : process.env.NODE_ENV === "development"
                    ? "http://localhost:3000"
                    : "https://bebravestudio.cz";

            const paymentSessionData = {
                amount: amountInCents,
                orderId: `bebrave-${reservation.id}-${Date.now()}`,
                description: `${classWithRelations.classType.name} - ${classWithRelations.trainer.name}`,
                customerInfo: {
                    name: `${userData.firstName} ${userData.lastName}`,
                    email: userData.email,
                    phone: userData.phone,
                    address: userData.address || "Customer Address",
                    city: userData.city || "Prague",
                    postalCode: userData.postalCode || "11000",
                    country: userData.country || "CZE",
                },
                resultUrl: `${baseUrl}/reservation/payment/success?reservationId=${reservation.id}`,
                cancelUrl: `${baseUrl}/reservation/payment/cancel?reservationId=${reservation.id}`,
                notificationUrl: `${baseUrl}/api/payment/webhook`,
            };

            const paymentSession =
                await nexiPaymentService.createPaymentSession(paymentSessionData);

            // Update reservation with payment session info
            await db
                .update(reservationsTable)
                .set({
                    paymentTransactionId: paymentSession.orderId,
                    paymentSecurityToken: paymentSession.securityToken,
                    paymentHostedPageUrl: paymentSession.hostedPage,
                })
                .where(eq(reservationsTable.id, reservation.id));

            // Redirect to payment page
            return paymentSession.hostedPage;
        } else {
            // Handle other payment methods (on_site, qr_payment)
            const reservation = await db
                .insert(reservationsTable)
                .values({
                    classId: classWithRelations.id,
                    userId: dotyposUserId,
                    status: "confirmed",
                    firstName: userData?.firstName,
                    lastName: userData?.lastName,
                    email: userData?.email,
                    phone: userData?.phone,
                    paymentMethod: paymentMethod,
                    paymentStatus: paymentMethod === "on_site" ? "pending" : "completed",
                    paymentAmount: amountInCents,
                    paymentCurrency: "CZK",
                })
                .returning();

            // Generate invoice for all payment methods
            await generateInvoice(reservation[0].id, classWithRelations, userData);

            // Send confirmation email
            await sendConfirmationEmail(
                classWithRelations,
                userData,
                paymentMethod,
                reservation[0].id,
            );

            return Promise.resolve(true);
        }
    } catch (error) {
        console.error("Error creating reservation:", error);

        return Promise.reject(
            "Došlo k chybě při vytváření rezervace. Zkuste to prosím znovu později.",
        );
    }
}

// Process payment result and finalize reservation
export async function getReservationWithDetails(reservationId: number) {
    try {
        const reservation = await db.query.reservationsTable.findFirst({
            where: eq(reservationsTable.id, reservationId),
            with: {
                class: {
                    with: {
                        classType: true,
                        trainer: true,
                    },
                },
            },
        });
        
        return reservation;
    } catch (error) {
        console.error("Error fetching reservation details:", error);
        return null;
    }
}

export async function processPaymentResult(
    reservationId: number,
    paymentResult: any,
): Promise<boolean> {
    try {
        const reservation = await getReservationWithDetails(reservationId);

        if (!reservation) {
            throw new Error("Reservation not found");
        }

        if (paymentResult.success) {
            // Update reservation status
            await db
                .update(reservationsTable)
                .set({
                    status: "confirmed",
                    paymentStatus: "completed",
                    paymentCompletedAt: new Date(),
                })
                .where(eq(reservationsTable.id, reservationId));

            // Generate invoice with full customer data
            await generateInvoice(reservationId, reservation.class, {
                firstName: reservation.firstName,
                lastName: reservation.lastName,
                email: reservation.email,
                phone: reservation.phone,
                // Note: For credit card payments, we should ideally store address data in reservations table
                // For now, we'll use default values since the address is collected during payment
                address: "Adresa zákazníka",
                city: "Praha",
                postalCode: "11000",
                country: "Česká republika",
            });

            // Send confirmation email with full customer data
            await sendConfirmationEmail(
                reservation.class,
                {
                    firstName: reservation.firstName,
                    lastName: reservation.lastName,
                    email: reservation.email,
                    phone: reservation.phone,
                    address: "Adresa zákazníka",
                    city: "Praha",
                    postalCode: "11000",
                    country: "Česká republika",
                },
                "credit_card",
                reservationId,
            );

            return true;
        } else {
            // Payment failed
            await db
                .update(reservationsTable)
                .set({
                    status: "cancelled",
                    paymentStatus: "failed",
                })
                .where(eq(reservationsTable.id, reservationId));

            return false;
        }
    } catch (error) {
        console.error("Error processing payment result:", error);

        return false;
    }
}

// Generate sequential invoice
async function generateInvoice(
    reservationId: number,
    classWithRelations: any,
    userData: any,
): Promise<Invoice | null> {
    try {
        // Get next invoice number
        const lastInvoice = await db
            .select({invoiceNumber: max(invoicesTable.invoiceNumber)})
            .from(invoicesTable)
            .then((result) => result[0]);

        const nextInvoiceNumber = (lastInvoice?.invoiceNumber || 0) + 1;

        const totalPriceInCzk = classWithRelations.classType.price;
        const totalAmountInCents =
            nexiPaymentService.convertToCents(totalPriceInCzk);

        // Calculate VAT (21% is already included in the total price)
        const vatRate = 21;
        const vatMultiplier = 1 + vatRate / 100; // 1.21
        const amountWithoutVatInCents = Math.round(
            totalAmountInCents / vatMultiplier,
        );
        const vatAmountInCents = totalAmountInCents - amountWithoutVatInCents;

        // Build customer address - include even partial information
        const addressParts = [];

        if (userData.address) addressParts.push(userData.address);
        if (userData.postalCode && userData.city) {
            addressParts.push(`${userData.postalCode} ${userData.city}`);
        } else if (userData.city) {
            addressParts.push(userData.city);
        }
        if (userData.country && userData.country !== "Česká republika") {
            addressParts.push(userData.country);
        }
        const customerAddress =
            addressParts.length > 0 ? addressParts.join(", ") : null;

        // Get class date for DUZP (date of taxable supply)
        const classDate = new Date(classWithRelations.date);

        // Get payment method from reservation
        const reservation = await db.query.reservationsTable.findFirst({
            where: eq(reservationsTable.id, reservationId),
        });

        const [invoice] = await db
            .insert(invoicesTable)
            .values({
                invoiceNumber: nextInvoiceNumber,
                reservationId: reservationId,
                amount: amountWithoutVatInCents, // Amount without VAT
                vatRate: vatRate,
                vatAmount: vatAmountInCents,
                totalAmount: totalAmountInCents, // Total amount including VAT
                description: `${classWithRelations.classType.name} - ${classWithRelations.trainer.name}`,
                customerName: `${userData.firstName} ${userData.lastName}`,
                customerEmail: userData.email,
                customerPhone: userData.phone,
                customerAddress: customerAddress,
                duzp: classDate, // Date of taxable supply (class date)
                paymentMethod: reservation?.paymentMethod || "on_site",
                status: "issued",
            })
            .returning();

        // Set PDF URL to API endpoint (PDF will be generated on-demand)
        try {
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

            // Update invoice with PDF URL
            await db
                .update(invoicesTable)
                .set({
                    pdfUrl: pdfUrl,
                })
                .where(eq(invoicesTable.id, invoice.id));

            console.log(`Invoice PDF URL set: ${pdfUrl}`);
        } catch (pdfError) {
            console.error("Error setting PDF URL for invoice:", pdfError);
            // Don't fail the entire invoice creation if URL setting fails
        }

        return invoice;
    } catch (error) {
        console.error("Error generating invoice:", error);

        return null;
    }
}

// Send confirmation email
async function sendConfirmationEmail(
    classWithRelations: any,
    userData: any,
    paymentMethod: string,
    reservationId?: number,
): Promise<void> {
    try {
        // Validate email address exists
        if (!userData?.email) {
            console.error("No email address provided for confirmation email", {
                paymentMethod,
                reservationId,
                userData: userData
                    ? {firstName: userData.firstName, lastName: userData.lastName}
                    : null,
            });

            return;
        }

        console.log(
            `Sending confirmation email for ${paymentMethod} payment to ${userData.email}`,
        );

        let htmlString = reservationEmail;

        if (classWithRelations.classTypeId === 21) htmlString = reservation500Email;

        // Replace placeholders with actual data
        htmlString = htmlString.replace("{{studio_name}}", "BeBrave Studio");
        htmlString = htmlString.replace(
            "{{first_name}}",
            userData?.firstName || "Zákazník",
        );
        htmlString = htmlString.replace(
            "{{date}}",
            new Date(classWithRelations?.date ?? -1).toLocaleDateString("cs-CZ", {
                weekday: "long",
            }) +
            ", " +
            new Date(classWithRelations?.date ?? -1).toLocaleDateString("cs-CZ", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        );
        htmlString = htmlString.replace(
            "{{time}}",
            classWithRelations?.time || "Neznámý čas",
        );
        htmlString = htmlString.replace(
            "{{class_name}}",
            classWithRelations.classType.name,
        );
        htmlString = htmlString.replace(
            "{{trainer_name}}",
            classWithRelations.trainer.name,
        );
        htmlString = htmlString.replace(
            "{{price}}",
            classWithRelations.classType.price
                ? `${classWithRelations.classType.price} Kč`
                : "Cena není stanovena",
        );

        // Add payment method info
        const paymentMethodText =
            paymentMethod === "credit_card"
                ? "Kreditní kartou (uhrazeno)"
                : paymentMethod === "qr_payment"
                    ? "QR platba"
                    : "Na místě";

        htmlString = htmlString.replace("{{payment_method}}", paymentMethodText);

        // Add invoice URL placeholder (will be replaced below if invoice exists)
        let invoiceUrlText = "";

        if (reservationId) {
            // Get invoice to show invoice number and create link
            try {
                const invoice = await db.query.invoicesTable.findFirst({
                    where: eq(invoicesTable.reservationId, reservationId),
                });

                if (invoice) {
                    const pdfDownloadUrl =
                        invoice.pdfUrl ||
                        generateSecureInvoicePdfUrl(
                            "https://bebravestudio.cz",
                            invoice.id,
                            invoice.customerEmail,
                            invoice.createdAt,
                        );

                    invoiceUrlText = `
        <tr>
          <td style="padding:0 40px 16px 40px;">
            <div style="background:#f0f9ff;border:1px solid #3b82f6;border-radius:6px;padding:16px 20px;">
              <p style="margin:0 0 8px 0;font-size:14px;color:#1f2937;"><strong>📄 Faktura č. ${invoice.invoiceNumber}:</strong> V příloze tohoto e-mailu najdete PDF fakturu za vaši rezervaci.</p>
              <p style="margin:0;font-size:13px;color:#6b7280;">
                <a href="${pdfDownloadUrl}" style="color:#3b82f6;text-decoration:none;">Zobrazit fakturu online</a>
              </p>
            </div>
          </td>
        </tr>`;
                }
            } catch (error) {
                console.error("Error getting invoice for email:", error);
                invoiceUrlText = `
        <tr>
          <td style="padding:0 40px 16px 40px;">
            <div style="background:#f0f9ff;border:1px solid #3b82f6;border-radius:6px;padding:16px 20px;">
              <p style="margin:0;font-size:14px;color:#1f2937;"><strong>📄 Faktura:</strong> V příloze tohoto e-mailu najdete PDF fakturu za vaši rezervaci.</p>
            </div>
          </td>
        </tr>`;
            }
        }
        htmlString = htmlString.replace("{{invoice_info}}", invoiceUrlText);

        // Send email using Resend
        const resend = new Resend("re_fPhhnprW_2SD7UaFhoM9ZdPo7bhWeMqxc");

        // Prepare email data
        const emailData: any = {
            from: "BeBrave Studio <info@bebravestudio.cz>",
            to: [userData?.email],
            subject: `Rezervace lekce ${classWithRelations.classType.name} - ${new Date(classWithRelations.date).toLocaleDateString("cs-CZ", {year: "numeric", month: "long", day: "numeric"})}`,
            html: htmlString,
        };

        // Add invoice PDF attachment for all reservations with invoices
        if (reservationId) {
            try {
                // Get invoice for this reservation
                const invoice = await db.query.invoicesTable.findFirst({
                    where: eq(invoicesTable.reservationId, reservationId),
                    with: {
                        reservation: {
                            with: {
                                class: {
                                    with: {
                                        classType: true,
                                        trainer: true,
                                    },
                                },
                            },
                        },
                    },
                });

                if (invoice) {
                    // Use remote PDF URL for email attachment (only in production)
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

                    // Only attach PDF if not using localhost (Resend doesn't support localhost URLs)
                    if (!baseUrl.includes("localhost")) {
                        emailData.attachments = [
                            {
                                path: pdfUrl,
                                filename: fileName,
                            },
                        ];

                        console.log(`Invoice PDF attached to email via URL: ${pdfUrl}`);
                    } else {
                        console.log(
                            `Skipping PDF attachment in development (localhost not supported by Resend): ${pdfUrl}`,
                        );
                    }

                    // Update email subject to indicate invoice is included (only if PDF is attached)
                    if (!baseUrl.includes("localhost")) {
                        emailData.subject = `${emailData.subject} + Faktura ${invoice.invoiceNumber}`;
                    }
                } else {
                    console.log(
                        `No invoice found for reservation ${reservationId}, PDF will not be attached`,
                    );
                }
            } catch (pdfError) {
                console.error("Error generating PDF for email attachment:", pdfError);
                // Continue sending email without PDF attachment
            }
        }

        console.log("Attempting to send email with data:", {
            to: emailData.to,
            subject: emailData.subject,
            hasAttachments: !!emailData.attachments,
            paymentMethod,
        });

        const result = await resend.emails.send(emailData);

        console.log("Email sent successfully:", result);
    } catch (error) {
        console.error("Error sending confirmation email:", {
            error: error.message,
            paymentMethod,
            reservationId,
            email: userData?.email,
            fullError: error,
        });
    }
}

// Get all invoices with pagination and filtering
export async function getInvoices(
    page: number = 1,
    limit: number = 20,
    filter?: string,
): Promise<{ invoices: any[]; total: number }> {
    try {
        const offset = (page - 1) * limit;

        const invoices = await db.query.invoicesTable.findMany({
            with: {
                reservation: {
                    with: {
                        class: {
                            with: {
                                classType: true,
                                trainer: true,
                            },
                        },
                    },
                },
            },
            limit: limit,
            offset: offset,
            orderBy: desc(invoicesTable.createdAt),
        });

        // Get total count for pagination
        const totalResult = await db
            .select({count: sql`count(*)`})
            .from(invoicesTable);

        const total = parseInt(totalResult[0].count as string);

        // Apply client-side filtering if needed
        let filteredInvoices = invoices;

        if (filter) {
            filteredInvoices = invoices.filter(
                (invoice) =>
                    invoice.invoiceNumber.toString().includes(filter) ||
                    invoice.customerName?.toLowerCase().includes(filter.toLowerCase()) ||
                    invoice.customerEmail?.toLowerCase().includes(filter.toLowerCase()),
            );
        }

        return {
            invoices: filteredInvoices as any[],
            total: total,
        };
    } catch (error) {
        console.error("Error fetching invoices:", error);

        return {invoices: [], total: 0};
    }
}

// Get single invoice by ID
export async function getInvoice(invoiceId: number): Promise<any | null> {
    try {
        const invoice = await db.query.invoicesTable.findFirst({
            where: eq(invoicesTable.id, invoiceId),
            with: {
                reservation: {
                    with: {
                        class: {
                            with: {
                                classType: true,
                                trainer: true,
                            },
                        },
                    },
                },
            },
        });

        return invoice as any;
    } catch (error) {
        console.error("Error fetching invoice:", error);

        return null;
    }
}

// Update invoice status
export async function updateInvoiceStatus(
    invoiceId: number,
    status: string,
): Promise<boolean> {
    try {
        await db
            .update(invoicesTable)
            .set({
                status: status,
                updatedAt: new Date(),
            })
            .where(eq(invoicesTable.id, invoiceId));

        return true;
    } catch (error) {
        console.error("Error updating invoice status:", error);

        return false;
    }
}

// Cancel reservation payment
export async function cancelReservationPayment(
    reservationId: number,
): Promise<boolean> {
    try {
        await db
            .update(reservationsTable)
            .set({
                status: "cancelled",
                paymentStatus: "cancelled",
                updatedAt: new Date(),
            })
            .where(eq(reservationsTable.id, reservationId));

        return true;
    } catch (error) {
        console.error("Error cancelling reservation payment:", error);

        return false;
    }
}

async function getNewAccessToken(): Promise<string | null> {
    if (!REFRESH_TOKEN) {
        console.error("No refresh token provided");

        return null;
    }

    const response = await axios({
        method: "POST",
        url: "https://api.dotykacka.cz/v2/signin/token",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Accept: "application/json; charset=UTF-8",
            Authorization: `User ${REFRESH_TOKEN}`,
        },
        data: {
            _cloudId: CLOUD_ID,
        },
    });

    ACCESS_TOKEN = response.data?.accessToken;

    return ACCESS_TOKEN;
}

async function dotyposCreateCustomer(userData: any): Promise<string | null> {
    ACCESS_TOKEN = await getNewAccessToken();

    if (!ACCESS_TOKEN) {
        throw new Error("No access token available");
    }

    console.log("Creating customer in Dotypos with data:", userData);
    console.log(`email|like|${userData.email}`);
    console.log(`CLOUD_ID: ${CLOUD_ID}`);
    console.log(`Bearer ${ACCESS_TOKEN}`);

    try {
        const response = await axios({
            method: "GET",
            url: `https://api.dotykacka.cz/v2/clouds/${CLOUD_ID}/customers`,
            params: {
                filter: `email|like|${userData.email}`,
            },
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                Accept: "application/json; charset=UTF-8",
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
        });

        console.log("Response from Dotypos:", response.data);

        if (response.data?.totalItemsCount > 0) {
            // Customer already exists, update their data except for email
            const existingCustomer = response.data.data[0];

            console.log("ętag " + response.headers["etag"]);
            console.log(existingCustomer);
            const updateResponse = await axios({
                method: "PATCH",
                url: `https://api.dotykacka.cz/v2/clouds/${CLOUD_ID}/customers/${existingCustomer.id}`,
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    Accept: "application/json; charset=UTF-8",
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "If-Match": response.headers["etag"],
                },
                data: {
                    addressLine1: userData.address || "",
                    city: userData.city || "",
                    zip: userData.postalCode || "",
                },
            });

            console.log("Updated existing customer:", updateResponse.data);

            return existingCustomer?.id || null;
        }
    } catch (error) {
        // if response 404, then the customer does not exist
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // Create a new customer
            const createResponse = await axios({
                method: "POST",
                url: `https://api.dotykacka.cz/v2/clouds/${CLOUD_ID}/customers`,
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    Accept: "application/json; charset=UTF-8",
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                },
                data: [
                    {
                        _cloudId: CLOUD_ID,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        phone: String(userData.phone),
                        email: userData.email,

                        //"externalId": "",
                        internalNote: "",

                        addressLine1: userData.address || "",
                        city: userData.city || "",
                        //"country": userData.country || "Česká republika",
                        zip: userData.postalCode || "",

                        barcode: "",
                        companyId: "",
                        companyName: "",
                        deleted: false,
                        display: true,
                        headerPrint: "",
                        hexColor: "#000000",
                        points: 0,
                        tags: [],
                        vatId: "",
                        flags: "0",
                    },
                ],
            });

            return createResponse.data[0]?.id || null;
        } else {
            console.error("Error fetching customer:", error);
            throw new Error(
                "Nastala se chyba při vytváření zákazníka v Dotykačce. Zkuste to prosím znovu později.",
            );
        }
    }

    return null;
}
