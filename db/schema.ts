import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  bio: varchar({ length: 500 }),
  expertise: varchar({ length: 255 }),
  profilePicture: varchar({ length: 255 }),
  ...timestamps,
});
export const trainersRelations = relations(trainersTable, ({ many }) => ({
  trainerClassTypes: many(trainerClassTypesTable),
  classes: many(classesTable, { relationName: "trainer" }),
  secondClasses: many(classesTable, { relationName: "secondTrainer" }),
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
  ({ one }) => ({
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
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  ...timestamps,
});
export const usersRelations = relations(usersTable, ({ many }) => ({
  reservations: many(reservationsTable),
}));

export type ClassType = typeof classTypesTable.$inferSelect;
export type ClassTypeWithRelations = ClassType & {
  trainerClassTypes: TrainerClassType[];
  classes: ClassWithRelations[];
};
export const classTypesTable = pgTable("class_types", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 500 }).notNull(),
  image: varchar({ length: 255 }),
  defaultCapacity: integer().notNull(),
  duration: integer().notNull(),
  price: integer().notNull(),
  allowedPaymentMethods: varchar({ length: 255 }).default(
    "credit_card,qr,osobne",
  ),
  customEmailMessage: varchar({ length: 1000 }),
  homepageText: text(),
  isShownOnHomepage: boolean().default(false),
  isShownAsPromo: boolean().default(false),
  isVoucherEligible: boolean().default(true),
});
export const classTypesRelations = relations(classTypesTable, ({ many }) => ({
  trainerClassTypes: many(trainerClassTypesTable),
  classes: many(classesTable),
  vouchers: many(vouchersTable),
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
  secondTrainerId: integer(),
  date: varchar({ length: 50 }).notNull(),
  time: varchar({ length: 5 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  capacity: integer().notNull(),
  ...timestamps,
});
export const classesRelations = relations(classesTable, ({ one, many }) => ({
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

export type Voucher = typeof vouchersTable.$inferSelect;
export const vouchersTable = pgTable("vouchers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  code: varchar({ length: 20 }).notNull().unique(),
  classTypeId: integer(),
  status: varchar({ length: 20 }).default("available"),
  validFrom: timestamp().defaultNow().notNull(),
  validUntil: timestamp().notNull(),
  usedAt: timestamp(),
  slevomatRedeemedAt: timestamp(),
  reservationId: integer(),
  createdAt: timestamp().defaultNow().notNull(),
});
export const vouchersRelations = relations(vouchersTable, ({ one }) => ({
  classType: one(classTypesTable, {
    fields: [vouchersTable.classTypeId],
    references: [classTypesTable.id],
  }),
  reservation: one(reservationsTable, {
    fields: [vouchersTable.reservationId],
    references: [reservationsTable.id],
  }),
}));

export type Reservation = typeof reservationsTable.$inferSelect;
export const reservationsTable = pgTable("reservations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }),
  classId: integer().notNull(),
  status: varchar({ length: 50 }).notNull(),
  firstName: varchar({ length: 255 }),
  lastName: varchar({ length: 255 }),
  email: varchar({ length: 255 }),
  phone: varchar({ length: 255 }),
  paymentMethod: varchar({ length: 50 }),
  paymentStatus: varchar({ length: 50 }),
  paymentTransactionId: varchar({ length: 255 }),
  paymentAmount: integer(),
  paymentCurrency: varchar({ length: 3 }).default("CZK"),
  paymentSecurityToken: varchar({ length: 255 }),
  paymentHostedPageUrl: varchar({ length: 500 }),
  paymentCompletedAt: timestamp(),
  voucherId: integer(),
  ...timestamps,
});
export const reservationsRelations = relations(
  reservationsTable,
  ({ one }) => ({
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
    voucher: one(vouchersTable, {
      fields: [reservationsTable.voucherId],
      references: [vouchersTable.id],
    }),
  }),
);

export type Invoice = typeof invoicesTable.$inferSelect;
export const invoicesTable = pgTable("invoices", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  invoiceNumber: integer().notNull().unique(),
  reservationId: integer().notNull(),
  amount: integer().notNull(),
  currency: varchar({ length: 3 }).default("CZK"),
  vatRate: integer().default(0),
  vatAmount: integer().default(0),
  totalAmount: integer().notNull(),
  description: varchar({ length: 500 }),
  customerName: varchar({ length: 255 }),
  customerEmail: varchar({ length: 255 }),
  customerPhone: varchar({ length: 255 }),
  customerAddress: varchar({ length: 500 }),
  issueDate: timestamp().defaultNow().notNull(),
  dueDate: timestamp(),
  duzp: timestamp(),
  paymentMethod: varchar({ length: 50 }),
  status: varchar({ length: 50 }).default("issued"),
  pdfUrl: varchar({ length: 500 }),
  ...timestamps,
});
export const invoicesRelations = relations(invoicesTable, ({ one }) => ({
  reservation: one(reservationsTable, {
    fields: [invoicesTable.reservationId],
    references: [reservationsTable.id],
  }),
}));
