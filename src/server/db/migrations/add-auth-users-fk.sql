-- Migration: Add foreign key constraint from user_profiles.user_id to auth.users.id
-- This ensures referential integrity between user_profiles and Supabase Auth users

-- First, check if the constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'user_profiles_user_id_fkey'
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE user_profile
        ADD CONSTRAINT user_profiles_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
        
        -- Add index for better query performance
        CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profile(user_id);
    END IF;
END $$;

