import { NextResponse } from "next/server";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Link,
  Image,
  Svg,
  Path,
  G,
  Circle,
} from "@react-pdf/renderer";
import { Resume, Profile, WorkExperience, Project } from "@/types/portfolio";
import sharp from "sharp";

// Icon components for the PDF
const IconGithub = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" style={{ marginRight: 3 }}>
    <Path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconLinkedin = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" style={{ marginRight: 3 }}>
    <Path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 9h4v12H2z" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="4" cy="4" r="2" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconTwitter = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" style={{ marginRight: 3 }}>
    <Path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconMail = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" style={{ marginRight: 3 }}>
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="m22 6-10 7L2 6" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconGlobe = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" style={{ marginRight: 3 }}>
    <Circle cx="12" cy="12" r="10" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 12h20" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconPhone = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" style={{ marginRight: 3 }}>
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconMapPin = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" style={{ marginRight: 3 }}>
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="10" r="3" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const isXDotComHost = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;

  const parseHostname = (input: string) => {
    try {
      return new URL(input).hostname.toLowerCase();
    } catch {
      return null;
    }
  };

  const hostname =
    parseHostname(trimmed) ??
    parseHostname(`https://${trimmed}`);

  return hostname === "x.com" || (hostname !== null && hostname.endsWith(".x.com"));
};

const SocialIcon = ({ platform }: { platform: string }) => {
  const p = platform.toLowerCase();
  if (p.includes('github')) return <IconGithub />;
  if (p.includes('linkedin')) return <IconLinkedin />;
  if (p.includes('twitter') || isXDotComHost(platform)) return <IconTwitter />;
  if (p.includes('mail') || p.includes('email')) return <IconMail />;
  if (p.includes('globe') || p.includes('website') || p.includes('portfolio')) return <IconGlobe />;
  if (p.includes('phone') || p.includes('call')) return <IconPhone />;
  if (p.includes('map') || p.includes('location')) return <IconMapPin />;
  return <IconGlobe />; // Fallback
};

export const dynamic = "force-dynamic";

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    fontSize: 10,
    color: "#334155",
  },
  // Header section
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 20,
    marginBottom: 15,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "bold",
    marginBottom: 6,
  },
  totalExp: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginLeft: 20,
    borderWidth: 2,
    borderColor: "#f1f5f9",
    objectFit: "cover",
    objectPosition: "center",
  },
  // Contact row
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
    fontSize: 9,
    color: "#475569",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactDivider: {
    color: "#cbd5e1",
    marginHorizontal: 4,
  },
  // Section common
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 2,
  },
  // Summary
  summary: {
    lineHeight: 1.5,
    textAlign: "justify",
  },
  // Experience
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  company: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
  },
  duration: {
    fontSize: 9,
    color: "#64748b",
  },
  positionLocation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    fontSize: 9,
    fontStyle: "italic",
    color: "#475569",
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 10,
  },
  bullet: {
    width: 10,
    fontSize: 10,
    color: "#2563eb",
  },
  bulletText: {
    flex: 1,
    lineHeight: 1.4,
  },
  // Skills
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  skillChip: {
    backgroundColor: "#f1f5f9",
    color: "#334155",
    fontSize: 8.5,
    padding: "3 6",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  // Projects
  projectItem: {
    marginBottom: 10,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  projectTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
  },
  projectTech: {
    fontSize: 8.5,
    color: "#2563eb",
    fontStyle: "italic",
  },
  projectLinks: {
    flexDirection: "row",
    gap: 10,
    fontSize: 8.5,
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#475569",
  },
  // Education & Certs
  eduCertItem: {
    marginBottom: 6,
  },
  eduCertMain: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
  },
  eduCertSub: {
    fontSize: 9,
    color: "#475569",
  },
  eduCertDate: {
    fontSize: 9,
    color: "#64748b",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
});

/**
 * Helper to calculate precise total experience duration
 */
function calculateTotalExperience(workExperiences?: WorkExperience[]): string {
  if (!workExperiences || workExperiences.length === 0) return "";
  
  // Sort by start date to handle overlapping intervals
  const sorted = [...workExperiences].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );
  
  let totalMonths = 0;
  let currentStart = new Date(sorted[0].start_date);
  let currentEnd = sorted[0].is_current 
    ? new Date() 
    : (sorted[0].end_date ? new Date(sorted[0].end_date!) : new Date());

  for (let i = 1; i < sorted.length; i++) {
    const expStart = new Date(sorted[i].start_date);
    const expEnd = sorted[i].is_current 
      ? new Date() 
      : (sorted[i].end_date ? new Date(sorted[i].end_date!) : new Date());

    if (expStart <= currentEnd) {
      // Overlap or contiguous - extend end date
      if (expEnd > currentEnd) {
        currentEnd = expEnd;
      }
    } else {
      // Gap - add accumulated months and reset
      totalMonths += (currentEnd.getFullYear() - currentStart.getFullYear()) * 12 + 
                     (currentEnd.getMonth() - currentStart.getMonth());
      currentStart = expStart;
      currentEnd = expEnd;
    }
  }
  // Add the final interval
  totalMonths += (currentEnd.getFullYear() - currentStart.getFullYear()) * 12 + 
                 (currentEnd.getMonth() - currentStart.getMonth());

  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  const yearStr = years > 0 ? `${years} Year${years !== 1 ? "s" : ""}` : "";
  const monthStr = remainingMonths > 0 ? `${remainingMonths} Month${remainingMonths !== 1 ? "s" : ""}` : "";
  
  return [yearStr, monthStr].filter(Boolean).join(" ");
}

/**
 * Helper function to format dates
 */
function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface ResumeDocumentProps {
  resume: Resume;
  profile: Profile;
  workExperiences?: WorkExperience[];
  projects?: Project[];
  processedAvatar?: string | null;
}

const ResumeDocument = ({
  resume,
  profile,
  workExperiences,
  projects,
  processedAvatar,
}: ResumeDocumentProps) => {
  const totalExp = calculateTotalExperience(workExperiences);
  
  // Filter projects to only those selected in resume.project_ids
  const selectedProjects = projects?.filter(p => resume.project_ids.includes(p.id)) || [];

  const primaryPhone = profile.contact_numbers?.find(n => n.isPrimary && n.isActive) || 
                       profile.contact_numbers?.find(n => n.isActive);

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{profile.full_name}</Text>
            <Text style={styles.title}>{resume.title || profile.tagline}</Text>
            {totalExp && (
              <Text style={styles.totalExp}>Total Professional Experience: {totalExp}</Text>
            )}
          </View>
          {processedAvatar && (
            /* eslint-disable-next-line jsx-a11y/alt-text */
            <Image src={processedAvatar} style={styles.avatar} />
          )}
        </View>

        {/* Contact Information Bar */}
        <View style={styles.contactRow}>
          {profile.home_page_data?.callToAction?.email && (
            <View style={styles.contactItem}>
              <SocialIcon platform="email" />
              <Text>{profile.home_page_data.callToAction.email}</Text>
            </View>
          )}
          {primaryPhone && (
            <View style={styles.contactItem}>
              <Text style={styles.contactDivider}>|</Text>
              <SocialIcon platform="phone" />
              <Text>{primaryPhone.number}</Text>
            </View>
          )}
          {resume.location && (
            <View style={styles.contactItem}>
              <Text style={styles.contactDivider}>|</Text>
              <SocialIcon platform="location" />
              <Text>{resume.location}</Text>
            </View>
          )}
          {profile.domain && (
            <View style={styles.contactItem}>
              <Text style={styles.contactDivider}>|</Text>
              <SocialIcon platform="globe" />
              <Link src={`https://${profile.domain}`} style={styles.link}>{profile.domain}</Link>
            </View>
          )}
          {profile.home_page_data?.socialLinks?.map((link, idx) => (
            <View key={idx} style={styles.contactItem}>
              <Text style={styles.contactDivider}>|</Text>
              <SocialIcon platform={link.platform} />
              <Link src={link.href} style={styles.link}>{link.display_label || link.platform}</Link>
            </View>
          ))}
        </View>

        {/* Professional Summary */}
        {resume.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{resume.summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {workExperiences && workExperiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {workExperiences.map((exp) => (
              <View key={exp.id} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.company}>{exp.company}</Text>
                  <Text style={styles.duration}>
                    {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                  </Text>
                </View>
                <View style={styles.positionLocation}>
                  <Text>{exp.position}</Text>
                  {exp.location && <Text>{exp.location}</Text>}
                </View>
                {exp.description?.map((bullet, idx) => (
                  <View key={idx} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {resume.skills.map((skill, idx) => (
                <View key={idx} style={styles.skillChip}>
                  <Text>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {selectedProjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Projects</Text>
            {selectedProjects.map((project) => (
              <View key={project.id} style={styles.projectItem}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <Text style={styles.projectTech}>{project.tech.join(", ")}</Text>
                </View>
                <View style={styles.projectLinks}>
                  {project.demo_url && (
                    <Link src={project.demo_url} style={styles.link}>Live Demo</Link>
                  )}
                  {project.github_url && (
                    <Link src={project.github_url} style={styles.link}>GitHub</Link>
                  )}
                </View>
                <Text style={styles.projectDescription}>{project.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, idx) => (
              <View key={idx} style={styles.eduCertItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.eduCertMain}>{edu.degree}</Text>
                  <Text style={styles.eduCertDate}>{edu.year}</Text>
                </View>
                <Text style={styles.eduCertSub}>{edu.school}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert, idx) => (
              <View key={idx} style={styles.eduCertItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.eduCertMain}>
                    {cert.url ? (
                      <Link src={cert.url} style={styles.link}>{cert.name}</Link>
                    ) : (
                      cert.name
                    )}
                  </Text>
                  <Text style={styles.eduCertDate}>{cert.date}</Text>
                </View>
                <Text style={styles.eduCertSub}>{cert.issuer}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      resume,
      profile,
      workExperiences,
      projects,
    }: {
      resume: Resume;
      profile: Profile;
      workExperiences?: WorkExperience[];
      projects?: Project[];
    } = body;

    if (!resume || !profile) {
      return NextResponse.json(
        { error: "Missing required data: resume and profile are required" },
        { status: 400 }
      );
    }

    // Fix avatar rotation issues for PDF
    let processedAvatar: string | null = null;
    if (profile.avatar_url) {
      try {
        // SSRF Protection: Validate and constrain URL before fetching
        const url = new URL(profile.avatar_url);
        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid protocol");
        }
        if (url.username || url.password || url.port) {
          throw new Error("Credentials and custom ports are not allowed");
        }

        // Only allow known avatar/image hosts (exact host match only)
        const allowedHosts = ["storage.macm.dev", "storage.macm.lk", "macm.dev", "macm.lk"];
        const hostname = url.hostname.toLowerCase();
        const allowedHost = allowedHosts.find((host) => hostname === host);
        if (!allowedHost) {
          throw new Error("Avatar host is not allowed");
        }

        // Disallow suspicious path patterns and reconstruct a canonical URL
        if (url.pathname.includes("..")) {
          throw new Error("Invalid avatar path");
        }
        const safeAvatarUrl = `${url.protocol}//${allowedHost}${url.pathname}${url.search}`;

        const response = await fetch(safeAvatarUrl, { redirect: "error" });
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          // Use sharp to auto-rotate based on EXIF and strip metadata
          const rotatedBuffer = await sharp(Buffer.from(buffer))
            .rotate()
            .png()
            .toBuffer();
          processedAvatar = `data:image/png;base64,${rotatedBuffer.toString("base64")}`;
        }
      } catch (e) {
        console.error("Error processing avatar for PDF (SSRF Check):", e);
      }
    }

    // Generate PDF
    const pdfDoc = (
      <ResumeDocument
        resume={resume}
        profile={profile}
        workExperiences={workExperiences}
        projects={projects}
        processedAvatar={processedAvatar}
      />
    );

    const pdfBlob = await pdf(pdfDoc).toBlob();
    const pdfBuffer = await pdfBlob.arrayBuffer();

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(
          profile.full_name || "Resume"
        ).replace(/[^a-zA-Z0-9]/g, "_")}_Resume.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
