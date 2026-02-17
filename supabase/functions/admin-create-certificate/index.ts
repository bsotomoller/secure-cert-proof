import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import QRCode from "https://esm.sh/qrcode@1.5.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 4; i++) {
    part1 += chars[Math.floor(Math.random() * chars.length)];
    part2 += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PIC-${part1}-${part2}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function generatePDF(
  companyName: string,
  issuedAt: Date,
  expiresAt: Date,
  publicCode: string,
  validationUrl: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  // A4 landscape
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // Background
  page.drawRectangle({
    x: 0, y: 0, width, height,
    color: rgb(0.98, 0.97, 0.95),
  });

  // Border
  const borderWidth = 3;
  const margin = 30;
  page.drawRectangle({
    x: margin, y: margin,
    width: width - margin * 2, height: height - margin * 2,
    borderColor: rgb(0.1, 0.15, 0.27),
    borderWidth,
    color: undefined,
  });

  // Inner border
  page.drawRectangle({
    x: margin + 8, y: margin + 8,
    width: width - (margin + 8) * 2, height: height - (margin + 8) * 2,
    borderColor: rgb(0.79, 0.66, 0.3),
    borderWidth: 1,
    color: undefined,
  });

  // Title
  const title = "CERTIFICADO DE CUMPLIMIENTO";
  const titleWidth = helveticaBold.widthOfTextAtSize(title, 24);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: height - 100,
    size: 24,
    font: helveticaBold,
    color: rgb(0.1, 0.15, 0.27),
  });

  const subtitle = "Programa de Integridad";
  const subtitleWidth = timesItalic.widthOfTextAtSize(subtitle, 18);
  page.drawText(subtitle, {
    x: (width - subtitleWidth) / 2,
    y: height - 130,
    size: 18,
    font: timesItalic,
    color: rgb(0.79, 0.66, 0.3),
  });

  // Decorative line
  page.drawLine({
    start: { x: width / 2 - 120, y: height - 145 },
    end: { x: width / 2 + 120, y: height - 145 },
    thickness: 1.5,
    color: rgb(0.79, 0.66, 0.3),
  });

  // Org name
  const org = "Programas de Integridad";
  const orgWidth = helvetica.widthOfTextAtSize(org, 12);
  page.drawText(org, {
    x: (width - orgWidth) / 2,
    y: height - 170,
    size: 12,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText("certifica que la empresa", {
    x: (width - helvetica.widthOfTextAtSize("certifica que la empresa", 13)) / 2,
    y: height - 210,
    size: 13,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Company name
  const companyWidth = timesBold.widthOfTextAtSize(companyName.toUpperCase(), 22);
  page.drawText(companyName.toUpperCase(), {
    x: (width - companyWidth) / 2,
    y: height - 248,
    size: 22,
    font: timesBold,
    color: rgb(0.1, 0.15, 0.27),
  });

  // Line under company
  const lineHalf = Math.min(companyWidth / 2 + 30, 200);
  page.drawLine({
    start: { x: width / 2 - lineHalf, y: height - 255 },
    end: { x: width / 2 + lineHalf, y: height - 255 },
    thickness: 0.5,
    color: rgb(0.79, 0.66, 0.3),
  });

  const bodyText = "ha cumplido satisfactoriamente con el Programa de Integridad.";
  page.drawText(bodyText, {
    x: (width - helvetica.widthOfTextAtSize(bodyText, 13)) / 2,
    y: height - 290,
    size: 13,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2),
  });

  const vigencia = `Vigencia: ${formatDate(issuedAt)} — ${formatDate(expiresAt)}`;
  page.drawText(vigencia, {
    x: (width - helvetica.widthOfTextAtSize(vigencia, 11)) / 2,
    y: height - 320,
    size: 11,
    font: helvetica,
    color: rgb(0.35, 0.35, 0.35),
  });

  const codeText = `Código verificador: ${publicCode}`;
  page.drawText(codeText, {
    x: (width - helveticaBold.widthOfTextAtSize(codeText, 11)) / 2,
    y: height - 345,
    size: 11,
    font: helveticaBold,
    color: rgb(0.1, 0.15, 0.27),
  });

  // QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(validationUrl, {
      width: 120,
      margin: 1,
      color: { dark: "#1a2744", light: "#faf8f3" },
    });
    const qrBase64 = qrDataUrl.split(",")[1];
    const qrBytes = Uint8Array.from(atob(qrBase64), (c) => c.charCodeAt(0));
    const qrImage = await pdfDoc.embedPng(qrBytes);
    const qrSize = 90;
    page.drawImage(qrImage, {
      x: (width - qrSize) / 2,
      y: margin + 55,
      width: qrSize,
      height: qrSize,
    });
  } catch {
    // QR generation failed, continue without it
  }

  const valText = `Validar en: ${validationUrl.replace('https://', '').split('/')[0]}/validar`;
  page.drawText(valText, {
    x: (width - helvetica.widthOfTextAtSize(valText, 8)) / 2,
    y: margin + 42,
    size: 8,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user's JWT
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { company_name } = await req.json();
    if (!company_name || typeof company_name !== "string" || company_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Nombre de empresa requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedName = company_name.trim();
    const publicCode = generateCode();
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Get the origin for QR URL
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || supabaseUrl.replace('.supabase.co', '');
    const validationUrl = `${origin}/validar?code=${publicCode}`;

    // Generate PDF
    const pdfBytes = await generatePDF(trimmedName, issuedAt, expiresAt, publicCode, validationUrl);

    // Calculate SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", pdfBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const pdfHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Upload PDF to storage
    const fileName = `${publicCode}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: "Error al subir PDF: " + uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("certificates")
      .getPublicUrl(fileName);

    const pdfUrl = publicUrlData.publicUrl;

    // Insert certificate record
    const { data: cert, error: insertError } = await supabase
      .from("certificates")
      .insert({
        public_code: publicCode,
        company_name: trimmedName,
        issued_at: issuedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: "active",
        pdf_url: pdfUrl,
        pdf_hash: pdfHash,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Error al crear certificado: " + insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, certificate: cert }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Error interno: " + (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
