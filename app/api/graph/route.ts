import { NextRequest, NextResponse } from "next/server";
import { getDriver } from "@/lib/cognodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = (searchParams.get("q") ?? "").trim();
  const technology = (searchParams.get("technology") ?? "").trim();
  const personId = (searchParams.get("personId") ?? "").trim();

  let driver;
  try {
    driver = getDriver();
    const session = driver.session();

    try {
      const counts = await session.run(`
        MATCH (p:Person) WITH count(p) AS people
        MATCH (s:Skill) WITH people, count(s) AS skills
        MATCH (pr:Project) WITH people, skills, count(pr) AS projects
        MATCH (t:Technology)
        RETURN people, skills, projects, count(t) AS technologies
      `);

      const countRecord = counts.records[0];
      const stats = countRecord
        ? {
            people: countRecord.get("people").toNumber(),
            skills: countRecord.get("skills").toNumber(),
            projects: countRecord.get("projects").toNumber(),
            technologies: countRecord.get("technologies").toNumber(),
          }
        : { people: 0, skills: 0, projects: 0, technologies: 0 };

      const pathResult = await session.run(
        `
          MATCH (p:Person)-[:WORKED_ON]->(project:Project)-[:USES]->(technology:Technology)
          WHERE ($technology = '' OR technology.name = $technology)
            AND ($q = '' OR toLower(p.name) CONTAINS toLower($q)
              OR toLower(project.name) CONTAINS toLower($q)
              OR toLower(technology.name) CONTAINS toLower($q))
          RETURN p.id AS personId, p.name AS person, project.name AS project, technology.name AS technology
          ORDER BY person, project, technology
          LIMIT 100
        `,
        { q, technology }
      );

      const personResult = personId
        ? await session.run(
            `
              MATCH (p:Person {id: $personId})
              OPTIONAL MATCH (p)-[:HAS_SKILL]->(skill:Skill)
              OPTIONAL MATCH (p)-[:WORKED_ON]->(project:Project)
              OPTIONAL MATCH (p)-[:COLLABORATED_WITH]->(colleague:Person)
              RETURN p.id AS id, p.name AS name, p.role AS role,
                     collect(DISTINCT skill.name) AS skills,
                     collect(DISTINCT project.name) AS projects,
                     collect(DISTINCT colleague.name) AS collaborators
            `,
            { personId }
          )
        : null;

      const peopleResult = q
        ? await session.run(
            `
              MATCH (p:Person)
              WHERE toLower(p.name) CONTAINS toLower($q)
                 OR toLower(p.role) CONTAINS toLower($q)
              RETURN p.id AS id, p.name AS name, p.role AS role
              ORDER BY name
              LIMIT 20
            `,
            { q }
          )
        : { records: [] };

      return NextResponse.json({
        stats,
        paths: pathResult.records.map((record) => record.toObject()),
        people: peopleResult.records.map((record) => record.toObject()),
        person: personResult?.records[0]?.toObject() ?? null,
      });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error("CognoDB request failed", error);
    return NextResponse.json(
      { error: "We couldn't reach the graph right now. Please try again." },
      { status: 503 }
    );
  } finally {
    await driver?.close();
  }
}
