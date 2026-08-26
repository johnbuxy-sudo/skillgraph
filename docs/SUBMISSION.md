# Wexa Submission Checklist

## 1. Live database verification

The production build runs `npm run seed` after `next build`, using the Vercel environment variables `COGNODB_URI`, `COGNODB_USERNAME`, and `COGNODB_PASSWORD`. The seed is idempotent, so redeploying does not duplicate the logical graph.

After the deployment is READY, open the production URL and confirm the dashboard shows:

- People: 8
- Skills: 10
- Projects: 5
- Technologies: 8

Then test:

1. Search `Alice` and open her profile.
2. Click `TypeScript` and confirm connected project paths appear.
3. Search `Python` and confirm multiple project paths appear.
4. Refresh the page and confirm the data remains available.

## 2. Screenshots required by Wexa

Capture these four screenshots from the deployed application:

- `docs/screenshots/01-home.png` — full dashboard with non-zero graph statistics.
- `docs/screenshots/02-search.png` — search results for Alice or another person.
- `docs/screenshots/03-filter.png` — technology filter showing multi-hop paths.
- `docs/screenshots/04-profile.png` — person profile showing skills, projects and collaborators.

Add the four images to the repository and reference them from the README.

## 3. Screen recording

Record a 60–90 second walkthrough:

1. Open the hosted SkillGraph URL.
2. Briefly explain: "SkillGraph is a team knowledge graph backed by CognoDB."
3. Point out the People, Skills, Projects and Technologies counts.
4. Search for `Alice` and open her profile.
5. Click `TypeScript` to demonstrate connected paths.
6. Explain the path `Person → Project → Technology` and why this is a natural graph query.
7. Refresh once to demonstrate the hosted app remains functional.

Keep the recording simple and focused on the working application. Do not show passwords or environment variables.

## 4. Final email

Subject: `CognoDB Assignment 2 – <Your Name>`

Include:

- GitHub repository URL
- Hosted demo URL
- Screen recording URL

Keep the CognoDB instance running until Wexa confirms the review is complete.
