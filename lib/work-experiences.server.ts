import { db } from "./db";
import { getSiteOwnerId } from "./site-owner";
import { WorkExperience } from "@/types/portfolio";
import { cache } from "react";

export const getVisibleWorkExperiencesServer = cache(async function getVisibleWorkExperiencesServer(
  domain: string,
): Promise<WorkExperience[]> {
  void domain;
  const ownerId = await getSiteOwnerId();
  if (!ownerId) return [];

  try {
    const experiences = await db.workExperience.findMany({
      where: {
        userId: ownerId,
        visible: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return experiences.map((exp) => ({
      id: exp.id,
      user_id: exp.userId,
      company: exp.company,
      position: exp.position,
      location: exp.location || undefined,
      start_date: exp.startDate.toISOString(),
      end_date: exp.endDate?.toISOString() || null,
      is_current: exp.isCurrent,
      description: exp.description,
      visible: exp.visible,
      created_at: exp.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching work experiences (server):", error);
    return [];
  }
});

export const getCurrentWorkServer = cache(async function getCurrentWorkServer(
  domain: string,
): Promise<WorkExperience | null> {
  const experiences = await getVisibleWorkExperiencesServer(domain);
  if (experiences.length === 0) return null;

  // Prefer one marked as current, otherwise the most recent one
  const current = experiences.find((exp) => exp.is_current);
  return current || experiences[0];
});
