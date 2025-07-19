CREATE TABLE "class_types"
(
    "id"              integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "class_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "name"            varchar(255) NOT NULL,
    "description"     varchar(500) NOT NULL,
    "image"           varchar(255),
    "defaultCapacity" integer      NOT NULL,
    "duration"        integer      NOT NULL,
    "price"           integer      NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes"
(
    "id"              integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "classes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "classTypeId"     integer                 NOT NULL,
    "trainerId"       integer                 NOT NULL,
    "secondTrainerId" integer,
    "date"            varchar(50)             NOT NULL,
    "time"            varchar(5)              NOT NULL,
    "location"        varchar(255)            NOT NULL,
    "capacity"        integer                 NOT NULL,
    "updatedAt"       timestamp DEFAULT now() NOT NULL,
    "createdAt"       timestamp DEFAULT now() NOT NULL,
    "deletedAt"       timestamp
);
--> statement-breakpoint
CREATE TABLE "invoices"
(
    "id"              integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invoices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "invoiceNumber"   integer                   NOT NULL,
    "reservationId"   integer                   NOT NULL,
    "amount"          integer                   NOT NULL,
    "currency"        varchar(3)  DEFAULT 'CZK',
    "vatRate"         integer     DEFAULT 0,
    "vatAmount"       integer     DEFAULT 0,
    "totalAmount"     integer                   NOT NULL,
    "description"     varchar(500),
    "customerName"    varchar(255),
    "customerEmail"   varchar(255),
    "customerPhone"   varchar(255),
    "customerAddress" varchar(500),
    "issueDate"       timestamp   DEFAULT now() NOT NULL,
    "dueDate"         timestamp,
    "status"          varchar(50) DEFAULT 'issued',
    "pdfUrl"          varchar(500),
    "updatedAt"       timestamp   DEFAULT now() NOT NULL,
    "createdAt"       timestamp   DEFAULT now() NOT NULL,
    "deletedAt"       timestamp,
    CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE ("invoiceNumber")
);
--> statement-breakpoint
CREATE TABLE "reservations"
(
    "id"                   integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reservations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "userId"               varchar(255),
    "classId"              integer                  NOT NULL,
    "status"               varchar(50)              NOT NULL,
    "firstName"            varchar(255),
    "lastName"             varchar(255),
    "email"                varchar(255),
    "phone"                varchar(255),
    "paymentMethod"        varchar(50),
    "paymentStatus"        varchar(50),
    "paymentTransactionId" varchar(255),
    "paymentAmount"        integer,
    "paymentCurrency"      varchar(3) DEFAULT 'CZK',
    "paymentSecurityToken" varchar(255),
    "paymentHostedPageUrl" varchar(500),
    "paymentCompletedAt"   timestamp,
    "updatedAt"            timestamp  DEFAULT now() NOT NULL,
    "createdAt"            timestamp  DEFAULT now() NOT NULL,
    "deletedAt"            timestamp
);
--> statement-breakpoint
CREATE TABLE "trainer_class_types"
(
    "id"          integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trainer_class_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "trainerId"   integer                 NOT NULL,
    "classTypeId" integer                 NOT NULL,
    "updatedAt"   timestamp DEFAULT now() NOT NULL,
    "createdAt"   timestamp DEFAULT now() NOT NULL,
    "deletedAt"   timestamp
);
--> statement-breakpoint
CREATE TABLE "trainers"
(
    "id"             integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trainers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "name"           varchar(255)            NOT NULL,
    "email"          varchar(255)            NOT NULL,
    "bio"            varchar(500),
    "expertise"      varchar(255),
    "profilePicture" varchar(255),
    "updatedAt"      timestamp DEFAULT now() NOT NULL,
    "createdAt"      timestamp DEFAULT now() NOT NULL,
    "deletedAt"      timestamp,
    CONSTRAINT "trainers_email_unique" UNIQUE ("email")
);
--> statement-breakpoint
CREATE TABLE "users"
(
    "id"        integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "name"      varchar(255)            NOT NULL,
    "email"     varchar(255)            NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "deletedAt" timestamp,
    CONSTRAINT "users_email_unique" UNIQUE ("email")
);
