import { notFound } from "next/navigation";
import { TrackerDashboard } from "@/components/build-tracker/tracker-dashboard";
import { inMemoryStore } from "@/lib/store/in-memory-store";

type TrackerPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function TrackerPage(props: TrackerPageProps) {
  const { projectId } = await props.params;
  const project = inMemoryStore.getProject(projectId);
  if (!project) {
    notFound();
  }
  return <TrackerDashboard project={project} />;
}
