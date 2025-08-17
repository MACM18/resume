import ProjectClient from "./ProjectClient";

export default async function Pafe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectClient id={id} />;
}
