// Run this with: node debug-contentful.js
// Make sure to have your .env.local values available

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID || 'YOUR_SPACE_ID';
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN';

const query = `
  query {
    postCollection(limit: 5) {
      total
      items {
        slug
        title
        date
      }
    }
  }
`;

async function testContentful() {
  console.log('Testing Contentful connection...');
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
    
    console.log('\n=== Response Data ===');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.errors) {
      console.log('\n❌ ERRORS FOUND:');
      data.errors.forEach(error => {
        console.log('-', error.message);
      });
    }
    
    if (data.data?.postCollection) {
      console.log('\n✅ SUCCESS!');
      console.log(`Found ${data.data.postCollection.total} posts`);
      console.log('Posts:', data.data.postCollection.items);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

testContentful();