import fs from 'fs';
import path from 'path';
import https from 'https';

let TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '';
if (!TOKEN) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envText = fs.readFileSync(envPath, 'utf8');
      const match = envText.match(/GITHUB_PERSONAL_ACCESS_TOKEN=(.+)/);
      if (match) TOKEN = match[1].trim();
    }
  } catch (e) {}
}

const OWNER = 'th3orymasterclass-dot';
const REPO  = 'TH3ORY-WEB';
const BRANCH = 'gh-pages';

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

function getFilesRecursively(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath, baseDir));
    } else {
      const relPath = path.relative(baseDir, filePath).replace(/\\/g, '/');
      results.push({ fullPath: filePath, relPath });
    }
  });
  return results;
}

async function deployGHPages() {
  console.log(`🚀 Starting GitHub Pages deployment to ${OWNER}/${REPO} on branch [${BRANCH}]...`);
  const distDir = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist folder not found. Run npm run build first.');
    return;
  }

  const files = getFilesRecursively(distDir);
  console.log(`📁 Found ${files.length} built assets in dist/`);

  // Get ref for gh-pages or main
  let parentCommitSha = null;
  const refRes = await ghRequest('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  if (refRes.status === 200) {
    parentCommitSha = refRes.data.object.sha;
  } else {
    // try main parent
    const mainRef = await ghRequest('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/main`);
    if (mainRef.status === 200) parentCommitSha = mainRef.data.object.sha;
  }

  const treeItems = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const contentBuf = fs.readFileSync(file.fullPath);
    const contentBase64 = contentBuf.toString('base64');

    const blobRes = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
      content: contentBase64,
      encoding: 'base64'
    });

    if (blobRes.status === 201) {
      treeItems.push({
        path: file.relPath,
        mode: '100644',
        type: 'blob',
        sha: blobRes.data.sha
      });
      console.log(`  [${i+1}/${files.length}] Uploaded: ${file.relPath}`);
    } else {
      console.error(`❌ Failed blob upload: ${file.relPath}`, blobRes.data);
    }
  }

  // Create tree
  const treePayload = { tree: treeItems };
  if (parentCommitSha) treePayload.base_tree = parentCommitSha;

  const treeRes = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/trees`, treePayload);
  if (treeRes.status !== 201) {
    console.error('❌ Failed to create tree:', treeRes.data);
    return;
  }

  // Create commit
  const commitPayload = {
    message: `Deploy production dist build to gh-pages [${new Date().toISOString()}]`,
    tree: treeRes.data.sha,
    parents: parentCommitSha ? [parentCommitSha] : []
  };

  const commitRes = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/commits`, commitPayload);
  if (commitRes.status !== 201) {
    console.error('❌ Failed to create commit:', commitRes.data);
    return;
  }

  // Update ref or create ref
  if (parentCommitSha) {
    const updateRef = await ghRequest('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
      sha: commitRes.data.sha,
      force: true
    });
    console.log(`🎉 Branch ${BRANCH} updated to commit ${commitRes.data.sha}`);
  } else {
    const createRef = await ghRequest('POST', `/repos/${OWNER}/${REPO}/git/refs`, {
      ref: `refs/heads/${BRANCH}`,
      sha: commitRes.data.sha
    });
    console.log(`🎉 Branch ${BRANCH} created at commit ${commitRes.data.sha}`);
  }
}

deployGHPages().catch(console.error);
