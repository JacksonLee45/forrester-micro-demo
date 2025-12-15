#!/usr/bin/env node

// Run this with: node debug-contentstack.js
// This will automatically load your .env.local file

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  No .env.local file found in current directory');
    console.log('Current directory:', process.cwd());
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
  
  console.log('✅ Loaded .env.local file\n');
}

loadEnvLocal();

const CONTENTSTACK_API_KEY = process.env.CONTENTSTACK_API_KEY;
const CONTENTSTACK_DELIVERY_TOKEN = process.env.CONTENTSTACK_DELIVERY_TOKEN;
const CONTENTSTACK_ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT || 'production';
const CONTENTSTACK_REGION = process.env.CONTENTSTACK_REGION || 'us';

console.log('===========================================');
console.log('CONTENTSTACK DEBUGGING TOOL');
console.log('===========================================\n');

console.log('1. CHECKING ENVIRONMENT VARIABLES');
console.log('-------------------------------------------');
console.log('CONTENTSTACK_API_KEY:', CONTENTSTACK_API_KEY ? `${CONTENTSTACK_API_KEY.substring(0, 10)}...` : '❌ NOT SET');
console.log('CONTENTSTACK_DELIVERY_TOKEN:', CONTENTSTACK_DELIVERY_TOKEN ? `${CONTENTSTACK_DELIVERY_TOKEN.substring(0, 10)}...` : '❌ NOT SET');
console.log('CONTENTSTACK_ENVIRONMENT:', CONTENTSTACK_ENVIRONMENT);
console.log('CONTENTSTACK_REGION:', CONTENTSTACK_REGION);

if (!CONTENTSTACK_API_KEY || !CONTENTSTACK_DELIVERY_TOKEN) {
  console.log('\n❌ ERROR: Missing environment variables!');
  console.log('Please set them in your .env.local file or export them:');
  console.log('  export CONTENTSTACK_API_KEY="your_api_key"');
  console.log('  export CONTENTSTACK_DELIVERY_TOKEN="your_delivery_token"');
  process.exit(1);
}

// Determine base URL based on region
function getBaseUrl(region) {
  const regionMap = {
    'us': 'https://cdn.contentstack.io',
    'eu': 'https://eu-cdn.contentstack.com',
    'azure-na': 'https://azure-na-cdn.contentstack.com',
    'azure-eu': 'https://azure-eu-cdn.contentstack.com',
  };
  return regionMap[region] || regionMap['us'];
}

const BASE_URL = getBaseUrl(CONTENTSTACK_REGION);

async function testConnection() {
  console.log('\n2. TESTING CONNECTION TO CONTENTSTACK');
  console.log('-------------------------------------------');
  console.log('Base URL:', BASE_URL);
  
  try {
    const response = await fetch(
      `${BASE_URL}/v3/content_types`,
      {
        headers: {
          'api_key': CONTENTSTACK_API_KEY,
          'access_token': CONTENTSTACK_DELIVERY_TOKEN,
          'environment': CONTENTSTACK_ENVIRONMENT,
        },
      }
    );

    if (response.ok) {
      console.log('✅ Connection successful!');
      const data = await response.json();
      console.log(`Found ${data.content_types?.length || 0} content types`);
      return data;
    } else {
      console.log('❌ Connection failed:', response.status, response.statusText);
      const error = await response.text();
      console.log('Error:', error);
      return null;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return null;
  }
}

async function checkContentTypes(data) {
  console.log('\n3. CHECKING AVAILABLE CONTENT TYPES');
  console.log('-------------------------------------------');
  
  if (!data || !data.content_types) {
    console.log('❌ No content types data available');
    return { hasMicroWebsiteContent: false, hasProduct: false, hasVideo: false };
  }

  const contentTypes = data.content_types.map(ct => ct.uid);
  
  console.log('Available content types:');
  contentTypes.forEach(type => console.log(`  - ${type}`));
  
  const hasMicroWebsiteContent = contentTypes.includes('micro_website_content');
  const hasProduct = contentTypes.includes('product');
  const hasVideo = contentTypes.includes('video');
  
  console.log('\n📋 Required content type check:');
  console.log(`  micro_website_content: ${hasMicroWebsiteContent ? '✅' : '❌'}`);
  console.log(`  product: ${hasProduct ? '✅' : '❌'}`);
  console.log(`  video: ${hasVideo ? '✅ (optional)' : '⚠️  (optional)'}`);
  
  return { hasMicroWebsiteContent, hasProduct, hasVideo, contentTypes };
}

async function testWebsiteContentQuery() {
  console.log('\n4. TESTING micro_website_content QUERY');
  console.log('-------------------------------------------');
  
  try {
    const response = await fetch(
      `${BASE_URL}/v3/content_types/micro_website_content/entries?include[]=images`,
      {
        headers: {
          'api_key': CONTENTSTACK_API_KEY,
          'access_token': CONTENTSTACK_DELIVERY_TOKEN,
          'environment': CONTENTSTACK_ENVIRONMENT,
        },
      }
    );

    const data = await response.json();
    
    if (data.error_code) {
      console.log('❌ Query error:', data.error_message);
      return false;
    }
    
    if (data.entries && data.entries.length > 0) {
      console.log(`✅ Found ${data.entries.length} micro_website_content entries`);
      
      console.log('\nFirst entry:');
      const entry = data.entries[0];
      console.log('  Heading:', entry.heading);
      console.log('  Sub Heading:', entry.sub_heading);
      console.log('  Description:', entry.heading_description);
      console.log('  Number of products:', entry.images?.length || 0);
      
      if (entry.images && entry.images.length > 0) {
        console.log('\n  Products:');
        entry.images.forEach((product, i) => {
          console.log(`    ${i + 1}. ${product.title || 'Untitled'}`);
          console.log(`       Has image: ${product.image ? 'Yes' : 'No'}`);
        });
      }
      
      return true;
    } else {
      console.log('⚠️  WARNING: No entries found!');
      console.log('You need to create a micro_website_content entry in Contentstack.');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function checkAllEntries() {
  console.log('\n5. CHECKING ALL ENTRIES IN STACK');
  console.log('-------------------------------------------');
  
  try {
    const response = await fetch(
      `${BASE_URL}/v3/content_types/product/entries`,
      {
        headers: {
          'api_key': CONTENTSTACK_API_KEY,
          'access_token': CONTENTSTACK_DELIVERY_TOKEN,
          'environment': CONTENTSTACK_ENVIRONMENT,
        },
      }
    );

    const data = await response.json();
    
    if (data.entries) {
      console.log(`Product entries: ${data.entries.length}`);
      
      if (data.entries.length > 0) {
        console.log('\nProduct details:');
        data.entries.forEach((entry, i) => {
          console.log(`  ${i + 1}. ${entry.title}`);
          console.log(`     Published: ${entry._version ? 'Yes' : 'No'}`);
          console.log(`     Has image: ${entry.image ? 'Yes' : 'No'}`);
        });
      }
      
      return true;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function provideSolution(contentTypeInfo) {
  console.log('\n===========================================');
  console.log('SOLUTION STEPS');
  console.log('===========================================\n');
  
  if (!contentTypeInfo.hasMicroWebsiteContent) {
    console.log('❌ The micro_website_content content type does not exist.\n');
    console.log('📝 Create it with these fields:');
    console.log('  1. heading (Single Line Textbox)');
    console.log('  2. sub_heading (Single Line Textbox)');
    console.log('  3. heading_description (Multi Line Textbox)');
    console.log('  4. images (Reference, Multiple - link to product entries)\n');
  }
  
  if (!contentTypeInfo.hasProduct) {
    console.log('❌ The product content type does not exist.\n');
    console.log('📝 Create it with these fields:');
    console.log('  1. title (Single Line Textbox)');
    console.log('  2. description (Multi Line Textbox)');
    console.log('  3. image (JSON Object)\n');
  }
  
  if (contentTypeInfo.hasMicroWebsiteContent && contentTypeInfo.hasProduct) {
    console.log('✅ Content types exist! Check if you have:');
    console.log('  1. Created at least one micro_website_content entry');
    console.log('  2. Created at least one product entry');
    console.log('  3. Published all entries (not just saved)');
    console.log('  4. Linked products to the micro_website_content entry');
    console.log('  5. Added Frontify JSON to product image fields\n');
  }
  
  console.log('📚 Full setup guide: See CONTENTSTACK_SETUP.md');
  console.log('⚡ Quick reference: See CONTENTSTACK_QUICK_REFERENCE.md');
}

async function main() {
  const connectionData = await testConnection();
  if (!connectionData) {
    console.log('\n❌ Cannot proceed without a working connection.');
    console.log('Check your API credentials and region setting.');
    process.exit(1);
  }
  
  const contentTypeInfo = await checkContentTypes(connectionData);
  await checkAllEntries();
  await testWebsiteContentQuery();
  await provideSolution(contentTypeInfo);
  
  console.log('\n===========================================');
  console.log('Debug complete! Share this output if you need help.');
  console.log('===========================================\n');
}

main();