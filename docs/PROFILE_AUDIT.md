# macm.dev profile audit — 23 September 2026

Reviewed the live [home](https://macm.dev/), [projects](https://macm.dev/projects), [about](https://macm.dev/about), and [resume](https://macm.dev/resume) pages and the current application build. Production content lives in PostgreSQL and should be updated through the private dashboard after this release. The copy below is a draft to review before publishing.

## Highest-priority content changes

1. **Lead with delivered systems.** The home headline already clearly says “Full-Stack Software Engineer | Next.js • TypeScript • Laravel • PostgreSQL | Docker & Linux Infrastructure.” Keep it. Replace the long “tech enthusiast” paragraph with a short statement of the applications and infrastructure you have built. Draft: “I build and operate web applications, from product features and data models to Docker deployments and Linux servers. My recent work includes management dashboards, automated workflows, and the infrastructure that runs them.”
2. **Turn the featured projects into evidence.** The NNS card currently says “manage the tasks, work and related things.” Draft: “Built a company management dashboard and landing page with role-based access and Google API integrations, giving teams a single place to coordinate work.” Confirm the exact integrations and your responsibility before publishing. Each case study should answer: problem, your scope, architecture, difficult decision, security/deployment approach, and outcome. Add a number only when you can verify it.
3. **Tighten the About and Resume copy.** The About story is long and spends much of its space on missed interests and early frustrations. Keep one sentence about the path through WordPress and web development; use the rest to show how you work now. The resume summary repeats ambitions and broad claims. Draft: “Full-stack developer with experience building Next.js and Laravel applications backed by PostgreSQL. I work across application features, Docker deployment, and Linux infrastructure, with a focus on reliable systems and clear delivery.” Check the role dates and exact responsibilities against your employment records.
4. **Make the skills list selective and consistent.** Put the strongest tools first and attach them to projects. Remove empty skill entries and “beginner” cloud platforms from the primary list unless a role calls for them. Fix visible spelling and casing: “experiance,” “managment,” “Clould platfrom,” “Frontedn,” “Javascript,” “Typescript,” “vue,” and “Wordpress.”
5. **Clarify the employment title.** “Lead Web Application Developer” can stay in the employment timeline if it is the official title. The public headline should continue to describe the engineering role and stack. A short note on leadership scope in the experience entry would remove ambiguity.

## Engineering and presentation checks

- The production build reports about **7.5 MB of first-load JavaScript** for the home route. This is a build estimate, not measured network transfer. Run Lighthouse on mobile, inspect bundle composition, and move admin-only dependencies out of public routes before optimizing animations. The client modules `lib/projects.ts` and `lib/resumes.ts` import the server storage module; moving those operations behind API routes is a likely way to reduce the admin bundle and avoid shipping server SDK code to the browser.
- Add at least one architecture diagram or sanitized screenshot per major case study. The personal portfolio can show authentication, Prisma/Postgres, S3 storage, CI/CD, and the deployment/rollback path. The NNS and workflow systems need similar concrete boundaries, with sensitive details removed.
- Verify live demo and source links, the PDF resume, contact links, mobile layout, keyboard navigation, and image alternatives after each content edit.
- Track outcomes where possible: number of users or teams, frequency of workflows, time saved, deployment frequency, incident recovery, or performance changes. Mark unknown values as unknown; do not estimate them for the portfolio.

## Suggested order

1. Rewrite the NNS and portfolio case studies, including your exact role and screenshots.
2. Replace the home introduction and resume summary, then shorten the About story.
3. Correct skills, spelling, dates, and outbound links.
4. Measure mobile performance and accessibility, then optimize the heaviest route components.
