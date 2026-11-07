-- Migration: Add BBCode content support to articles table
-- Run this once against your database

ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS content LONGTEXT DEFAULT NULL AFTER summary,
  ADD COLUMN IF NOT EXISTS content_format VARCHAR(20) DEFAULT 'bbcode' AFTER content;

-- If your DB doesn't support IF NOT EXISTS on ALTER TABLE:
-- ALTER TABLE articles ADD COLUMN content LONGTEXT DEFAULT NULL AFTER summary;
-- ALTER TABLE articles ADD COLUMN content_format VARCHAR(20) DEFAULT 'bbcode' AFTER content;