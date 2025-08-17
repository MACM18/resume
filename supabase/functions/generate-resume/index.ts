import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Sanitize text to remove characters not supported by standard PDF fonts (WinAnsiEncoding)
const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  // This regex removes characters outside the common set, including most emojis.
  return text.replace(/[^a-zA-Z0-9.,!?'"#$%&'()*+,-./:;<=>@[\]^_`{|}~ \n\r]/g, '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { resume, profile, projects } = await req.json();

    if (!resume || !profile) {
      throw new Error("Missing resume or profile data.");
    }
    
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let y = height - 50;
    const leftMargin = 50;
    const rightMargin = width - 50;
    const contentWidth = rightMargin - leftMargin;

    const drawText = (text: string, x: number, yPos: number, size: number, isBold = false, color = rgb(0, 0, 0)) => {
      if (yPos < 50) return 0;
      page.drawText(sanitizeText(text), { x, y: yPos, font: isBold ? boldFont : font, size, color });
      return size + 4;
    };
    
    // Header
    drawText(profile.full_name, leftMargin, y, 24, true);
    y -= 30;
    drawText(resume.title, leftMargin, y, 18, false, rgb(0.3, 0.3, 0.3));
    y -= 20;
    const contactEmail = profile.home_page_data?.callToAction?.email || 'No Email Provided';
    drawText(`${contactEmail} | San Francisco, CA`, leftMargin, y, 12);
    y -= 20;
    
    page.drawLine({ start: { x: leftMargin, y }, end: { x: rightMargin, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 30;

    // Summary
    if (resume.summary) {
      y -= drawText('Summary', leftMargin, y, 14, true);
      const words = sanitizeText(resume.summary).split(' ');
      let currentLine = '';
      for (const word of words) {
          const testLine = currentLine + word + ' ';
          if (font.widthOfTextAtSize(testLine, 10) > contentWidth) {
              y -= drawText(currentLine, leftMargin, y, 10);
              currentLine = word + ' ';
          } else {
              currentLine = testLine;
          }
      }
      y -= drawText(currentLine, leftMargin, y, 10);
      y -= 20;
    }

    // Experience
    if (resume.experience && resume.experience.length > 0) {
      y -= drawText('Experience', leftMargin, y, 14, true);
      for (const exp of resume.experience) {
        const positionLineY = y;
        y -= drawText(exp.position, leftMargin, y, 12, true);
        drawText(exp.duration, rightMargin - font.widthOfTextAtSize(sanitizeText(exp.duration), 10), positionLineY, 10);
        y -= 4;
        y -= drawText(exp.company, leftMargin, y, 11, false, rgb(0.3, 0.3, 0.3));
        for (const desc of exp.description || []) { y -= drawText(`• ${desc}`, leftMargin + 10, y, 10); }
        y -= 10;
      }
      y -= 20;
    }

    // Education
    if (resume.education && resume.education.length > 0) {
      y -= drawText('Education', leftMargin, y, 14, true);
      for (const edu of resume.education) {
        const degreeLineY = y;
        y -= drawText(edu.degree, leftMargin, y, 12, true);
        drawText(edu.year, rightMargin - font.widthOfTextAtSize(sanitizeText(edu.year), 10), degreeLineY, 10);
        y -= 4;
        y -= drawText(edu.school, leftMargin, y, 11);
        y -= 10;
      }
      y -= 20;
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      y -= drawText('Skills', leftMargin, y, 14, true);
      y -= drawText(resume.skills.join(', '), leftMargin, y, 10);
      y -= 20;
    }

    // Projects
    const relevantProjects = (resume.project_ids || [])
      .map((id: string) => (projects || []).find((p: any) => p.id === id))
      .filter(Boolean);

    if (relevantProjects.length > 0) {
      y -= drawText('Featured Projects', leftMargin, y, 14, true);
      for (const proj of relevantProjects) {
        y -= drawText(proj.title, leftMargin, y, 12, true);
        y -= drawText(proj.description, leftMargin + 10, y, 10);
        y -= 10;
      }
    }

    const pdfBytes = await pdfDoc.save()
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    return new Response(pdfBlob, {
      headers: { ...corsHeaders, 'Content-Type': 'application/pdf' },
    })
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})