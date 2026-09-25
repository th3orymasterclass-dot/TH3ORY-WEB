/**
 * TH3ORY - OBSIDIAN VAULT CODEBASE SYNCHRONIZER
 * Syncs production site files, schemas, scripts, and documentation into the connected Obsidian Vault.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VAULT_BACKUP_ROOT = 'E:\\TH3ORY\\TH3ORY\\Backup';

console.log('🚀 [TH3ORY -> OBSIDIAN] Initiating Codebase Sync...');
console.log(`📂 Source: ${PROJECT_ROOT}`);
console.log(`📦 Destination: ${VAULT_BACKUP_ROOT}`);

if (!fs.existsSync(path.dirname(VAULT_BACKUP_ROOT))) {
  console.error(`❌ Target Obsidian Vault does not exist at ${path.dirname(VAULT_BACKUP_ROOT)}`);
  process.exit(1);
}

fs.mkdirSync(VAULT_BACKUP_ROOT, { recursive: true });

const DIRS_TO_SYNC = ['src', 'public', 'api', 'scripts'];
const FILES_TO_SYNC = [
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'vercel.json',
  'index.html',
  '.env.example',
  'PROJECT_SUMMARY.md',
  'API_KEYS_AND_INTEGRATIONS.md',
  'DESIGN_SYSTEM.md',
  'BIMI_SETUP.md',
  'supabase_schema.sql',
  'supabase_community.sql',
  'supabase_ambassadors.sql',
  'supabase_dpdp_compliance.sql',
  'supabase_team_members.sql',
  'supabase_blogs.sql',
  'supabase_certificates.sql'
];

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip node_modules, dist, .git, etc.
    if (['node_modules', 'dist', '.git', '.vercel', 'scratch'].includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy directories
let dirCount = 0;
for (const dir of DIRS_TO_SYNC) {
  const srcDir = path.join(PROJECT_ROOT, dir);
  const destDir = path.join(VAULT_BACKUP_ROOT, dir);
  if (fs.existsSync(srcDir)) {
    copyDirRecursive(srcDir, destDir);
    dirCount++;
    console.log(`  ✓ Directory synced: ${dir}/`);
  }
}

// Copy root files
let fileCount = 0;
for (const file of FILES_TO_SYNC) {
  const srcFile = path.join(PROJECT_ROOT, file);
  const destFile = path.join(VAULT_BACKUP_ROOT, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    fileCount++;
    console.log(`  ✓ File synced: ${file}`);
  }
}

console.log(`\n🎉 [SUCCESS] Synced ${dirCount} directories and ${fileCount} root configurations to Obsidian Vault!`);
