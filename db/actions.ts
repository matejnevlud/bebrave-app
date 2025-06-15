"use server";

import { db } from "@/db";
import {Class, classesTable, ClassType, classTypesTable, ClassWithRelations, reservationsTable, Trainer, trainersTable, TrainerWithRelations} from "@/db/schema";
import { desc } from "drizzle-orm";
import {Resend} from "resend";
import axios from "axios";
import {reservationEmail} from "@/db/reservation_email";


// Keep inmemory last access token
const CLOUD_ID = process.env.CLOUD_ID || '373067553';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN || 'f4813dc9dd81ebcc58dbefa452a3295c';
var ACCESS_TOKEN: string | PromiseLike<string | null> | null = null;


export async function getTrainers(): Promise<TrainerWithRelations[]> {
    const data = await db.query.trainersTable.findMany({
        with: {
            trainerClassTypes: {
                with: {
                    classType: true,
                }
            },
            classes: {
                with: {
                    classType: true,
                    reservations: true,
                }
            },
        }
    });

    return data as TrainerWithRelations[];
}

export async function getClassTypes(): Promise<ClassType[]> {
    const data = await db.query.classTypesTable.findMany({
        with: {
            trainerClassTypes: {
                with: {
                    trainer: true,
                }
            },
            classes: {
                with: {
                    trainer: true,
                    secondTrainer: true,
                    reservations: true,
                }
            },
        }
    });

    return data;
}

export async function getClasses(): Promise<ClassWithRelations[]> {
    let data = await db.query.classesTable.findMany({
        with: {
            classType: true,
            trainer: true,
            secondTrainer: true,
            reservations: true,
        }
    });

    // Sort classes by date and then by time, the time is in HH:MM format so it can be sorted as a string
    data = data.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA.getTime() - dateB.getTime();
    });

    return data as ClassWithRelations[];
}


export async function createReservation(classWithRelations: ClassWithRelations, userId?: string, userData?: any): Promise<boolean> {


    if (!userId && !userData) {
        throw new Error("Either userId or userData must be provided to create a reservation");
    }

    try {

        let dotyposUserId = userId ? String(userId) : null;
        // If userId is not provided, create a new customer in Dotypos
        if (!dotyposUserId)
            dotyposUserId = await dotyposCreateCustomer(userData);

        // insert reservation into the database
        await db.insert(reservationsTable).values({
            classId: classWithRelations.id,
            userId: dotyposUserId,
            status: 'confirmed', // or 'confirmed' based on your logic
            firstName: userData?.firstName,
            lastName: userData?.lastName,
            email: userData?.email,
            phone: userData?.phone,
        })


        let htmlString = reservationEmail;
        // Replace placeholders with actual data
        htmlString = htmlString.replace('{{studio_name}}', 'BeBrave Studio');
        htmlString = htmlString.replace('{{first_name}}', userData?.firstName || 'Zákazník');
        htmlString = htmlString.replace('{{date}}', new Date(classWithRelations?.date ?? -1).toLocaleDateString('cs-CZ', { weekday: 'long' }) + ', ' + new Date(classWithRelations?.date ?? -1).toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' }));
        htmlString = htmlString.replace('{{time}}', classWithRelations?.time || 'Neznámý čas');
        htmlString = htmlString.replace('{{class_name}}', classWithRelations.classType.name);
        htmlString = htmlString.replace('{{trainer_name}}', classWithRelations.trainer.name);
        htmlString = htmlString.replace('{{price}}', classWithRelations.classType.price ? `${classWithRelations.classType.price} Kč` : 'Cena není stanovena');

        // Send email using Resend
        const resend = new Resend('re_fPhhnprW_2SD7UaFhoM9ZdPo7bhWeMqxc');

        // set js Date locale to Czech
        resend.emails.send({
            from: 'BeBrave Studio <info@bebravestudio.cz>',
            to: [userData?.email],
            subject: `Rezervace lekce ${classWithRelations.classType.name} - ${new Date(classWithRelations.date).toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' })}`,
            html: htmlString,
        }).catch(err => {
            console.error("Error sending email:", err);
            alert("Došlo k chybě při odesílání rezervace. Zkuste to prosím znovu později.");
        })

        return Promise.resolve(true);
    } catch (error) {
        console.error("Error creating reservation:", error);
        return Promise.reject("Došlo k chybě při vytváření rezervace. Zkuste to prosím znovu později.");
    }

}


async function getNewAccessToken(): Promise<string | null> {
    if (!REFRESH_TOKEN) {
        console.error("No refresh token provided");
        return null;
    }

    const response = await axios({
        "method": "POST",
        "url": "https://api.dotykacka.cz/v2/signin/token",
        "headers": {
            "Content-Type": "application/json; charset=UTF-8",
            "Accept": "application/json; charset=UTF-8",
            "Authorization": `User ${REFRESH_TOKEN}`,
        },
        "data": {
            "_cloudId": CLOUD_ID,
        }
    })


    ACCESS_TOKEN = response.data?.accessToken;

    return ACCESS_TOKEN;
}

async function dotyposCreateCustomer(userData: any): Promise<string | null> {
    if (!ACCESS_TOKEN) {
        ACCESS_TOKEN = await getNewAccessToken();
    }

    if (!ACCESS_TOKEN) {
        throw new Error("No access token available");
    }

    console.log("Creating customer in Dotypos with data:", userData);
    console.log(`email|like|${userData.email}`);
    console.log(`CLOUD_ID: ${CLOUD_ID}`);
    console.log(`Bearer ${ACCESS_TOKEN}`);


    try {
        const response = await axios({
            "method": "GET",
            "url": `https://api.dotykacka.cz/v2/clouds/${CLOUD_ID}/customers`,
            "params": {
                "filter" : `email|like|${userData.email}`,
            },
            "headers": {
                "Content-Type": "application/json; charset=UTF-8",
                "Accept": "application/json; charset=UTF-8",
                "Authorization": `Bearer ${ACCESS_TOKEN}`,
            }
        })

        console.log("Response from Dotypos:", response.data);

        if (response.data?.totalItemsCount > 0) {
            // Customer already exists, return the first one
            return response.data.data[0]?.id;
        }
    } catch (error) {

        // if response 404, then the customer does not exist
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // Create a new customer
            const createResponse = await axios({
                "method": "POST",
                "url": `https://api.dotykacka.cz/v2/clouds/${CLOUD_ID}/customers`,
                "headers": {
                    "Content-Type": "application/json; charset=UTF-8",
                    "Accept": "application/json; charset=UTF-8",
                    "Authorization": `Bearer ${ACCESS_TOKEN}`,
                },
                "data": [
                    {
                        "_cloudId": CLOUD_ID,
                        "firstName": userData.firstName,
                        "lastName": userData.lastName,
                        "phone": String(userData.phone),
                        "email": userData.email,

                        //"externalId": "",
                        "internalNote": "",

                        "addressLine1": "",
                        //"city": "",
                        //"country": "",
                        "zip": "",

                        "barcode": "",
                        "companyId": "",
                        "companyName": "",
                        "deleted": false,
                        "display": true,
                        "headerPrint": "",
                        "hexColor": "#000000",
                        "points": 0,
                        "tags": [],
                        "vatId": "",
                        "flags": "0"
                    }
                ]
            });

            return createResponse.data[0]?.id || null;
        } else {
            console.error("Error fetching customer:", error);
            throw new Error("Nastala se chyba při vytváření zákazníka v Dotykačce. Zkuste to prosím znovu později.");
        }
    }

    return null;
}