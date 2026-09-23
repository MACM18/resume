import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { db } from "./db";

export const getSiteOwnerId = cache(async (): Promise<string | null> => {
  const site = await db.siteSettings.findUnique({ where: { id: 1 }, select: { ownerUserId: true } });
  return site?.ownerUserId ?? null;
});

export async function getOwnerSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const ownerId = await getSiteOwnerId();
  return ownerId === session.user.id ? session : null;
}
