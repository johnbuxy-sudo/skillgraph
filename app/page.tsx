const skills = ["TypeScript", "GraphQL", "React", "Python", "Next.js", "PostgreSQL", "Docker", "Kubernetes"];

export default function Home() {
  return (
    <main className="container">
      <header className="header">
        <div className="logo">SkillGraph</div>
        <div className="badge">CognoDB · openCypher</div>
      </header>

      <section className="hero">
        <h1>See how people, skills, projects, and technology connect.</h1>
        <p>SkillGraph turns a team&apos;s knowledge into a navigable graph, making it easier to discover expertise and understand project dependencies.</p>
      </section>

      <div className="search">
        <input placeholder="Search people, skills, projects, or technologies..." aria-label="Search" />
        <button type="button">Explore</button>
      </div>

      <section className="grid" aria-label="Graph statistics">
        <div className="card"><div className="number">25</div><div className="label">People</div></div>
        <div className="card"><div className="number">18</div><div className="label">Skills</div></div>
        <div className="card"><div className="number">10</div><div className="label">Projects</div></div>
        <div className="card"><div className="number">12</div><div className="label">Technologies</div></div>
      </section>

      <section className="section">
        <h2>Explore skills</h2>
        <div className="pills">{skills.map((skill) => <span className="pill" key={skill}>{skill}</span>)}</div>
      </section>

      <div className="note"><strong>Graph question:</strong> Which people have worked on projects that use a technology, and what skills connect them? This is where multi-hop graph traversal becomes useful.</div>
    </main>
  );
}
