#!/usr/bin/env node

// Check video content in Contentstack

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
console.log('VIDEO CONTENT CHECKER');
console.log('===========================================\n');

async function checkVideos() {
  try {
    console.log('Checking frontify_video_content entries...\n');
    
    const response = await fetch(
      `${BASE_URL}/v3/content_types/frontify_video_content/entries`,
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
      console.log('❌ Error:', data.error_message);
      return;
    }
    
    console.log(`Found ${data.entries?.length || 0} video entries\n`);
    
    if (!data.entries || data.entries.length === 0) {
      console.log('⚠️  No video entries found!\n');
      console.log('To add a video:');
      console.log('1. Go to Entries in Contentstack');
      console.log('2. Create New → frontify_video_content');
      console.log('3. Fill in:');
      console.log('   - Title: "Featured Video"');
      console.log('   - JSON RTE: Paste your Frontify video JSON');
      console.log('4. Publish the entry');
      console.log('\nFrontify video JSON format:');
      console.log(JSON.stringify([
        {
          "id": "video_id",
          "title": "Video Title",
          "type": "Video",
          "previewUrl": "https://video-cdn-url/preview.jpg",
          "downloadUrl": "https://video-cdn-url/video.mp4",
          "dynamicPreviewUrl": "https://video-cdn-url/dynamic.mp4"
        }
      ], null, 2));
      return;
    }
    
    // Show all entries
    data.entries.forEach((entry, index) => {
      console.log(`VIDEO ${index + 1}:`);
      console.log('─'.repeat(60));
      console.log('UID:', entry.uid);
      console.log('Title:', entry.title);
      console.log('Published:', entry.publish_details ? 'Yes' : 'No');
      console.log('\njson_rte field:');
      console.log('  Type:', typeof entry.json_rte);
      console.log('  Is Array:', Array.isArray(entry.json_rte));
      
      if (entry.json_rte) {
        console.log('  Content:', JSON.stringify(entry.json_rte, null, 2));
        
        // Check for video URLs
        if (Array.isArray(entry.json_rte) && entry.json_rte.length > 0) {
          const video = entry.json_rte[0];
          console.log('\n  Video URLs found:');
          if (video.previewUrl) console.log('    ✅ previewUrl:', video.previewUrl.substring(0, 50) + '...');
          if (video.downloadUrl) console.log('    ✅ downloadUrl:', video.downloadUrl.substring(0, 50) + '...');
          if (video.dynamicPreviewUrl) console.log('    ✅ dynamicPreviewUrl:', video.dynamicPreviewUrl.substring(0, 50) + '...');
          if (video.src) console.log('    ✅ src:', video.src.substring(0, 50) + '...');
        }
      } else {
        console.log('  ⚠️  json_rte field is empty!');
      }
      
      console.log('\n');
    });
    
    console.log('===========================================');
    console.log('SUMMARY');
    console.log('===========================================');
    
    if (data.entries.length > 0 && data.entries[0].json_rte) {
      console.log('✅ Video entry exists with data');
      console.log('\nIf video still not showing:');
      console.log('1. Check browser console for errors');
      console.log('2. Verify video URL is accessible');
      console.log('3. Check FrontifyVideo component is rendering');
    } else if (data.entries.length > 0 && !data.entries[0].json_rte) {
      console.log('⚠️  Video entry exists but json_rte is empty');
      console.log('\nEdit the entry and add Frontify video JSON to json_rte field');
    } else {
      console.log('❌ No video entries found - create one in Contentstack');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkVideos();