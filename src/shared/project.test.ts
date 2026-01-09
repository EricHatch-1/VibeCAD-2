import { describe, expect, it } from "vitest";
import { applyProjectDefaults } from "./project";

describe("applyProjectDefaults", () => {
  it("fills in default schema values", () => {
    const project = applyProjectDefaults({
      project_id: "project-1",
      name: "Test Project",
      created_at: "2024-01-01T00:00:00Z"
    });

    expect(project.entrypoint).toBe("src/main.scad");
    expect(project.units).toBe("mm");
    expect(project.openscad).toEqual({
      backendDefault: "cgal",
      timeouts: {
        renderSec: 60,
        autopilotTotalSec: 300
      }
    });
    expect(project.llm).toEqual({
      providerId: null,
      visionPreferred: true
    });
  });

  it("preserves provided overrides", () => {
    const project = applyProjectDefaults({
      project_id: "project-2",
      name: "Overrides",
      created_at: "2024-02-01T00:00:00Z",
      entrypoint: "src/custom.scad",
      units: "in",
      openscad: {
        backendDefault: "manifold",
        timeouts: {
          renderSec: 10
        }
      },
      llm: {
        providerId: "openai",
        visionPreferred: false
      }
    });

    expect(project.entrypoint).toBe("src/custom.scad");
    expect(project.units).toBe("in");
    expect(project.openscad).toEqual({
      backendDefault: "manifold",
      timeouts: {
        renderSec: 10,
        autopilotTotalSec: 300
      }
    });
    expect(project.llm).toEqual({
      providerId: "openai",
      visionPreferred: false
    });
  });
});
