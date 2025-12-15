#!/usr/bin/env node

// Enhanced debug script that shows actual data structure from Contentstack

const fs = require('fs');
const path = require('path');

// Load .env.local
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

console.log('===========================================');
console.log('CONTENTSTACK DATA STRUCTURE ANALYZER');
console.log('===========================================\n');

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

async function analyzeContentType(contentTypeUid, includeReferences = []) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`ANALYZING: ${contentTypeUid}`);
  console.log('='.repeat(60));
  
  try {
    let url = `${BASE_URL}/v3/content_types/${contentTypeUid}/entries`;
    
    // Add include references if specified
    if (includeReferences.length > 0) {
      const includeParams = includeReferences.map(ref => `include[]=${ref}`).join('&');
      url += `?${includeParams}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'api_key': CONTENTSTACK_API_KEY,
        'access_token': CONTENTSTACK_DELIVERY_TOKEN,
        'environment': CONTENTSTACK_ENVIRONMENT,
      },
    });

    const data = await response.json();
    
    if (data.error_code) {
      console.log(`❌ Error: ${data.error_message}`);
      return null;
    }
    
    if (!data.entries || data.entries.length === 0) {
      console.log('⚠️  No entries found');
      return null;
    }
    
    console.log(`✅ Found ${data.entries.length} entries\n`);
    
    // Show structure of first entry
    const firstEntry = data.entries[0];
    
    console.log('ENTRY STRUCTURE:');
    console.log('─'.repeat(60));
    console.log(JSON.stringify(firstEntry, null, 2));
    console.log('─'.repeat(60));
    
    // Show field summary
    console.log('\nFIELD SUMMARY:');
    console.log('─'.repeat(60));
    
    const fields = Object.keys(firstEntry).filter(key => !key.startsWith('_') && key !== 'ACL' && key !== 'locale' && key !== 'uid' && key !== 'created_at' && key !== 'updated_at' && key !== 'created_by' && key !== 'updated_by');
    
    fields.forEach(field => {
      const value = firstEntry[field];
      const type = Array.isArray(value) ? 'Array' : typeof value;
      const preview = Array.isArray(value) 
        ? `[${value.length} items]`
        : typeof value === 'object' && value !== null
        ? '{...}'
        : String(value).substring(0, 50);
      
      console.log(`  ${field}:`);
      console.log(`    Type: ${type}`);
      console.log(`    Value: ${preview}`);
      
      // If it's an array, show first item structure
      if (Array.isArray(value) && value.length > 0) {
        console.log(`    First item: ${JSON.stringify(value[0]).substring(0, 100)}...`);
      }
    });
    
    return data.entries;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function analyzeContentModel(contentTypeUid) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`CONTENT MODEL: ${contentTypeUid}`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(
      `${BASE_URL}/v3/content_types/${contentTypeUid}`,
      {
        headers: {
          'api_key': CONTENTSTACK_API_KEY,
          'access_token': CONTENTSTACK_DELIVERY_TOKEN,
        },
      }
    );

    const data = await response.json();
    
    if (data.error_code) {
      console.log(`❌ Error: ${data.error_message}`);
      return;
    }
    
    const contentType = data.content_type;
    
    console.log('\nFIELD DEFINITIONS:');
    console.log('─'.repeat(60));
    
    contentType.schema.forEach(field => {
      console.log(`\n  ${field.display_name}`);
      console.log(`    UID: ${field.uid}`);
      console.log(`    Type: ${field.data_type}`);
      if (field.mandatory) console.log(`    Mandatory: Yes`);
      if (field.multiple) console.log(`    Multiple: Yes`);
      if (field.reference_to) console.log(`    References: ${field.reference_to.join(', ')}`);
    });
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function main() {
  if (!CONTENTSTACK_API_KEY || !CONTENTSTACK_DELIVERY_TOKEN) {
    console.log('❌ Missing environment variables!');
    return;
  }
  
  console.log('Region:', CONTENTSTACK_REGION);
  console.log('Environment:', CONTENTSTACK_ENVIRONMENT);
  console.log();
  
  // Analyze Product content type
  console.log('\n' + '═'.repeat(60));
  console.log('PART 1: PRODUCT CONTENT TYPE');
  console.log('═'.repeat(60));
  
  await analyzeContentModel('product');
  await analyzeContentType('product');
  
  // Analyze Video content type
  console.log('\n' + '═'.repeat(60));
  console.log('PART 2: FRONTIFY VIDEO CONTENT TYPE');
  console.log('═'.repeat(60));
  
  await analyzeContentModel('frontify_video_content');
  await analyzeContentType('frontify_video_content');
  
  // Check if there are any other content types that might be the website content
  console.log('\n' + '═'.repeat(60));
  console.log('PART 3: CHECKING OTHER CONTENT TYPES');
  console.log('═'.repeat(60));
  
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
    
    const data = await response.json();
    const contentTypes = data.content_types;
    
    console.log('\nAll available content types:');
    contentTypes.forEach(ct => {
      console.log(`  - ${ct.uid} (${ct.title})`);
    });
    
    console.log('\n\nWould you like to create a "micro_website_content" type?');
    console.log('Or do you have an existing content type for the main page?');
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  // Summary and recommendations
  console.log('\n' + '═'.repeat(60));
  console.log('RECOMMENDATIONS FOR CODE UPDATES');
  console.log('═'.repeat(60));
  
  console.log('\nBased on your Contentstack setup, you need to:');
  console.log('\n1. Update lib/contentstack-api.ts:');
  console.log('   - Change video content type from "video" to "frontify_video_content"');
  console.log('\n2. Either:');
  console.log('   a) Create a "micro_website_content" content type, OR');
  console.log('   b) Tell me which existing content type contains your page content');
  console.log('\n3. Check the data structure above to ensure field names match');
  
  console.log('\n' + '═'.repeat(60));
  console.log('Next: Copy the output above and I\'ll update the code!');
  console.log('═'.repeat(60) + '\n');
}

main();