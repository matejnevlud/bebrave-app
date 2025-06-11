import {integer, pgTable, timestamp, varchar} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";


const timestamps ={
    updatedAt: timestamp().defaultNow().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
}



export type Trainer = typeof trainersTable.$inferSelect;
export type TrainerWithRelations = Trainer & {
    trainerClassTypes: any[];
    classes: ClassWithRelations[];
}
export const trainersTable = pgTable("trainers", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    bio: varchar({ length: 500 }),
    expertise: varchar({ length: 255 }),
    profilePicture: varchar({ length: 255 }), // URL to the trainer's profile picture
    ...timestamps,
})
export const trainersRelations = relations(trainersTable, ({ many }) => ({
    trainerClassTypes: many(trainerClassTypesTable),
    classes: many(classesTable),
}));




export const trainerClassTypesTable = pgTable("trainer_class_types", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    trainerId: integer().notNull(),
    classTypeId: integer().notNull(),
    ...timestamps,
})
export const trainerClassTypesRelations = relations(trainerClassTypesTable, ({ one }) => ({
    trainer: one(trainersTable, {
        fields: [trainerClassTypesTable.trainerId],
        references: [trainersTable.id],
    }),
    classType: one(classTypesTable, {
        fields: [trainerClassTypesTable.classTypeId],
        references: [classTypesTable.id],
    }),
}));



export type User = typeof usersTable.$inferSelect;
export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    ...timestamps
});
export const usersRelations = relations(usersTable, ({ many }) => ({
    reservations: many(reservationsTable),
}));



export type ClassType = typeof classTypesTable.$inferSelect;
export const classTypesTable = pgTable("class_types", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 500 }).notNull(),
    image: varchar({ length: 255 }), // URL to the class type image
    capacity: integer().notNull(), // Maximum number of participants
    duration: integer().notNull(), // Duration in minutes
    price: integer().notNull(), // Price in crowns
})
export const classTypesRelations = relations(classTypesTable, ({ many }) => ({
    trainerClassTypes: many(trainerClassTypesTable),
    classes: many(classesTable),
}));



export type Class = typeof classesTable.$inferSelect;
export type ClassWithRelations = Class & {
    classType: ClassType;
    trainer: Trainer;
    reservations: Reservation[];
}
export const classesTable = pgTable("classes", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    classTypeId: integer().notNull(),
    trainerId: integer().notNull(),
    date: varchar({ length: 50 }).notNull(), // Date in YYYY-MM-DD format
    time: varchar({ length: 5 }).notNull(), // Time in HH:MM format
    location: varchar({ length: 255 }).notNull(),
    ...timestamps,
})
export const classesRelations = relations(classesTable, ({ one, many }) => ({
    classType: one(classTypesTable, {
        fields: [classesTable.classTypeId],
        references: [classTypesTable.id],
    }),
    trainer: one(trainersTable, {
        fields: [classesTable.trainerId],
        references: [trainersTable.id],
    }),
    reservations: many(reservationsTable),
}));



export type Reservation = typeof reservationsTable.$inferSelect;
export const reservationsTable = pgTable("reservations", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer(),
    classId: integer().notNull(),
    status: varchar({ length: 50 }).notNull(), // e.g., 'confirmed', 'cancelled'
    name: varchar({ length: 255 }),
    email: varchar({ length: 255 }),
    phone: varchar({ length: 255 }),
    ...timestamps,
});
export const reservationsRelations = relations(reservationsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [reservationsTable.userId],
        references: [usersTable.id],
    }),
    class: one(classesTable, {
        fields: [reservationsTable.classId],
        references: [classesTable.id],
    }),
}));

