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
];

const skills = ["TypeScript", "GraphQL", "React", "Python", "Next.js", "PostgreSQL", "Docker", "Kubernetes"];
const technologies = ["TypeScript", "GraphQL", "React", "Next.js", "PostgreSQL", "Python", "Docker", "Kubernetes"];
const projects = [
  { id: "pr1", name: "Atlas", description: "Internal developer platform" },
  { id: "pr2", name: "Mercury", description: "Customer data platform" },
  { id: "pr3", name: "Nova", description: "Analytics workspace" },
  { id: "pr4", name: "Pulse", description: "Product insights dashboard" },
];

async function main() {
  const session = driver.session();
  try {
    await session.run("MATCH (n) DETACH DELETE n");
    await session.run(`UNWIND $people AS person CREATE (:Person {id: person.id, name: person.name, role: person.role})`, { people });
    await session.run(`UNWIND $skills AS name CREATE (:Skill {name})`, { skills });
    await session.run(`UNWIND $technologies AS name CREATE (:Technology {name})`, { technologies });
    await session.run(`UNWIND $projects AS project CREATE (:Project {id: project.id, name: project.name, description: project.description})`, { projects });

    await session.run(`
      MATCH (p1:Person {id:"p1"}), (p2:Person {id:"p2"}), (p3:Person {id:"p3"}),
            (p4:Person {id:"p4"}), (p5:Person {id:"p5"}), (p6:Person {id:"p6"})
      MATCH (s1:Skill {name:"TypeScript"}), (s2:Skill {name:"GraphQL"}), (s3:Skill {name:"React"}),
            (s4:Skill {name:"Python"}), (s5:Skill {name:"Next.js"}), (s6:Skill {name:"PostgreSQL"}),
            (s7:Skill {name:"Docker"}), (s8:Skill {name:"Kubernetes"})
      CREATE (p1)-[:HAS_SKILL]->(s1), (p1)-[:HAS_SKILL]->(s2), (p1)-[:HAS_SKILL]->(s5),
             (p2)-[:HAS_SKILL]->(s1), (p2)-[:HAS_SKILL]->(s7), (p2)-[:HAS_SKILL]->(s8),
             (p3)-[:HAS_SKILL]->(s3), (p3)-[:HAS_SKILL]->(s5), (p4)-[:HAS_SKILL]->(s2),
             (p4)-[:HAS_SKILL]->(s6), (p4)-[:HAS_SKILL]->(s4), (p5)-[:HAS_SKILL]->(s4),
             (p5)-[:HAS_SKILL]->(s6), (p6)-[:HAS_SKILL]->(s1), (p6)-[:HAS_SKILL]->(s3)
    `);

    await session.run(`
      MATCH (p1:Person {id:"p1"}), (p2:Person {id:"p2"}), (p3:Person {id:"p3"}), (p4:Person {id:"p4"}), (p5:Person {id:"p5"}), (p6:Person {id:"p6"})
      MATCH (a:Project {id:"pr1"}), (m:Project {id:"pr2"}), (n:Project {id:"pr3"}), (pu:Project {id:"pr4"})
      CREATE (p1)-[:WORKED_ON]->(a), (p2)-[:WORKED_ON]->(a), (p3)-[:WORKED_ON]->(a),
             (p2)-[:WORKED_ON]->(m), (p4)-[:WORKED_ON]->(m), (p5)-[:WORKED_ON]->(n),
             (p4)-[:WORKED_ON]->(n), (p6)-[:WORKED_ON]->(pu), (p3)-[:WORKED_ON]->(pu),
             (p1)-[:COLLABORATED_WITH]->(p2), (p2)-[:COLLABORATED_WITH]->(p4),
             (p3)-[:COLLABORATED_WITH]->(p6), (p4)-[:COLLABORATED_WITH]->(p5)
    `);

    await session.run(`
      MATCH (a:Project {id:"pr1"}), (m:Project {id:"pr2"}), (n:Project {id:"pr3"}), (pu:Project {id:"pr4"})
      MATCH (t1:Technology {name:"TypeScript"}), (t2:Technology {name:"GraphQL"}), (t3:Technology {name:"React"}),
            (t4:Technology {name:"Next.js"}), (t5:Technology {name:"PostgreSQL"}), (t6:Technology {name:"Python"}),
            (t7:Technology {name:"Docker"}), (t8:Technology {name:"Kubernetes"})
      CREATE (a)-[:USES]->(t1), (a)-[:USES]->(t2), (a)-[:USES]->(t4), (a)-[:USES]->(t7),
             (m)-[:USES]->(t6), (m)-[:USES]->(t5), (m)-[:USES]->(t7),
             (n)-[:USES]->(t6), (n)-[:USES]->(t5), (n)-[:USES]->(t8),
             (pu)-[:USES]->(t3), (pu)-[:USES]->(t4), (pu)-[:USES]->(t1)
    `);

    await session.run(`
      MATCH (s1:Skill {name:"TypeScript"}), (s2:Skill {name:"GraphQL"}), (s3:Skill {name:"React"}), (s4:Skill {name:"Next.js"})
      CREATE (s1)-[:RELATED_TO]->(s2), (s1)-[:RELATED_TO]->(s4), (s3)-[:RELATED_TO]->(s4)
    `);

    console.log("SkillGraph seed complete.");
  } finally {
    await session.close();
    await driver.close();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
