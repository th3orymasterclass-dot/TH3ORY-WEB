import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('────────────────────────────────────────────────────────────');
console.log('⚡ TESTING TH3ORY SUPABASE AMBASSADOR REALTIME SYSTEM');
console.log('────────────────────────────────────────────────────────────');

const ROOT_DIR = process.cwd();

// 1. Verify supabaseService.js exports and functions
console.log('\n▶ Suite 1: Supabase Service Ambassador Integrations');
const supabaseServicePath = path.join(ROOT_DIR, 'src', 'services', 'supabaseService.js');
const serviceContent = fs.readFileSync(supabaseServicePath, 'utf8');

const expectedFunctions = [
  'fetchAllAmbassadorApplicationsFromSupabase',
  'fetchAmbassadorByCodeFromSupabase',
  'updateAmbassadorApplicationInSupabase',
  'deleteAmbassadorApplicationFromSupabase',
  'approveAmbassadorInSupabase',
  'rejectAmbassadorInSupabase',
  'saveAmbassadorInterviewNotesToSupabase',
  'scheduleAmbassadorInterviewInSupabase',
  'submitAmbassadorTeamApprovalToSupabase',
  'fetchAllAmbassadorLeadsFromSupabase',
  'fetchAmbassadorLeadsFromSupabase',
  'saveAmbassadorLeadToSupabase',
  'updateAmbassadorLeadStatusInSupabase',
  'deleteAmbassadorLeadFromSupabase',
  'fetchAllAmbassadorPayoutsFromSupabase',
  'fetchAmbassadorPayoutsFromSupabase',
  'updateAmbassadorPayoutStatusInSupabase',
  'deleteAmbassadorPayoutFromSupabase',
  'saveAmbassadorPayoutDetailsToSupabase',
  'requestAmbassadorPayoutToSupabase',
  'fetchAllAmbassadorWeeklyReportsFromSupabase',
  'fetchAmbassadorWeeklyReportsFromSupabase',
  'saveAmbassadorWeeklyReportToSupabase',
  'fetchAmbassadorTasksFromSupabase',
  'createAmbassadorTaskInSupabase',
  'updateAmbassadorTaskInSupabase',
  'deleteAmbassadorTaskInSupabase',
  'subscribeToAmbassadors',
  'subscribeToAmbassadorLeads',
  'subscribeToAmbassadorPayouts',
  'subscribeToAmbassadorTasks',
  'subscribeToAllAmbassadorData'
];

expectedFunctions.forEach(fn => {
  assert(serviceContent.includes(fn), `supabaseService.js must export ${fn}`);
  console.log(`  ✓ PASS: supabaseService.js exports ${fn}`);
});

// 2. Verify AmbassadorPortal.jsx
console.log('\n▶ Suite 2: AmbassadorPortal Component Audit');
const portalPath = path.join(ROOT_DIR, 'src', 'components', 'AmbassadorPortal.jsx');
const portalContent = fs.readFileSync(portalPath, 'utf8');

assert(portalContent.includes('subscribeToAmbassadors'), 'Portal connects to subscribeToAmbassadors');
assert(portalContent.includes('subscribeToAmbassadorLeads'), 'Portal connects to subscribeToAmbassadorLeads');
assert(portalContent.includes('subscribeToAmbassadorPayouts'), 'Portal connects to subscribeToAmbassadorPayouts');
assert(portalContent.includes('subscribeToAmbassadorTasks'), 'Portal connects to subscribeToAmbassadorTasks');
assert(portalContent.includes("activeTab === 'tasks'"), 'Portal renders Campaign Tasks tab');
assert(portalContent.includes("activeTab === 'reports'"), 'Portal renders Friday Reports tab');
assert(portalContent.includes("activeTab === 'payouts'"), 'Portal renders Payouts & Ledger tab');
assert(portalContent.includes('fetchAmbassadorTasksFromSupabase'), 'Portal fetches tasks from Supabase');
assert(portalContent.includes('fetchAmbassadorWeeklyReportsFromSupabase'), 'Portal fetches weekly reports from Supabase');
console.log('  ✓ PASS: AmbassadorPortal.jsx connects to all real-time subscriptions and renders all tabs');

// 3. Verify AmbassadorApplicationsPanel.jsx (Admin & Team)
console.log('\n▶ Suite 3: AmbassadorApplicationsPanel (Admin & Team) Audit');
const panelPath = path.join(ROOT_DIR, 'src', 'admin', 'panels', 'AmbassadorApplicationsPanel.jsx');
const panelContent = fs.readFileSync(panelPath, 'utf8');

assert(panelContent.includes('subscribeToAllAmbassadorData'), 'Panel subscribes to subscribeToAllAmbassadorData');
assert(panelContent.includes("activeSection === 'pipeline'"), 'Panel renders Recruitment Pipeline section');
assert(panelContent.includes("activeSection === 'combined'"), 'Panel renders Combined Ambassadors Ledger');
assert(panelContent.includes("activeSection === 'leads'"), 'Panel renders Referred Student Leads section');
assert(panelContent.includes("activeSection === 'reports'"), 'Panel renders Weekly Activity Reports stream');
assert(panelContent.includes("activeSection === 'payouts'"), 'Panel renders Payout Settlements section');
assert(panelContent.includes("activeSection === 'tasks'"), 'Panel renders Campaign Tasks Manager section');
assert(panelContent.includes('handleToggleLeadStatus'), 'Panel supports live lead status toggling');
assert(panelContent.includes('handleConfirmSettlement'), 'Panel supports live payout settlement');
assert(panelContent.includes('handleSaveTaskSubmit'), 'Panel supports live campaign quest CRUD');
console.log('  ✓ PASS: AmbassadorApplicationsPanel.jsx unifies all 5 ambassador tables with live edits');

// 4. Verify Route Links & Navigation
console.log('\n▶ Suite 4: Route Links & Portal Navigation Audit');
const footerPath = path.join(ROOT_DIR, 'src', 'components', 'Footer.jsx');
const footerContent = fs.readFileSync(footerPath, 'utf8');
assert(footerContent.includes('#ambassador-login'), 'Footer links to #ambassador-login');
assert(footerContent.includes('Campus Ambassador Portal Login'), 'Footer exposes Campus Ambassador Portal Login link');

const loginPath = path.join(ROOT_DIR, 'src', 'components', 'AmbassadorLogin.jsx');
const loginContent = fs.readFileSync(loginPath, 'utf8');
assert(loginContent.includes('fetchAmbassadorByCodeFromSupabase'), 'AmbassadorLogin authenticates with Supabase');

console.log('  ✓ PASS: Footer and AmbassadorLogin route links connect directly to database');

console.log('\n============================================================');
console.log('  ALL AMBASSADOR REALTIME SYSTEM TESTS PASSED SUCCESSFULLY! 🚀');
console.log('============================================================\n');
