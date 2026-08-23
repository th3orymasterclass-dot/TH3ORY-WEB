const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 RUNNING COMPREHENSIVE UI STATES & FEEDBACK SUITE...\n');

const uiStateComponentsPath = path.join(__dirname, '../src/components/UIStateComponents.jsx');
const uiStatusContextPath = path.join(__dirname, '../src/context/UIStatusContext.jsx');

assert(fs.existsSync(uiStateComponentsPath), 'UIStateComponents.jsx file must exist');
assert(fs.existsSync(uiStatusContextPath), 'UIStatusContext.jsx file must exist');

const uiStateCode = fs.readFileSync(uiStateComponentsPath, 'utf8');
const uiContextCode = fs.readFileSync(uiStatusContextPath, 'utf8');

// List of required UI components according to PDF specification
const requiredComponents = [
  'InitialPageLoader',
  'ContentSkeletonLoader',
  'ButtonLoadingState',
  'FormSubmissionLoader',
  'InfiniteScrollLoader',
  'ImageSkeleton',
  'FileUploadProgress',
  'FileDownloadProgress',
  'DataRefreshIndicator',
  'BackgroundProcessingLoader',
  'NoInternetBanner',
  'RequestTimeoutCard',
  'APIRequestFailedCard',
  'Unauthorized401Modal',
  'Forbidden403Card',
  'SessionExpiredNotice',
  'NotFound404Page',
  'ServerError500Card',
  'MaintenanceModeBanner',
  'ValidationErrorBox',
  'DuplicateEntryNotice',
  'SubmissionFailedAlert',
  'PaymentFailedCard',
  'FileUploadErrorCard',
  'NoSearchResultsCard',
  'EmptyStateCard',
  'SuccessStateAlert'
];

console.log('Checking required UI state components in UIStateComponents.jsx...');
requiredComponents.forEach(comp => {
  const hasExport = uiStateCode.includes(`export function ${comp}`);
  assert(hasExport, `Component ${comp} must be exported from UIStateComponents.jsx`);
  console.log(`  ✓ ${comp} exported successfully`);
});

console.log('\nChecking UIStatusContext methods and toast capabilities...');
const requiredContextMethods = [
  'showToast',
  'showSuccess',
  'showError',
  'showWarning',
  'showInfo',
  'copyToClipboard',
  'triggerSessionExpired',
  'isOffline'
];

requiredContextMethods.forEach(method => {
  assert(uiContextCode.includes(method), `Method/state ${method} must exist in UIStatusContext.jsx`);
  console.log(`  ✓ ${method} present in UIStatusContext`);
});

console.log('\n🎉 ALL 27 UI STATE COMPONENTS & STATUS CONTEXT METHODS PASSED VALIDATION (100% PASS RATE)!');
