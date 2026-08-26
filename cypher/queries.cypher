// 1. Person -> skills
MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(s:Skill)
RETURN s.name AS skill
ORDER BY skill;

// 2. Multi-hop: person -> project -> technology
MATCH (p:Person {id: $personId})-[:WORKED_ON]->(project:Project)-[:USES]->(technology:Technology)
RETURN project.name AS project, technology.name AS technology
ORDER BY project, technology;

// 3. Graph-heavy discovery: people connected to a technology through projects
MATCH (p:Person)-[:WORKED_ON]->(project:Project)-[:USES]->(technology:Technology)
WHERE technology.name = $technology
RETURN p.name AS person, collect(DISTINCT project.name) AS projects
ORDER BY person;

// 4. Collaboration + skills
MATCH (p:Person {id: $personId})-[:COLLABORATED_WITH]->(colleague:Person)-[:HAS_SKILL]->(skill:Skill)
RETURN colleague.name AS colleague, collect(skill.name) AS skills
ORDER BY colleague;
