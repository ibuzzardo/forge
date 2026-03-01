import { notFound } from "next/navigation";
import { TrackerDashboard } from "@/components/build-tracker/tracker-dashboard";
import { inMemoryStore } from "@/lib/store/in-memory-store";

interface TrackerPageProps {
  params: { projectId: string };
}

export default function TrackerPage({ params }: TrackerPageProps): JSX.Element {
  const project = inMemoryStore.getProject(params.projectId);
  if (!project) {
    notFound();
  }
  return <TrackerDashboard project={project} />;
}
