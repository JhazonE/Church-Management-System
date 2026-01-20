-- Migration script to add reference column to donations table
-- Run this script on existing databases to add the reference field

-- Add reference column to donations table
-- Note: This will fail if the column already exists, which is fine
ALTER TABLE donations ADD COLUMN reference TEXT;
