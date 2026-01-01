import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Hash passwords
  const defaultPassword = await bcrypt.hash("changeme123", 12);

  // ============================================================================
  // 1. CREATE USERS
  // ============================================================================
  console.log("Creating users...");

  const chathura = await prisma.user.upsert({
    where: { email: "chathura@macm.dev" },
    update: {},
    create: {
      id: "cluser_chathura_001",
      email: "chathura@macm.dev",
      passwordHash: defaultPassword,
      emailVerified: new Date("2025-12-09T09:10:10.585Z"),
      createdAt: new Date("2025-12-09T09:10:10.585Z"),
    },
  });
  console.log(`  ✓ Created user: ${chathura.email}`);

  const taniya = await prisma.user.upsert({
    where: { email: "taniya@taniya.dev" },
    update: {},
    create: {
      id: "cluser_taniya_002",
      email: "taniya@taniya.dev",
      passwordHash: defaultPassword,
      emailVerified: new Date("2025-12-09T13:10:13.323Z"),
      createdAt: new Date("2025-12-09T13:10:13.323Z"),
    },
  });
  console.log(`  ✓ Created user: ${taniya.email}`);

  // ============================================================================
  // 2. CREATE PROFILES
  // ============================================================================
  console.log("\nCreating profiles...");

  await prisma.profile.upsert({
    where: { userId: chathura.id },
    update: {},
    create: {
      id: "clprofile_chathura_001",
      userId: chathura.id,
      domain: "macm.dev",
      fullName: "Chathura Madhushanka",
      tagline: "Full Stack Developer - DevOps and AI",
      theme: {
        "--card": "222 47% 11%",
        "--ring": "186 100% 69%",
        "--input": "222 40% 15%",
        "--muted": "222 40% 15%",
        "--accent": "270 95% 75%",
        "--border": "222 40% 20%",
        "--popover": "222 47% 11%",
        "--primary": "93 54% 71%",
        "--glass-bg": "253 78% 18%",
        "--secondary": "217 100% 50%",
        "--background": "0 0% 38%",
        "--foreground": "210 40% 98%",
        "--destructive": "0 84.2% 60.2%",
        "--glass-border": "222 40% 25%",
        "--card-foreground": "210 40% 98%",
        "--muted-foreground": "215 20.2% 65.1%",
        "--accent-foreground": "222 47% 7%",
        "--popover-foreground": "210 40% 98%",
        "--primary-foreground": "222 47% 7%",
        "--background-secondary": "222 47% 9%",
        "--secondary-foreground": "222 47% 7%",
        "--destructive-foreground": "210 40% 98%",
      },
      contactNumbers: [
        {
          id: "contact-1765293336840",
          label: "Mobile",
          number: "+94 78 123 0 275",
          isActive: true,
          isPrimary: true,
        },
        {
          id: "contact-1765293373459",
          label: "Mobile - secondary",
          number: "+94 77 020 1218",
          isActive: true,
          isPrimary: false,
        },
      ],
      activeResumeRole: "Full stack developer",
      homePageData: {
        name: "Chathura Madhushanka",
        tagline: "Full Stack Developer - DevOps and AI",
        socialLinks: [
          {
            href: "https://github.com/MACM18",
            icon: "Fa.FaGithub",
            label: "FAGithub",
            platform: "FAGithub",
          },
          {
            href: "http://linkedin.com/in/chathura-m",
            icon: "Fa.FaLinkedinIn",
            label: "FALinkedin In",
            platform: "FALinkedin In",
          },
          {
            href: "https://x.com/chathur27358499?s=21",
            icon: "Bs.BsTwitterX",
            label: "BSTwitter X",
            platform: "BSTwitter X",
          },
        ],
        achievements: [],
        callToAction: {
          email: "chathura@macm.dev",
          title: "Let's Connect & Collaborate",
          description:
            "I'm always excited to discuss new opportunities, share ideas, or explore potential collaborations. Feel free to reach out!",
        },
        technicalExpertise: [
          { name: "Full stack development", skills: ["Next.js", "Wordpress"] },
          {
            name: "Frontedn development ",
            skills: ["React", "Javascript", "Typescript", "vue", "qwik", ""],
          },
          {
            name: "Backend and Database",
            skills: [
              "Laravel",
              "Express",
              "MySQL",
              "MongoDB",
              "Postgres",
              "Supabase",
            ],
          },
          {
            name: "Deployment",
            skills: [
              "Git",
              "Github",
              "CI/CD",
              "Github Actions",
              "Linux",
              "VPS managment",
            ],
          },
          { name: "Clould platfrom", skills: ["GCP and Azure - beginner"] },
        ],
        experienceHighlights: [
          {
            title: "Years experiance",
            metric: "2+",
            subtitle: "Development",
            description:
              "I have been working in the field as well as academic projects. Individual projects ",
          },
        ],
        about_card_description: "",
      },
      aboutPageData: {
        story: ["story pending"],
        title: "It's me",
        skills: [],
        subtitle:
          "Started as a dev and now moving with devops, AI. Continuing to widen my area of expertise.",
        callToAction: {
          email: "chathura@macm.dev",
          title: "Ready to Work Together?",
          description:
            "I'm always open to discussing new opportunities and interesting projects. Let's connect and see how we can create something amazing together.",
        },
        contactNumbers: [
          {
            id: "contact-1765293336840",
            label: "Mobile",
            number: "+94 78 123 0 275",
            isActive: true,
            isPrimary: true,
          },
          {
            id: "contact-1765293373459",
            label: "Mobile - secondary",
            number: "+94 77 020 1218",
            isActive: true,
            isPrimary: false,
          },
        ],
      },
      createdAt: new Date("2025-12-09T09:10:10.585Z"),
    },
  });
  console.log("  ✓ Created profile: macm.dev");

  await prisma.profile.upsert({
    where: { userId: taniya.id },
    update: {},
    create: {
      id: "clprofile_taniya_002",
      userId: taniya.id,
      domain: "taniya.dev",
      fullName: "Taniya Aththanayaka",
      tagline: "Welcome to my portfolio",
      theme: {
        accent: "280 80% 50%",
        primary: "221 83% 53%",
        "accent-glow": "280 80% 60%",
        "primary-glow": "221 83% 63%",
        "primary-muted": "221 83% 23%",
        "primary-foreground": "0 0% 100%",
      },
      homePageData: {
        name: "Taniya",
        tagline: "Welcome to my portfolio",
        socialLinks: [],
        achievements: [],
        callToAction: {
          email: "machathuramadushanka@outlook.com",
          title: "Let's Connect",
          description: "I'm always open to discussing new opportunities.",
        },
        technicalExpertise: [],
        experienceHighlights: [],
      },
      aboutPageData: {
        story: ["Tell your story here..."],
        title: "About Me",
        skills: [],
        subtitle: "My Journey",
        callToAction: {
          email: "machathuramadushanka@outlook.com",
          title: "Get in Touch",
          description: "Let's work together!",
        },
      },
      createdAt: new Date("2025-12-09T13:10:13.323Z"),
    },
  });
  console.log("  ✓ Created profile: taniya.dev");

  // ============================================================================
  // 3. CREATE UPLOADED RESUMES
  // ============================================================================
  console.log("\nCreating uploaded resumes...");

  const uploadedResume = await prisma.uploadedResume.upsert({
    where: { id: "clupload_resume_001" },
    update: {},
    create: {
      id: "clupload_resume_001",
      userId: chathura.id,
      filePath: `${chathura.id}/Full-stack-developer-1765330381481.pdf`,
      publicUrl: null, // Will need to re-upload to new S3 storage
      originalFilename: "Chathura Madhushanka-Resume.pdf",
      fileSize: 54485,
      createdAt: new Date("2025-12-10T01:33:11.132Z"),
    },
  });
  console.log(`  ✓ Created uploaded resume: ${uploadedResume.originalFilename}`);

  // ============================================================================
  // 4. CREATE RESUMES
  // ============================================================================
  console.log("\nCreating resumes...");

  await prisma.resume.upsert({
    where: { id: "clresume_001" },
    update: {},
    create: {
      id: "clresume_001",
      userId: chathura.id,
      role: "Full stack developer",
      title: "",
      summary:
        "As a versatile Full Stack Developer with a strong foundation in development, I am expanding my expertise into DevOps and AI, driven by a passion for continuous learning and growth. With a solid understanding of software development principles, I am poised to leverage my skills in innovative projects that integrate DevOps and AI. I am excited to collaborate with like-minded professionals and explore new opportunities that combine technology and creativity. With a strong desire to deliver exceptional results, I am ready to bring my skills and enthusiasm to a dynamic team and contribute to the development of cutting-edge solutions.",
      skills: [
        "Next.js",
        "Laravel",
        "AI assisted Development",
        "React",
        "Wordpress",
        "SQL",
      ],
      experience: [],
      education: [
        {
          year: "2025",
          degree: "Bachelor of Information Communication Technology (Hons.)",
          school: "University of Jaffna",
        },
      ],
      certifications: [],
      projectIds: [],
      resumeUrl: null, // Will need to re-generate or re-upload
      pdfSource: "uploaded",
      location: "No 89, Welikala, Pokunuwita, Sri Lanka",
      uploadedResumeId: uploadedResume.id,
      createdAt: new Date("2025-12-10T01:35:18.238Z"),
    },
  });
  console.log("  ✓ Created resume: Full stack developer");

  // ============================================================================
  // 5. CREATE WORK EXPERIENCES
  // ============================================================================
  console.log("\nCreating work experiences...");

  await prisma.workExperience.upsert({
    where: { id: "clwork_001" },
    update: {},
    create: {
      id: "clwork_001",
      userId: chathura.id,
      company: "Altitude1 Pvt. Ltd",
      position: "Web Application Developer",
      location: "Colombo",
      startDate: new Date("2025-04-01"),
      endDate: null,
      isCurrent: true,
      visible: true,
      description: [],
      createdAt: new Date("2025-12-10T01:31:05.762Z"),
    },
  });
  console.log("  ✓ Created work experience: Web Application Developer (current)");

  await prisma.workExperience.upsert({
    where: { id: "clwork_002" },
    update: {},
    create: {
      id: "clwork_002",
      userId: chathura.id,
      company: "Altitude1 Pvt. Ltd",
      position: "Associate web developer",
      location: "Colombo",
      startDate: new Date("2024-09-01"),
      endDate: new Date("2024-11-01"),
      isCurrent: false,
      visible: true,
      description: [],
      createdAt: new Date("2025-12-10T01:30:04.344Z"),
    },
  });
  console.log("  ✓ Created work experience: Associate web developer");

  await prisma.workExperience.upsert({
    where: { id: "clwork_003" },
    update: {},
    create: {
      id: "clwork_003",
      userId: chathura.id,
      company: "Altitude1 Pvt. Ltd",
      position: "Wordpress Developerr",
      location: "Colombo",
      startDate: new Date("2024-03-01"),
      endDate: new Date("2024-09-01"),
      isCurrent: false,
      visible: true,
      description: [],
      createdAt: new Date("2025-12-10T01:29:15.217Z"),
    },
  });
  console.log("  ✓ Created work experience: Wordpress Developer");

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📝 Notes:");
  console.log("   - All users have password: changeme123");
  console.log("   - Please change passwords after first login");
  console.log("   - Storage files need to be re-uploaded to S3");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
