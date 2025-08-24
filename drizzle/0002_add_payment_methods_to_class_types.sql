-- Add allowedPaymentMethods column to class_types table
ALTER TABLE class_types ADD COLUMN allowed_payment_methods VARCHAR(255) DEFAULT 'credit_card,qr,osobne';

-- Update existing class types with appropriate payment methods based on their current IDs
-- This preserves the existing hardcoded logic for specific class types
UPDATE class_types SET allowed_payment_methods = 'credit_card,qr,osobne' WHERE id = 21;
UPDATE class_types SET allowed_payment_methods = 'credit_card' WHERE id = 24;