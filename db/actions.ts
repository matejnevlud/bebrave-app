"use server";

import { db } from "@/db";
import {Class, ClassType, classTypesTable, ClassWithRelations, Trainer, trainersTable, TrainerWithRelations} from "@/db/schema";

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