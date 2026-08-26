import { NextResponse } from "next/server";
import { getDriver } from "@/lib/cognodb";

export async function GET() {
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (p:Person)-[:WORKED_ON]->(project:Project)-[:USES]->(technology:Technology)
      RETURN p.name AS person, project.name AS project, technology.name AS technology
      ORDER BY person, project, technology
      LIMIT 100
    `);
    return NextResponse.json(result.records.map((r) => r.toObject()));
  } catch {
    return NextResponse.json({ error: "Graph database is currently unavailable." }, { status: 503 });
  } finally {
    await session.close();
    await driver.close();
  }
}
