// 1. Person -> skills
MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(s:Skill)
RETURN s.name AS skill
ORDER BY skill;

// 2. Required multi-hop traversal: Person -> Project -> Technology
MATCH (p:Person {id: $personId})-[:WORKED_ON]->(project:Project)-[:USES]->(technology:Technology)
RETURN project.name AS project, technology.name AS technology
ORDER BY project, technology;

// 3. Graph-heavy discovery: people connected to a technology through projects
MATCH (p:Person)-[:WORKED_ON]->(project:Project)-[:USES]->(technology:Technology)
WHERE technology.name = $technology
RETURN p.name AS person, collect(DISTINCT project.name) AS projects
ORDER BY person;

// 4. Collaboration + skills: Person -> colleague -> Skill
MATCH (p:Person {id: $personId})-[:COLLABORATED_WITH]->(colleague:Person)-[:HAS_SKILL]->(skill:Skill)
RETURN colleague.name AS colleague, collect(skill.name) AS skills
ORDER BY colleague;

// 5. Graph-native recommendation: Person -> colleague -> Skill <- Skill -> candidate
// Finds people who share skills with someone the selected person collaborates with.
MATCH (p:Person {id: $personId})-[:COLLABORATED_WITH]->(colleague:Person)-[:HAS_SKILL]->(skill:Skill)<-[:HAS_SKILL]-(candidate:Person)
WHERE candidate <> p
RETURN candidate.name AS candidate, collect(DISTINCT skill.name) AS sharedSkills
ORDER BY size(sharedSkills) DESC, candidate;
