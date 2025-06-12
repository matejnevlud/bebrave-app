"use server";

import { db } from "@/db";
import {Class, classesTable, ClassType, classTypesTable, ClassWithRelations, reservationsTable, Trainer, trainersTable, TrainerWithRelations} from "@/db/schema";
import { desc } from "drizzle-orm";
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
            reservations: {
                with: {
                    user: true,
                }
            },
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

        // set js Date locale to Czech
        const locale = 'cs-CZ';
        resend.emails.send({
            from: 'BeBrave Studio <info@bebravestudio.cz>',
            to: [userData?.email],
            subject: 'Rezervace potvrzena',
            html: '<p>Dobrý den,</p><p>Vaše rezervace byla úspěšně potvrzena.</p><p>Podrobnosti o vaší rezervaci:</p><ul><li>Cvičení: ' + classWithRelations.classType.name + '</li><li>Trenér: ' + classWithRelations.trainer.name + '</li><li>Datum a čas: ' + `${new Date(classWithRelations?.date ?? -1).toLocaleDateString('cs-CZ', { weekday: 'long' })} ${new Date(classWithRelations?.date ?? -1).toLocaleDateString('cs-CZ')} v ${classWithRelations?.time}` + '</li></ul><p>Těšíme se na vás, tým BeBrave.</p>',
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