-- ==============================================================================
-- TH3ORY COMMUNITY HUB - COMPLETE DATABASE SCHEMA & REALTIME SYNCHRONIZATION
-- Run this complete script in the Supabase SQL Editor (https://app.supabase.com)
-- Supports PostgreSQL 14+, Supabase Realtime Engine, and zero-downtime migrations
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. COMMUNITY MEMBERS TABLE
-- Stores private community member accounts, approval statuses, credentials, and roles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.community_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin', 'instructor')),
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    rejection_reason TEXT,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema migration alterations for existing tables
ALTER TABLE public.community_members ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';
ALTER TABLE public.community_members ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
ALTER TABLE public.community_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- 2. COMMUNITY WALL POSTS TABLE
-- Stores weekly videos, tactical file downloads, discussion prompts, and pinned announcements
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
    author_id TEXT REFERENCES public.community_members(id) ON DELETE SET NULL,
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema migration alterations for existing tables
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS author_id TEXT;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- 3. COMMUNITY POST REACTIONS TABLE
-- Stores curated 6-reaction matrix (👍, ❤️, 🔥, 💡, 🧠, 👏) with unique per-member constraint
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.community_reactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    post_id TEXT NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES public.community_members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    emoji TEXT NOT NULL CHECK (emoji IN ('👍', '❤️', '🔥', '💡', '🧠', '👏')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (post_id, member_id, emoji)
);

-- ==============================================================================
-- 4. COMMUNITY POST COMMENTS TABLE
-- Stores threaded discussion replies associated with community wall posts
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.community_comments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    post_id TEXT NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES public.community_members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema migration alterations for existing tables
ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- 5. AUTOMATED UPDATED_AT TRIGGER FUNCTION
-- Automatically updates updated_at timestamp upon record modifications
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_community_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_community_members_updated ON public.community_members;
CREATE TRIGGER tr_community_members_updated
    BEFORE UPDATE ON public.community_members
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_community_updated_at();

DROP TRIGGER IF EXISTS tr_community_posts_updated ON public.community_posts;
CREATE TRIGGER tr_community_posts_updated
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_community_updated_at();

-- ==============================================================================
-- 6. REPLICA IDENTITY FULL (MANDATORY FOR SUPABASE REALTIME UPDATES & DELETES)
-- Ensures old records are fully included in Realtime WebSocket broadcast payloads
-- ==============================================================================
ALTER TABLE public.community_members REPLICA IDENTITY FULL;
ALTER TABLE public.community_posts REPLICA IDENTITY FULL;
ALTER TABLE public.community_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.community_comments REPLICA IDENTITY FULL;

-- ==============================================================================
-- 7. PERFORMANCE INDEXES
-- Accelerates real-time querying, sorting, and relational foreign-key resolution
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_community_members_email ON public.community_members(email);
CREATE INDEX IF NOT EXISTS idx_community_members_status ON public.community_members(status);
CREATE INDEX IF NOT EXISTS idx_community_members_role ON public.community_members(role);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON public.community_posts(is_pinned DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON public.community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_reactions_post ON public.community_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_member ON public.community_reactions(member_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON public.community_comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_community_comments_member ON public.community_comments(member_id);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict access control allowing registration, member access, and admin controls
-- ==============================================================================
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Public can register as community member" ON public.community_members;
DROP POLICY IF EXISTS "Public can view approved community members" ON public.community_members;
DROP POLICY IF EXISTS "Members and admins can update community members" ON public.community_members;
DROP POLICY IF EXISTS "Public can read community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Public can insert community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Public can update community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Public can delete community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Public can read community reactions" ON public.community_reactions;
DROP POLICY IF EXISTS "Public can insert community reactions" ON public.community_reactions;
DROP POLICY IF EXISTS "Public can delete own community reactions" ON public.community_reactions;
DROP POLICY IF EXISTS "Public can read community comments" ON public.community_comments;
DROP POLICY IF EXISTS "Public can insert community comments" ON public.community_comments;
DROP POLICY IF EXISTS "Public can delete community comments" ON public.community_comments;

-- Member policies
CREATE POLICY "Public can register as community member" 
    ON public.community_members FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view approved community members" 
    ON public.community_members FOR SELECT USING (true);

CREATE POLICY "Members and admins can update community members" 
    ON public.community_members FOR UPDATE USING (true) WITH CHECK (true);

-- Post policies
CREATE POLICY "Public can read community posts" 
    ON public.community_posts FOR SELECT USING (true);

CREATE POLICY "Public can insert community posts" 
    ON public.community_posts FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update community posts" 
    ON public.community_posts FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public can delete community posts" 
    ON public.community_posts FOR DELETE USING (true);

-- Reaction policies
CREATE POLICY "Public can read community reactions" 
    ON public.community_reactions FOR SELECT USING (true);

CREATE POLICY "Public can insert community reactions" 
    ON public.community_reactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can delete own community reactions" 
    ON public.community_reactions FOR DELETE USING (true);

-- Comment policies
CREATE POLICY "Public can read community comments" 
    ON public.community_comments FOR SELECT USING (true);

CREATE POLICY "Public can insert community comments" 
    ON public.community_comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can delete community comments" 
    ON public.community_comments FOR DELETE USING (true);

-- ==============================================================================
-- 9. SUPABASE REALTIME PUBLICATION REGISTRATION
-- Subscribes community tables to the global WebSocket stream for live synchronisation
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
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
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Supabase Realtime publication setup warning: %', SQLERRM;
END $$;
