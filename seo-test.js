#!/usr/bin/env node

const https = require('https');

function fetchHTML() {
  return new Promise((resolve, reject) => {
    https.get('https://chemie-lernen.org/pse-in-vr/', { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractTag(html, tag, attr) {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

function extractContent(html, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractJsonLD(html) {
  const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i;
  const match = html.match(regex);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function testSEO() {
  console.log('🔍 SEO & Meta Tag Analysis');
  console.log('='.repeat(60));
  console.log('');

  const html = await fetchHTML();

  // Basic Meta Tags
  console.log('📋 Basic Meta Tags');
  console.log('-'.repeat(60));

  const title = extractContent(html, 'title');
  const description = extractTag(html, 'meta', 'name="description"');
  const keywords = extractTag(html, 'meta', 'name="keywords"');
  const author = extractTag(html, 'meta', 'name="author"');
  const viewport = extractTag(html, 'meta', 'name="viewport"');
  const charset = extractTag(html, 'meta', 'charset');

  console.log(`Title: ${title ? '✅' : '❌'}`);
  if (title) console.log(`  ${title}`);
  console.log(``);
  console.log(`Description: ${description ? '✅' : '❌'}`);
  if (description) console.log(`  ${description.substring(0, 100)}...`);
  console.log(``);
  console.log(`Keywords: ${keywords ? '✅' : '❌'}`);
  if (keywords) console.log(`  ${keywords.split(',').slice(0, 5).join(', ')}...`);
  console.log(``);
  console.log(`Author: ${author ? '✅' : '❌'}`);
  console.log(`Viewport: ${viewport ? '✅' : '❌'}`);
  console.log(`Charset: ${charset ? '✅' : '❌'}`);
  console.log(``);

  // Open Graph Tags
  console.log('📱 Open Graph Tags');
  console.log('-'.repeat(60));

  const ogTitle = extractTag(html, 'meta', 'property="og:title"');
  const ogDescription = extractTag(html, 'meta', 'property="og:description"');
  const ogImage = extractTag(html, 'meta', 'property="og:image"');
  const ogType = extractTag(html, 'meta', 'property="og:type"');
  const ogUrl = extractTag(html, 'meta', 'property="og:url"');

  console.log(`OG Title: ${ogTitle ? '✅' : '❌'}`);
  console.log(`OG Description: ${ogDescription ? '✅' : '❌'}`);
  console.log(`OG Image: ${ogImage ? '✅' : '❌'}`);
  if (ogImage) console.log(`  ${ogImage}`);
  console.log(`OG Type: ${ogType ? '✅' : '❌'} ${ogType || ''}`);
  console.log(`OG URL: ${ogUrl ? '✅' : '❌'}`);
  console.log(``);

  // Twitter Card Tags
  console.log('🐦 Twitter Card Tags');
  console.log('-'.repeat(60));

  const twitterCard = extractTag(html, 'meta', 'name="twitter:card"');
  const twitterTitle = extractTag(html, 'meta', 'name="twitter:title"');
  const twitterImage = extractTag(html, 'meta', 'name="twitter:image"');

  console.log(`Twitter Card: ${twitterCard ? '✅' : '❌'} ${twitterCard || ''}`);
  console.log(`Twitter Title: ${twitterTitle ? '✅' : '❌'}`);
  console.log(`Twitter Image: ${twitterImage ? '✅' : '❌'}`);
  console.log(``);

  // Schema.org Structured Data
  console.log('🏗️  Schema.org Structured Data');
  console.log('-'.repeat(60));

  const jsonLD = extractJsonLD(html);
  if (jsonLD) {
    console.log(`✅ JSON-LD Present`);
    console.log(`  Type: ${jsonLD['@type']}`);
    console.log(`  Name: ${jsonLD.name}`);
    console.log(`  Application Category: ${jsonLD.applicationCategory}`);
    console.log(`  Features: ${jsonLD.featureList}`);
  } else {
    console.log(`❌ No JSON-LD found`);
  }
  console.log(``);

  // Performance & Security Headers
  console.log('🔒 Security & Performance');
  console.log('-'.repeat(60));

  const csp = extractTag(html, 'meta', 'http-equiv="Content-Security-Policy"');
  const referrer = extractTag(html, 'meta', 'name="referrer"');
  const themeColor = extractTag(html, 'meta', 'name="theme-color"');

  console.log(`CSP: ${csp ? '✅' : '❌'}`);
  console.log(`Referrer Policy: ${referrer ? '✅' : '❌'} ${referrer || ''}`);
  console.log(`Theme Color: ${themeColor ? '✅' : '❌'} ${themeColor || ''}`);
  console.log(``);

  // Performance Features
  console.log('⚡ Performance Features');
  console.log('-'.repeat(60));

  const preconnect = html.includes('rel="preconnect"');
  const dnsPrefetch = html.includes('rel="dns-prefetch"');
  const performanceObserver = html.includes('PerformanceObserver');
  const serviceWorker = html.includes('serviceWorker');

  console.log(`Preconnect: ${preconnect ? '✅' : '❌'}`);
  console.log(`DNS Prefetch: ${dnsPrefetch ? '✅' : '❌'}`);
  console.log(`Performance Observer: ${performanceObserver ? '✅' : '❌'}`);
  console.log(`Service Worker: ${serviceWorker ? '✅' : '❌'}`);
  console.log(``);

  // Summary Score
  console.log('='.repeat(60));
  console.log('📊 SEO Score');
  console.log('='.repeat(60));

  const checks = [
    title, description, keywords, author, viewport, charset,
    ogTitle, ogDescription, ogImage, ogType, ogUrl,
    twitterCard, twitterTitle, twitterImage,
    jsonLD, csp, referrer, themeColor,
    preconnect, dnsPrefetch, performanceObserver, serviceWorker
  ];

  const score = Math.round((checks.filter(c => c).length / checks.length) * 100);

  console.log(`Overall Score: ${score}/100`);
  console.log('');

  if (score >= 90) {
    console.log('🌟 Excellent! Your page is well optimized for SEO and performance.');
  } else if (score >= 70) {
    console.log('👍 Good! Most SEO and performance best practices are implemented.');
  } else if (score >= 50) {
    console.log('⚠️  Fair. Consider adding more meta tags and optimizations.');
  } else {
    console.log('❌ Poor. Significant SEO and performance improvements needed.');
  }

  console.log('');
  console.log('✅ Testing complete!');
}

testSEO().catch(console.error);
