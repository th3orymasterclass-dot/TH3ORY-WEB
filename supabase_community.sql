-- =====================================================================
-- TH3ORY COMMUNITY HUB DATABASE SCHEMA & REALTIME CONFIGURATION
-- =====================================================================

-- 1. Community Members Table
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Community Wall Posts Table (Weekly Videos, Files, Discussions, Announcements)
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT NOT NULL DEFAULT 'discussion' CHECK (post_type IN ('weekly_video', 'file_resource', 'discussion', 'announcement')),
    media_url TEXT DEFAULT '',
    file_name TEXT DEFAULT '',
    file_url TEXT DEFAULT '',
    file_size TEXT DEFAULT '',
    is_pinned BOOLEAN DEFAULT FALSE,
    author_name TEXT DEFAULT 'TH3ORY Administration',
    author_role TEXT DEFAULT 'Instructor / Founder',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Community Post Reactions Table (👍, ❤️, 🔥, 💡, 🧠, 👏)
CREATE TABLE IF NOT EXISTS public.community_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.community_members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    emoji TEXT NOT NULL CHECK (emoji IN ('👍', '❤️', '🔥', '💡', '🧠', '👏')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (post_id, member_id, emoji)
);

-- 4. Community Post Comments Table
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.community_members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_members_email ON public.community_members(email);
CREATE INDEX IF NOT EXISTS idx_community_members_status ON public.community_members(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON public.community_posts(is_pinned DESC);
CREATE INDEX IF NOT EXISTS idx_community_reactions_post ON public.community_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON public.community_comments(post_id, created_at ASC);

-- Row Level Security (RLS)
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Anonymous/Public Read & Insertion Policies
CREATE POLICY "Public can register as community member" ON public.community_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view approved community members" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Public can read community posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Public can read community reactions" ON public.community_reactions FOR SELECT USING (true);
CREATE POLICY "Public can insert community reactions" ON public.community_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete own community reactions" ON public.community_reactions FOR DELETE USING (true);
CREATE POLICY "Public can read community comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Public can insert community comments" ON public.community_comments FOR INSERT WITH CHECK (true);

-- Enable Realtime publication for Community tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'community_posts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'community_reactions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reactions;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'community_comments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'community_members'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.community_members;
    END IF;
END $$;
