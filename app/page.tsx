"use client";

import { useEffect, useMemo, useState } from "react";

type Stats = { people: number; skills: number; projects: number; technologies: number };
type Path = { personId: string; person: string; project: string; technology: string };
type Person = { id: string; name: string; role: string };
type PersonDetail = Person & { skills: string[]; projects: string[]; collaborators: string[] };
type GraphResponse = { stats: Stats; paths: Path[]; people: Person[]; person: PersonDetail | null; error?: string };

const fallbackStats: Stats = { people: 0, skills: 0, projects: 0, technologies: 0 };
const technologies = ["TypeScript", "GraphQL", "React", "Next.js", "PostgreSQL", "Python", "Docker", "Kubernetes"];

export default function Home() {
  const [data, setData] = useState<GraphResponse>({ stats: fallbackStats, paths: [], people: [], person: null });
  const [query, setQuery] = useState("");
  const [activeTechnology, setActiveTechnology] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGraph = async (options: { q?: string; technology?: string; personId?: string } = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (options.q) params.set("q", options.q);
      if (options.technology) params.set("technology", options.technology);
      if (options.personId) params.set("personId", options.personId);
      const response = await fetch(`/api/graph?${params.toString()}`, { cache: "no-store" });
      const result: GraphResponse = await response.json();
      if (!response.ok) throw new Error(result.error || "Graph database is unavailable.");
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  const filteredPaths = useMemo(() => data.paths, [data.paths]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setSelectedPerson("");
    loadGraph({ q: query, technology: activeTechnology });
  }

  function selectTechnology(value: string) {
    const next = activeTechnology === value ? "" : value;
    setActiveTechnology(next);
    setSelectedPerson("");
    loadGraph({ q: query, technology: next });
  }

  function selectPerson(person: Person) {
    setSelectedPerson(person.id);
    loadGraph({ personId: person.id, q: query, technology: activeTechnology });
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <div className="logo">SkillGraph</div>
          <div className="eyebrow">Knowledge discovery for connected teams</div>
        </div>
        <div className="badge">CognoDB · openCypher</div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="kicker">GRAPH EXPLORER</div>
          <h1>See how people, skills, projects, and technology connect.</h1>
          <p>Explore real relationships in a team knowledge graph. Search for a person or technology, then follow the project paths that connect them.</p>
        </div>
        <div className="hero-panel">
          <div className="mini-label">Live graph</div>
          <div className="path-preview"><span>Person</span><b>→</b><span>Project</span><b>→</b><span>Technology</span></div>
          <p>Multi-hop traversal powered by CognoDB.</p>
        </div>
      </section>

      <form className="search" onSubmit={submitSearch}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, projects, or technologies..." aria-label="Search the graph" />
        <button type="submit" disabled={loading}>{loading ? "Loading…" : "Explore graph"}</button>
      </form>

      <section className="stats" aria-label="Live graph statistics">
        {[[data.stats.people, "People"], [data.stats.skills, "Skills"], [data.stats.projects, "Projects"], [data.stats.technologies, "Technologies"]].map(([number, label]) => (
          <div className="card" key={label as string}><div className="number">{number}</div><div className="label">{label}</div></div>
        ))}
      </section>

      <section className="section">
        <div className="section-heading"><div><div className="kicker">FILTER BY PATH</div><h2>Technologies in the graph</h2></div><span className="result-count">{filteredPaths.length} paths</span></div>
        <div className="pills">
          {technologies.map((technology) => <button className={`pill ${activeTechnology === technology ? "active" : ""}`} key={technology} onClick={() => selectTechnology(technology)} type="button">{technology}</button>)}
        </div>
      </section>

      {error && <div className="state error" role="alert"><strong>Graph connection issue</strong><span>{error}</span><button onClick={() => loadGraph({ q: query, technology: activeTechnology })} type="button">Try again</button></div>}

      {data.people.length > 0 && !data.person && <section className="results section"><div className="section-heading"><div><div className="kicker">PEOPLE MATCHES</div><h2>Who matches your search?</h2></div></div><div className="people-grid">{data.people.map((person) => <button className="person-card" key={person.id} onClick={() => selectPerson(person)} type="button"><strong>{person.name}</strong><span>{person.role}</span><small>View connected work →</small></button>)}</div></section>}

      <section className="section">
        <div className="section-heading"><div><div className="kicker">MULTI-HOP RESULTS</div><h2>{activeTechnology ? `People connected to ${activeTechnology}` : "Project technology paths"}</h2></div></div>
        {loading ? <div className="state">Loading connected paths…</div> : filteredPaths.length === 0 ? <div className="state"><strong>No paths found</strong><span>Try another technology or a broader search.</span></div> : <div className="path-list">{filteredPaths.map((path, index) => <button className="path-row" key={`${path.personId}-${path.project}-${path.technology}-${index}`} onClick={() => selectPerson({ id: path.personId, name: path.person, role: "" })} type="button"><span className="node person-node">{path.person}</span><span className="arrow">WORKED ON →</span><span className="node">{path.project}</span><span className="arrow">USES →</span><span className="node tech-node">{path.technology}</span></button>)}</div>}
      </section>

      {data.person && <section className="detail-panel section"><div><div className="kicker">PERSON PROFILE</div><h2>{data.person.name}</h2><p>{data.person.role}</p></div><div className="detail-columns"><div><span className="mini-label">Skills</span><div className="pills">{data.person.skills.filter(Boolean).map((skill) => <span className="pill" key={skill}>{skill}</span>)}</div></div><div><span className="mini-label">Projects</span><ul>{data.person.projects.filter(Boolean).map((project) => <li key={project}>{project}</li>)}</ul></div><div><span className="mini-label">Collaborators</span><ul>{data.person.collaborators.filter(Boolean).map((person) => <li key={person}>{person}</li>)}</ul></div></div></section>}

      <section className="note"><strong>Why graph?</strong> The key question is not just &quot;what is stored?&quot; but &quot;what is connected?&quot; A single traversal can follow Person → Project → Technology and expose relationships that would require several joins in a relational model.</section>
    </main>
  );
}
