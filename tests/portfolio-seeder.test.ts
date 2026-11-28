import test from "node:test";
import assert from "node:assert/strict";
import { portfolioProjects } from "../lib/portfolio-seed-data";
import { seedOwnerPortfolio } from "../lib/portfolio-seeder";

test("seeds missing owner projects and clears legacy placeholders without replacing existing content", async () => {
  const ownerId = "owner-test";
  const confidentialWorkflow = portfolioProjects[7];
  const projects: any[] = [
    {
      id: portfolioProjects[0].sourceId,
      userId: ownerId,
      title: "My existing portfolio title",
      description: "Owner-written summary",
      longDescription: "Owner-written case study",
      image: "/placeholder.svg",
      tech: ["Custom tool"],
      demoUrl: null,
      githubUrl: null,
      featured: false,
      published: false,
      keyFeatures: ["Owner feature"],
      createdAt: new Date("2026-01-01"),
    },
    {
      id: confidentialWorkflow.sourceId,
      userId: ownerId,
      title: confidentialWorkflow.oldTitle,
      description: "Existing task summary",
      longDescription: "Existing task detail",
      image: "/placeholder.svg",
      tech: [],
      demoUrl: null,
      githubUrl: null,
      featured: false,
      published: true,
      keyFeatures: [],
      createdAt: new Date("2026-01-02"),
    },
  ];
  const profile: any = {
    userId: ownerId,
    fullName: "Owner",
    tagline: "Existing profile",
    homePageData: { name: "Keep this", technicalExpertise: [{ name: "Custom", skills: ["One"] }] },
    aboutPageData: { title: "Keep this too", skills: [{ category: "Custom", items: ["Two"] }] },
    activeResumeRole: "Developer",
  };
  const resume: any = { id: "resume-1", userId: ownerId, role: "Developer", skills: ["Existing skill"], updatedAt: new Date() };

  const tx: any = {
    profile: {
      findUnique: async () => structuredClone(profile),
      update: async ({ data }: any) => Object.assign(profile, structuredClone(data)),
    },
    project: {
      findMany: async ({ where, take }: any) => {
        const found = projects.find((project) => project.userId === where.userId && where.OR.some((condition: any) =>
          (condition.id && project.id === condition.id) ||
          (condition.title && [condition.title.in].flat().some((title: string) => title.toLowerCase() === project.title.toLowerCase())) ||
          (condition.githubUrl && project.githubUrl === condition.githubUrl) ||
          (condition.demoUrl && project.demoUrl === condition.demoUrl)));
        return found ? [structuredClone(found)].slice(0, take) : [];
      },
      upsert: async ({ create }: any) => {
        const found = projects.find((project) => project.id === create.id);
        if (found) return found;
        projects.push(structuredClone(create));
        return create;
      },
      update: async ({ where, data }: any) => Object.assign(projects.find((project) => project.id === where.id), structuredClone(data)),
    },
    resume: {
      findFirst: async () => structuredClone(resume),
      update: async ({ data }: any) => Object.assign(resume, structuredClone(data)),
      create: async ({ data }: any) => Object.assign(resume, structuredClone(data)),
    },
  };

  await seedOwnerPortfolio(tx, ownerId);
  await seedOwnerPortfolio(tx, ownerId);

  assert.equal(projects.length, portfolioProjects.length);
  assert.equal(projects[0].title, "My existing portfolio title");
  assert.equal(projects[0].description, "Owner-written summary");
  assert.equal(projects[0].longDescription, "Owner-written case study");
  assert.equal(projects[0].image, portfolioProjects[0].image);
  assert.equal(projects[0].featured, false);
  assert.equal(projects[0].published, false);
  assert.deepEqual(projects[0].keyFeatures.slice(0, 1), ["Owner feature"]);
  assert.ok(projects[0].tech.includes("Custom tool"));
  assert.equal(projects[1].image, null);
  assert.equal(profile.homePageData.name, "Keep this");
  assert.equal(profile.aboutPageData.title, "Keep this too");
  assert.equal(new Set(resume.skills).size, resume.skills.length);
  assert.equal(projects.filter((project) => project.title === portfolioProjects[1].title).length, 1);
});
