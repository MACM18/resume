export const portfolioProjects = [
  {
    sourceId: "cmkikczbt0003ln01q00ycpho", oldTitle: "Personal portfolio", title: "Personal portfolio and content platform",
    description: "Built this portfolio as a full-stack application with a private content dashboard, resume management, visual themes and S3-compatible media storage.",
    longDescription: "This portfolio is a Next.js application backed by NextAuth, Prisma and PostgreSQL. I built an owner-only dashboard to edit the public profile, projects, resumes, gallery and theme without redeploying. Images and PDFs are stored in S3-compatible storage. The application runs in Docker, with database migrations applied at startup and existing content retained for rollback. The design keeps public pages separate from authenticated editing routes.",
    image: "https://cdn.macm.dev/portfolio-macm/project-images/cmj8uwynb0000nj0jnkb3tk15/1785893582791.webp", tech: ["Next.js", "TypeScript", "NextAuth", "Prisma", "PostgreSQL", "Docker", "S3-compatible storage"],
    demoUrl: "https://macm.dev", githubUrl: "https://github.com/MACM18/resume", featured: true,
    keyFeatures: ["Owner-only content dashboard", "Project and resume management", "S3-compatible media", "Theme customization", "Docker deployment"],
  },
  {
    sourceId: "cmkik07gh0001ln01fmlti21v", oldTitle: "Company management Dashboard and landing page - NNS", title: "NNS company management dashboard",
    description: "Built a company management dashboard and landing page with role-based access, Google Sheets integration and a PostgreSQL-backed workflow.",
    longDescription: "NNS began as a public landing page and grew into an authenticated dashboard for company workflows. I implemented the application with Next.js, authentication and role-based authorization, PostgreSQL data management and Google Sheets integration. The data layer moved from Supabase to a separately hosted PostgreSQL setup as the application evolved. The dashboard remains in active development.",
    image: "https://cdn.macm.dev/portfolio-macm/project-images/cmj8uwynb0000nj0jnkb3tk15/1768669234474.webp", tech: ["Next.js", "Prisma", "PostgreSQL", "NextAuth", "Google Sheets API"],
    demoUrl: "https://nns.macm.dev", githubUrl: "https://github.com/MACM18/NNS", featured: true,
    keyFeatures: ["Role-based authorization", "Google Sheets integration", "PostgreSQL data management", "Authenticated dashboard"],
  },
  {
    sourceId: "seed_macm_studio", oldTitle: "MACM Studio", title: "MACM Studio website and project estimator",
    description: "Designed and built the MACM Studio website with a guided project estimator, enquiry flow, and client workspace.",
    longDescription: "The MACM Studio platform brings the studio's public website and project planning journey together. Visitors can explore services, shape a project estimate, and send an enquiry. The private workspace supports client communication and project updates, with a focus on clear scope, careful data handling, and practical handover.",
    image: null, tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Docker", "Email and Telegram integrations"],
    demoUrl: "https://macm.lk", githubUrl: "https://github.com/MACM18/macm-studio", featured: true,
    keyFeatures: ["Interactive project estimator", "Lead intake workflow", "Private client workspace", "Project updates and handover"],
  },
  {
    sourceId: "seed_daymark_store_desk", oldTitle: "Daymark Store Desk", title: "Daymark Store Desk",
    description: "Built a focused store management system for checkout, inventory, cash reconciliation, and team operations.",
    longDescription: "Daymark Store Desk supports the daily work behind a single store, from opening the cash drawer and recording sales to receiving stock, managing prices, and reviewing expenses. Role-based access keeps owner, manager, and cashier tasks clear. The installable app also supports offline checkout capture and later synchronization for interrupted connections.",
    image: null, tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "PWA", "Docker"],
    demoUrl: "https://shop.macm.dev", githubUrl: "https://github.com/MACM18/Store-system", featured: false,
    keyFeatures: ["Checkout and cash reconciliation", "Inventory and price management", "Owner, manager, and cashier roles", "Offline checkout capture"],
  },
  {
    sourceId: "seed_macm_books", oldTitle: "MACM Books", title: "MACM Books bookkeeping platform",
    description: "Built a bookkeeping platform for small organizations, with Sri Lankan tax filing preparation workflows.",
    longDescription: "MACM Books brings everyday bookkeeping into a guided workflow for invoices, receipts, expenses, bank statement reconciliation, and financial reports. It includes preparation tools for Sri Lankan filing periods, while keeping review and submission with the business owner. Organization roles and plan access control keep records scoped to each business.",
    image: null, tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "PayHere", "Docker"],
    demoUrl: null, githubUrl: "https://github.com/MACM18/tax-system-macm", featured: false,
    keyFeatures: ["Guided bookkeeping workflows", "Bank statement matching and reconciliation", "Financial reports and review snapshots", "Sri Lankan filing preparation packs"],
  },
  {
    sourceId: "seed_karate_iks", oldTitle: "Karate IKS", title: "Karate IKS training management system",
    description: "Built a training and organization management system for karate programs, instructors, and student progression.",
    longDescription: "Karate IKS brings program administration and student progress into one workspace. It supports curriculum and exam planning, attendance, belt progression, instructor and staff management, and achievement records. The interface is designed around clear workflows for instructors and administrators.",
    image: null, tech: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Docker"],
    demoUrl: null, githubUrl: "https://github.com/MACM18/karate-IKS", featured: false,
    keyFeatures: ["Curriculum and exam management", "Attendance and check-in tools", "Belt progression tracking", "Instructor and staff management"],
  },
  {
    sourceId: "seed_confidential_company_management", oldTitle: "Confidential company management system", title: "Confidential company management system",
    description: "Built a company management system for organizing operational records and supporting team workflows.",
    longDescription: "A confidential company management system with practical tools for organizing company information and day-to-day operations. The company identity, customer data, screenshots, source links, and detailed workflows are intentionally omitted.",
    image: null, tech: ["Laravel", "PHP", "MySQL", "Blade", "Docker"],
    demoUrl: null, githubUrl: null, featured: false,
    keyFeatures: ["Company operations management", "Organized internal records", "Team workflow support"],
  },
  {
    sourceId: "cmu44cwij0001sx01agud8z4x", oldTitle: "Automated Workflow & Task Management System", title: "Daily task and team monitoring PWA",
    description: "Built a task platform with recurring schedules, backlog carryover, subtask tracking, email digests, Telegram alerts and team reporting.",
    longDescription: "TaskFlow supports both personal focus and team coordination. Unfinished tasks can roll into a backlog, recurring schedules create new work, and subtasks show progress. The application sends configurable email digests and Telegram notifications, keeps editable email logs and produces periodic reports. These automations reduce manual coordination while leaving room for review before messages are sent.",
    image: null, tech: ["Next.js", "Prisma", "PostgreSQL", "Email automation", "Telegram"],
    demoUrl: "https://todo.macm.dev", githubUrl: "https://github.com/MACM18/to-do_at1", featured: false,
    keyFeatures: ["Recurring schedules", "Backlog carryover", "Subtask tracking", "Email digests", "Telegram alerts", "Periodic reports"],
  },
  {
    sourceId: "cmkikmqiz0005ln010urrv14l", oldTitle: "Mail server deployment", title: "Self-hosted mail and application infrastructure",
    description: "Built and operate a home lab and VPS setup for application hosting, Dokploy deployments, and self-hosted mail services.",
    longDescription: "I maintain the infrastructure behind my applications, combining a home lab with Linux VPS hosting. Docker and Dokploy support repeatable deployments, while self-hosted mail services, DNS, Cloudflare routing, TLS, and backups keep the surrounding services working. This project shows the operational side of taking an application from code to a maintained service.",
    image: null, tech: ["Home lab", "Linux VPS", "Docker", "Docker Compose", "Dokploy", "Mail servers", "Cloudflare"],
    demoUrl: null, githubUrl: null, featured: false,
    keyFeatures: ["Home lab and VPS operations", "Docker and Dokploy deployments", "Self-hosted mail server administration", "DNS, TLS, and Cloudflare routing"],
  },
] as const;

export const portfolioHomeSkills = [
  { name: "Homelab and VPS infrastructure", skills: ["Home lab", "Linux VPS", "Docker", "Docker Compose", "Dokploy", "CI/CD", "GitHub Actions"] },
  { name: "Mail and network services", skills: ["Self-hosted mail servers", "DNS", "Cloudflare", "TLS", "S3-compatible storage"] },
] as const;

export const portfolioAboutSkills = [
  { category: "Homelab and VPS", icon: "Gi.GiCloudUpload", items: ["Home lab", "Linux VPS", "Docker", "Docker Compose", "Dokploy", "GitHub Actions"] },
  { category: "Mail and network services", icon: "Fa.FaServer", items: ["Self-hosted mail servers", "DNS", "Cloudflare", "TLS", "S3-compatible storage"] },
] as const;

export const portfolioResumeSkills = ["Home lab", "Linux VPS", "Docker", "Docker Compose", "Dokploy", "Mail server administration", "Cloudflare", "DNS", "TLS"] as const;
