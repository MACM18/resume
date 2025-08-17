import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { resume, profile, projects } = await req.json();
    
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
      page.drawText(text, { x, y: yPos, font: isBold ? boldFont : font, size, color });
      return size + 4;
    };
    
    // Header
    page.drawText(profile.full_name, { x: leftMargin, y, font: boldFont, size: 24 });
    y -= 30;
    page.drawText(resume.title, { x: leftMargin, y, font: font, size: 18, color: rgb(0.3, 0.3, 0.3) });
    y -= 20;
    const contactEmail = profile.home_page_data?.callToAction?.email || 'No Email Provided';
    page.drawText(`${contactEmail} | San Francisco, CA`, { x: leftMargin, y, font: font, size: 12 });
    y -= 20;
    
    page.drawLine({ start: { x: leftMargin, y }, end: { x: rightMargin, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 30;

    // Summary
    y -= drawText('Summary', leftMargin, y, 14, true);
    const summaryLines = [];
    const words = resume.summary.split(' ');
    let currentLine = '';
    for (const word of words) {
        const testLine = currentLine + word + ' ';
        if (font.widthOfTextAtSize(testLine, 10) > contentWidth) {
            summaryLines.push(currentLine);
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    }
    summaryLines.push(currentLine);
    for (const line of summaryLines) { y -= drawText(line, leftMargin, y, 10); }
    y -= 20;

    // Experience
    y -= drawText('Experience', leftMargin, y, 14, true);
    for (const exp of resume.experience) {
      y -= drawText(exp.position, leftMargin, y, 12, true);
      page.drawText(exp.duration, { x: rightMargin - font.widthOfTextAtSize(exp.duration, 10), y, font: font, size: 10 });
      y -= 16;
      y -= drawText(exp.company, leftMargin, y, 11, false, rgb(0.3, 0.3, 0.3));
      for (const desc of exp.description) { y -= drawText(`• ${desc}`, leftMargin + 10, y, 10); }
      y -= 10;
    }
    y -= 20;

    // Education
    y -= drawText('Education', leftMargin, y, 14, true);
    for (const edu of resume.education) {
      y -= drawText(edu.degree, leftMargin, y, 12, true);
      page.drawText(edu.year, { x: rightMargin - font.widthOfTextAtSize(edu.year, 10), y, font: font, size: 10 });
      y -= 16;
      y -= drawText(edu.school, leftMargin, y, 11);
      y -= 10;
    }
    y -= 20;

    // Skills
    y -= drawText('Skills', leftMargin, y, 14, true);
    y -= drawText(resume.skills.join(', '), leftMargin, y, 10);
    y -= 20;

    // Projects
    const relevantProjects = resume.project_ids
      .map((id: string) => projects.find((p: any) => p.id === id))
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

    return new Response(pdfBytes, {
      headers: { ...corsHeaders, 'Content-Type': 'application/pdf' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})