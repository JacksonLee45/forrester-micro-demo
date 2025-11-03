// Run this with: node debug-product.js
// Make sure to have your .env.local values available

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID || 'YOUR_SPACE_ID';
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN';

const query = `
  query {
    productCollection(limit: 1) {
      items {
        title
        image
        description
      }
    }
  }
`;

async function testProduct() {
  console.log('Testing Product content...');
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
    
    if (data.data?.productCollection?.items?.[0]) {
      const product = data.data.productCollection.items[0];
      console.log('\n=== Product Data ===');
      console.log('Title:', product.title);
      console.log('Description:', product.description);
      console.log('\n=== IMAGE FIELD (This is the important part) ===');
      console.log('Type:', typeof product.image);
      console.log('Value:', product.image);
      console.log('Stringified:', JSON.stringify(product.image, null, 2));
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

testProduct();