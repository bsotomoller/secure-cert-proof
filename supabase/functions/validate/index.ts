import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Demasiadas solicitudes. Intente en un momento." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ ok: false, error: "Código requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: cert, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("public_code", normalizedCode)
      .maybeSingle();

    const userAgent = req.headers.get("user-agent") || "unknown";

    if (error || !cert) {
      // Log not found
      await supabase.from("validation_logs").insert({
        public_code: normalizedCode,
        result: "not_found",
        ip,
        user_agent: userAgent,
      });

      return new Response(
        JSON.stringify({ ok: false, error: "Código no válido" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate state
    const now = new Date();
    const expiresAt = new Date(cert.expires_at);
    let state: string;

    if (cert.status === "revoked") {
      state = "revoked";
    } else if (now >= expiresAt) {
      state = "expired";
    } else {
      state = "active";
    }

    const logResult = state === "active" ? "found" : state;

    await supabase.from("validation_logs").insert({
      public_code: normalizedCode,
      result: logResult,
      ip,
      user_agent: userAgent,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        certificate: {
          company_name: cert.company_name,
          issued_at: cert.issued_at,
          expires_at: cert.expires_at,
          public_code: cert.public_code,
          state,
          pdf_url: cert.pdf_url,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
