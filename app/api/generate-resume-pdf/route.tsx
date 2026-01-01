import { NextResponse } from "next/server";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Link,
} from "@react-pdf/renderer";
import { Resume, Profile, WorkExperience } from "@/types/portfolio";

export const dynamic = "force-dynamic";

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 10,
    color: "#475569",
  },
  contactItem: {
    marginRight: 15,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summary: {
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.6,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  company: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
  },
  duration: {
    fontSize: 10,
    color: "#64748b",
  },
  position: {
    fontSize: 11,
    color: "#334155",
    marginBottom: 4,
  },
  location: {
    fontSize: 9,
    color: "#94a3b8",
    marginBottom: 4,
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
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.4,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skill: {
    backgroundColor: "#eff6ff",
    color: "#1e40af",
    fontSize: 9,
    padding: "4 8",
    borderRadius: 4,
  },
  educationItem: {
    marginBottom: 8,
  },
  degree: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
  },
  school: {
    fontSize: 10,
    color: "#475569",
  },
  year: {
    fontSize: 9,
    color: "#94a3b8",
  },
  certItem: {
    marginBottom: 6,
  },
  certName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
  },
  certIssuer: {
    fontSize: 10,
    color: "#475569",
  },
  certDate: {
    fontSize: 9,
    color: "#94a3b8",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
  twoColumn: {
    flexDirection: "row",
    gap: 20,
  },
  column: {
    flex: 1,
  },
});

interface ResumeDocumentProps {
  resume: Resume;
  profile: Profile;
  workExperiences?: WorkExperience[];
}

// Resume PDF Document Component
const ResumeDocument = ({
  resume,
  profile,
  workExperiences,
}: ResumeDocumentProps) => (
  <Document>
    <Page size='A4' style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{profile.full_name}</Text>
        {resume.title && <Text style={styles.title}>{resume.title}</Text>}
        <View style={styles.contactInfo}>
          {profile.home_page_data?.callToAction?.email && (
            <Text style={styles.contactItem}>
              {profile.home_page_data.callToAction.email}
            </Text>
          )}
          {resume.location && (
            <Text style={styles.contactItem}>{resume.location}</Text>
          )}
          {profile.domain && (
            <Text style={styles.contactItem}>{profile.domain}</Text>
          )}
        </View>
      </View>

      {/* Summary */}
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
                  {formatDate(exp.start_date)} -{" "}
                  {exp.is_current ? "Present" : formatDate(exp.end_date)}
                </Text>
              </View>
              <Text style={styles.position}>{exp.position}</Text>
              {exp.location && (
                <Text style={styles.location}>{exp.location}</Text>
              )}
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

      {/* Inline Resume Experience (fallback if no work_experiences) */}
      {(!workExperiences || workExperiences.length === 0) &&
        resume.experience &&
        resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp, idx) => (
              <View key={idx} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.company}>{exp.company}</Text>
                  <Text style={styles.duration}>{exp.duration}</Text>
                </View>
                <Text style={styles.position}>{exp.position}</Text>
                {exp.description?.map((bullet, bidx) => (
                  <View key={bidx} style={styles.bulletPoint}>
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
              <Text key={idx} style={styles.skill}>
                {skill}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {resume.education.map((edu, idx) => (
            <View key={idx} style={styles.educationItem}>
              <Text style={styles.degree}>{edu.degree}</Text>
              <Text style={styles.school}>{edu.school}</Text>
              <Text style={styles.year}>{edu.year}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {resume.certifications.map((cert, idx) => (
            <View key={idx} style={styles.certItem}>
              <Text style={styles.certName}>
                {cert.url ? (
                  <Link src={cert.url} style={styles.link}>
                    {cert.name}
                  </Link>
                ) : (
                  cert.name
                )}
              </Text>
              <Text style={styles.certIssuer}>{cert.issuer}</Text>
              <Text style={styles.certDate}>{cert.date}</Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

// Helper function to format dates
function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      resume,
      profile,
      workExperiences,
    }: {
      resume: Resume;
      profile: Profile;
      workExperiences?: WorkExperience[];
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
