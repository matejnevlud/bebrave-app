-- Manual migration script for invoice table columns
-- This script adds the missing columns to the invoices table
-- Run this directly against your PostgreSQL database

-- Add the duzp (date of taxable supply) column
ALTER TABLE "invoices"
    ADD COLUMN IF NOT EXISTS "duzp" timestamp;

-- Add the paymentMethod column
ALTER TABLE "invoices"
    ADD COLUMN IF NOT EXISTS "paymentMethod" varchar (50);

-- Verify the columns were added (optional - uncomment to run)
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'invoices' 
-- AND column_name IN ('duzp', 'paymentMethod');