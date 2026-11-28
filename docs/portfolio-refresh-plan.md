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

`scripts/seed-owner-portfolio.ts` runs from `docker-entrypoint.sh` after Prisma migrations and the storage URL migration. It reads the existing owner from `SiteSettings.id = 1`, then seeds inside a transaction. It never creates an account, resets data, or deletes project rows. Missing project records are published; a matched row keeps its title, usable image, links, featured state, and published state while only blank descriptions/media/links are filled. A literal `/placeholder.svg` is treated as missing and replaced with an approved image when available, otherwise cleared. Technologies and features are merged without duplicates. Home/About skill groups and the active resume skills are merged while other profile copy remains intact. The Prisma development seed uses the same helper.

The data set includes the current portfolio, MACM Studio, NNS, Daymark Store Desk, MACM Books, Karate IKS, the task/team PWA, the generic confidential company-management entry, and home-lab/VPS infrastructure. CSE Asset Management is excluded. The confidential entry contains no company identity, data, screenshot, repository, demo, or detailed workflow.

`DATABASE_URL` is unavailable here and the user requested local-only commits with no GitHub push, so this workspace has made no direct database write. The latest read-only production check on 2026-11-28 returned HTTP 200, confirmed a contact form and all nine project title entries, and still found `/placeholder.svg` references. The production startup log shared by the user shows migrations and the storage URL migration but no `Seeding missing portfolio content` message or seeder summary, so that log does not prove the startup seeder ran. The local `main` branch is ahead of `origin/main`, so the deployed container does not include the current local startup seeder and placeholder fixes. Production project rows have not been verified directly in PostgreSQL. The startup code is ready to fill missing content after the updated image is deployed; the user has explicitly requested no push, so the live container and database remain untouched.

## Verification status

- The implementation is committed locally; no push was made.
- TypeScript, CSS parsing, the project image/icon/seeder/theme tests, and an in-memory repeat-run/preservation check for the seeder passed.
- The appearance editor supports custom hex colors, checks body text against a 4.5:1 contrast target, and selects readable text for accent buttons. Automated checks cover all eight fixed palettes in light and dark modes.
- Full `pnpm build` passed on 2026-11-28. `npm audit` and `pnpm audit` both reported zero known vulnerabilities.
- The latest read-only production check returned HTTP 200. It found a contact form and `/placeholder.svg` references; the shared startup log did not show a portfolio seeder run. The production deployment has not been updated or written to.
- Placeholder-image handling is covered by tests for local, relative, CDN, and query/hash URL variants. Seeder repeat-run checks confirm old text, titles, and publication flags remain intact as placeholder images are cleared or replaced.
- The admin project form and create/update APIs use the same image normalization, so editing an absolute or query-suffixed placeholder cannot save it back to the database.
- The icon editor retains React Icons and its existing saved icon names through a curated icon map. The public About page's first-load JS fell from 7.55 MB to 199 KB, and the About editor route fell from 7.6 MB to 253 KB in the production build report.
