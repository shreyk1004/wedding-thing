-- Add design column to wedding table
ALTER TABLE wedding ADD COLUMN IF NOT EXISTS design jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN wedding.design IS 'Stores the AI-generated design including colors and fonts';

-- Create an index on the design column for better query performance
CREATE INDEX IF NOT EXISTS idx_wedding_design ON wedding USING gin (design); 