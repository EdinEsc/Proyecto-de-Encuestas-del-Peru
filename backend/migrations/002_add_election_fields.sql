-- Migration: Add banner_url and description to elections
ALTER TABLE elections ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS description TEXT;
