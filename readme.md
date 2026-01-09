Developer Handoff Package

VibeCAD – Local-First LLM + OpenSCAD Project-Based CAD App (Electron)

This is a complete spec you can paste into GPT-5 Codex to begin implementation. It includes product scope, UX, architecture, data model, OpenSCAD CLI templates, agent/tool loop (with vision snapshots), IDE + SCAD import, and an evaluation plan for SCAD-generation models.

⸻

1) Product vision

A draftsman AI for engineered, parametric OpenSCAD.
Users describe practical/mechanical parts (brackets, enclosures, mounts). The app generates clean .scad, renders locally with OpenSCAD into a preview PNG + STL, and iterates using build logs, geometry summaries, and (when supported) rendered snapshots sent to a vision-capable model.

⸻

2) Goals and non-goals

Goals
	•	Fast path to printable STL (via local OpenSCAD export).
	•	Clean, reusable parametric OpenSCAD (modules, named parameters, minimal magic numbers).
	•	Project-based workflow: create/import projects, manage files, version tree with thumbnails.
	•	Iterative agent loop:
	•	reads build errors/warnings
	•	optionally “sees” rendered PNG snapshots for shape correctness (vision)
	•	can self-iterate (Autopilot) or assist (user approval)

Non-goals (MVP)
	•	Multi-user collaboration / accounts
	•	Cloud file storage (LLM can be cloud, but files remain local)
	•	Full CAD constraint solving or advanced mesh repair
	•	Supporting many CAD formats beyond .scad and .stl

⸻

3) Core user workflows

A) New model workflow
	1.	Create Project (template: Blank / Bracket / Enclosure).
	2.	Type prompt (optionally “Clarify first”).
	3.	AI generates OpenSCAD in IDE.
	4.	Click Build (or Autopilot builds).
	5.	See 3D preview + rendered PNG + errors/warnings.
	6.	Adjust sliders (auto-detected parameters).
	7.	Say “make walls thicker and add fillets” and optionally click/highlight a region.
	8.	Iterate until satisfied.
	9.	Export STL.

B) Import existing SCAD workflow (copy into workspace)
	1.	Import .scad file or folder.
	2.	App copies into workspace and chooses entrypoint.
	3.	Build baseline v1 (preview + STL + logs).
	4.	Use AI to refactor/improve/parameterize while preserving full version history.

C) Project management workflow
	•	Home “Project Library”:
	•	Create, Import, Rename, Duplicate, Delete (move to app trash), Search, Open Recent
	•	Single window: one active project at a time.

⸻

4) Product features

4.1 Project-first system
	•	Workspace root (user configurable), default ~/Documents/VibeCAD/Projects/
	•	Projects are folders with project.json, src/, and versions/ snapshots/artifacts.

4.2 Rich SCAD IDE
	•	Monaco Editor with OpenSCAD syntax highlighting (Monarch).  ￼
	•	File tree, tabs, search/replace, bracket matching.
	•	Optional upgrade: LSP integration using monaco-languageclient.  ￼

OpenSCAD LSP options:
	•	dzhu/openscad-language-server uses tree-sitter.  ￼
	•	Leathong/openscad-LSP (and VSCode extension) also available.  ￼

4.3 Local rendering + exports via OpenSCAD CLI
	•	Build pipeline produces:
	•	preview.png (rendered snapshot)
	•	model.stl
	•	summary.json (stats for sanity checks)
	•	openscad.log (stdout/stderr)
	•	OpenSCAD CLI supports exporting output by extension and generating a summary file.  ￼

4.4 Vision snapshots for iteration
	•	When provider supports vision: send preview.png (and optionally a “selected region” screenshot) to the model to critique the design and guide edits.
	•	Ollama vision accepts an images array in API requests.  ￼
	•	LM Studio OpenAI-compatible endpoints explicitly support Chat Completions with text and images.  ￼

4.5 Agent modes
	•	Assist: AI proposes a patch, user clicks Apply.
	•	Hybrid: AI iterates automatically but pauses at checkpoints.
	•	Autopilot: AI iterates until pass criteria or limits.

4.6 Version tree with thumbnails
	•	Versions are nodes: v1, v2, v2.1, etc.
	•	Each node contains:
	•	src_snapshot/ (entire source tree at that version)
	•	artifacts/ (png/stl/summary/log)
	•	Tree view shows thumbnail preview and change summary.

4.7 Parameter sliders
	•	Auto-detect parameters from:
	•	top-level assignments
	•	optional conventions (Customizer-like comments)
	•	Parameter changes rebuild quickly by passing defines to OpenSCAD (implementation detail: -D name=value is supported in OpenSCAD CLI).  ￼

4.8 Backend option: CGAL vs Manifold
	•	Provide a toggle in settings: Default CGAL; optional Manifold.
	•	OpenSCAD supports selecting Manifold backend via --backend=manifold in newer builds; CGAL remains default.  ￼
	•	Manifold’s goal is reliable manifold output, aligned with 3D printing needs.  ￼
	•	Implement fallback: if Manifold errors/warnings, retry build with CGAL.

⸻

5) Technical architecture

5.1 Tech stack
	•	Electron (single-window desktop)
	•	Renderer: React + TypeScript
	•	Main process:
	•	filesystem, OpenSCAD runner, LLM calls, SQLite index
	•	3D viewer: three.js (or React Three Fiber)
	•	IDE: Monaco Editor (syntax highlighting via Monarch).  ￼
	•	LSP (optional): monaco-languageclient + OpenSCAD language server.  ￼

5.2 Process separation
	•	Renderer never touches filesystem or API keys directly.
	•	Main process:
	•	spawns OpenSCAD CLI
	•	reads/writes project files
	•	calls LLM providers
	•	streams results to renderer via IPC

5.3 macOS PATH reliability (critical)

Packaged GUI apps often do not inherit shell PATH. Use fix-path in main process at startup.  ￼

⸻

6) Data model and on-disk layout

6.1 Workspace layout

<workspace>/
  Projects/
    <ProjectName>/
      project.json
      src/
      versions/
      cache/
  .trash/
    <project_id>/

6.2 Project folder layout

<ProjectName>/
  project.json
  src/
    main.scad
    ...
  versions/
    v1/
      src_snapshot/...
      artifacts/
        preview.png
        preview_selected.png   (optional)
        model.stl
        summary.json
        build.json
        openscad.log
    v2.1/...
  cache/
    thumbnails/

6.3 project.json (schema)
	•	project_id (uuid)
	•	name
	•	created_at
	•	entrypoint (default src/main.scad)
	•	units (“mm” default)
	•	openscad:
	•	backendDefault: “cgal”
	•	timeouts: { renderSec, autopilotTotalSec }
	•	llm:
	•	providerId (points to global settings)
	•	visionPreferred: true/false

6.4 Global project index (SQLite)

A global DB (in app data dir) tracks project list and recents:
	•	projects(project_id, name, path, entrypoint, created_at, updated_at, last_opened_at, thumbnail_path, deleted_at)

⸻

7) OpenSCAD runner specification

7.1 Detection

Check:
	•	/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD
	•	user configured path
	•	PATH resolved binary (fix-path helps)  ￼

If missing: show “Install OpenSCAD” link and “Locate…” option.

7.2 Build outputs

For a given version node:
	•	working directory: versions/<vid>/src_snapshot/
	•	entrypoint file path inside snapshot

7.3 Command templates (recommended)

Use separate runs or a single run with -o depending on behavior; simplest is separate calls:

STL export
	•	openscad -o artifacts/model.stl <entrypoint.scad>

PNG snapshot
	•	openscad -o artifacts/preview.png --imgsize=1200,900 --viewall --autocenter --render <entrypoint.scad>

Summary JSON
	•	openscad --summary=all --summary-file artifacts/summary.json -o artifacts/model.stl <entrypoint.scad>

OpenSCAD CLI options and summary support are documented in command-line references.  ￼

Backend
	•	CGAL default (no flag)
	•	Manifold: openscad --backend=manifold ...  ￼
If Manifold build fails or produces critical warnings, retry once with CGAL.

7.4 Guardrails
	•	per-build timeout (kill process)
	•	--csglimit when in autopilot to avoid runaway complexity (supported on CLI option list)  ￼
	•	capture stdout+stderr to openscad.log
	•	store build.json with command, args, exit code, duration, backend, defines

⸻

8) 3D viewer + point-and-edit selection

8.1 Viewer features
	•	Load STL (from current version)
	•	Orbit, pan, zoom
	•	Measure tool (distance)
	•	Click selection (raycast) + highlight

8.2 Selection context object

When user clicks:
	•	hitPoint: [x,y,z]
	•	normal: [nx,ny,nz]
	•	faceIndex
	•	timestamp
	•	Optional: viewer screenshot with highlight saved as preview_selected.png

8.3 How AI uses selection in OpenSCAD reality

OpenSCAD is CSG and parameter-driven, so “edit this face” becomes:
	•	identify which module/parameter likely controls that region
	•	adjust parameters (wall thickness, chamfer, fillet approximation)
	•	refactor code (if needed) into named modules to make localized edits possible

⸻

9) LLM provider layer (OpenAI-compatible endpoints)

9.1 Requirements
	•	Support:
	•	OpenAI cloud
	•	OpenAI-compatible local endpoints (Ollama, LM Studio)
	•	User supplies API key (and base URL for local endpoints)

9.2 Vision capability flag
	•	supportsVision: boolean
	•	If true: send PNG snapshots to LLM
	•	If false: omit images and rely on logs/summary + code reasoning

Ollama vision images arrays are documented.  ￼
LM Studio states chat completions support text and images.  ￼

9.3 Structured outputs (optional)

If endpoint supports structured outputs, request JSON schemas for reliable tool decisions (bump major/minor, files to edit). Ollama documents structured outputs capability.  ￼

⸻

10) Agent/tool loop design (the “draftsman”)

10.1 Tools exposed to the model

All tool calls are mediated by the app (main process). The model never directly runs executables or writes arbitrary paths.

Project & files
	•	list_files(projectId, root="src/") -> FileNode[]
	•	read_file(projectId, path) -> text
	•	write_file(projectId, path, text) -> ok

Build
	•	run_openscad(projectId, entrypoint, defines, backend, timeoutSec) -> {versionId, exitCode, logPath, summaryPath, previewPath, stlPath}

Versioning
	•	commit_version(projectId, parentVersionId, bump: "major"|"minor", summary) -> versionId
	•	checkout_version(projectId, versionId) -> ok (restores src/ from src_snapshot)

Selection
	•	get_selection_context() -> SelectionContext
	•	save_selection_snapshot() -> preview_selected.png (optional)

10.2 State machine
	1.	Clarify: ask missing constraints (critical dims, mounting pattern, tolerances).
	2.	Generate/Edit: produce clean parametric SCAD (modules, params at top).
	3.	Build: run OpenSCAD, collect logs/summary/preview.
	4.	Assess:
	•	if errors: fix syntax/logic
	•	if summary indicates empty/huge bbox: fix geometry
	•	if vision available: compare preview image to requirements and fix
	5.	Commit: create version node (major/minor).
	6.	Repeat until stop conditions.

10.3 Stop conditions
	•	build succeeds
	•	sanity checks pass
	•	max iterations reached
	•	user clicks Stop
	•	autopilot budget reached (time/iterations)

⸻

11) Sanity checks (MVP)

Use summary.json + basic file existence:
	•	STL exists and non-empty
	•	PNG exists and non-empty
	•	summary bbox finite and within user-configurable bounds
	•	build duration within limit

⸻

12) Import existing SCAD (copy into workspace)

12.1 Import rules
	•	Always copy source into <project>/src/
	•	Determine entrypoint:
	1.	user selected file
	2.	main.scad / index.scad
	3.	heuristic (largest file or most referenced)

12.2 Dependency scan
	•	Parse include <...> and use <...>
	•	If missing:
	•	show warning
	•	offer “Locate and copy into src/libs/”
	•	Do not auto-rewrite paths in MVP unless user approves.

⸻

13) IDE implementation details

13.1 Monaco highlighting
	•	Implement OpenSCAD language registration + Monarch tokenizer.  ￼
	•	Optional: reuse grammar patterns from VSCode OpenSCAD extension as reference; that extension includes syntax highlighting and customizer syntax support.  ￼

13.2 LSP (optional but recommended)
	•	Use monaco-languageclient to connect Monaco to an LSP server.  ￼
	•	Bundle or download one of:
	•	dzhu openscad-language-server (tree-sitter based)  ￼
	•	Leathong openscad-LSP  ￼

⸻

14) Model/provider recommendations + evaluation plan (SCAD generation)

14.1 Why evaluation matters

CAD code generation quality varies widely; success depends on compile rate, shape correctness, parameterization quality, and iteration speed.

14.2 Use CADPrompt + CADCodeVerify ideas

Research introduces CADPrompt, a benchmark for CAD code generation, and CADCodeVerify, an iterative visual-feedback method that improves success rate and geometric accuracy.  ￼

Your product implements a practical version of this:
	•	render PNG locally
	•	feed PNG + requirements back to model for correction

14.3 Model candidates
	•	GPT-4 class models (cloud) typically best for first-pass correctness and structured code.
	•	Code Llama is a strong open model family for code tasks.  ￼
(For local use, expect more iterations; still valuable as an offline option.)

14.4 Simple internal evaluation harness (ship with repo)

Create a small suite (10–30 prompts) like:
	•	bracket with hole pattern
	•	enclosure with lid and screw bosses
	•	clamp with clearance/tolerance
For each model/provider:
	•	generate SCAD
	•	run OpenSCAD build
	•	record:
	•	compile success
	•	iterations to success
	•	bbox sanity
	•	“param score” (count of named top-level params)
Use these metrics to suggest default provider/model in docs, without hard-coding “best forever”.

⸻

15) Development plan (milestones, no dates)

Milestone A – App skeleton + project library
	•	Electron app shell (single window)
	•	Project Library UI: create/import/open/rename/duplicate/delete
	•	Global SQLite index

Milestone B – Project workspace + file system integration
	•	src/ file tree, tabs, save
	•	project.json management

Milestone C – OpenSCAD runner + artifacts
	•	Detect OpenSCAD path (macOS + configured)
	•	Build pipeline: STL + PNG + summary + logs
	•	Timeout/kill + error reporting

Milestone D – 3D viewer + selection
	•	Load STL
	•	Inspect + measure
	•	Click selection context + optional highlighted screenshot

Milestone E – Version tree + snapshots
	•	Create version nodes with src_snapshot/ + artifacts
	•	Thumbnail generation + tree rendering
	•	Checkout version (restore src)

Milestone F – LLM provider layer
	•	OpenAI + OpenAI-compatible endpoint support
	•	Secure API key handling in main process
	•	Capability flags (vision, structured output)

Milestone G – Agent loop + modes
	•	Assist mode first (apply patch)
	•	Hybrid/autopilot loop with stop conditions
	•	Integrate build logs + summary feedback into prompts

Milestone H – Vision snapshot iteration
	•	If vision supported: send preview.png and preview_selected.png to model
	•	If not: degrade gracefully (text-only loop)

Milestone I – Import + AI refactor
	•	Import file/folder copy into workspace
	•	Dependency scan
	•	AI “Improve/Parameterize” flows

Milestone J – IDE upgrades
	•	Monarch tokenizer polish
	•	Optional: OpenSCAD LSP integration

⸻

16) Acceptance criteria (MVP)
	•	Can create/import a project and manage it in the library.
	•	Can edit SCAD with syntax highlighting.
	•	Can build and see:
	•	PNG snapshot
	•	STL in 3D viewer
	•	errors/warnings
	•	Can iterate:
	•	AI fixes compile errors from logs
	•	AI responds to user feedback
	•	selection context influences edits
	•	Version tree works with thumbnails and checkout.
	•	Export STL is one click.
	•	Works reliably on macOS packaged app (PATH fixed via fix-path).  ￼

⸻

Copy/Paste to GPT-5 Codex (implementation instructions)

You are GPT-5 Codex acting as a senior engineer. Build this Electron app as described above.
	•	Use Electron + React + TypeScript.
	•	Use Monaco Editor for IDE with OpenSCAD Monarch tokenizer.
	•	Use three.js for STL viewing and raycast selection.
	•	Implement a project library (global SQLite index) and project folders in workspace.
	•	Implement version nodes as folders with src_snapshot + artifacts.
	•	Implement OpenSCAD runner as child process using OpenSCAD CLI.
	•	Implement LLM provider layer for OpenAI + OpenAI-compatible endpoints (Ollama/LM Studio), with capability flags for vision.
	•	Implement agent tool loop: generate/edit SCAD, run OpenSCAD, read logs/summary/preview, commit versions.
	•	Implement import (copy into workspace) for existing SCAD projects and allow AI refactor/improve.
	•	Ensure macOS PATH reliability using fix-path at startup.

Start by scaffolding the repo structure and the IPC contracts, then build in milestones A → J.

⸻

If you want, I can also generate a “starter repo blueprint” (folders + file names + interfaces + IPC handler signatures) that Codex can follow verbatim.
