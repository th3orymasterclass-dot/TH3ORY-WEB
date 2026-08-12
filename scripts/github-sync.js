import fs from 'fs';
import path from 'path';
import https from 'https';

// Auto-load GITHUB_PERSONAL_ACCESS_TOKEN from .env if present
let TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '';
if (!TOKEN) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envText = fs.readFileSync(envPath, 'utf8');
      const match = envText.match(/GITHUB_PERSONAL_ACCESS_TOKEN=(.+)/);
      if (match) TOKEN = match[1].trim();
    }
  } catch (e) {
    // fallback
  }
}

const OWNER = 'th3orymasterclass-dot';
const REPO  = 'TH3ORY-WEB';
const BRANCH = 'main';

const IGNORED_DIRS = new Set(['node_modules', 'dist', 'build', '.git', 'scratch', '.tempmediaStorage', '.gemini']);
const IGNORED_FILES = new Set(['.env', '.ds_store', 'desktop.ini', 'npm-debug.log']);

function ghRequest(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: urlPath,
      method: method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'NodeJS-GitHub-Sync',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };
    const req = https.request(options, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resBody);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function getAllFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const relPath  = path.relative(baseDir, filePath).replace(/\\/g, '/');
    const stat     = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!IGNORED_DIRS.has(file.toLowerCase()) && !file.startsWith('.system_')) {
        results = results.concat(getAllFiles(filePath, baseDir));
      }
    } else {
      if (!IGNORED_FILES.has(file.toLowerCase()) && !file.endsWith('.log')) {
        results.push({ fullPath: filePath, relPath });
      }
    }
  });
  return results;
}

async function syncToGitHub(commitMessage = 'Update TH3ORY-WEB codebase') {
  console.log(`🚀 Starting sync to GitHub repository ${OWNER}/${REPO}...`);
  const rootDir = process.cwd();
  const files = getAllFiles(rootDir);
  console.log(`📁 Found ${files.length} workspace files to sync.`);

  // 1. Get latest commit SHA on main
  const refRes = await ghRequest('GET', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`);
  let latestCommitSha = null;
  let baseTreeSha = null;

  if (refRes.status === 200) {
    latestCommitSha = refRes.data.object.sha;
    const commitRes = await ghRequest('GET', `/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`);
    if (commitRes.status === 200) {
      baseTreeSha = commitRes.data.tree.sha;
    }
  }

  console.log(`📌 Latest Commit SHA: ${latestCommitSha || 'Initial'}`);

  // 2. Upload blobs
  const treeItems = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const content = fs.readFileSync(f.fullPath);
    const isBinary = content.includes(0);
    const encoding = isBinary ? 'base64' : 'utf-8';
    const payload = {
      content: content.toString(encoding),
      encoding: encoding
    };

    const blobRes = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/blobs`, payload);
    if (blobRes.status === 201) {
      treeItems.push({
        path: f.relPath,
        mode: '100644',
        type: 'blob',
        sha: blobRes.data.sha
      });
      process.stdout.write(`\r  [${i + 1}/${files.length}] Uploaded: ${f.relPath}`);
    } else {
      console.error(`\n❌ Failed to upload blob for ${f.relPath}:`, blobRes.data);
    }
  }
  console.log('\n✅ All blobs uploaded successfully.');

  // 3. Create tree
  const treePayload = {
    tree: treeItems
  };
  if (baseTreeSha) treePayload.base_tree = baseTreeSha;

  const treeRes = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/trees`, treePayload);
  if (treeRes.status !== 201) {
    console.error('❌ Failed to create tree:', treeRes.data);
    return false;
  }
  const newTreeSha = treeRes.data.sha;
  console.log(`🌳 Created Tree SHA: ${newTreeSha}`);

  // 4. Create commit
  const commitPayload = {
    message: commitMessage,
    tree: newTreeSha,
    parents: latestCommitSha ? [latestCommitSha] : []
  };

  const newCommitRes = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/commits`, commitPayload);
  if (newCommitRes.status !== 201) {
    console.error('❌ Failed to create commit:', newCommitRes.data);
    return false;
  }
  const newCommitSha = newCommitRes.data.sha;
  console.log(`✨ Created Commit SHA: ${newCommitSha}`);

  // 5. Update ref
  const updateRefPayload = {
    sha: newCommitSha,
    force: true
  };

  let updateRefRes;
  if (latestCommitSha) {
    updateRefRes = await ghRequest('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, updateRefPayload);
  } else {
    updateRefRes = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/refs`, {
      ref: `refs/heads/${BRANCH}`,
      sha: newCommitSha
    });
  }

  if (updateRefRes.status === 200 || updateRefRes.status === 201) {
    console.log(`🎉 SUCCESS! Synced to https://github.com/${OWNER}/${REPO}/tree/${BRANCH}`);
    return true;
  } else {
    console.error('❌ Failed to update ref:', updateRefRes.data);
    return false;
  }
}

const msg = process.argv[2] || 'Sync TH3ORY-WEB full application to GitHub';
syncToGitHub(msg);
