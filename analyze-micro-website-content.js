#!/usr/bin/env node

// Analyze micro_website_content specifically with references

const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
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
  }
}

loadEnvLocal();

const CONTENTSTACK_API_KEY = process.env.CONTENTSTACK_API_KEY;
const CONTENTSTACK_DELIVERY_TOKEN = process.env.CONTENTSTACK_DELIVERY_TOKEN;
const CONTENTSTACK_ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT || 'production';
const CONTENTSTACK_REGION = process.env.CONTENTSTACK_REGION || 'us';

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

console.log('===========================================');
console.log('MICRO WEBSITE CONTENT ANALYZER');
console.log('===========================================\n');

async function analyzeMicroWebsiteContent() {
  console.log('Testing micro_website_content with references...\n');
  
  try {
    // Test 1: Without including references
    console.log('TEST 1: Fetching WITHOUT include references');
    console.log('─'.repeat(60));
    
    const response1 = await fetch(
      `${BASE_URL}/v3/content_types/micro_website_content/entries`,
      {
        headers: {
          'api_key': CONTENTSTACK_API_KEY,
          'access_token': CONTENTSTACK_DELIVERY_TOKEN,
          'environment': CONTENTSTACK_ENVIRONMENT,
        },
      }
    );

    const data1 = await response1.json();
    
    if (data1.entries && data1.entries.length > 0) {
      console.log('✅ Found entry');
      console.log('\nEntry structure:');
      console.log(JSON.stringify(data1.entries[0], null, 2));
      
      console.log('\n\nImages field type:', typeof data1.entries[0].images);
      console.log('Images field value:', data1.entries[0].images);
    } else {
      console.log('❌ No entries found');
      if (data1.error_code) {
        console.log('Error:', data1.error_message);
      }
      return;
    }
    
    // Test 2: With including references
    console.log('\n\n' + '='.repeat(60));
    console.log('TEST 2: Fetching WITH include references');
    console.log('─'.repeat(60));
    
    const response2 = await fetch(
      `${BASE_URL}/v3/content_types/micro_website_content/entries?include[]=images`,
      {
        headers: {
          'api_key': CONTENTSTACK_API_KEY,
          'access_token': CONTENTSTACK_DELIVERY_TOKEN,
          'environment': CONTENTSTACK_ENVIRONMENT,
        },
      }
    );

    const data2 = await response2.json();
    
    if (data2.entries && data2.entries.length > 0) {
      console.log('✅ Found entry with references');
      console.log('\nEntry structure:');
      console.log(JSON.stringify(data2.entries[0], null, 2));
      
      console.log('\n\nImages field after include:');
      console.log('Type:', typeof data2.entries[0].images);
      console.log('Is Array:', Array.isArray(data2.entries[0].images));
      console.log('Length:', data2.entries[0].images?.length);
      
      if (Array.isArray(data2.entries[0].images) && data2.entries[0].images.length > 0) {
        console.log('\n📦 First product structure:');
        console.log(JSON.stringify(data2.entries[0].images[0], null, 2));
        
        console.log('\n🖼️  Image data location:');
        const firstProduct = data2.entries[0].images[0];
        console.log('Has custom field:', !!firstProduct.custom);
        console.log('custom is array:', Array.isArray(firstProduct.custom));
        if (firstProduct.custom && Array.isArray(firstProduct.custom)) {
          console.log('custom array length:', firstProduct.custom.length);
          console.log('\n📸 First image in custom array:');
          console.log('  previewUrl:', firstProduct.custom[0].previewUrl?.substring(0, 50) + '...');
          console.log('  downloadUrl:', firstProduct.custom[0].downloadUrl?.substring(0, 50) + '...');
          console.log('  dynamicPreviewUrl:', firstProduct.custom[0].dynamicPreviewUrl?.substring(0, 50) + '...');
        }
      }
    } else {
      console.log('❌ No entries found with references');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function main() {
  if (!CONTENTSTACK_API_KEY || !CONTENTSTACK_DELIVERY_TOKEN) {
    console.log('❌ Missing environment variables!');
    return;
  }
  
  console.log('API Key:', CONTENTSTACK_API_KEY.substring(0, 10) + '...');
  console.log('Region:', CONTENTSTACK_REGION);
  console.log('Environment:', CONTENTSTACK_ENVIRONMENT);
  console.log();
  
  await analyzeMicroWebsiteContent();
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log('\nBased on the output above, we can see:');
  console.log('1. How the images reference field is structured');
  console.log('2. Whether includeReference is working correctly');
  console.log('3. Where the custom/image data actually is');
  console.log('\nShare this output and I\'ll fix the API code!');
  console.log('='.repeat(60) + '\n');
}

main();