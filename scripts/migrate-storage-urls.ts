import { PrismaClient } from "@prisma/client";
import { extractStoragePath } from "../lib/storage-urls";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================");
  console.log("🔄 Starting Storage URL Migration");
  console.log("   Converting hardcoded URLs to relative image paths");
  console.log("==================================================\n");

  let profilesUpdated = 0;
  let projectsUpdated = 0;
  let galleryUpdated = 0;
  let uploadedResumesUpdated = 0;
  let resumesUpdated = 0;

  // 1. Migrate Profiles
  const profiles = await prisma.profile.findMany();
  console.log(`Checking ${profiles.length} profile(s)...`);
  for (const profile of profiles) {
    const newAvatar = extractStoragePath(profile.avatarUrl);
    const newBg = extractStoragePath(profile.backgroundImageUrl);
    const newFavicon = extractStoragePath(profile.faviconUrl);

    const hasAvatarChanged = newAvatar !== profile.avatarUrl;
    const hasBgChanged = newBg !== profile.backgroundImageUrl;
    const hasFaviconChanged = newFavicon !== profile.faviconUrl;

    if (hasAvatarChanged || hasBgChanged || hasFaviconChanged) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          avatarUrl: newAvatar,
          backgroundImageUrl: newBg,
          faviconUrl: newFavicon,
        },
      });
      profilesUpdated++;
      console.log(`  ✓ Updated profile: ${profile.fullName} (${profile.id})`);
      if (hasAvatarChanged) console.log(`    - avatarUrl: ${profile.avatarUrl} -> ${newAvatar}`);
      if (hasBgChanged) console.log(`    - backgroundImageUrl: ${profile.backgroundImageUrl} -> ${newBg}`);
      if (hasFaviconChanged) console.log(`    - faviconUrl: ${profile.faviconUrl} -> ${newFavicon}`);
    }
  }

  // 2. Migrate Projects
  const projects = await prisma.project.findMany();
  console.log(`\nChecking ${projects.length} project(s)...`);
  for (const project of projects) {
    if (!project.image) continue;
    const newImage = extractStoragePath(project.image);
    if (newImage !== project.image) {
      await prisma.project.update({
        where: { id: project.id },
        data: { image: newImage },
      });
      projectsUpdated++;
      console.log(`  ✓ Updated project: ${project.title} (${project.id})`);
      console.log(`    - image: ${project.image} -> ${newImage}`);
    }
  }

  // 3. Migrate Gallery Images
  const galleryImages = await prisma.galleryImage.findMany();
  console.log(`\nChecking ${galleryImages.length} gallery image(s)...`);
  for (const image of galleryImages) {
    const newUrl = extractStoragePath(image.url) || image.url;
    if (newUrl !== image.url) {
      await prisma.galleryImage.update({
        where: { id: image.id },
        data: { url: newUrl },
      });
      galleryUpdated++;
      console.log(`  ✓ Updated gallery image: ${image.id}`);
      console.log(`    - url: ${image.url} -> ${newUrl}`);
    }
  }

  // 4. Migrate Uploaded Resumes
  const uploadedResumes = await prisma.uploadedResume.findMany();
  console.log(`\nChecking ${uploadedResumes.length} uploaded resume(s)...`);
  for (const resume of uploadedResumes) {
    const newPublicUrl = extractStoragePath(resume.publicUrl);
    const newFilePath = extractStoragePath(resume.filePath) || resume.filePath;

    const hasPublicUrlChanged = newPublicUrl !== resume.publicUrl;
    const hasFilePathChanged = newFilePath !== resume.filePath;

    if (hasPublicUrlChanged || hasFilePathChanged) {
      await prisma.uploadedResume.update({
        where: { id: resume.id },
        data: {
          publicUrl: newPublicUrl,
          filePath: newFilePath,
        },
      });
      uploadedResumesUpdated++;
      console.log(`  ✓ Updated uploaded resume: ${resume.id}`);
      if (hasPublicUrlChanged) console.log(`    - publicUrl: ${resume.publicUrl} -> ${newPublicUrl}`);
      if (hasFilePathChanged) console.log(`    - filePath: ${resume.filePath} -> ${newFilePath}`);
    }
  }

  // 5. Migrate Resumes
  const resumes = await prisma.resume.findMany();
  console.log(`\nChecking ${resumes.length} resume record(s)...`);
  for (const resume of resumes) {
    if (!resume.resumeUrl) continue;
    const newResumeUrl = extractStoragePath(resume.resumeUrl);
    if (newResumeUrl !== resume.resumeUrl) {
      await prisma.resume.update({
        where: { id: resume.id },
        data: { resumeUrl: newResumeUrl },
      });
      resumesUpdated++;
      console.log(`  ✓ Updated resume: ${resume.role} (${resume.id})`);
      console.log(`    - resumeUrl: ${resume.resumeUrl} -> ${newResumeUrl}`);
    }
  }

  console.log("\n==================================================");
  console.log("✅ Migration Complete!");
  console.log(`   Profiles updated:         ${profilesUpdated}`);
  console.log(`   Projects updated:         ${projectsUpdated}`);
  console.log(`   Gallery images updated:   ${galleryUpdated}`);
  console.log(`   Uploaded resumes updated: ${uploadedResumesUpdated}`);
  console.log(`   Resumes updated:          ${resumesUpdated}`);
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
