// Run this with: node debug-contentful-complete.js
// Make sure to have your .env.local values set as environment variables

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

console.log('===========================================');
console.log('CONTENTFUL DEBUGGING TOOL');
console.log('===========================================\n');

console.log('1. CHECKING ENVIRONMENT VARIABLES');
console.log('-------------------------------------------');
console.log('CONTENTFUL_SPACE_ID:', CONTENTFUL_SPACE_ID ? `${CONTENTFUL_SPACE_ID.substring(0, 10)}...` : '❌ NOT SET');
console.log('CONTENTFUL_ACCESS_TOKEN:', CONTENTFUL_ACCESS_TOKEN ? `${CONTENTFUL_ACCESS_TOKEN.substring(0, 10)}...` : '❌ NOT SET');

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  console.log('\n❌ ERROR: Missing environment variables!');
  console.log('Please set them in your .env.local file or export them:');
  console.log('  export CONTENTFUL_SPACE_ID="your_space_id"');
  console.log('  export CONTENTFUL_ACCESS_TOKEN="your_access_token"');
  process.exit(1);
}

async function testConnection() {
  console.log('\n2. TESTING CONNECTION TO CONTENTFUL');
  console.log('-------------------------------------------');
  
  try {
    const response = await fetch(
      `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
        },
      }
    );

    if (response.ok) {
      console.log('✅ Connection successful!');
      const data = await response.json();
      console.log('Space name:', data.name);
    } else {
      console.log('❌ Connection failed:', response.status, response.statusText);
      const error = await response.text();
      console.log('Error:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
  
  return true;
}

async function checkContentTypes() {
  console.log('\n3. CHECKING AVAILABLE CONTENT TYPES');
  console.log('-------------------------------------------');
  
  const query = `
    query {
      __schema {
        types {
          name
          kind
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();
    
    if (data.data) {
      const contentTypes = data.data.__schema.types
        .filter(type => 
          type.kind === 'OBJECT' && 
          !type.name.startsWith('__') && 
          type.name.endsWith('Collection')
        )
        .map(type => type.name.replace('Collection', ''));
      
      console.log('Available content types:');
      contentTypes.forEach(type => console.log(`  - ${type}`));
      
      // Check for the ones we need
      const hasMicroWebsiteContent = contentTypes.includes('microWebsiteContent');
      const hasProduct = contentTypes.includes('Product');
      
      console.log('\n📋 Content type check:');
      console.log(`  microWebsiteContent: ${hasMicroWebsiteContent ? '✅' : '❌'}`);
      console.log(`  Product: ${hasProduct ? '✅' : '❌'}`);
      
      return { hasMicroWebsiteContent, hasProduct, contentTypes };
    } else {
      console.log('❌ Could not fetch content types');
      if (data.errors) {
        console.log('Errors:', JSON.stringify(data.errors, null, 2));
      }
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

async function testWebsiteContentQuery() {
  console.log('\n4. TESTING microWebsiteContent QUERY');
  console.log('-------------------------------------------');
  
  const query = `
    query {
      microWebsiteContentCollection(limit: 1) {
        items {
          heading
          subHeading
          headingDescription
          imagesCollection {
            items {
              title
              image
              description
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();
    
    if (data.errors) {
      console.log('❌ Query has errors:');
      data.errors.forEach(error => console.log(`  - ${error.message}`));
      return false;
    }
    
    if (data.data?.microWebsiteContentCollection) {
      const items = data.data.microWebsiteContentCollection.items;
      console.log(`✅ Found ${items.length} microWebsiteContent entries`);
      
      if (items.length === 0) {
        console.log('\n⚠️  WARNING: No content found!');
        console.log('You need to create a microWebsiteContent entry in Contentful.');
        return false;
      }
      
      console.log('\nFirst entry:');
      console.log(JSON.stringify(items[0], null, 2));
      return true;
    } else {
      console.log('❌ No data returned');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function checkAllEntries() {
  console.log('\n5. CHECKING ALL ENTRIES IN SPACE');
  console.log('-------------------------------------------');
  
  try {
    const response = await fetch(
      `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries`,
      {
        headers: {
          'Authorization': `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.items) {
      console.log(`Total entries: ${data.items.length}`);
      
      const contentTypes = {};
      data.items.forEach(item => {
        const type = item.sys.contentType.sys.id;
        contentTypes[type] = (contentTypes[type] || 0) + 1;
      });
      
      console.log('\nEntries by content type:');
      Object.entries(contentTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
      
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
  
  if (!contentTypeInfo || !contentTypeInfo.hasMicroWebsiteContent) {
    console.log('❌ The microWebsiteContent content type does not exist in your Contentful space.\n');
    console.log('You need to create it with these fields:');
    console.log('  1. heading (Short text)');
    console.log('  2. subHeading (Short text)');
    console.log('  3. headingDescription (Long text)');
    console.log('  4. images (References, many - link to Product entries)\n');
    console.log('Then create a Product content type with:');
    console.log('  1. title (Short text)');
    console.log('  2. description (Long text)');
    console.log('  3. image (JSON object)\n');
    console.log('After creating the content types, create entries and publish them.');
  } else {
    console.log('✅ Content types exist. Check if you have:');
    console.log('  1. Created at least one microWebsiteContent entry');
    console.log('  2. Published the entry (not just saved as draft)');
    console.log('  3. Added Product entries to the images field');
    console.log('  4. Published all Product entries');
  }
}

async function main() {
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without a working connection.');
    process.exit(1);
  }
  
  const contentTypeInfo = await checkContentTypes();
  await checkAllEntries();
  await testWebsiteContentQuery();
  await provideSolution(contentTypeInfo);
  
  console.log('\n===========================================');
  console.log('If you need help, share the output above!');
  console.log('===========================================\n');
}

main();