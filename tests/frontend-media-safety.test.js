/**
 * tests/frontend-media-safety.test.js
 * 
 * Verifies that client-side media resolution strictly enforces safe media sources,
 * eliminates unauthenticated third-party content exposure (pollinations.ai, hedgex),
 * and neutralizes dangerous URI schemes (javascript:, data:text/html, etc.).
 */

import assert from 'assert';
import { resolveSafeMediaUrl, isSafeMediaUrl, isValidDownloadUrl, getDynamicBrandPlaceholder } from '../client/src/utils/safeMediaResolver.js';

console.log('================================================================');
console.log('🧪 RUNNING FRONTEND MEDIA SAFETY TEST SUITE');
console.log('================================================================\n');

const mockWorkspace = {
  _id: '6ae1f5d0880ed8a2eb96e282',
  name: 'Toran Invites',
  brandColor: '#D97706',
};

// 1. Prohibited External Media Providers
console.log('Test 1: Prohibited third-party AI image generation providers (pollinations.ai)...');
const pollinationsUrl1 = 'https://image.pollinations.ai/prompt/luxury%20wedding%20invitation%20gold%20foil';
const pollinationsUrl2 = 'https://pollinations.ai/p/test.jpg';
assert.strictEqual(isSafeMediaUrl(pollinationsUrl1), false, 'pollinations.ai must be deemed unsafe');
assert.strictEqual(isSafeMediaUrl(pollinationsUrl2), false, 'pollinations.ai root must be deemed unsafe');

const resolvedPollinations = resolveSafeMediaUrl(pollinationsUrl1, mockWorkspace);
assert.ok(resolvedPollinations.startsWith('data:image/svg+xml;utf8,'), 'Must return SVG placeholder instead of pollinations URL');
assert.ok(resolvedPollinations.includes('Toran%20Invites') || resolvedPollinations.includes('Toran Invites'), 'SVG placeholder must include workspace brand name');
console.log('  ✅ Passed');

// 2. Prohibited Legacy Stock / Placeholder Filenames
console.log('Test 2: Prohibited legacy placeholder and stock filenames...');
const prohibitedFilenames = [
  'https://example.com/vyuhox_banner.jpg',
  '/uploads/vyuhox_reel.jpg',
  'https://storage.example.com/hedgex_post.png',
  '/my_custom_post_1792729769118.jpg',
];
for (const fn of prohibitedFilenames) {
  assert.strictEqual(isSafeMediaUrl(fn), false, `Filename containing ${fn} must be deemed unsafe`);
  const resolved = resolveSafeMediaUrl(fn, mockWorkspace);
  assert.ok(resolved.startsWith('data:image/svg+xml;utf8,'), 'Must return SVG placeholder');
}
console.log('  ✅ Passed');

// 3. Dangerous URI Schemes & XSS Vectors
console.log('Test 3: Dangerous URI schemes (javascript:, vbscript:, malicious data URIs)...');
const maliciousSchemes = [
  'javascript:alert(document.cookie)',
  'JAVASCRIPT:/*--></title></style></textarea></script><svg/onload=alert(1)>',
  'vbscript:MsgBox("PWNED")',
  'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
  'file:///etc/passwd',
];
for (const uri of maliciousSchemes) {
  assert.strictEqual(isSafeMediaUrl(uri), false, `Dangerous scheme ${uri} must be rejected`);
  const resolved = resolveSafeMediaUrl(uri, mockWorkspace);
  assert.ok(resolved.startsWith('data:image/svg+xml;utf8,'), 'Must return SVG placeholder');
  assert.ok(!resolved.includes('javascript'), 'Resolved placeholder must not retain malicious script');
}
console.log('  ✅ Passed');

// 4. Legitimate Published Assets
console.log('Test 4: Legitimate published assets (/published/:wsId/:filename)...');
const validPublishedUrl = '/published/6ae1f5d0880ed8a2eb96e282/wedding_card_final.jpg';
assert.strictEqual(isSafeMediaUrl(validPublishedUrl), true, 'Published workspace asset must be safe');
assert.strictEqual(resolveSafeMediaUrl(validPublishedUrl, mockWorkspace), validPublishedUrl, 'Must return legitimate published URL unchanged');
console.log('  ✅ Passed');

// 5. Legitimate Authenticated API Assets
console.log('Test 5: Legitimate authenticated API asset endpoints...');
const validAssetApiUrl = '/api/assets/6ae1f5d0880ed8a2eb96e282';
const validSignedViewUrl = '/api/assets/view/eyJhbGciOiJIUzI1NiJ9.test-sig';
assert.strictEqual(isSafeMediaUrl(validAssetApiUrl), true, 'API asset route must be safe');
assert.strictEqual(isSafeMediaUrl(validSignedViewUrl), true, 'Signed view route must be safe');
assert.strictEqual(resolveSafeMediaUrl(validAssetApiUrl, mockWorkspace), validAssetApiUrl);
assert.strictEqual(resolveSafeMediaUrl(validSignedViewUrl, mockWorkspace), validSignedViewUrl);
console.log('  ✅ Passed');

// 6. Dynamic SVG Brand Placeholder
console.log('Test 6: Dynamic SVG Brand Placeholder generation...');
const placeholder = getDynamicBrandPlaceholder(mockWorkspace, true);
assert.ok(placeholder.startsWith('data:image/svg+xml;utf8,'), 'Must return valid SVG data URI');
assert.ok(placeholder.includes('Toran%20Invites') || placeholder.includes('Toran Invites'), 'Must contain brand name');
assert.ok(placeholder.includes('720') && placeholder.includes('1280'), 'Reel placeholder must specify 720x1280 vertical dimensions');
console.log('  ✅ Passed');

// 7. Null, Undefined, and Empty Input Handling
console.log('Test 7: Null, undefined, and empty string handling...');
assert.strictEqual(isSafeMediaUrl(null), false);
assert.strictEqual(isSafeMediaUrl(undefined), false);
assert.strictEqual(isSafeMediaUrl(''), false);
assert.ok(resolveSafeMediaUrl(null, mockWorkspace).startsWith('data:image/svg+xml;utf8,'));
assert.ok(resolveSafeMediaUrl(undefined, mockWorkspace).startsWith('data:image/svg+xml;utf8,'));
assert.ok(resolveSafeMediaUrl('', mockWorkspace).startsWith('data:image/svg+xml;utf8,'));
console.log('  ✅ Passed');

// 8. Independent Download Link Validation
console.log('Test 8: Independent download link validation via isValidDownloadUrl...');
assert.strictEqual(isValidDownloadUrl('https://image.pollinations.ai/prompt/untrusted'), false, 'Pollinations download link must be rejected');
assert.strictEqual(isValidDownloadUrl('javascript:alert(1)'), false, 'JavaScript protocol download must be rejected');
assert.strictEqual(isValidDownloadUrl('data:text/html;base64,PHNjcmlwdD4='), false, 'Data text/html download must be rejected');
assert.strictEqual(isValidDownloadUrl('https://images.unsplash.com/photo-1540555700478-4be289fbecef'), true, 'Legitimate Unsplash CDN download link must be accepted');
assert.strictEqual(isValidDownloadUrl('/published/6ae1f5d0880ed8a2eb96e282/deck_cover.png'), true, 'Legitimate published asset download link must be accepted');
assert.strictEqual(isValidDownloadUrl(null), false, 'Null download link must be rejected');
assert.strictEqual(isValidDownloadUrl(''), false, 'Empty download link must be rejected');
console.log('  ✅ Passed');

// 9. VisualCreativeStudio Strategy Cover Image Resolution & Placeholders
console.log('Test 9: VisualCreativeStudio coverImage resolution and dynamic fallback...');
const unsafeCover = 'https://image.pollinations.ai/prompt/executive%20deck';
const resolvedUnsafeCover = resolveSafeMediaUrl(unsafeCover, mockWorkspace);
assert.ok(resolvedUnsafeCover.startsWith('data:image/svg+xml;utf8,'), 'Unsafe coverImage must be replaced with brand placeholder SVG');
assert.ok(resolvedUnsafeCover.includes('Toran%20Invites') || resolvedUnsafeCover.includes('Toran Invites'));

const safeCover = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab';
const resolvedSafeCover = resolveSafeMediaUrl(safeCover, mockWorkspace);
assert.strictEqual(resolvedSafeCover, safeCover, 'Safe Unsplash coverImage must be preserved');
console.log('  ✅ Passed');

// 10. VisualCreativeStudio Generated Image & Legitimate Image Provider Compatibility
console.log('Test 10: Legitimate AI visual provider image acceptance (DALL-E, Unsplash, relative assets)...');
const legitimateUrls = [
  'https://oaidalleapiprodscus.blob.core.windows.net/private/org-123/user-456/img-789.png?sig=abc',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df',
  '/published/6ae1f5d0880ed8a2eb96e282/creative_render.jpg',
  '/api/assets/view/valid-token-example',
];
for (const url of legitimateUrls) {
  assert.strictEqual(isSafeMediaUrl(url), true, `Legitimate provider URL must be accepted: ${url}`);
  assert.strictEqual(resolveSafeMediaUrl(url, mockWorkspace), url, 'Legitimate URL must remain unchanged');
  assert.strictEqual(isValidDownloadUrl(url), true, 'Legitimate download URL must be valid');
}
console.log('  ✅ Passed');

console.log('\n================================================================');
console.log('🎉 ALL FRONTEND MEDIA SAFETY TESTS PASSED (10 / 10)');
console.log('================================================================');
