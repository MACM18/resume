export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  tech: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export interface Resume {
  role: string;
  title: string;
  summary: string;
  experience: {
    company: string;
    position: string;
    duration: string;
    description: string[];
  }[];
  skills: string[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  projects: string[]; // Project IDs
}

export const projects: Project[] = [
  {
    id: "glassmorphic-dashboard",
    title: "Glassmorphic Dashboard",
    description: "Modern analytics dashboard with glassmorphism design",
    longDescription: "A comprehensive analytics dashboard featuring glassmorphic design principles, real-time data visualization, and smooth animations. Built with React, TypeScript, and Framer Motion.",
    image: "/placeholder.svg",
    tech: ["React", "TypeScript", "Framer Motion", "Tailwind CSS", "Chart.js"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    featured: true
  },
  {
    id: "ai-portfolio-generator",
    title: "AI Portfolio Generator",
    description: "AI-powered tool for creating stunning portfolios",
    longDescription: "An innovative AI-powered platform that generates personalized portfolio websites based on user preferences and career goals. Features dynamic content generation and adaptive layouts.",
    image: "/placeholder.svg",
    tech: ["Next.js", "OpenAI API", "Prisma", "PostgreSQL", "Tailwind CSS"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    featured: true
  },
  {
    id: "realtime-chat-app",
    title: "Real-time Chat Application",
    description: "Modern chat app with real-time messaging",
    longDescription: "A feature-rich real-time chat application with message encryption, file sharing, and group conversations. Built with modern web technologies for optimal performance.",
    image: "/placeholder.svg",
    tech: ["Socket.io", "Node.js", "React", "MongoDB", "Redis"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/example",
    featured: false
  }
];

export const resumes: Record<string, Resume> = {
  developer: {
    role: "developer",
    title: "Full Stack Developer",
    summary: "Passionate full-stack developer with 5+ years of experience creating modern web applications using React, Node.js, and cloud technologies. Specialized in building scalable solutions with clean, maintainable code.",
    experience: [
      {
        company: "Tech Solutions Inc.",
        position: "Senior Full Stack Developer",
        duration: "2022 - Present",
        description: [
          "Led development of 3 major web applications serving 10k+ users",
          "Implemented CI/CD pipelines reducing deployment time by 60%",
          "Mentored junior developers and conducted code reviews"
        ]
      },
      {
        company: "StartupXYZ",
        position: "Frontend Developer",
        duration: "2020 - 2022",
        description: [
          "Built responsive React applications with TypeScript",
          "Optimized application performance resulting in 40% faster load times",
          "Collaborated with design team to implement pixel-perfect UIs"
        ]
      }
    ],
    skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "GraphQL", "PostgreSQL"],
    education: [
      {
        degree: "Bachelor of Computer Science",
        school: "University of Technology",
        year: "2020"
      }
    ],
    projects: ["glassmorphic-dashboard", "ai-portfolio-generator"]
  },
  designer: {
    role: "designer",
    title: "UI/UX Designer",
    summary: "Creative UI/UX designer with a passion for creating intuitive and beautiful digital experiences. Specialized in design systems, user research, and modern design trends.",
    experience: [
      {
        company: "Design Studio Pro",
        position: "Senior UI/UX Designer",
        duration: "2021 - Present",
        description: [
          "Designed user interfaces for 15+ web and mobile applications",
          "Created comprehensive design systems used across multiple products",
          "Conducted user research and usability testing"
        ]
      }
    ],
    skills: ["Figma", "Adobe Creative Suite", "Prototyping", "User Research", "Design Systems", "HTML/CSS"],
    education: [
      {
        degree: "Bachelor of Fine Arts in Digital Design",
        school: "Art Institute",
        year: "2021"
      }
    ],
    projects: ["glassmorphic-dashboard"]
  }
};