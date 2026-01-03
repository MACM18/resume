/**
 * Generate vCard (VCF) content for contact information
 * Compatible with both iOS and Android
 */
export interface VCardData {
  fullName: string;
  email?: string;
  phone?: string;
  url?: string;
  organization?: string;
  title?: string;
  photo?: string;
}

export function generateVCard(data: VCardData): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.fullName}`,
    `N:${data.fullName.split(" ").reverse().join(";")};;;`,
  ];

  if (data.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${data.email}`);
  }

  if (data.phone) {
    // Clean phone number
    const cleanPhone = data.phone.replace(/[^\d+]/g, "");
    lines.push(`TEL;TYPE=CELL:${cleanPhone}`);
  }

  if (data.organization) {
    lines.push(`ORG:${data.organization}`);
  }

  if (data.title) {
    lines.push(`TITLE:${data.title}`);
  }

  if (data.url) {
    lines.push(`URL:${data.url}`);
  }

  if (data.photo) {
    lines.push(`PHOTO;VALUE=uri:${data.photo}`);
  }

  lines.push("END:VCARD");

  return lines.join("\r\n");
}

/**
 * Download vCard file
 */
export function downloadVCard(vcard: string, fileName: string = "contact.vcf") {
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
