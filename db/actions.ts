"use server";

import { db } from "@/db";
import {Class, ClassType, classTypesTable, ClassWithRelations, reservationsTable, Trainer, trainersTable, TrainerWithRelations} from "@/db/schema";
import {Resend} from "resend";

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
                    reservations: true,
                }
            },
        }
    });

    return data;
}

export async function getClasses(): Promise<ClassWithRelations[]> {
    const data = await db.query.classesTable.findMany({
        with: {
            classType: true,
            trainer: true,
            reservations: {
                with: {
                    user: true,
                }
            },
        }
    });

    return data;
}


export async function createReservation(classWithRelations: ClassWithRelations, userId?: number | string, userData?: any): Promise<boolean> {

    try {
        // insert reservation into the database
        await db.insert(reservationsTable).values({
            classId: classWithRelations.id,
            userId: userId ? Number(userId) : null,
            status: 'confirmed', // or 'confirmed' based on your logic
            name: userData?.name,
            email: userData?.email,
            phone: userData?.phone,
        })


        const resend = new Resend('re_fPhhnprW_2SD7UaFhoM9ZdPo7bhWeMqxc');

        resend.emails.send({
            from: 'BeBrave Studio <info@bebravestudio.cz>',
            to: [userData?.email],
            subject: 'Rezervace potvrzena',
            html: '<p>Dobrý den,</p><p>Vaše rezervace byla úspěšně potvrzena.</p><p>Podrobnosti o vaší rezervaci:</p><ul><li>Cvičení: ' + classWithRelations.classType.name + '</li><li>Trenér: ' + classWithRelations.trainer.name + '</li><li>Datum a čas: ' + classWithRelations.date + ' ' + classWithRelations.time + '</li></ul><p>Děkujeme, že jste si vybrali BeBrave Studio!</p>',
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