-- Migration: Update content_items table to new schema
-- This script updates the content_items table structure

-- Drop the old table and recreate with new schema
DROP TABLE IF EXISTS content_items CASCADE;

-- Create the updated content_items table
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('pdf', 'video', 'audio', 'document', 'image', 'link', 'quiz', 'other')),
    file_url TEXT,
    file_size_bytes BIGINT,
    duration_minutes INTEGER,
    thumbnail_url TEXT,
    tags TEXT[], -- Array of tags for categorization
    uploaded_by UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on content_items" ON content_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_content_items_content_type ON content_items(content_type);
CREATE INDEX idx_content_items_uploaded_by ON content_items(uploaded_by);
CREATE INDEX idx_content_items_tags ON content_items USING GIN(tags);
CREATE INDEX idx_content_items_created_at ON content_items(created_at DESC);

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
