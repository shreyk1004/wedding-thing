-- Add user_id column to weddings table to link wedding details to user accounts
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_weddings_user_id ON weddings (user_id);

-- Add comment to explain the column
COMMENT ON COLUMN weddings.user_id IS 'Links wedding details to authenticated user account'; 