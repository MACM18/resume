# Portfolio refresh and project publishing plan

## Goal

Turn macm.dev into a clear, creative portfolio that helps a hiring manager quickly understand who MACM is, what has been built, and how to make contact. Replace the traditional, multi-page visitor journey with a fast, single-page story while preserving the current profile and project data.

## Public portfolio direction

- Build one scrollable story page with clear chapter links and a compact navigation.
- Story order: introduction and primary actions; proof and current focus; selected projects; experience and approach; capabilities; short personal context; contact.
- Add a rounded rope or thread as the visual spine. Let it move in a gentle zigzag between chapters, with a marker at each section and a subtle progress fill as the visitor scrolls.
- Keep the rope behind the content with wide bends and generous spacing. On mobile, simplify it to a line along one side of the page.
- Use expressive but lightweight motion: staggered entrance, portrait/orbit movement, project hover transitions, and scroll-linked rope progress. Respect reduced-motion preferences.
- Prioritize load time and low frontend complexity. Reuse the current stack, avoid adding an animation dependency, and keep client-side behavior to small interactive elements where possible.
- Use current profile, project, work-experience, social-link, highlight, achievement, and skill data. Avoid a database schema change for the first pass.
- Continue using production project images and links where available. When a project has no image, show a compact project information block instead of a placeholder image.
- Put the working contact form in the final homepage chapter and retain it on `/contact`; include the MACM Studio link and footer branding.

## Proposed portfolio projects

GitHub links below were read from local repository remotes. Public repository visibility has not been checked. Do not invent a live URL where one is unknown.

| Project | Summary for portfolio | GitHub | Live link | Publishing note |
| --- | --- | --- | --- | --- |
| MACM Studio | Web development studio site and interactive project estimator | [MACM18/macm-studio](https://github.com/MACM18/macm-studio) | [macm.lk](https://macm.lk) | Strong public showcase candidate. |
| NNS Enterprise | Telecom company website and operations platform | [MACM18/NNS](https://github.com/MACM18/NNS) | [nns.macm.dev](https://nns.macm.dev) | Keep case-study content focused on MACM's contribution; exclude business or customer data. |
| Daymark Store Desk | Store management system covering operations such as checkout, inventory, cash reconciliation, and team workflows | [MACM18/Store-system](https://github.com/MACM18/Store-system) | [shop.macm.dev](https://shop.macm.dev) | App may require sign-in; use approved, sanitized visuals if included. |
| MACM Books | Bookkeeping and Sri Lankan tax filing preparation application | [MACM18/tax-system-macm](https://github.com/MACM18/tax-system-macm) | Not confirmed | Confirm a public demo URL and suitable screenshots before publishing. |
| Daily Task & Team Monitoring PWA | Personal and team task tracking with reports | [MACM18/to-do_at1](https://github.com/MACM18/to-do_at1) | [todo.macm.dev](https://todo.macm.dev) | Existing preset contains this demo URL. |
| Karate IKS | Karate organization and training management project | [MACM18/karate-IKS](https://github.com/MACM18/karate-IKS) | Not confirmed | Confirm the public description and demo URL before publishing. |
| Confidential company management system (checking-ta) | Operational records, team workflows, and availability lookup | No public link included | No public link included | Keep company identity, data, screenshots, repository, and detailed workflows private. |
| Home lab and VPS infrastructure | Docker and Dokploy hosting, self-hosted mail, DNS, and application operations | No public link included | No public link included | Do not publish server addresses or account details. |

Do not seed the CSE Asset Management project. Favor MACM Studio and NNS Enterprise, with Daymark Store Desk as another project entry. Include home lab, VPS, Docker, Dokploy, and mail server experience in the skills and infrastructure content. Keep checking-ta high-level and confidential as described above.

## Production data seeding

`scripts/seed-owner-portfolio.ts` runs from `docker-entrypoint.sh` after Prisma migrations and the storage URL migration. It reads the existing owner from `SiteSettings.id = 1`, then seeds inside a transaction. It never creates an account, resets data, or deletes project rows. Missing project records are published; a matched row keeps its title, image, links, featured state, and published state while only blank descriptions/media/links are filled. Technologies and features are merged without duplicates. Home/About skill groups and the active resume skills are merged while other profile copy remains intact. The Prisma development seed uses the same helper.

The data set includes the current portfolio, MACM Studio, NNS, Daymark Store Desk, MACM Books, Karate IKS, the task/team PWA, the generic confidential company-management entry, and home-lab/VPS infrastructure. CSE Asset Management is excluded. The confidential entry contains no company identity, data, screenshot, repository, demo, or detailed workflow.

The production database has not been changed from this workspace. `DATABASE_URL` is unavailable here, and the user requested a local-only commit with no GitHub push. The new startup seed will run the next time an image containing this commit starts with database migrations enabled. Verify its startup logs and the public project list after that deployment.

## Verification status

- The implementation is committed locally; no push was made.
- TypeScript, CSS parsing, contact-route validation, and an in-memory repeat-run/preservation check for the seeder passed.
- The appearance editor supports custom hex colors, checks body text against a 4.5:1 contrast target, and selects readable text for accent buttons. Automated checks cover all eight fixed palettes in light and dark modes.
- The homepage compiled in the Next development server. The production build worker was repeatedly terminated with `SIGKILL` in this environment, so a complete production build remains unverified.
- Deployment and production database verification remain pending; there is no production database write from this workspace.
