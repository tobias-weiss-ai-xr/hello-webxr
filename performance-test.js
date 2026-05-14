#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://chemie-lernen.org/pse-in-vr';

const tests = [
  { name: 'Main Page', path: '/', expectedSize: 5000 },
  { name: 'Main Bundle', path: '/bundle.js', expectedSize: 95000 },
  { name: 'Three.js Bundle', path: '/1.bundle.js', expectedSize: 688000 },
  { name: 'Vendor Bundle', path: '/2.bundle.js', expectedSize: 237000 },
  { name: 'Service Worker', path: '/sw.js', expectedSize: 3500 },
  { name: 'Favicon', path: '/res/favicon-32x32.png', expectedSize: 2000 }
];

function fetchResource(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'chemie-lernen.org',
      port: 443,
      path: `/pse-in-vr${path}`,
      method: 'GET',
      rejectUnauthorized: false,
      headers: { 'Accept-Encoding': 'gzip, deflate, br' }
    };

    const req = https.request(options, (res) => {
      let data = [];
      let size = 0;

      res.on('data', (chunk) => {
        data.push(chunk);
        size += chunk.length;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          size: size,
          contentType: res.headers['content-type'],
          contentEncoding: res.headers['content-encoding'],
          cacheControl: res.headers['cache-control'],
          compressed: res.headers['content-encoding'] === 'gzip'
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 WebXR Performance Testing');
  console.log('=' .repeat(60));
  console.log('');

  const results = [];

  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    try {
      const start = Date.now();
      const result = await fetchResource(test.path);
      const duration = Date.now() - start;

      result.name = test.name;
      result.path = test.path;
      result.duration = duration;
      result.expectedSize = test.expectedSize;

      results.push(result);

      const sizeMatch = Math.abs(result.size - test.expectedSize) / test.expectedSize < 0.1;
      const status = result.status === 200 ? '✅' : '❌';
      const compression = result.compressed ? '🗜️' : '❌';
      const cache = result.cacheControl ? '💾' : '❌';

      console.log(`${status} ${compression} ${cache}`);
      console.log(`  Status: ${result.status}`);
      console.log(`  Size: ${(result.size / 1024).toFixed(1)} KB (expected ${(test.expectedSize / 1024).toFixed(1)} KB)`);
      console.log(`  Duration: ${duration}ms`);
      if (result.cacheControl) {
        console.log(`  Cache: ${result.cacheControl}`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('');
    }
  }

  // Summary
  console.log('=' .repeat(60));
  console.log('📊 Performance Summary');
  console.log('=' .repeat(60));
  console.log('');

  const totalSize = results.reduce((sum, r) => sum + r.size, 0);
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const compressedCount = results.filter(r => r.compressed).length;
  const cachedCount = results.filter(r => r.cacheControl).length;

  console.log(`Total Download Size: ${(totalSize / 1024).toFixed(1)} KB`);
  console.log(`Average Response Time: ${avgDuration.toFixed(0)}ms`);
  console.log(`Resources Compressed: ${compressedCount}/${results.length}`);
  console.log(`Resources Cached: ${cachedCount}/${results.length}`);
  console.log('');

  // Bundle analysis
  console.log('📦 Bundle Analysis');
  console.log('-'.repeat(60));
  const mainBundle = results.find(r => r.path === '/bundle.js');
  const threeBundle = results.find(r => r.path === '/1.bundle.js');
  const vendorBundle = results.find(r => r.path === '/2.bundle.js');

  if (mainBundle && threeBundle && vendorBundle) {
    const totalBundleSize = mainBundle.size + threeBundle.size + vendorBundle.size;
    const mainBundlePercent = (mainBundle.size / totalBundleSize * 100).toFixed(1);
    const threeBundlePercent = (threeBundle.size / totalBundleSize * 100).toFixed(1);
    const vendorBundlePercent = (vendorBundle.size / totalBundleSize * 100).toFixed(1);

    console.log(`Main Bundle:        ${(mainBundle.size / 1024).toFixed(1)} KB (${mainBundlePercent}%)`);
    console.log(`Three.js Bundle:    ${(threeBundle.size / 1024).toFixed(1)} KB (${threeBundlePercent}%)`);
    console.log(`Vendor Bundle:      ${(vendorBundle.size / 1024).toFixed(1)} KB (${vendorBundlePercent}%)`);
    console.log(`Total:              ${(totalBundleSize / 1024).toFixed(1)} KB`);
    console.log('');
    console.log(`🎯 Main bundle is ${mainBundlePercent}% of total - Great for updates!`);
  }

  console.log('');
  console.log('✅ Testing complete!');
}

runTests().catch(console.error);
