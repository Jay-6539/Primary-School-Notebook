-- Supabase Database Schema for Aiden's Website
-- Run this SQL in your Supabase SQL Editor

-- 1. Words table (for recognition and spelling words)
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recognition', 'spelling')),
  date_added TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT CHECK (level IN ('starters', 'movers', 'flyers')),
  needs_review BOOLEAN DEFAULT FALSE,
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Spelling history table
CREATE TABLE IF NOT EXISTS spelling_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  attempts JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_errors INTEGER NOT NULL DEFAULT 0,
  last_attempt_date DATE NOT NULL,
  mastered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Recognition history table
CREATE TABLE IF NOT EXISTS recognition_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  view_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_views INTEGER NOT NULL DEFAULT 0,
  last_viewed_date DATE NOT NULL,
  first_viewed_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bank entries table
CREATE TABLE IF NOT EXISTS bank_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('reward', 'red-packet', 'gift', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Parent feedback table
CREATE TABLE IF NOT EXISTS parent_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  dad_accuracy TEXT CHECK (dad_accuracy IN ('good', 'bad')),
  dad_attitude TEXT CHECK (dad_attitude IN ('good', 'bad')),
  mom_accuracy TEXT CHECK (mom_accuracy IN ('good', 'bad')),
  mom_attitude TEXT CHECK (mom_attitude IN ('good', 'bad')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Pictures table
CREATE TABLE IF NOT EXISTS pictures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  title TEXT,
  is_uploaded BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_words_type ON words(type);
CREATE INDEX IF NOT EXISTS idx_words_level ON words(level);
CREATE INDEX IF NOT EXISTS idx_spelling_history_word ON spelling_history(word);
CREATE INDEX IF NOT EXISTS idx_spelling_history_mastered ON spelling_history(mastered);
CREATE INDEX IF NOT EXISTS idx_recognition_history_word ON recognition_history(word);
CREATE INDEX IF NOT EXISTS idx_bank_entries_date ON bank_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_parent_feedback_date ON parent_feedback(date DESC);
CREATE INDEX IF NOT EXISTS idx_pictures_uploaded ON pictures(is_uploaded);

-- Enable Row Level Security (RLS) - Allow all operations for now
-- You can customize this later for security
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE spelling_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recognition_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE pictures ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (public access)
-- In production, you should restrict this based on your needs
CREATE POLICY "Allow all operations on words" ON words FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on spelling_history" ON spelling_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on recognition_history" ON recognition_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on bank_entries" ON bank_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on parent_feedback" ON parent_feedback FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on pictures" ON pictures FOR ALL USING (true) WITH CHECK (true);

