# SkillGraph

A small graph database application built for the Wexa AI CognoDB take-home assignment.

SkillGraph helps a non-technical user explore connections between people, skills, projects, and technologies.

## Why a graph database?

The useful questions here are relationship questions: which people worked on projects that use a particular technology, which skills connect collaborators, and how a person's project history relates to technologies. These questions naturally follow paths such as `Person -> WORKED_ON -> Project -> USES -> Technology`. A relational model can represent the same facts, but relationship-heavy discovery becomes increasingly join-heavy as paths become more complex. A graph makes the connected structure explicit.

## Data model

```text
(Person)-[:HAS_SKILL]->(Skill)
(Person)-[:WORKED_ON]->(Project)-[:USES]->(Technology)
(Person)-[:COLLABORATED_WITH]->(Person)
(Skill)-[:RELATED_TO]->(Skill)
```

Seed data contains people, skills, projects, technologies, and realistic relationships between them.

## Main graph query

```cypher
MATCH (p:Person {id: $personId})
      -[:WORKED_ON]->(project:Project)
      -[:USES]->(technology:Technology)
RETURN project.name AS project, technology.name AS technology
ORDER BY project, technology
```

The repository also includes a graph-heavy discovery query that finds people connected to a technology through projects, plus a collaboration-and-skills traversal. All application queries use parameters rather than string-concatenated Cypher.

## Stack

- Next.js + TypeScript
- Neo4j official JavaScript driver
- CognoDB Cloud
- Vercel for deployment

## Local setup

1. Create a free CognoDB instance at https://console.cognodb.com/signup.
2. Save the generated password when CognoDB shows it.
3. Copy `.env.example` to `.env.local` and fill in the CognoDB URI and password. Never commit `.env.local`.
4. Install dependencies with `npm install`.
5. Load the graph with `npm run seed`.
6. Start the app with `npm run dev`.
7. Open `http://localhost:3000`.

## Environment variables

```env
COGNODB_URI=bolt+s://your-instance-id.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your-password
```

## Project structure

```text
app/                 Next.js application and API routes
lib/cognodb.ts       CognoDB/Neo4j driver connection
scripts/seed.ts      realistic graph seed data
cypher/queries.cypher parameterized query examples
```

## Graceful database failure

The graph API returns HTTP 503 with a user-safe error message if CognoDB is unreachable. Credentials are read only from environment variables.

## Deployment

Import this repository into Vercel and add `COGNODB_URI`, `COGNODB_USERNAME`, and `COGNODB_PASSWORD` as Vercel environment variables. The hosted URL is the final demo required by the assignment.

## Screenshots

Add final screenshots of the deployed UI here before submission.

## Screen recording

Record a short walkthrough showing the exploration experience and a multi-hop graph question, then add the recording link here.
