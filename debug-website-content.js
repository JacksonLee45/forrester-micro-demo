// Run this with: node debug-website-content.js
// Make sure to have your .env.local values available

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID || 'YOUR_SPACE_ID';
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN';

const query = `
  query {
    microWebsiteContentCollection(limit: 1) {
      items {
        heading
        subHeading
        headingDescription
        imagesCollection {
          items {
            ... on Product {
              title
              image
              description
            }
          }
        }
      }
    }
  }
`;

async function testWebsiteContent() {
  console.log('Testing microWebsiteContent...');
  console.log('Space ID:', CONTENTFUL_SPACE_ID);
  console.log('Token:', CONTENTFUL_ACCESS_TOKEN ? CONTENTFUL_ACCESS_TOKEN.substring(0, 10) + '...' : 'NOT SET');
  
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
    
    console.log('\n=== Response Status ===');
    console.log(response.status, response.statusText);
    
    console.log('\n=== Full Response Data ===');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.data?.microWebsiteContentCollection?.items?.[0]) {
      const content = data.data.microWebsiteContentCollection.items[0];
      console.log('\n=== Website Content ===');
      console.log('Heading:', content.heading);
      console.log('Sub-heading:', content.subHeading);
      console.log('Description:', content.headingDescription);
      console.log('\n=== Images ===');
      console.log('Number of images:', content.imagesCollection?.items?.length || 0);
      if (content.imagesCollection?.items) {
        content.imagesCollection.items.forEach((item, i) => {
          console.log(`\nImage ${i + 1}:`);
          console.log('  Title:', item.title);
          console.log('  Description:', item.description);
          console.log('  Image type:', typeof item.image);
        });
      }
      console.log('\n✅ SUCCESS!');
    }
    
    if (data.errors) {
      console.log('\n❌ ERRORS FOUND:');
      data.errors.forEach(error => {
        console.log('-', error.message);
      });
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

testWebsiteContent();