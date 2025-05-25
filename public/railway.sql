-- -------------------------------------------------------------
-- TablePlus 6.5.0(613)
--
-- https://tableplus.com/
--
-- Database: railway
-- Generation Time: 2025-05-25 19:21:20.3240
-- -------------------------------------------------------------


-- Table Definition
CREATE TABLE "public"."users" (
    "id" int4 NOT NULL,
    "name" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "deletedAt" timestamp,
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."class_types" (
    "id" int4 NOT NULL,
    "name" varchar(255) NOT NULL,
    "description" varchar(500) NOT NULL,
    "capacity" int4 NOT NULL,
    "duration" int4 NOT NULL,
    "price" int4 NOT NULL,
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."classes" (
    "id" int4 NOT NULL,
    "classTypeId" int4 NOT NULL,
    "trainerId" int4 NOT NULL,
    "date" varchar(50) NOT NULL,
    "time" varchar(5) NOT NULL,
    "location" varchar(255) NOT NULL,
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "deletedAt" timestamp,
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."reservations" (
    "id" int4 NOT NULL,
    "userId" int4 NOT NULL,
    "classId" int4 NOT NULL,
    "status" varchar(50) NOT NULL,
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "deletedAt" timestamp,
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."trainer_class_types" (
    "id" int4 NOT NULL,
    "trainerId" int4 NOT NULL,
    "classTypeId" int4 NOT NULL,
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "deletedAt" timestamp,
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."trainers" (
    "id" int4 NOT NULL,
    "name" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "bio" varchar(500),
    "expertise" varchar(255),
    "profilePicture" varchar(255),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "deletedAt" timestamp,
    PRIMARY KEY ("id")
);



-- Indices
CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);


-- Indices
CREATE UNIQUE INDEX trainers_email_unique ON public.trainers USING btree (email);
