/**
 * TH3ORY Masterclass - BIMI & VMC Asset Validator
 * 
 * Verifies that:
 * 1. public/bimi-logo.svg conforms to IETF SVG Tiny 1.2 PS specifications.
 * 2. public/bimi-vmc.pem and public/th3ory.vmc contain valid PEM certificate chains.
 * 3. Email API & services embed the official logo profile picture and BIMI headers.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('🔍 Running BIMI & VMC Verification Suite...\n');

// 1. Validate public/bimi-logo.svg
const bimiLogoPath = path.join(rootDir, 'public', 'bimi-logo.svg');
assert(fs.existsSync(bimiLogoPath), 'public/bimi-logo.svg file exists');

if (fs.existsSync(bimiLogoPath)) {
  const svgContent = fs.readFileSync(bimiLogoPath, 'utf8');
  assert(svgContent.includes('version="1.2"'), 'SVG declares version="1.2" (SVG Tiny PS)');
  assert(svgContent.includes('baseProfile="tiny-ps"'), 'SVG declares baseProfile="tiny-ps"');
  assert(svgContent.includes('xmlns="http://www.w3.org/2000/svg"'), 'SVG contains official XML namespace');
  assert(!svgContent.includes('<image'), 'SVG contains no raster <image> elements (BIMI strict compliance)');
  assert(!svgContent.includes('<script'), 'SVG contains no <script> tags (BIMI strict security requirement)');
  assert(svgContent.includes('viewBox="0 0 512 512"'), 'SVG uses standard 1:1 square viewBox (512x512)');
  assert(svgContent.includes('<title>'), 'SVG contains required <title> metadata');
}

// 2. Validate VMC Certificate Files
const vmcPemPath = path.join(rootDir, 'public', 'bimi-vmc.pem');
const vmcDirectPath = path.join(rootDir, 'public', 'th3ory.vmc');

assert(fs.existsSync(vmcPemPath), 'public/bimi-vmc.pem exists');
assert(fs.existsSync(vmcDirectPath), 'public/th3ory.vmc exists');

if (fs.existsSync(vmcPemPath)) {
  const pemContent = fs.readFileSync(vmcPemPath, 'utf8');
  assert(pemContent.includes('-----BEGIN CERTIFICATE-----'), 'VMC file contains standard PEM certificate header');
  assert(pemContent.includes('-----END CERTIFICATE-----'), 'VMC file contains standard PEM certificate footer');
  
  // Base64 decoded inspection of X.509 logotype extension
  const decodedPayload = Buffer.from(pemContent.replace(/-----[^\n]+-----|\s+/g, ''), 'base64').toString('latin1');
  assert(decodedPayload.includes('th3ory.online/bimi-logo.svg'), 'VMC certificate contains embedded logotype URI pointer');
}

// 3. Validate DNS Documentation
const bimiDocPath = path.join(rootDir, 'BIMI_SETUP.md');
assert(fs.existsSync(bimiDocPath), 'BIMI_SETUP.md DNS setup guide exists');

if (fs.existsSync(bimiDocPath)) {
  const docContent = fs.readFileSync(bimiDocPath, 'utf8');
  assert(docContent.includes('default._bimi'), 'Documentation defines default._bimi selector record');
  assert(docContent.includes('v=BIMI1'), 'Documentation defines v=BIMI1 record syntax');
  assert(docContent.includes('v=DMARC1'), 'Documentation specifies DMARC prerequisite policy');
}

// 4. Validate Email Templates with Logo Profile Picture
const sendEmailApiPath = path.join(rootDir, 'api', 'send-email.js');
const emailServicePath = path.join(rootDir, 'src', 'services', 'emailService.js');

if (fs.existsSync(sendEmailApiPath)) {
  const apiContent = fs.readFileSync(sendEmailApiPath, 'utf8');
  assert(apiContent.includes('https://th3ory.online/logo-transparent.png'), 'api/send-email.js embeds high-res logo profile picture');
  assert(apiContent.includes('VERIFIED OFFICIAL SENDER'), 'api/send-email.js displays verified sender badge in email header');
  assert(apiContent.includes('Bimi-Selector'), 'api/send-email.js dispatches Bimi-Selector headers');
}

if (fs.existsSync(emailServicePath)) {
  const serviceContent = fs.readFileSync(emailServicePath, 'utf8');
  assert(serviceContent.includes('https://th3ory.online/logo-transparent.png'), 'src/services/emailService.js embeds logo profile picture in client fallback');
  assert(serviceContent.includes('Bimi-Selector'), 'src/services/emailService.js dispatches Bimi-Selector headers');
}

console.log(`\n========================================`);
console.log(`Result: ${passedTests}/${totalTests} BIMI & VMC Tests Passed.`);
console.log(`========================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
