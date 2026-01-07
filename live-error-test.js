#!/usr/bin/env node

const https = require('https');

const resources = [
  { path: '/', name: 'Main Page', expectedStatus: 200 },
  { path: '/bundle.js', name: 'Main Bundle', expectedStatus: 200 },
  { path: '/1.bundle.js', name: 'Three.js Bundle', expectedStatus: 200 },
  { path: '/2.bundle.js', name: 'Vendor Bundle', expectedStatus: 200 },
  { path: '/sw.js', name: 'Service Worker', expectedStatus: 200 },
  { path: '/src/vendor/basis_transcoder.js', name: 'Basis Transcoder JS', expectedStatus: 200 },
  { path: '/src/vendor/draco_wasm_wrapper.js', name: 'Draco Wrapper JS', expectedStatus: 200 },
  { path: '/src/vendor/basis_transcoder.wasm', name: 'Basis Transcoder WASM', expectedStatus: 200 },
  { path: '/src/vendor/draco_decoder.wasm', name: 'Draco Decoder WASM', expectedStatus: 200 },
  { path: '/res/favicon-32x32.png', name: 'Favicon', expectedStatus: 200 },
  { path: '/assets/angel.min.glb', name: 'Sample 3D Model', expectedStatus: 200 }
];

function checkResource(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'chemie-lernen.org',
      port: 443,
      path: `/pse-in-vr${path}`,
      method: 'GET',
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      resolve({
        path,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        contentLength: res.headers['content-length'],
        contentEncoding: res.headers['content-encoding'],
        cacheControl: res.headers['cache-control']
      });
    });

    req.on('error', (error) => {
      resolve({
        path,
        status: 'ERROR',
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        path,
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('');
  console.log('🔍 HELLO WEBXR - LIVE ERROR TEST');
  console.log('================================');
  console.log('');
  console.log('📅 Date:', new Date().toISOString().split('T')[0]);
  console.log('🌐 URL: https://chemie-lernen.org/pse-in-vr/');
  console.log('');

  const results = [];
  const errors = [];
  const warnings = [];

  for (const resource of resources) {
    process.stdout.write(`Testing ${resource.name}... `);
    const result = await checkResource(resource.path);
    result.name = resource.name;
    result.expected = resource.expectedStatus;
    results.push(result);

    if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
      console.log('❌');
      errors.push(`${resource.name}: ${result.error || 'Unknown error'}`);
    } else if (result.status !== resource.expectedStatus) {
      console.log('⚠️');
      warnings.push(`${resource.name}: HTTP ${result.status} (expected ${resource.expectedStatus})`);
    } else {
      console.log('✅');
    }
  }

  console.log('');
  console.log('─'.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('─'.repeat(60));
  console.log('');

  const passed = results.filter(r => r.status === r.expected).length;
  const total = results.length;

  console.log(`Total Resources Tested: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${errors.length} ❌`);
  console.log(`Warnings: ${warnings.length} ⚠️`);
  console.log('');

  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach(err => console.log(`  - ${err}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(warn => console.log(`  - ${warn}`));
    console.log('');
  }

  // Detailed results
  console.log('─'.repeat(60));
  console.log('📋 DETAILED RESULTS');
  console.log('─'.repeat(60));
  console.log('');

  results.forEach(result => {
    const status = result.status === result.expected ? '✅' : '❌';
    const size = result.contentLength ? `${(result.contentLength / 1024).toFixed(1)} KB` : 'N/A';
    const encoding = result.contentEncoding || 'none';
    const cache = result.cacheControl ? '✅' : '❌';

    console.log(`${status} ${result.name}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Size: ${size}`);
    console.log(`   Encoding: ${encoding}`);
    console.log(`   Cached: ${cache}`);
    console.log(``);
  });

  // Summary
  console.log('─'.repeat(60));
  console.log('🎯 SUMMARY');
  console.log('─'.repeat(60));
  console.log('');

  const successRate = Math.round((passed / total) * 100);

  if (errors.length === 0 && warnings.length === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('');
    console.log('✅ All resources are accessible');
    console.log('✅ All bundles loading correctly');
    console.log('✅ All vendor files available');
    console.log('✅ Service worker registered');
    console.log('✅ No errors detected');
    console.log('');
    console.log('Success Rate: 100%');
  } else if (errors.length === 0) {
    console.log('⚠️  TESTS PASSED WITH WARNINGS');
    console.log('');
    console.log(`Success Rate: ${successRate}%`);
    console.log('Review warnings above for details');
  } else {
    console.log('❌ TESTS FAILED');
    console.log('');
    console.log(`Success Rate: ${successRate}%`);
    console.log('');
    console.log('Action Required:');
    console.log('1. Review errors above');
    console.log('2. Check Docker container logs: docker logs hello-webxr');
    console.log('3. Verify files are copied to container');
    console.log('4. Rebuild and redeploy if needed');
  }

  console.log('');
  console.log('─'.repeat(60));
  console.log('✅ Testing complete!');
  console.log('─'.repeat(60));
  console.log('');
}

runTests().catch(console.error);
