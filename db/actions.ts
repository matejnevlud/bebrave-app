"use server";

import { db } from "@/db";
import {Class, ClassType, classTypesTable, Trainer, trainersTable} from "@/db/schema";

export async function getTrainers(): Promise<Trainer[]> {
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

    return data as Trainer[];
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

export async function getClasses(): Promise<Class[]> {
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