import { parseGoogleDriveUrl, getEmbeddableMediaUrl } from '../src/utils/gdriveHelper.js';

function runGoogleDriveTestSuite() {
  console.log('===================================================================');
  console.log('⚡ TH3ORY MASTERCLASS - GOOGLE DRIVE DIGITAL STORAGE TEST SUITE');
  console.log('===================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] Test ${total}: ${testName}`);
      if (details) console.log(`      ↳ ${details}`);
    } else {
      console.error(`  ❌ [FAIL] Test ${total}: ${testName}`);
      if (details) console.error(`      ↳ ${details}`);
    }
  }

  // 1. Standard Shareable File View Link
  const url1 = 'https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9J0k1L2m3N4o5P6qR/view?usp=sharing';
  const res1 = parseGoogleDriveUrl(url1);
  assert(
    res1.isGDrive && res1.fileId === '1A2b3C4d5E6f7G8h9J0k1L2m3N4o5P6qR' && res1.embedUrl === 'https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9J0k1L2m3N4o5P6qR/preview',
    'Standard Google Drive Shareable File Link Parsing',
    `Extracted ID: ${res1.fileId} | Embed Stream: ${res1.embedUrl}`
  );

  // 2. Open ID Link
  const url2 = 'https://drive.google.com/open?id=1XyZ98765432101234567890abcdefg';
  const res2 = parseGoogleDriveUrl(url2);
  assert(
    res2.isGDrive && res2.fileId === '1XyZ98765432101234567890abcdefg',
    'Google Drive Open ID Format Parsing',
    `Extracted ID: ${res2.fileId}`
  );

  // 3. Folder Link
  const url3 = 'https://drive.google.com/drive/folders/1FolderID99887766554433221100aa';
  const res3 = parseGoogleDriveUrl(url3);
  assert(
    res3.isGDrive && res3.isFolder && res3.fileId === '1FolderID99887766554433221100aa',
    'Google Drive Folder View Parsing',
    `Folder ID: ${res3.fileId} | Embedded Folder View: ${res3.embedUrl}`
  );

  // 4. Raw File ID String
  const url4 = '1RawIDString1234567890987654321';
  const res4 = parseGoogleDriveUrl(url4);
  assert(
    res4.isGDrive && res4.fileId === '1RawIDString1234567890987654321',
    'Raw Google Drive File ID Input',
    `Extracted ID: ${res4.fileId}`
  );

  // 5. Direct Stream Embed Helper
  const embedMedia = getEmbeddableMediaUrl(url1);
  assert(
    embedMedia === 'https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9J0k1L2m3N4o5P6qR/preview',
    'getEmbeddableMediaUrl Conversion for Google Drive Video',
    `Result: ${embedMedia}`
  );

  // 6. Direct Download Link Generation
  assert(
    res1.downloadUrl === 'https://drive.google.com/uc?export=download&id=1A2b3C4d5E6f7G8h9J0k1L2m3N4o5P6qR',
    'Google Drive Direct Download Stream Link Generation',
    `Download Link: ${res1.downloadUrl}`
  );

  console.log('\n===================================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} / ${total} TESTS PASSED CLEANLY!`);
  console.log('===================================================================\n');

  if (passed === total) process.exit(0);
  else process.exit(1);
}

runGoogleDriveTestSuite();
