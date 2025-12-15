import Contentstack from "contentstack";

type ContentstackRegion = "us" | "eu" | "azure-na" | "azure-eu";

// Get base URL for region
function getBaseUrl(region: ContentstackRegion): string {
  const regionMap = {
    'us': 'https://cdn.contentstack.io',
    'eu': 'https://eu-cdn.contentstack.com',
    'azure-na': 'https://azure-na-cdn.contentstack.com',
    'azure-eu': 'https://azure-eu-cdn.contentstack.com',
  };
  return regionMap[region];
}

// Get API credentials
function getCredentials() {
  if (!process.env.CONTENTSTACK_API_KEY || !process.env.CONTENTSTACK_DELIVERY_TOKEN || !process.env.CONTENTSTACK_ENVIRONMENT) {
    throw new Error("Missing Contentstack environment variables");
  }

  const region = (process.env.CONTENTSTACK_REGION || "us") as ContentstackRegion;
  
  return {
    apiKey: process.env.CONTENTSTACK_API_KEY,
    deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN,
    environment: process.env.CONTENTSTACK_ENVIRONMENT,
    region,
    baseUrl: getBaseUrl(region),
  };
}

interface WebsiteContent {
  heading: string;
  sub_heading: string;
  heading_description: string;
  images?: Array<{
    title: string;
    description: string;
    custom: any; // Frontify data is in 'custom' field
  }>;
}

interface VideoContent {
  title: string;
  json_rte: any; // Frontify video data is in 'json_rte' field
}

export async function getWebsiteContent(): Promise<any> {
  try {
    const { apiKey, deliveryToken, environment, baseUrl } = getCredentials();
    
    // Use REST API directly since SDK has issues with includeReference
    const response = await fetch(
      `${baseUrl}/v3/content_types/micro_website_content/entries?include[]=images`,
      {
        headers: {
          'api_key': apiKey,
          'access_token': deliveryToken,
          'environment': environment,
        },
        next: { tags: ["website"] },
      }
    );

    const data = await response.json();

    if (data.error_code) {
      console.error("Contentstack API error:", data.error_message);
      return null;
    }

    if (!data.entries || !data.entries.length) {
      console.error("No website content found in Contentstack");
      return null;
    }

    const entry = data.entries[0];

    console.log("=== CONTENTSTACK REST API RESPONSE ===");
    console.log("Entry:", entry);
    console.log("Entry.images:", entry.images);

    // Transform to match our component's expected format
    // Map 'custom' field to 'image' for component compatibility
    const productsWithImages = (entry.images || []).map((product: any) => ({
      ...product,
      image: product.custom, // Map custom field to image
    }));

    return {
      heading: entry.heading,
      subHeading: entry.sub_heading,
      headingDescription: entry.heading_description,
      imagesCollection: {
        items: productsWithImages,
      },
    };
  } catch (error) {
    console.error("Error fetching Contentstack website content:", error);
    return null;
  }
}

export async function getFirstVideo(): Promise<any> {
  try {
    const { apiKey, deliveryToken, environment, baseUrl } = getCredentials();
    
    const response = await fetch(
      `${baseUrl}/v3/content_types/frontify_video_content/entries`,
      {
        headers: {
          'api_key': apiKey,
          'access_token': deliveryToken,
          'environment': environment,
        },
        cache: 'no-store', // Force no caching
      }
    );

    const data = await response.json();

    console.log("=== VIDEO API RESPONSE ===");
    console.log("Response:", data);
    console.log("Entries count:", data.entries?.length);

    if (data.error_code) {
      console.error("Contentstack API error:", data.error_message);
      return null;
    }

    if (!data.entries || !data.entries.length) {
      console.error("No video found in Contentstack");
      console.error("This might be a caching issue. Try restarting the dev server.");
      return null;
    }

    const entry = data.entries[0];
    
    console.log("=== VIDEO ENTRY ===");
    console.log("Entry title:", entry.title);
    console.log("json_rte type:", typeof entry.json_rte);
    console.log("json_rte:", entry.json_rte);
    console.log("json_rte.children:", entry.json_rte?.children);
    
    // Extract Frontify video data from rich text editor structure
    let videoData = null;
    
    if (entry.json_rte && entry.json_rte.children) {
      console.log("Searching through children...");
      
      // Look for the Frontify node in the children
      const frontifyNode = entry.json_rte.children.find(
        (child: any) => {
          console.log("Child type:", child.type);
          return child.type === 'Frontify';
        }
      );
      
      console.log("Found Frontify node:", !!frontifyNode);
      
      if (frontifyNode && frontifyNode.attrs) {
        // The video data is in the attrs
        videoData = [frontifyNode.attrs]; // Wrap in array to match expected format
        console.log("✅ Extracted video data:", videoData);
        console.log("Video URL:", videoData[0].downloadUrl);
      }
    }
    
    if (!videoData) {
      console.error("❌ Could not extract video data from json_rte structure");
      console.error("Full entry:", JSON.stringify(entry, null, 2));
      return null;
    }
    
    const result = {
      name: entry.title,
      video: videoData,
    };
    
    console.log("=== RETURNING VIDEO DATA ===");
    console.log("Result:", result);
    
    return result;
  } catch (error) {
    console.error("Error fetching Contentstack video:", error);
    return null;
  }
}