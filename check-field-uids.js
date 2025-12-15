#!/usr/bin/env node

// Check the content model to see field UIDs

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
console.log('CONTENT MODEL FIELD CHECKER');
console.log('===========================================\n');

async function checkContentModel() {
  try {
    const response = await fetch(
      `${BASE_URL}/v3/content_types/micro_website_content`,
      {
        headers: {
          'api_key': CONTENTSTACK_API_KEY,
          'access_token': CONTENTSTACK_DELIVERY_TOKEN,
        },
      }
    );

    const data = await response.json();
    
    if (data.error_code) {
      console.log('❌ Error:', data.error_message);
      return;
    }
    
    const contentType = data.content_type;
    
    console.log('Content Type: micro_website_content');
    console.log('Title:', contentType.title);
    console.log('\nFIELDS:');
    console.log('─'.repeat(60));
    
    contentType.schema.forEach(field => {
      console.log(`\n${field.display_name}`);
      console.log(`  UID: ${field.uid}`);
      console.log(`  Type: ${field.data_type}`);
      if (field.mandatory) console.log(`  Mandatory: Yes`);
      if (field.multiple) console.log(`  Multiple: Yes`);
      if (field.reference_to) console.log(`  References: ${field.reference_to.join(', ')}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('ACTION NEEDED:');
    console.log('='.repeat(60));
    
    const referenceFields = contentType.schema.filter(f => f.data_type === 'reference');
    
    if (referenceFields.length === 0) {
      console.log('\n❌ No reference fields found!');
      console.log('\nYou need to add a Reference field:');
      console.log('  1. Go to Content Models → micro_website_content');
      console.log('  2. Click "Edit"');
      console.log('  3. Add field → Reference');
      console.log('  4. Display Name: Images');
      console.log('  5. UID: images');
      console.log('  6. Reference To: product');
      console.log('  7. Multiple: Yes');
      console.log('  8. Save');
    } else {
      console.log('\n✅ Reference field(s) found:');
      referenceFields.forEach(field => {
        console.log(`\n  Field: ${field.display_name}`);
        console.log(`  UID: ${field.uid}`);
        console.log(`  References: ${field.reference_to.join(', ')}`);
        console.log(`  Multiple: ${field.multiple ? 'Yes' : 'No'}`);
      });
      
      const imagesField = referenceFields.find(f => f.uid === 'images');
      
      if (!imagesField) {
        console.log('\n⚠️  No field with UID "images" found!');
        console.log('\nThe code expects a field with UID "images".');
        console.log('Your reference field has a different UID.');
        console.log('\nOptions:');
        console.log('  A. Rename your reference field UID to "images"');
        console.log('  B. Update the code to use UID: ' + referenceFields[0].uid);
      } else {
        console.log('\n✅ "images" field exists!');
        console.log('\nNext: Make sure you have:');
        console.log('  1. Created product entries');
        console.log('  2. Edited your micro_website_content entry');
        console.log('  3. Added products to the images field');
        console.log('  4. Published everything');
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkContentModel();