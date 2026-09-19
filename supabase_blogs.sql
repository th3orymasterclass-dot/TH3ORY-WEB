-- ==========================================================
-- TH3ORY MASTERCLASS - BLOG & ARTICLES SCHEMA
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.blogs (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Cognitive Science',
  tags JSONB DEFAULT '[]'::jsonb,
  author JSONB DEFAULT '{"name": "Mentalist Sravan", "role": "Cognitive Strategist & Founder", "avatar": "/instructor.png"}'::jsonb,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  read_time TEXT DEFAULT '5 min read',
  cover_image TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  excerpt TEXT DEFAULT '',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by slug and category
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs (slug);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs (category);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON public.blogs (published);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all published blogs
CREATE POLICY "Public can view published blogs"
  ON public.blogs
  FOR SELECT
  USING (published = true);

-- Allow full access for anon/service key (or authenticated users) to manage blogs
CREATE POLICY "Public/Admin can insert blogs"
  ON public.blogs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public/Admin can update blogs"
  ON public.blogs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public/Admin can delete blogs"
  ON public.blogs
  FOR DELETE
  USING (true);
