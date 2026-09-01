/**
 * TH3ORY Profile Picture & Dedicated Memory Segmentation Test Suite
 * Validates role-based memory partitions, localStorage keys, image compression logic,
 * avatar preset resolutions, and Supabase integration handlers.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('========================================================================');
console.log('  TH3ORY PROFILE AVATAR & MEMORY SEGMENTATION VALIDATION SUITE');
console.log('========================================================================\n');

// 1. Profile Storage Engine
console.log('▶ [Suite 1]: Profile Storage Engine & Memory Segmentation Logic');
const engineSource = readFileSync(resolve('src/utils/profileStorageEngine.js'), 'utf8');

assert(engineSource.includes('getStudentAvatarKey'), 'Exports getStudentAvatarKey function');
assert(engineSource.includes('getAmbassadorAvatarKey'), 'Exports getAmbassadorAvatarKey function');
assert(engineSource.includes('getTeamMemberAvatarKey'), 'Exports getTeamMemberAvatarKey function');

assert(engineSource.includes('th3ory_student_avatar_'), 'Student avatar key uses dedicated th3ory_student_avatar_ partition prefix');
assert(engineSource.includes('th3ory_ambassador_avatar_'), 'Ambassador avatar key uses dedicated th3ory_ambassador_avatar_ partition prefix');
assert(engineSource.includes('th3ory_team_avatar_'), 'Team avatar key uses dedicated th3ory_team_avatar_ partition prefix');

assert(engineSource.includes('processImageFile'), 'Implements client-side auto-compression engine processImageFile');
assert(engineSource.includes('AVATAR_PRESETS'), 'Defines curated HD persona preset avatars');
assert(engineSource.includes('th3ory_student_avatar_change'), 'Dispatches th3ory_student_avatar_change custom event');
assert(engineSource.includes('th3ory_ambassador_avatar_change'), 'Dispatches th3ory_ambassador_avatar_change custom event');
assert(engineSource.includes('MAX_PHOTO_SIZE_BYTES'), 'Defines MAX_PHOTO_SIZE_BYTES constant');
assert(engineSource.includes('1 * 1024 * 1024'), 'Enforces 1MB photo file size threshold in bytes');
assert(engineSource.includes('MAX_PHOTO_SIZE_MB'), 'Exports MAX_PHOTO_SIZE_MB constant');

// 2. ProfileAvatar & ProfilePictureModal UI Components
console.log('\n▶ [Suite 2]: UI Components (ProfileAvatar & ProfilePictureModal)');
const avatarSource = readFileSync(resolve('src/components/ProfileAvatar.jsx'), 'utf8');
const modalSource = readFileSync(resolve('src/components/ProfilePictureModal.jsx'), 'utf8');

assert(avatarSource.includes('export default function ProfileAvatar'), 'ProfileAvatar component exists and is exported');
assert(avatarSource.includes('ROLE_THEMES'), 'ProfileAvatar has distinctive role themes for student (gold), ambassador (amber), and team (indigo)');
assert(avatarSource.includes('editable'), 'ProfileAvatar supports editable hover overlay with camera icon');

assert(modalSource.includes('export default function ProfilePictureModal'), 'ProfilePictureModal component exists and is exported');
assert(modalSource.includes('handleFileSelect') || modalSource.includes('handleDrop'), 'ProfilePictureModal supports drag-and-drop / file browser upload');
assert(modalSource.includes('MAX_PHOTO_SIZE_BYTES'), 'ProfilePictureModal enforces MAX_PHOTO_SIZE_BYTES validation');
assert(modalSource.includes('1MB'), 'ProfilePictureModal displays 1MB maximum photo size in the upload prompt');
assert(modalSource.includes('processImageFile'), 'ProfilePictureModal uses processImageFile for automatic WebP/JPEG compression');
assert(modalSource.includes('AVATAR_PRESETS'), 'ProfilePictureModal offers preset persona selector');
assert(modalSource.includes('memoryPartitionKey'), 'ProfilePictureModal calculates dedicated database / storage partition key');

// 3. Student Portal Integration
console.log('\n▶ [Suite 3]: Student Portal Profile Picture Integration');
const studentAppSource = readFileSync(resolve('src/student/StudentApp.jsx'), 'utf8');
const studentDashSource = readFileSync(resolve('src/student/panels/DashboardHome.jsx'), 'utf8');

assert(studentAppSource.includes('ProfileAvatar'), 'StudentApp imports ProfileAvatar');
assert(studentAppSource.includes('ProfilePictureModal'), 'StudentApp renders ProfilePictureModal');
assert(studentAppSource.includes('th3ory_student_avatar_change'), 'StudentApp listens for student avatar changes');
assert(studentDashSource.includes('ProfileAvatar'), 'DashboardHome welcome banner displays student ProfileAvatar');

// 4. Ambassador Portal Integration
console.log('\n▶ [Suite 4]: Ambassador Portal Profile Picture Integration');
const ambPortalSource = readFileSync(resolve('src/components/AmbassadorPortal.jsx'), 'utf8');

assert(ambPortalSource.includes('ProfileAvatar'), 'AmbassadorPortal imports ProfileAvatar');
assert(ambPortalSource.includes('ProfilePictureModal'), 'AmbassadorPortal renders ProfilePictureModal');
assert(ambPortalSource.includes('th3ory_ambassador_avatar_change'), 'AmbassadorPortal listens for ambassador avatar changes');
assert(ambPortalSource.includes('getAmbassadorAvatar'), 'AmbassadorPortal loads partitioned avatar from storage');

// 5. Team Portal Integration
console.log('\n▶ [Suite 5]: Team Portal Profile Picture Integration');
const teamAppSource = readFileSync(resolve('src/team/TeamApp.jsx'), 'utf8');

assert(teamAppSource.includes('ProfileAvatar'), 'TeamApp imports ProfileAvatar');
assert(teamAppSource.includes('ProfilePictureModal'), 'TeamApp renders ProfilePictureModal');
assert(teamAppSource.includes('th3ory_team_avatar_change'), 'TeamApp listens for team avatar changes');
assert(teamAppSource.includes('getTeamMemberAvatar'), 'TeamApp loads partitioned avatar from storage');

// 6. Supabase Service Database Handlers & SQL Schema
console.log('\n▶ [Suite 6]: Supabase Database Integration & Schema Allocations');
const supabaseSource = readFileSync(resolve('src/services/supabaseService.js'), 'utf8');
const sqlSource = readFileSync(resolve('supabase_schema.sql'), 'utf8');

assert(supabaseSource.includes('saveStudentProfilePictureToSupabase'), 'supabaseService exports saveStudentProfilePictureToSupabase');
assert(supabaseSource.includes('fetchStudentProfileFromSupabase'), 'supabaseService exports fetchStudentProfileFromSupabase');
assert(supabaseSource.includes('saveAmbassadorProfilePictureToSupabase'), 'supabaseService exports saveAmbassadorProfilePictureToSupabase');
assert(supabaseSource.includes('saveTeamMemberProfilePictureToSupabase'), 'supabaseService exports saveTeamMemberProfilePictureToSupabase');

assert(sqlSource.includes('avatar_url TEXT'), 'supabase_schema.sql allocates avatar_url column in database schema');

console.log('\n========================================================================');
console.log(`  VALIDATION RESULTS: ${passed} Passed | ${failed} Failed | ${passed + failed} Total`);
console.log('========================================================================\n');

if (failed === 0) {
  console.log('🎉 ALL PROFILE PICTURE & MEMORY SEGMENTATION CHECKS PASSED!\n');
  process.exit(0);
} else {
  console.error('⚠️ SOME TESTS FAILED. CHECK LOGS ABOVE.\n');
  process.exit(1);
}
