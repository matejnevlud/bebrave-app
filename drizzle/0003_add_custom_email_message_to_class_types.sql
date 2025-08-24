-- Add customEmailMessage column to class_types table
ALTER TABLE class_types ADD COLUMN custom_email_message VARCHAR(1000);