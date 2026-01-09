export type OpenScadTimeouts = {
  renderSec: number;
  autopilotTotalSec: number;
};

export type OpenScadSettings = {
  backendDefault: "cgal" | "manifold";
  timeouts: OpenScadTimeouts;
};

export type LlmSettings = {
  providerId: string | null;
  visionPreferred: boolean;
};

export type ProjectJson = {
  project_id: string;
  name: string;
  created_at: string;
  entrypoint: string;
  units: "mm" | "in";
  openscad: OpenScadSettings;
  llm: LlmSettings;
};

export type ProjectJsonInput = {
  project_id: string;
  name: string;
  created_at: string;
  entrypoint?: string;
  units?: "mm" | "in";
  openscad?: Partial<OpenScadSettings> & {
    timeouts?: Partial<OpenScadTimeouts>;
  };
  llm?: Partial<LlmSettings>;
};

export const applyProjectDefaults = (input: ProjectJsonInput): ProjectJson => {
  return {
    project_id: input.project_id,
    name: input.name,
    created_at: input.created_at,
    entrypoint: input.entrypoint ?? "src/main.scad",
    units: input.units ?? "mm",
    openscad: {
      backendDefault: input.openscad?.backendDefault ?? "cgal",
      timeouts: {
        renderSec: input.openscad?.timeouts?.renderSec ?? 60,
        autopilotTotalSec: input.openscad?.timeouts?.autopilotTotalSec ?? 300
      }
    },
    llm: {
      providerId: input.llm?.providerId ?? null,
      visionPreferred: input.llm?.visionPreferred ?? true
    }
  };
};
