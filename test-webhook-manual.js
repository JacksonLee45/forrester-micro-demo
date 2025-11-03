#!/usr/bin/env node

// Quick webhook test - simulates what Contentful sends
// Usage: node test-webhook-manual.js <your-vercel-url> <your-secret>

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node test-webhook-manual.js <vercel-url> <secret>');
  console.log('Example: node test-webhook-manual.js https://mysite.vercel.app my-secret-123');
  process.exit(1);
}

const vercelUrl = args[0];
const secret = args[1];
const endpoint = `${vercelUrl}/api/revalidate`;

console.log('🚀 Simulating Contentful Webhook Call\n');
console.log('Endpoint:', endpoint);
console.log('Secret:', secret.substring(0, 5) + '...\n');

async function testWebhook() {
  try {
    console.log('📡 Sending POST request...\n');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-reval-key': secret,
      },
      body: JSON.stringify({
        sys: {
          type: 'Entry',
          id: 'test-entry-id',
        },
      }),
    });

    const data = await response.json();

    console.log('📊 Response:');
    console.log('  Status:', response.status, response.statusText);
    console.log('  Body:', JSON.stringify(data, null, 2));
    console.log();

    if (response.status === 200) {
      console.log('✅ SUCCESS!');
      console.log('Your webhook endpoint is working correctly.');
      console.log('\nYou can now set up the webhook in Contentful with:');
      console.log('  URL:', endpoint);
      console.log('  Header: x-vercel-reval-key = ' + secret);
      console.log();
    } else if (response.status === 401) {
      console.log('❌ FAILED: Invalid secret');
      console.log('\nCheck:');
      console.log('  1. CONTENTFUL_REVALIDATE_SECRET in Vercel matches your secret');
      console.log('  2. You redeployed after adding the env var');
      console.log();
    } else {
      console.log('⚠️  Unexpected response');
      console.log('Check your revalidate API route');
      console.log();
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log();
  }
}

testWebhook();