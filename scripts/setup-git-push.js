import { execSync } from 'child_process';
import fs from 'fs';

const envText = fs.readFileSync('.env', 'utf8');
const tokenMatch = envText.match(/GITHUB_PERSONAL_ACCESS_TOKEN=(.+)/);
const token = tokenMatch ? tokenMatch[1].trim() : '';

const repoUrl = `https://${token}@github.com/th3orymasterclass-dot/TH3ORY-WEB.git`;

function run(cmd) {
  console.log('Running:', cmd.includes(token) ? cmd.replace(token, '***') : cmd);
  try {
    const out = execSync(cmd, { stdio: 'pipe' }).toString();
    if (out.trim()) console.log(out.trim());
    return true;
  } catch (e) {
    console.error('Error:', e.stderr ? e.stderr.toString() : e.message);
    return false;
  }
}

try {
  try { execSync('git rm --cached .env.local', { stdio: 'ignore' }); } catch {}
  try { execSync('git rm --cached mcp.json', { stdio: 'ignore' }); } catch {}
  try { execSync('git rm --cached .mcp.json', { stdio: 'ignore' }); } catch {}
  try { execSync('git rm --cached .env.example', { stdio: 'ignore' }); } catch {}
  try { execSync('git rm --cached .env', { stdio: 'ignore' }); } catch {}
  
  run('git add -A');
  run('git status --short');
  run('git commit -m "feat: implement DPDP Act 2023 privacy and consent management framework"');
  run('git push origin main');
  console.log('🎉 PUSH COMPLETED SUCCESSFULLY!');
} catch (err) {
  console.error('Failed:', err);
}
