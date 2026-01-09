import "./app.css";
import ProjectLibrary from "./ProjectLibrary";

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>VibeCAD</h1>
          <p>Local-first OpenSCAD projects with AI assistance.</p>
        </div>
      </header>
      <main className="app__content">
        <ProjectLibrary />
      </main>
    </div>
  );
}
