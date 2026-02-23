import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function ensureBucketExists(supabaseUrl: string, serviceKey: string): Promise<void> {
  try {
    const response = await fetch(
      `${supabaseUrl}/storage/v1/bucket/images`,
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
            name: "images",
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

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `student-works/${fileName}`;

    const buffer = await file.arrayBuffer();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await ensureBucketExists(supabaseUrl, supabaseServiceKey);

    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/images/${filePath}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${supabaseServiceKey}`,
          "x-upsert": "true",
        },
        body: buffer,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error("Upload failed:", error);
      return new Response(
        JSON.stringify({ error: "Failed to upload image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/images/${filePath}`;

    return new Response(JSON.stringify({ url: imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});