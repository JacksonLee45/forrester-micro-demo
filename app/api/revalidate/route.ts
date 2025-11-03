import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    // Get the secret from headers
    const requestHeaders = new Headers(request.headers);
    const secret = requestHeaders.get("x-vercel-reval-key");

    // Validate secret
    if (!secret) {
      console.log('❌ No secret provided in request');
      return NextResponse.json(
        { message: "No secret provided" }, 
        { status: 401 }
      );
    }

    if (secret !== process.env.CONTENTFUL_REVALIDATE_SECRET) {
      console.log('❌ Invalid secret provided');
      return NextResponse.json(
        { message: "Invalid secret" }, 
        { status: 401 }
      );
    }

    // Get webhook data (optional, for logging)
    let body;
    try {
      body = await request.json();
      console.log('📝 Webhook received for:', body?.sys?.contentType?.sys?.id || 'unknown');
    } catch (e) {
      // Body parsing failed, but that's OK for revalidation
      console.log('📝 Webhook received (no body)');
    }

    // Revalidate using tags
    revalidateTag("website");
    revalidateTag("products");
    
    // Also revalidate the homepage
    revalidatePath("/");

    console.log('✅ Revalidation triggered successfully');

    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      message: "Cache revalidated successfully"
    });

  } catch (error) {
    console.error('❌ Revalidation error:', error);
    return NextResponse.json(
      { 
        message: "Error during revalidation",
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Support GET requests for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: "Revalidation endpoint is active. Use POST with x-vercel-reval-key header.",
    timestamp: Date.now()
  });
}