import neo4j from "neo4j-driver";

const uri = process.env.COGNODB_URI;
const password = process.env.COGNODB_PASSWORD;
const username = process.env.COGNODB_USERNAME || "cognodb";

if (!uri || !password) throw new Error("Set COGNODB_URI and COGNODB_PASSWORD before seeding.");

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

const people = [
  { id: "p1", name: "Alice Johnson", role: "Senior Software Engineer" },
  { id: "p2", name: "Marcus Chen", role: "Platform Engineer" },
  { id: "p3", name: "Sarah Williams", role: "Frontend Engineer" },
  { id: "p4", name: "Daniel Okafor", role: "Backend Engineer" },
  { id: "p5", name: "Maya Patel", role: "Data Engineer" },
  { id: "p6", name: "Fatima Bello", role: "Product Engineer" },
  { id: "p7", name: "James Adeyemi", role: "DevOps Engineer" },
  { id: "p8", name: "Grace Kim", role: "Data Platform Engineer" },
];

const skills = ["TypeScript", "GraphQL", "React", "Python", "Next.js", "PostgreSQL", "Docker", "Kubernetes", "Data Engineering", "System Design"];
const technologies = ["TypeScript", "GraphQL", "React", "Next.js", "PostgreSQL", "Python", "Docker", "Kubernetes"];
const projects = [
  { id: "pr1", name: "Atlas", description: "Internal developer platform" },
  { id: "pr2", name: "Mercury", description: "Customer data platform" },
  { id: "pr3", name: "Nova", description: "Analytics workspace" },
  { id: "pr4", name: "Pulse", description: "Product insights dashboard" },
  { id: "pr5", name: "Orbit", description: "Developer observability platform" },
];

const personSkills: Record<string, string[]> = {
  p1: ["TypeScript", "GraphQL", "Next.js", "System Design"],
  p2: ["TypeScript", "Docker", "Kubernetes", "System Design"],
  p3: ["React", "Next.js", "TypeScript"],
  p4: ["GraphQL", "PostgreSQL", "Python", "System Design"],
  p5: ["Python", "PostgreSQL", "Data Engineering"],
  p6: ["TypeScript", "React", "GraphQL"],
  p7: ["Docker", "Kubernetes", "Python", "System Design"],
  p8: ["Python", "PostgreSQL", "Data Engineering", "Docker"],
};

const work: Array<[string, string]> = [
  ["p1", "pr1"], ["p2", "pr1"], ["p3", "pr1"],
  ["p2", "pr2"], ["p4", "pr2"], ["p5", "pr2"],
  ["p4", "pr3"], ["p5", "pr3"], ["p8", "pr3"],
  ["p6", "pr4"], ["p3", "pr4"], ["p1", "pr4"],
  ["p2", "pr5"], ["p7", "pr5"], ["p8", "pr5"],
];

const projectTechnologies: Record<string, string[]> = {
  pr1: ["TypeScript", "GraphQL", "Next.js", "Docker"],
  pr2: ["Python", "PostgreSQL", "Docker"],
  pr3: ["Python", "PostgreSQL", "Kubernetes"],
  pr4: ["React", "Next.js", "TypeScript", "GraphQL"],
  pr5: ["Kubernetes", "Docker", "Python"],
};

const collaborations: Array<[string, string]> = [
  ["p1", "p2"], ["p2", "p4"], ["p3", "p6"], ["p4", "p5"],
  ["p2", "p7"], ["p5", "p8"], ["p7", "p8"], ["p1", "p6"],
];

async function main() {
  const session = driver.session();
  try {
    // Idempotent seed: rerunning this script updates the same logical graph instead of deleting it.
    await session.run(
      `UNWIND $people AS person
       MERGE (p:Person {id: person.id})
       SET p.name = person.name, p.role = person.role`,
      { people }
    );

    await session.run(
      `UNWIND $skills AS name MERGE (:Skill {name: name})`,
      { skills }
    );

    await session.run(
      `UNWIND $technologies AS name MERGE (:Technology {name: name})`,
      { technologies }
    );

    await session.run(
      `UNWIND $projects AS project
       MERGE (p:Project {id: project.id})
       SET p.name = project.name, p.description = project.description`,
      { projects }
    );

    await session.run(
      `UNWIND $rows AS row
       MATCH (p:Person {id: row.personId}), (s:Skill {name: row.skill})
       MERGE (p)-[:HAS_SKILL]->(s)`,
      { rows: Object.entries(personSkills).flatMap(([personId, values]) => values.map((skill) => ({ personId, skill }))) }
    );

    await session.run(
      `UNWIND $work AS row
       MATCH (p:Person {id: row[0]}), (project:Project {id: row[1]})
       MERGE (p)-[:WORKED_ON]->(project)`,
      { work }
    );

    await session.run(
      `UNWIND $rows AS row
       MATCH (project:Project {id: row.projectId}), (technology:Technology {name: row.technology})
       MERGE (project)-[:USES]->(technology)`,
      { rows: Object.entries(projectTechnologies).flatMap(([projectId, values]) => values.map((technology) => ({ projectId, technology }))) }
    );

    await session.run(
      `UNWIND $collaborations AS row
       MATCH (a:Person {id: row[0]}), (b:Person {id: row[1]})
       MERGE (a)-[:COLLABORATED_WITH]->(b)
       MERGE (b)-[:COLLABORATED_WITH]->(a)`,
      { collaborations }
    );

    await session.run(`
      UNWIND [
        ["TypeScript", "GraphQL"], ["TypeScript", "Next.js"], ["React", "Next.js"],
        ["Python", "PostgreSQL"], ["Docker", "Kubernetes"]
      ] AS pair
      MATCH (a:Skill {name: pair[0]}), (b:Skill {name: pair[1]})
      MERGE (a)-[:RELATED_TO]->(b)
      MERGE (b)-[:RELATED_TO]->(a)
    `);

    const counts = await session.run(`
      MATCH (p:Person) WITH count(p) AS people
      MATCH (s:Skill) WITH people, count(s) AS skills
      MATCH (pr:Project) WITH people, skills, count(pr) AS projects
      MATCH (t:Technology)
      RETURN people, skills, projects, count(t) AS technologies
    `);
    console.log("SkillGraph seed complete:", counts.records[0]?.toObject());
  } finally {
    await session.close();
    await driver.close();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
