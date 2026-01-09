import { useEffect, useState } from "react";
import type { ProjectListItem } from "../shared/ipc";

type CreateState = {
  name: string;
  status: "idle" | "saving" | "error";
  errorMessage?: string;
};

export default function ProjectLibrary() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading");
  const [createState, setCreateState] = useState<CreateState>({
    name: "",
    status: "idle"
  });

  const loadProjects = async () => {
    setStatus("loading");
    try {
      const data = await window.vibeCad.listProjects();
      setProjects(data);
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateState((prev) => ({ ...prev, status: "saving", errorMessage: undefined }));

    try {
      const response = await window.vibeCad.createProject({ name: createState.name });
      setProjects((prev) => [response.project, ...prev]);
      setCreateState({ name: "", status: "idle" });
    } catch (error) {
      console.error(error);
      setCreateState({
        name: createState.name,
        status: "error",
        errorMessage: "Unable to create project."
      });
    }
  };

  return (
    <section className="library">
      <div className="library__header">
        <div>
          <h2>Project Library</h2>
          <p>Manage your local VibeCAD projects.</p>
        </div>
        <form className="library__form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="New project name"
            value={createState.name}
            onChange={(event) =>
              setCreateState((prev) => ({ ...prev, name: event.target.value }))
            }
          />
          <button type="submit" disabled={createState.status === "saving"}>
            {createState.status === "saving" ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      {createState.status === "error" && (
        <p className="library__error">{createState.errorMessage}</p>
      )}

      {status === "loading" && <p>Loading projects...</p>}
      {status === "error" && <p>Unable to load projects.</p>}
      {status === "idle" && projects.length === 0 && (
        <p>No projects yet. Create one to get started.</p>
      )}

      {projects.length > 0 && (
        <ul className="library__list">
          {projects.map((project) => (
            <li key={project.project_id} className="library__item">
              <div>
                <h3>{project.name}</h3>
                <p>{project.entrypoint}</p>
              </div>
              <button
                type="button"
                onClick={() => window.vibeCad.openProject({ projectId: project.project_id })}
              >
                Open
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
