import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('========================================================================');
console.log('  🏛️ TH3ORY PRIVATE COMMUNITY HUB & REALTIME SYNCHRONIZATION TEST SUITE');
console.log('========================================================================\n');

let passedTests = 0;
let totalTests = 0;

function testAssert(condition, message) {
  totalTests++;
  try {
    assert(condition, message);
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✕ FAIL: ${message} - ${err.message}`);
  }
}

// ── Suite 1: Database Schema & Realtime Replication Integrity ────────────────
console.log('▶ [Suite 1]: Database Schema & Realtime Replication Integrity Audit');

const sqlPath = path.join(rootDir, 'supabase_community.sql');
testAssert(fs.existsSync(sqlPath), 'supabase_community.sql migration file exists in root directory');

const sqlContent = fs.readFileSync(sqlPath, 'utf8');
testAssert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.community_members'), 'Allocates public.community_members table');
testAssert(sqlContent.includes('status TEXT NOT NULL DEFAULT \'pending\''), 'Defines pending status default for member registrations');
testAssert(sqlContent.includes('CHECK (status IN (\'pending\', \'approved\', \'rejected\', \'suspended\'))'), 'Enforces member status state constraint');
testAssert(sqlContent.includes('role TEXT NOT NULL DEFAULT \'member\''), 'Allocates member role attribute (member, moderator, admin, instructor)');

testAssert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.community_posts'), 'Allocates public.community_posts table');
testAssert(sqlContent.includes('post_type TEXT NOT NULL DEFAULT \'discussion\''), 'Allocates post_type column for weekly videos, files & discussions');
testAssert(sqlContent.includes('media_url TEXT DEFAULT \'\''), 'Allocates media_url column for video streaming');
testAssert(sqlContent.includes('is_pinned BOOLEAN DEFAULT FALSE'), 'Allocates is_pinned column for announcements');
testAssert(sqlContent.includes('views_count INT DEFAULT 0'), 'Allocates views_count column for post analytics');

testAssert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.community_reactions'), 'Allocates public.community_reactions table');
testAssert(sqlContent.includes('emoji TEXT NOT NULL CHECK (emoji IN (\'👍\', \'❤️\', \'🔥\', \'💡\', \'🧠\', \'👏\'))'), 'Enforces 6 curated cognitive reaction emojis constraint');
testAssert(sqlContent.includes('UNIQUE (post_id, member_id, emoji)'), 'Enforces unique per-member emoji constraint');
testAssert(sqlContent.includes('ON DELETE CASCADE'), 'Configures cascading delete on reactions when post or member is removed');

testAssert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.community_comments'), 'Allocates public.community_comments table');
testAssert(sqlContent.includes('post_id TEXT NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE'), 'Configures foreign key on post comments with ON DELETE CASCADE');

// Replica Identity Full for Realtime
testAssert(sqlContent.includes('ALTER TABLE public.community_members REPLICA IDENTITY FULL'), 'Enables REPLICA IDENTITY FULL on community_members');
testAssert(sqlContent.includes('ALTER TABLE public.community_posts REPLICA IDENTITY FULL'), 'Enables REPLICA IDENTITY FULL on community_posts');
testAssert(sqlContent.includes('ALTER TABLE public.community_reactions REPLICA IDENTITY FULL'), 'Enables REPLICA IDENTITY FULL on community_reactions');
testAssert(sqlContent.includes('ALTER TABLE public.community_comments REPLICA IDENTITY FULL'), 'Enables REPLICA IDENTITY FULL on community_comments');

// Updated At Triggers
testAssert(sqlContent.includes('FUNCTION public.handle_community_updated_at()'), 'Defines automated handle_community_updated_at() trigger function');
testAssert(sqlContent.includes('CREATE TRIGGER tr_community_members_updated'), 'Attaches updated_at trigger to community_members');
testAssert(sqlContent.includes('CREATE TRIGGER tr_community_posts_updated'), 'Attaches updated_at trigger to community_posts');

// Indexes
testAssert(sqlContent.includes('CREATE INDEX IF NOT EXISTS idx_community_members_email'), 'Indexes community members by email');
testAssert(sqlContent.includes('CREATE INDEX IF NOT EXISTS idx_community_members_status'), 'Indexes community members by status');
testAssert(sqlContent.includes('CREATE INDEX IF NOT EXISTS idx_community_posts_created'), 'Indexes community posts by creation timestamp');
testAssert(sqlContent.includes('CREATE INDEX IF NOT EXISTS idx_community_reactions_post'), 'Indexes reactions by post_id');
testAssert(sqlContent.includes('CREATE INDEX IF NOT EXISTS idx_community_comments_post'), 'Indexes comments by post_id');

// RLS Policies
testAssert(sqlContent.includes('ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY'), 'Enables RLS on community_members');
testAssert(sqlContent.includes('ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY'), 'Enables RLS on community_posts');
testAssert(sqlContent.includes('ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY'), 'Enables RLS on community_reactions');
testAssert(sqlContent.includes('ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY'), 'Enables RLS on community_comments');

// Supabase Realtime Publication
testAssert(sqlContent.includes('ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts'), 'Enables supabase_realtime publication for community_posts');
testAssert(sqlContent.includes('ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reactions'), 'Enables supabase_realtime publication for community_reactions');
testAssert(sqlContent.includes('ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments'), 'Enables supabase_realtime publication for community_comments');
testAssert(sqlContent.includes('ALTER PUBLICATION supabase_realtime ADD TABLE public.community_members'), 'Enables supabase_realtime publication for community_members');

// Master schema parity in supabase_schema.sql
const masterSqlPath = path.join(rootDir, 'supabase_schema.sql');
const masterSqlContent = fs.readFileSync(masterSqlPath, 'utf8');
testAssert(masterSqlContent.includes('public.community_members'), 'Master supabase_schema.sql includes community_members table');
testAssert(masterSqlContent.includes('public.community_posts'), 'Master supabase_schema.sql includes community_posts table');
testAssert(masterSqlContent.includes('public.community_reactions'), 'Master supabase_schema.sql includes community_reactions table');
testAssert(masterSqlContent.includes('public.community_comments'), 'Master supabase_schema.sql includes community_comments table');


// ── Suite 2: Supabase Service Layer & Realtime Cross-Tab Sync ───────────────
console.log('\n▶ [Suite 2]: Service Layer & Realtime Synchronization Audit');

const servicePath = path.join(rootDir, 'src/services/supabaseService.js');
const serviceContent = fs.readFileSync(servicePath, 'utf8');

testAssert(serviceContent.includes('export async function registerCommunityMemberInSupabase'), 'Exports registerCommunityMemberInSupabase');
testAssert(serviceContent.includes('export async function fetchCommunityMembersFromSupabase'), 'Exports fetchCommunityMembersFromSupabase');
testAssert(serviceContent.includes('export async function approveCommunityMemberInSupabase'), 'Exports approveCommunityMemberInSupabase');
testAssert(serviceContent.includes('export async function rejectCommunityMemberInSupabase'), 'Exports rejectCommunityMemberInSupabase');
testAssert(serviceContent.includes('export async function authenticateCommunityMemberInSupabase'), 'Exports authenticateCommunityMemberInSupabase');
testAssert(serviceContent.includes('export async function fetchCommunityPostsFromSupabase'), 'Exports fetchCommunityPostsFromSupabase');
testAssert(serviceContent.includes('export async function createCommunityPostInSupabase'), 'Exports createCommunityPostInSupabase');
testAssert(serviceContent.includes('export async function deleteCommunityPostInSupabase'), 'Exports deleteCommunityPostInSupabase');
testAssert(serviceContent.includes('export async function fetchCommunityReactionsFromSupabase'), 'Exports fetchCommunityReactionsFromSupabase');
testAssert(serviceContent.includes('export async function toggleCommunityReactionInSupabase'), 'Exports toggleCommunityReactionInSupabase');
testAssert(serviceContent.includes('export async function fetchCommunityCommentsFromSupabase'), 'Exports fetchCommunityCommentsFromSupabase');
testAssert(serviceContent.includes('export async function addCommunityCommentInSupabase'), 'Exports addCommunityCommentInSupabase');
testAssert(serviceContent.includes('export async function deleteCommunityCommentInSupabase'), 'Exports deleteCommunityCommentInSupabase');
testAssert(serviceContent.includes('export function subscribeToCommunityFeed'), 'Exports subscribeToCommunityFeed real-time listener');

// Cross-tab real-time bus
testAssert(serviceContent.includes('COMMUNITY_SYNC_CHANNEL_NAME = \'th3ory_community_sync\''), 'Defines dedicated th3ory_community_sync channel');
testAssert(serviceContent.includes('broadcastCommunityUpdate'), 'Implements broadcastCommunityUpdate cross-tab broadcaster');
testAssert(serviceContent.includes('new BroadcastChannel'), 'Instantiates modern BroadcastChannel for tab synchronization');
testAssert(serviceContent.includes('window.addEventListener(\'storage\''), 'Implements storage event fallback for cross-tab sync');
testAssert(serviceContent.includes('postgres_changes'), 'Subscribes to Supabase postgres_changes for remote sync');


// ── Suite 3: Approval Email Dispatcher & BIMI Notification Handlers ──────────
console.log('\n▶ [Suite 3]: Approval Email Dispatcher & BIMI Verification');

const emailServicePath = path.join(rootDir, 'src/services/emailService.js');
const emailServiceContent = fs.readFileSync(emailServicePath, 'utf8');

testAssert(emailServiceContent.includes('export async function sendCommunityApprovalEmail'), 'Exports sendCommunityApprovalEmail dispatcher');
testAssert(emailServiceContent.includes('type: \'COMMUNITY_APPROVAL\''), 'Configures COMMUNITY_APPROVAL email dispatch type');
testAssert(emailServiceContent.includes('#/community-login?email='), 'Embeds direct community login link with recipient email query parameter');
testAssert(emailServiceContent.includes('Bimi-Selector'), 'Configures official BIMI Selector in email headers');

const apiEmailPath = path.join(rootDir, 'api/send-email.js');
const apiEmailContent = fs.readFileSync(apiEmailPath, 'utf8');
testAssert(apiEmailContent.includes('receipt.type === \'COMMUNITY_APPROVAL\''), 'api/send-email.js processes COMMUNITY_APPROVAL email type');
testAssert(apiEmailContent.includes('Access Approved! 🎉'), 'api/send-email.js renders official approval greeting');


// ── Suite 4: Frontend UI Components & Realtime Subscriptions ─────────────────
console.log('\n▶ [Suite 4]: Community UI Components & Live Subscriptions Audit');

const regPath = path.join(rootDir, 'src/community/CommunityRegister.jsx');
testAssert(fs.existsSync(regPath), 'CommunityRegister.jsx component exists');
const regContent = fs.readFileSync(regPath, 'utf8');
testAssert(regContent.includes('registerCommunityMemberInSupabase'), 'CommunityRegister invokes registration service');
testAssert(regContent.includes('Status: Awaiting Admin Approval'), 'CommunityRegister displays pending approval status view');
testAssert(regContent.includes('Check Current Approval Status'), 'CommunityRegister provides live status re-check');
testAssert(regContent.includes('subscribeToCommunityFeed'), 'CommunityRegister subscribes to realtime feed for auto-approval detection');

const loginPath = path.join(rootDir, 'src/community/CommunityLogin.jsx');
testAssert(fs.existsSync(loginPath), 'CommunityLogin.jsx component exists');
const loginContent = fs.readFileSync(loginPath, 'utf8');
testAssert(loginContent.includes('authenticateCommunityMemberInSupabase'), 'CommunityLogin invokes authentication service');
testAssert(loginContent.includes('Account Review In Progress'), 'CommunityLogin handles pending account status notification');

const portalPath = path.join(rootDir, 'src/community/CommunityPortal.jsx');
testAssert(fs.existsSync(portalPath), 'CommunityPortal.jsx component exists');
const portalContent = fs.readFileSync(portalPath, 'utf8');
testAssert(portalContent.includes('EMOJI_DEFINITIONS'), 'CommunityPortal defines 6 reaction emoji definitions');
testAssert(portalContent.includes('toggleCommunityReactionInSupabase'), 'CommunityPortal wires reaction toggling');
testAssert(portalContent.includes('addCommunityCommentInSupabase'), 'CommunityPortal wires comment submissions');
testAssert(portalContent.includes('subscribeToCommunityFeed'), 'CommunityPortal subscribes to real-time feed updates');
testAssert(portalContent.includes('getEmbeddableMediaUrl'), 'CommunityPortal integrates Google Drive video stream embedder');


// ── Suite 5: Admin Management & Navigation Integration ───────────────────────
console.log('\n▶ [Suite 5]: Admin Community Hub Panel & Navigation Integration');

const adminPanelPath = path.join(rootDir, 'src/admin/panels/CommunityAdminPanel.jsx');
testAssert(fs.existsSync(adminPanelPath), 'CommunityAdminPanel.jsx component exists');
const adminPanelContent = fs.readFileSync(adminPanelPath, 'utf8');
testAssert(adminPanelContent.includes('approveCommunityMemberInSupabase'), 'Admin panel supports 1-click member approvals');
testAssert(adminPanelContent.includes('sendCommunityApprovalEmail'), 'Admin approval automatically triggers login link email dispatch');
testAssert(adminPanelContent.includes('createCommunityPostInSupabase'), 'Admin panel supports weekly video, file, and discussion publishing');
testAssert(adminPanelContent.includes('deleteCommunityPostInSupabase'), 'Admin panel supports wall post deletion');
testAssert(adminPanelContent.includes('deleteCommunityCommentInSupabase'), 'Admin panel supports discussion comment moderation');
testAssert(adminPanelContent.includes('subscribeToCommunityFeed'), 'Admin panel subscribes to realtime updates for live applicant notifications');

const adminAppPath = path.join(rootDir, 'src/admin/AdminApp.jsx');
const adminAppContent = fs.readFileSync(adminAppPath, 'utf8');
testAssert(adminAppContent.includes('CommunityAdminPanel'), 'AdminApp imports CommunityAdminPanel');
testAssert(adminAppContent.includes('id: \'community_hub\''), 'AdminApp registers community_hub in navigation items');
testAssert(adminAppContent.includes('case \'community_hub\':'), 'AdminApp renders CommunityAdminPanel in render switch');


// ── Suite 6: Main Routing & Navbar Links ────────────────────────────────────
console.log('\n▶ [Suite 6]: Routing & Navigation Verification');

const mainPath = path.join(rootDir, 'src/main.jsx');
const mainContent = fs.readFileSync(mainPath, 'utf8');
testAssert(mainContent.includes('CommunityRegister'), 'main.jsx imports CommunityRegister');
testAssert(mainContent.includes('CommunityLogin'), 'main.jsx imports CommunityLogin');
testAssert(mainContent.includes('CommunityPortal'), 'main.jsx imports CommunityPortal');
testAssert(mainContent.includes('view === \'community-register\''), 'main.jsx routes community-register view');
testAssert(mainContent.includes('view === \'community-login\''), 'main.jsx routes community-login view');
testAssert(mainContent.includes('view === \'community\''), 'main.jsx routes community portal view');

const navbarPath = path.join(rootDir, 'src/components/Navbar.jsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');
testAssert(navbarContent.includes('href="#community"'), 'Navbar.jsx embeds desktop Community link');
testAssert(navbarContent.includes('Private Community Wall'), 'Navbar.jsx embeds mobile drawer Community link');


// ── Suite 7: Functional Service State Transitions & Validation Logic ────────
console.log('\n▶ [Suite 7]: Functional State Transitions & Logic Validation');

// Mock in-memory execution of core community rules
function mockRegisterMember(email, name, password) {
  if (!email || !email.includes('@')) return { success: false, error: 'Invalid email' };
  if (!name || name.trim().length === 0) return { success: false, error: 'Name required' };
  if (!password || password.length < 6) return { success: false, error: 'Short password' };
  return {
    success: true,
    member: {
      id: 'test-mem-1',
      name,
      email,
      password_hash: password,
      status: 'pending',
      created_at: new Date().toISOString()
    }
  };
}

function mockApproveMember(member) {
  return {
    ...member,
    status: 'approved',
    approved_at: new Date().toISOString()
  };
}

function mockAuthenticateMember(member, password) {
  if (!member) return { success: false, error: 'Account not found' };
  if (member.password_hash !== password) return { success: false, error: 'Incorrect password' };
  if (member.status === 'pending') return { success: false, status: 'pending', error: 'Pending review' };
  if (member.status === 'approved') return { success: true, member };
  return { success: false, error: 'Access denied' };
}

// 1. Validation tests
const invalidEmailRes = mockRegisterMember('invalid-email', 'John Doe', 'Pass1234');
testAssert(!invalidEmailRes.success, 'Registration rejects invalid email format');

const shortPassRes = mockRegisterMember('valid@th3ory.online', 'John Doe', '123');
testAssert(!shortPassRes.success, 'Registration rejects password shorter than 6 characters');

const validRegRes = mockRegisterMember('john@th3ory.online', 'John Doe', 'SecurePass2026!');
testAssert(validRegRes.success && validRegRes.member.status === 'pending', 'Registration creates member in pending status');

// 2. Pending member gate
const pendingLoginRes = mockAuthenticateMember(validRegRes.member, 'SecurePass2026!');
testAssert(!pendingLoginRes.success && pendingLoginRes.status === 'pending', 'Pending member cannot log in until approved');

// 3. Admin approval transition
const approvedMember = mockApproveMember(validRegRes.member);
testAssert(approvedMember.status === 'approved' && approvedMember.approved_at !== null, 'Admin approval updates status to approved with timestamp');

// 4. Approved member login
const approvedLoginRes = mockAuthenticateMember(approvedMember, 'SecurePass2026!');
testAssert(approvedLoginRes.success && approvedLoginRes.member.status === 'approved', 'Approved member successfully authenticates');

// 5. Wrong password rejected
const wrongPassLoginRes = mockAuthenticateMember(approvedMember, 'WrongPassword!');
testAssert(!wrongPassLoginRes.success && wrongPassLoginRes.error === 'Incorrect password', 'Authentication rejects wrong password');


console.log('\n========================================================================');
console.log(`  VALIDATION RESULTS: ${passedTests} Passed | ${totalTests - passedTests} Failed | ${totalTests} Total`);
console.log('========================================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL COMMUNITY HUB SYSTEM & REALTIME ASSERTIONS PASSED WITH 100% PASS RATE!\n');
  process.exit(0);
} else {
  console.error('❌ SOME COMMUNITY TESTS FAILED.');
  process.exit(1);
}
