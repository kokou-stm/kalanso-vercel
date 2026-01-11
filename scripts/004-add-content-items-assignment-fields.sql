-- Migration: Add assignment fields to content_items table
-- This adds the missing assignment-related columns

-- Add assignment fields
ALTER TABLE content_items
ADD COLUMN assigned_to UUID REFERENCES sessions(id) ON DELETE SET NULL,
ADD COLUMN assignment_order INTEGER,
ADD COLUMN is_required BOOLEAN DEFAULT true;

-- Create index for better query performance on assigned_to
CREATE INDEX idx_content_items_assigned_to ON content_items(assigned_to);
CREATE INDEX idx_content_items_assignment_order ON content_items(assignment_order);
