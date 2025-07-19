import {integer, pgTable, timestamp, varchar} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";

const timestamps = {
    updatedAt: timestamp().defaultNow().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
};

export type Trainer = typeof trainersTable.$inferSelect;
export type TrainerWithRelations = Trainer & {
    trainerClassTypes: any[];
    classes: ClassWithRelations[];
};
export const trainersTable = pgTable("trainers", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({length: 255}).notNull(),
    email: varchar({length: 255}).notNull().unique(),
    bio: varchar({length: 500}),
    expertise: varchar({length: 255}),
    profilePicture: varchar({length: 255}), // URL to the trainer's profile picture
    ...timestamps,
});
export const trainersRelations = relations(trainersTable, ({many}) => ({
    trainerClassTypes: many(trainerClassTypesTable),
    classes: many(classesTable, {relationName: "trainer"}),
    secondClasses: many(classesTable, {relationName: "secondTrainer"}),
}));

export type TrainerClassType = typeof trainerClassTypesTable.$inferSelect;
export const trainerClassTypesTable = pgTable("trainer_class_types", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    trainerId: integer().notNull(),
    classTypeId: integer().notNull(),
    ...timestamps,
});
export const trainerClassTypesRelations = relations(
    trainerClassTypesTable,
    ({one}) => ({
        trainer: one(trainersTable, {
            fields: [trainerClassTypesTable.trainerId],
            references: [trainersTable.id],
        }),
        classType: one(classTypesTable, {
            fields: [trainerClassTypesTable.classTypeId],
            references: [classTypesTable.id],
        }),
    }),
);

export type User = typeof usersTable.$inferSelect;
export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({length: 255}).notNull(),
    email: varchar({length: 255}).notNull().unique(),
    ...timestamps,
});
export const usersRelations = relations(usersTable, ({many}) => ({
    reservations: many(reservationsTable),
}));

export type ClassType = typeof classTypesTable.$inferSelect;
export type ClassTypeWithRelations = ClassType & {
    trainerClassTypes: TrainerClassType[];
    classes: ClassWithRelations[];
};
export const classTypesTable = pgTable("class_types", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({length: 255}).notNull(),
    description: varchar({length: 500}).notNull(),
    image: varchar({length: 255}), // URL to the class type image
    defaultCapacity: integer().notNull(), // Maximum number of participants
    duration: integer().notNull(), // Duration in minutes
    price: integer().notNull(), // Price in crowns
});
export const classTypesRelations = relations(classTypesTable, ({many}) => ({
    trainerClassTypes: many(trainerClassTypesTable),
    classes: many(classesTable),
}));

export type Class = typeof classesTable.$inferSelect;
export type ClassWithRelations = Class & {
    classType: ClassType;
    trainer: Trainer;
    secondTrainer?: Trainer;
    reservations: Reservation[];
};
export const classesTable = pgTable("classes", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    classTypeId: integer().notNull(),
    trainerId: integer().notNull(),
    secondTrainerId: integer(), // Optional secondary trainer
    date: varchar({length: 50}).notNull(), // Date in YYYY-MM-DD format
    time: varchar({length: 5}).notNull(), // Time in HH:MM format
    location: varchar({length: 255}).notNull(),
    capacity: integer().notNull(), // Maximum number of participants
    ...timestamps,
});
export const classesRelations = relations(classesTable, ({one, many}) => ({
    classType: one(classTypesTable, {
        fields: [classesTable.classTypeId],
        references: [classTypesTable.id],
    }),
    trainer: one(trainersTable, {
        fields: [classesTable.trainerId],
        references: [trainersTable.id],
        relationName: "trainer",
    }),
    secondTrainer: one(trainersTable, {
        fields: [classesTable.secondTrainerId],
        references: [trainersTable.id],
        relationName: "secondTrainer",
    }),
    reservations: many(reservationsTable),
}));

export type Reservation = typeof reservationsTable.$inferSelect;
export const reservationsTable = pgTable("reservations", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar({length: 255}),
    classId: integer().notNull(),
    status: varchar({length: 50}).notNull(), // e.g., 'confirmed', 'cancelled'
    firstName: varchar({length: 255}),
    lastName: varchar({length: 255}),
    email: varchar({length: 255}),
    phone: varchar({length: 255}),
    // Payment tracking fields
    paymentMethod: varchar({length: 50}), // 'on_site', 'qr_payment', 'credit_card', 'customer_credit'
    paymentStatus: varchar({length: 50}), // 'pending', 'completed', 'failed', 'cancelled'
    paymentTransactionId: varchar({length: 255}), // Nexi transaction ID
    paymentAmount: integer(), // Amount in smallest currency unit (cents)
    paymentCurrency: varchar({length: 3}).default("CZK"), // Currency code
    paymentSecurityToken: varchar({length: 255}), // Nexi security token for validation
    paymentHostedPageUrl: varchar({length: 500}), // URL for payment redirect
    paymentCompletedAt: timestamp(), // When payment was completed
    ...timestamps,
});
export const reservationsRelations = relations(
    reservationsTable,
    ({one}) => ({
        user: one(usersTable, {
            fields: [reservationsTable.userId],
            references: [usersTable.id],
        }),
        class: one(classesTable, {
            fields: [reservationsTable.classId],
            references: [classesTable.id],
        }),
        invoice: one(invoicesTable, {
            fields: [reservationsTable.id],
            references: [invoicesTable.reservationId],
        }),
    }),
);

export type Invoice = typeof invoicesTable.$inferSelect;
export const invoicesTable = pgTable("invoices", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    invoiceNumber: integer().notNull().unique(), // Sequential invoice number
    reservationId: integer().notNull(),
    amount: integer().notNull(), // Amount in cents
    currency: varchar({length: 3}).default("CZK"),
    vatRate: integer().default(0), // VAT rate in percentage (0 for no VAT)
    vatAmount: integer().default(0), // VAT amount in cents
    totalAmount: integer().notNull(), // Total amount including VAT in cents
    description: varchar({length: 500}),
    customerName: varchar({length: 255}),
    customerEmail: varchar({length: 255}),
    customerPhone: varchar({length: 255}),
    customerAddress: varchar({length: 500}),
    issueDate: timestamp().defaultNow().notNull(),
    dueDate: timestamp(),
    duzp: timestamp(), // Date of taxable supply (class date)
    paymentMethod: varchar({length: 50}), // 'on_site', 'qr_payment', 'credit_card', 'customer_credit'
    status: varchar({length: 50}).default("issued"), // 'issued', 'paid', 'cancelled'
    pdfUrl: varchar({length: 500}), // URL to generated PDF
    ...timestamps,
});
export const invoicesRelations = relations(invoicesTable, ({one}) => ({
    reservation: one(reservationsTable, {
        fields: [invoicesTable.reservationId],
        references: [reservationsTable.id],
    }),
}));
