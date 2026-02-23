import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type BucketType = 'courses' | 'blog' | 'student-works' | 'general';

const BUCKET_CONFIG: Record<BucketType, { bucket: string; folder: string }> = {
  'courses': { bucket: 'images', folder: 'courses' },
  'blog': { bucket: 'images', folder: 'blog' },
  'student-works': { bucket: 'images', folder: 'student-works' },
  'general': { bucket: 'images', folder: 'general' },
};

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function ensureBucketExists(supabaseUrl: string, serviceKey: string, bucketName: string): Promise<void> {
  try {
    const response = await fetch(
      `${supabaseUrl}/storage/v1/bucket/${bucketName}`,
      {
        method: "HEAD",
        headers: {
          authorization: `Bearer ${serviceKey}`,
        },
      }
    );

    if (response.status === 404) {
      const createResponse = await fetch(
        `${supabaseUrl}/storage/v1/bucket`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: bucketName,
            public: true,
          }),
        }
      );

      if (!createResponse.ok) {
        const error = await createResponse.text();
        console.error("Failed to create bucket:", error);
      }
    }
  } catch (error) {
    console.error("Error checking/creating bucket:", error);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as BucketType) || 'general';

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File size exceeds 10MB limit" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Allowed: jpg, jpeg, png, gif, webp, svg" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Invalid MIME type. Only images are allowed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = BUCKET_CONFIG[type] || BUCKET_CONFIG['general'];
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${config.folder}/${fileName}`;

    const buffer = await file.arrayBuffer();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await ensureBucketExists(supabaseUrl, supabaseServiceKey, config.bucket);

    const contentType = file.type || 'image/jpeg';

    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${config.bucket}/${filePath}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${supabaseServiceKey}`,
          "content-type": contentType,
          "cache-control": "3600",
        },
        body: new Uint8Array(buffer),
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return new Response(
        JSON.stringify({
          error: "Failed to upload image",
          details: errorText,
          status: uploadResponse.status
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${config.bucket}/${filePath}`;

    return new Response(JSON.stringify({ url: imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});