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
} from "@react-pdf/renderer";
import { Resume, Profile, WorkExperience, Project } from "@/types/portfolio";

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
}

const ResumeDocument = ({
  resume,
  profile,
  workExperiences,
  projects,
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
          {profile.avatar_url && (
            /* eslint-disable-next-line jsx-a11y/alt-text */
            <Image src={profile.avatar_url} style={styles.avatar} />
          )}
        </View>

        {/* Contact Information Bar */}
        <View style={styles.contactRow}>
          {profile.home_page_data?.callToAction?.email && (
            <View style={styles.contactItem}>
              <Text>{profile.home_page_data.callToAction.email}</Text>
            </View>
          )}
          {primaryPhone && (
            <View style={styles.contactItem}>
              <Text style={styles.contactDivider}>|</Text>
              <Text>{primaryPhone.number}</Text>
            </View>
          )}
          {resume.location && (
            <View style={styles.contactItem}>
              <Text style={styles.contactDivider}>|</Text>
              <Text>{resume.location}</Text>
            </View>
          )}
          {profile.domain && (
            <View style={styles.contactItem}>
              <Text style={styles.contactDivider}>|</Text>
              <Link src={`https://${profile.domain}`} style={styles.link}>{profile.domain}</Link>
            </View>
          )}
          {profile.home_page_data?.socialLinks?.map((link, idx) => (
            <View key={idx} style={styles.contactItem}>
              <Text style={styles.contactDivider}>|</Text>
              <Link src={link.href} style={styles.link}>{link.platform}</Link>
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

    // Generate PDF
    const pdfDoc = (
      <ResumeDocument
        resume={resume}
        profile={profile}
        workExperiences={workExperiences}
        projects={projects}
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
