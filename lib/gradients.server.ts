import { db } from "./db";

export async function getGradientById(id: string) {
  try {
    const gradient = await db.gradient.findUnique({ where: { id } });
    return gradient || null;
  } catch (error) {
    console.error("Error fetching gradient by id:", error);
    return null;
  }
}

export async function listGradients() {
  try {
    return await db.gradient.findMany({ orderBy: { createdAt: "asc" } });
  } catch (error) {
    console.error("Error listing gradients:", error);
    return [];
  }
}
