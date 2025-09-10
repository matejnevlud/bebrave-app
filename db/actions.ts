"use server";

import { desc, eq, max, sql, and, gte, lt } from "drizzle-orm";
import { Resend } from "resend";
import axios from "axios";

import { db } from "@/db";
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
    trainerClassTypesTable,
    invoicesTable,
    Invoice,
} from "@/db/schema";
import { reservationEmail } from "@/db/reservation_email";
import { reservation500Email } from "@/db/reservation_500_email";
import { monthlyInvoiceSummaryEmail } from "@/db/monthly_invoice_summary_email";
import { PDFMonthlySummaryService } from "@/lib/services/pdf-monthly-summary";
import { nexiPaymentService } from "@/lib/services/nexi";
import { PDFInvoiceService } from "@/lib/services/pdf-invoice";
import { generateSecureInvoicePdfUrl } from "@/lib/invoice-security";
import { picnicReservationEmail } from "@/db/picnic_reservation_email";

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

export async function getHomepageClassTypes(): Promise<
    ClassTypeWithRelations[]
> {
    const data = await db.query.classTypesTable.findMany({
        where: eq(classTypesTable.isShownOnHomepage, true),
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

export async function getPromoClassType(): Promise<ClassTypeWithRelations> {
    const data = await db.query.classTypesTable.findFirst({
        where: eq(classTypesTable.isShownAsPromo, true),
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

export async function deleteClassType(classTypeId: number): Promise<boolean> {
    try {
        // Delete the class type from the database
        const result = await db
            .delete(classTypesTable)
            .where(eq(classTypesTable.id, classTypeId));

        return true;
    } catch (error) {
        console.error("Error deleting class type:", error);
        throw new Error(
            "Nastala se chyba při mazání typu lekce. Zkuste to prosím znovu později.",
        );
    }
}

export async function createClassType(
    classTypeData: Partial<ClassType>,
    trainerIds?: number[],
): Promise<ClassTypeWithRelations | null> {
    try {
        // Ensure classTypeData has all required fields
        if (!classTypeData.name || !classTypeData.price) {
            throw new Error("Missing required fields to create a class type");
        }

        // Set default payment methods if not provided
        if (!classTypeData.allowedPaymentMethods) {
            classTypeData.allowedPaymentMethods = "credit_card,qr,osobne";
        }

        // Insert the new class type into the database
        const [newClassType] = await db
            .insert(classTypesTable)
            .values(classTypeData as any)
            .returning();

        // Handle trainer associations if provided
        if (trainerIds && trainerIds.length > 0) {
            const associations = trainerIds.map((trainerId) => ({
                classTypeId: newClassType.id,
                trainerId: trainerId,
            }));

            await db.insert(trainerClassTypesTable).values(associations);
        }

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

export async function setAllClassTypesNotShownAsPromo() {
    await db
        .update(classTypesTable)
        .set({ isShownAsPromo: false })
        .where(eq(classTypesTable.isShownAsPromo, true));
}

export async function updateClassType(
    classTypeId: number | undefined,
    classTypeData: Partial<ClassType>,
    trainerIds?: number[],
): Promise<ClassTypeWithRelations | null> {
    try {
        if (!classTypeId) {
            throw new Error("Class Type ID is required to update a class type");
        }

        //strip id from classTypeData if it exists
        if (classTypeData.id) delete classTypeData.id;

        // Ensure allowedPaymentMethods is set if not provided
        if (!classTypeData.allowedPaymentMethods) {
            classTypeData.allowedPaymentMethods = "credit_card,qr,osobne";
        }

        const updatedClassType = await db
            .update(classTypesTable)
            .set(classTypeData)
            .where(eq(classTypesTable.id, classTypeId))
            .returning();

        if (updatedClassType.length === 0) {
            return null;
        }

        // Handle trainer associations if provided
        if (trainerIds !== undefined) {
            // First, delete all existing associations
            await db
                .delete(trainerClassTypesTable)
                .where(eq(trainerClassTypesTable.classTypeId, classTypeId));

            // Then add new associations
            if (trainerIds.length > 0) {
                const associations = trainerIds.map((trainerId) => ({
                    classTypeId: classTypeId,
                    trainerId: trainerId,
                }));

                await db.insert(trainerClassTypesTable).values(associations);
            }
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

        const paymentMethod = userData?.paymentMethod || "osobne";
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
        } else if (paymentMethod === "kredit") {
            if (!dotyposUserId)
                throw new Error("Nemůžeme získat ID zákazníka v Dotypos");
            const balance =
                await dotyposGetCustomerCreditBalanceByUserId(dotyposUserId);

            if (!balance || balance < amount)
                throw new Error("Nemáte dostatečný kredit pro tuto rezervaci");
            const paymentResult = await dotyposPayWithCredit(dotyposUserId, amount);

            if (!paymentResult) throw new Error("Nepodařilo se zaplatit rezervaci");

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
                    paymentStatus: "completed",
                    paymentAmount: amountInCents,
                    paymentCurrency: "CZK",
                })
                .returning();

            // Send confirmation email
            await sendConfirmationEmail(
                classWithRelations,
                userData,
                paymentMethod,
                reservation[0].id,
            );
        } else {
            // Handle other payment methods (osobne, qr_payment)
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
                    paymentStatus: paymentMethod === "osobne" ? "pending" : "completed",
                    paymentAmount: amountInCents,
                    paymentCurrency: "CZK",
                })
                .returning();

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

    // Default return if no conditions match
    return Promise.resolve(true);
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

            // Get customer data from Dotypos for accurate billing address
            let customerData = {
                firstName: reservation.firstName,
                lastName: reservation.lastName,
                email: reservation.email,
                phone: reservation.phone,
                address: "Adresa zákazníka",
                city: "Praha",
                postalCode: "11000",
                country: "Česká republika",
            };

            if (reservation.email) {
                try {
                    const dotyposCustomer = await dotyposGetCustomerByEmail(
                        reservation.email,
                    );

                    if (dotyposCustomer) {
                        customerData = {
                            firstName: dotyposCustomer.firstName || reservation.firstName,
                            lastName: dotyposCustomer.lastName || reservation.lastName,
                            email: reservation.email,
                            phone: dotyposCustomer.phone || reservation.phone,
                            address: dotyposCustomer.addressLine1 || "Adresa zákazníka",
                            city: dotyposCustomer.city || "Praha",
                            postalCode: dotyposCustomer.zip || "11000",
                            country: dotyposCustomer.country || "Česká republika",
                        };
                        console.log(
                            "Using Dotypos customer data for invoice:",
                            customerData,
                        );
                    } else {
                        console.log(
                            "Customer not found in Dotypos, using fallback data for invoice",
                        );
                    }
                } catch (error) {
                    console.error(
                        "Error fetching customer from Dotypos, using fallback data:",
                        error,
                    );
                }
            }

            // Generate invoice only for credit card payments
            let invoice = null;

            if (reservation.paymentMethod === "credit_card") {
                invoice = await generateInvoice(
                    reservationId,
                    reservation.class,
                    customerData,
                );

                // Mark invoice as paid for successful card payments
                if (invoice) {
                    await db
                        .update(invoicesTable)
                        .set({
                            status: "paid",
                        })
                        .where(eq(invoicesTable.id, invoice.id));

                    console.log(
                        `Invoice ${invoice.invoiceNumber} marked as paid for reservation ${reservationId}`,
                    );
                }
            }

            // Send confirmation email with customer data from Dotypos
            await sendConfirmationEmail(
                reservation.class,
                customerData,
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
            .select({ invoiceNumber: max(invoicesTable.invoiceNumber) })
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
                paymentMethod: reservation?.paymentMethod || "osobne",
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
                invoice.customerEmail || "",
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
                    ? { firstName: userData.firstName, lastName: userData.lastName }
                    : null,
            });

            return;
        }

        console.log(
            `Sending confirmation email for ${paymentMethod} payment to ${userData.email}`,
        );

        let htmlString = reservationEmail;

        if (classWithRelations.classTypeId === 21) htmlString = reservation500Email;
        if (classWithRelations.classTypeId === 24)
            htmlString = picnicReservationEmail;

        // Replace placeholders with actual data
        htmlString = htmlString.replace("{{studio_name}}", "BeBrave Studio");
        htmlString = htmlString.replace(
            "{{first_name}}",
            userData?.firstName || "Zákazník",
        );

        // Add custom email message if it exists
        let customMessageHtml = "";

        if (
            classWithRelations.classType.customEmailMessage &&
            classWithRelations.classType.customEmailMessage.trim() !== ""
        ) {
            customMessageHtml = `
        <div style="background:#f0f9ff;border:1px solid #3b82f6;border-radius:6px;padding:16px 20px;margin:16px 0;">
          <p style="margin:0 0 16px 0;font-size:14px;color:#1f2937;">${classWithRelations.classType.customEmailMessage}</p>
        </div>`;
        }
        htmlString = htmlString.replace(
            "{{custom_email_message}}",
            customMessageHtml,
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
                            invoice.customerEmail || "",
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
            bcc: "bgaluskova@intaste.cz",
            subject: `Rezervace lekce ${classWithRelations.classType.name} - ${new Date(classWithRelations.date).toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" })}`,
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
                        invoice.customerEmail || "",
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
            error: error instanceof Error ? error.message : String(error),
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
            .select({ count: sql`count(*)` })
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

        return { invoices: [], total: 0 };
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

// Cancel reservation (staff action - only changes status, not payment status)
export async function cancelReservation(
    reservationId: number,
): Promise<boolean> {
    try {
        await db
            .update(reservationsTable)
            .set({
                status: "cancelled",
                updatedAt: new Date(),
            })
            .where(eq(reservationsTable.id, reservationId));

        return true;
    } catch (error) {
        console.error("Error cancelling reservation:", error);

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

async function dotyposGetCustomerByEmail(email: string): Promise<any | null> {
    ACCESS_TOKEN = await getNewAccessToken();
    if (!ACCESS_TOKEN) {
        throw new Error("No access token available");
    }

    try {
        const response = await axios({
            method: "GET",
            url: `https://api.dotykacka.cz/v2/clouds/${CLOUD_ID}/customers`,
            params: {
                filter: `email|like|${email}`,
            },
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                Accept: "application/json; charset=UTF-8",
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
        });

        if (response.data?.totalItemsCount > 0) {
            return response.data.data[0];
        }

        return null;
    } catch (error) {
        console.error("Error fetching customer from Dotypos:", error);

        return null;
    }
}

export async function dotyposGetCustomerCreditBalanceByEmailAndPhone(
    email: string,
    phone: string,
): Promise<any | null> {
    ACCESS_TOKEN = await getNewAccessToken();
    if (!ACCESS_TOKEN) {
        throw new Error("No access token available");
    }

    let customer = null;
    let balance = null;

    try {
        const response1 = await axios({
            method: "GET",
            url: `https://api.dotykacka.cz/v2/clouds/${CLOUD_ID}/customers`,
            params: {
                filter: `email|like|${email};phone|like|${phone}`,
            },
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                Accept: "application/json; charset=UTF-8",
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
        });

        if (response1.data?.totalItemsCount != 1)
            return { customer: null, balance: null };

        customer = response1.data.data[0];

        // double check if emails match
        if (customer.email != email) return { customer: null, balance: null };
        if (phone.length < 9) return { customer: null, balance: null };

    } catch (error) {
        if (axios.isAxiosError(error) && (error.response?.status == 404 || error.response?.status == 400)) {
            console.log(`Customer not found for email: ${email} and phone: ${phone}`);
        } else {
            console.error(`Error fetching customer account from Dotypos:`, error);
        }

        return { customer: null, balance: null };
    }

    try {
        const customerId = customer.id;

        const response2 = await axios({
            method: "GET",
            url: `https://api.dotykacka.cz/v2/clouds/${CLOUD_ID}/customers/${customerId}/accounts/default`,
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                Accept: "application/json; charset=UTF-8",
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
        });

        const balance = parseFloat(response2.data.balance);

        return { customer, balance };
    } catch (error) {
        if (axios.isAxiosError(error) && (error.response?.status == 404 || error.response?.status == 400)) {
            console.log(
                `Customer credit account not found for email: ${email} and phone: ${phone}`,
            );
        } else {
            console.error(`Error fetching customer account from Dotypos:`, error);
        }

        return { customer, balance: null };
    }
}

async function dotyposGetCustomerCreditBalanceByUserId(
    customerId: string,
): Promise<any | null> {
    ACCESS_TOKEN = await getNewAccessToken();
    if (!ACCESS_TOKEN) {
        throw new Error("No access token available");
    }

    try {
        const response2 = await axios({
            method: "GET",
            url: `https://api.dotykacka.cz/v2/clouds/${CLOUD_ID}/customers/${customerId}/accounts/default`,
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                Accept: "application/json; charset=UTF-8",
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
        });

        const balance = parseFloat(response2.data.balance);

        return balance;
    } catch (error) {
        console.error("Error fetching customer account from Dotypos:", error);

        return null;
    }
}
async function dotyposPayWithCredit(
    customerId: string,
    amount: number,
): Promise<boolean> {
    ACCESS_TOKEN = await getNewAccessToken();
    if (!ACCESS_TOKEN) {
        throw new Error("No access token available");
    }

    try {
        const response2 = await axios({
            method: "POST",
            url: `https://api.dotykacka.cz/v2/clouds/${CLOUD_ID}/customers/${customerId}/accounts/default`,
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                Accept: "application/json; charset=UTF-8",
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
            data: {
                amount,
                currency: "CZK",
                note: "Platba kreditem z rezervačního systému",
                source: "bebravestudio.cz",
                type: "payment",
            },
        });

        return !!response2.data.id;
    } catch (error) {
        console.error("Error fetching customer account from Dotypos:", error);

        return false;
    }
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

interface MonthlyInvoiceSummaryData {
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

// Generate and send monthly invoice summary email
export async function generateMonthlyInvoiceSummary(
    targetMonth?: Date,
    recipientEmail?: string,
): Promise<MonthlyInvoiceSummaryData | null> {
    try {
        // Use current month - 1 if no target month provided
        const now = new Date();
        const summaryDate =
            targetMonth || new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const startOfMonth = new Date(
            summaryDate.getFullYear(),
            summaryDate.getMonth(),
            1,
        );
        const endOfMonth = new Date(
            summaryDate.getFullYear(),
            summaryDate.getMonth() + 1,
            1,
        ); // First day of next month

        // Previous month for comparison
        const startOfPrevMonth = new Date(
            summaryDate.getFullYear(),
            summaryDate.getMonth() - 1,
            1,
        );
        const endOfPrevMonth = new Date(
            summaryDate.getFullYear(),
            summaryDate.getMonth(),
            1,
        ); // First day of target month

        console.log(
            `Generating invoice summary for ${startOfMonth.toLocaleDateString("cs-CZ", { month: "long", year: "numeric" })}`,
        );
        console.log(
            `Date range: ${startOfMonth.toISOString()} to ${endOfMonth.toISOString()}`,
        );

        // Get all invoices for the target month
        const invoices = await db.query.invoicesTable.findMany({
            where: and(
                gte(invoicesTable.issueDate, startOfMonth),
                lt(invoicesTable.issueDate, endOfMonth),
            ),
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
            orderBy: desc(invoicesTable.issueDate),
        });

        console.log(
            `Found ${invoices.length} invoices for the month of ${startOfMonth.toLocaleDateString("cs-CZ", { month: "long", year: "numeric" })}`,
        );

        // Get previous month invoices for comparison
        const prevMonthInvoices = await db.query.invoicesTable.findMany({
            where: and(
                gte(invoicesTable.issueDate, startOfPrevMonth),
                lt(invoicesTable.issueDate, endOfPrevMonth),
            ),
        });

        console.log(
            `Found ${prevMonthInvoices.length} invoices for previous month comparison`,
        );

        // Calculate totals
        const totalInvoices = invoices.length;
        const totalAmountWithoutVat = invoices.reduce(
            (sum, inv) => sum + (inv.amount || 0),
            0,
        );
        const totalVatAmount = invoices.reduce(
            (sum, inv) => sum + (inv.vatAmount || 0),
            0,
        );
        const totalAmountWithVat = invoices.reduce(
            (sum, inv) => sum + (inv.totalAmount || 0),
            0,
        );

        // Group by class type
        const classTypeMap = new Map<
            string,
            {
                name: string;
                count: number;
                amountWithoutVat: number;
                vatAmount: number;
                totalAmount: number;
            }
        >();

        invoices.forEach((invoice) => {
            const classTypeName =
                invoice.reservation?.class?.classType?.name || "Neznámý typ lekce";

            if (!classTypeMap.has(classTypeName)) {
                classTypeMap.set(classTypeName, {
                    name: classTypeName,
                    count: 0,
                    amountWithoutVat: 0,
                    vatAmount: 0,
                    totalAmount: 0,
                });
            }

            const entry = classTypeMap.get(classTypeName)!;

            entry.count++;
            entry.amountWithoutVat += invoice.amount || 0;
            entry.vatAmount += invoice.vatAmount || 0;
            entry.totalAmount += invoice.totalAmount || 0;
        });

        // Group by payment method
        const paymentMethodMap = new Map<
            string,
            {
                method: string;
                methodLabel: string;
                count: number;
                amountWithoutVat: number;
                vatAmount: number;
                totalAmount: number;
            }
        >();

        const paymentMethodLabels: Record<string, string> = {
            credit_card: "Kreditní karta",
            osobne: "Na místě",
            free: "Zdarma",
            on_site: "Na místě",
            qr_payment: "QR platba",
            customer_credit: "Kredit zákazníka",
        };

        invoices.forEach((invoice) => {
            const paymentMethod = invoice.paymentMethod || "osobne";
            const methodLabel = paymentMethodLabels[paymentMethod] || paymentMethod;

            if (!paymentMethodMap.has(paymentMethod)) {
                paymentMethodMap.set(paymentMethod, {
                    method: paymentMethod,
                    methodLabel,
                    count: 0,
                    amountWithoutVat: 0,
                    vatAmount: 0,
                    totalAmount: 0,
                });
            }

            const entry = paymentMethodMap.get(paymentMethod)!;

            entry.count++;
            entry.amountWithoutVat += invoice.amount || 0;
            entry.vatAmount += invoice.vatAmount || 0;
            entry.totalAmount += invoice.totalAmount || 0;
        });

        // Group by VAT rate
        const vatRateMap = new Map<
            number,
            {
                rate: number;
                count: number;
                baseAmount: number;
                vatAmount: number;
                totalAmount: number;
            }
        >();

        invoices.forEach((invoice) => {
            const vatRate = invoice.vatRate || 0;

            if (!vatRateMap.has(vatRate)) {
                vatRateMap.set(vatRate, {
                    rate: vatRate,
                    count: 0,
                    baseAmount: 0,
                    vatAmount: 0,
                    totalAmount: 0,
                });
            }

            const entry = vatRateMap.get(vatRate)!;

            entry.count++;
            entry.baseAmount += invoice.amount || 0;
            entry.vatAmount += invoice.vatAmount || 0;
            entry.totalAmount += invoice.totalAmount || 0;
        });

        // Calculate previous month comparison
        const prevMonthTotal = prevMonthInvoices.reduce(
            (sum, inv) => sum + (inv.totalAmount || 0),
            0,
        );
        const invoiceCountChange = totalInvoices - prevMonthInvoices.length;
        const revenueChange = totalAmountWithVat - prevMonthTotal;
        const percentageChange =
            prevMonthTotal > 0 ? (revenueChange / prevMonthTotal) * 100 : 0;

        const summaryData: MonthlyInvoiceSummaryData = {
            month: startOfMonth.toLocaleDateString("cs-CZ", { month: "long" }),
            year: startOfMonth.getFullYear(),
            totalInvoices,
            totalAmountWithoutVat,
            totalVatAmount,
            totalAmountWithVat,
            classTypeBreakdown: Array.from(classTypeMap.values()).sort(
                (a, b) => b.totalAmount - a.totalAmount,
            ),
            paymentMethodBreakdown: Array.from(paymentMethodMap.values()).sort(
                (a, b) => b.totalAmount - a.totalAmount,
            ),
            vatBreakdown: Array.from(vatRateMap.values()).sort(
                (a, b) => b.rate - a.rate,
            ),
            previousMonthComparison: {
                invoiceCountChange,
                revenueChange,
                percentageChange,
            },
        };

        return summaryData;
    } catch (error) {
        console.error("Error generating monthly invoice summary:", error);

        return null;
    }
}

// Send monthly invoice summary email
export async function sendMonthlyInvoiceSummaryEmail(
    targetMonth?: Date,
    recipientEmail?: string,
): Promise<boolean> {
    try {
        // Determine recipient email based on environment
        let finalRecipientEmail = recipientEmail;

        const summaryData = await generateMonthlyInvoiceSummary(targetMonth);

        if (!summaryData) {
            console.error("Failed to generate monthly invoice summary data");

            return false;
        }

        // Generate PDF attachment
        console.log("Generating PDF attachment...");
        const pdfBufferBase64 =
            await PDFMonthlySummaryService.generatePDF(summaryData);
        const pdfFileName = PDFMonthlySummaryService.generatePDFFileName(
            summaryData.month,
            summaryData.year,
        );

        // Format values for simple email template
        const formatCurrency = (amountInCents: number): string => {
            return (amountInCents / 100).toLocaleString("cs-CZ", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        };

        const formatPercentage = (value: number): string => {
            const sign = value > 0 ? "+" : "";

            return `${sign}${value.toFixed(1)}%`;
        };

        // Determine color for percentage change
        const percentageChangeColor =
            summaryData.previousMonthComparison.percentageChange > 0
                ? "color:#16a34a;"
                : summaryData.previousMonthComparison.percentageChange < 0
                    ? "color:#dc2626;"
                    : "";

        // Replace placeholders in simple email template
        let emailHtml = monthlyInvoiceSummaryEmail
            .replace(/{{month_year}}/g, `${summaryData.month} ${summaryData.year}`)
            .replace(/{{total_invoices}}/g, summaryData.totalInvoices.toString())
            .replace(
                /{{total_amount_with_vat}}/g,
                formatCurrency(summaryData.totalAmountWithVat),
            )
            .replace(
                /{{percentage_change}}/g,
                formatPercentage(summaryData.previousMonthComparison.percentageChange),
            )
            .replace(/{{percentage_change_color}}/g, percentageChangeColor)
            .replace(/{{generation_date}}/g, new Date().toLocaleDateString("cs-CZ"));

        // Send email using Resend with PDF attachment
        const resend = new Resend("re_fPhhnprW_2SD7UaFhoM9ZdPo7bhWeMqxc");

        const result = await resend.emails.send({
            from: "BeBrave Studio <info@bebravestudio.cz>",
            to: [finalRecipientEmail || "nevlud3@gmail.com"],
            subject: `Měsíční přehled faktur - ${summaryData.month} ${summaryData.year}`,
            html: emailHtml,
            attachments: [
                {
                    filename: pdfFileName,
                    content: pdfBufferBase64,
                },
            ],
        });

        console.log("Monthly invoice summary email sent successfully:", result);

        return true;
    } catch (error) {
        console.error("Error sending monthly invoice summary email:", error);

        return false;
    }
}
