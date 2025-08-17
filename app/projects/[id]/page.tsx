import ProjectClient from "./ProjectClient";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <ProjectClient id={params.id} />;
}