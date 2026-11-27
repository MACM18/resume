# Portfolio refresh and project publishing plan

## Goal

Turn macm.dev into a clear, creative portfolio that helps a hiring manager quickly understand who MACM is, what has been built, and how to make contact. Replace the traditional, multi-page visitor journey with a fast, single-page story while preserving the current profile and project data.

## Public portfolio direction

- Build one scrollable story page with clear chapter links and a compact navigation.
- Story order: introduction and primary actions; proof and current focus; selected projects; experience and approach; capabilities; short personal context; contact.
- Add a rounded rope or thread as the visual spine. Let it move in a gentle zigzag between chapters, with a marker at each section and a subtle progress fill as the visitor scrolls.
- Keep the rope behind the content with wide bends and generous spacing. On mobile, simplify it to a line along one side of the page.
- Keep animation restrained: short reveals and rope progress only. Respect reduced-motion preferences.
- Prioritize load time and low frontend complexity. Reuse the current stack, avoid adding an animation dependency, and keep client-side behavior to small interactive elements where possible.
- Use current profile, project, work-experience, social-link, highlight, achievement, and skill data. Avoid a database schema change for the first pass.
- Continue using production project images and links where available. When a project has no image, show a compact project information block instead of a placeholder image.

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
| Confidential company management system (checking-ta) | A company management system with operational features for organizing company work and information | No public link included | No public link included | This high-level description is approved. Keep the company identity, customer/company data, screenshots, repository, and specific workflows private. |
| Home lab and VPS infrastructure | Docker and Dokploy hosting, self-hosted mail, DNS, and application operations | No public link included | No public link included | Do not publish server addresses or account details. |

Do not seed the CSE Asset Management project. Favor MACM Studio and NNS Enterprise, with Daymark Store Desk as another project entry. Include home lab, VPS, Docker, Dokploy, and mail server experience in the skills and infrastructure content. Keep checking-ta high-level and confidential as described above.

## Decisions captured from this conversation

- The portfolio should feel current, creative, and easy for a hiring manager or potential client to scan, rather than like a traditional resume site.
- Present it as a fast, single-page animated story using existing profile and project data. Use a rounded thread/rope that travels in a gentle zigzag between story chapters, with restrained scroll progress and motion; reduce the treatment on small screens and honor reduced-motion preferences.
- Keep front-end complexity and load time low. Prefer the current stack and small, focused interactions over a large animation/component framework.
- Use current production images and verified GitHub/live URLs where available. Do not invent links or use placeholder images; use a compact text block when a project has no image.
- The project list above is the proposed portfolio inventory. Keep checking-ta out of public repository, demo, image, and company-identifying details; the approved public wording is only that it is a company management system with operational features.
- Seed the existing production owner's data through owner-scoped, reviewable admin actions after deployment. Do not reset the database, delete current projects, or include CSE Asset Management. The exact sections and production prerequisites are documented below.

Earlier admin-area requirements from this conversation remain part of the product context: a dedicated dashboard layout with fixed sidebar, back-to-home action, responsive mobile drawer/top bar, no public navbar in admin, separate Overview / Content / Portfolio / Media / Settings routes, compact conventional tabs with save scoped to the current tab, and simpler well-organized editing controls. The admin should support a fixed color palette with light/dark modes, additional theme options and custom hex colors, and an `OWNER="MACM"`-gated update/fill action with a warning confirmation. The public landing page should have a small MACM.lk-branded footer and use the supplied MACM logo/icon where appropriate. These are recorded as requirements from the earlier dashboard work, separate from the current public story-page implementation.

## Production data seeding

The user approved seeding the selected content for the existing owner/current user. The owner authenticated preset endpoint performs the work in a transaction and scopes all project, profile, and resume changes to the signed-in site owner. It does not reset the database or delete existing projects.

After the updated app is deployed, apply the recommended preset separately from these admin pages:

1. **Portfolio → Projects:** Apply recommended to add/update the selected project records and publish them. The confirmation names the included projects, excludes CSE Asset Management, and describes the generic confidential entry.
2. **Content → Home:** Apply recommended to set the story intro and infrastructure capability groups.
3. **Content → About:** Apply recommended to set the approved profile story and skills.
4. **Portfolio → Resumes:** Apply recommended to add the infrastructure skills to the active resume record.

Apply these sections individually rather than using the all-sections preset, which also changes unrelated theme, work, and gallery content.

The code and confirmation flows are ready, but no production database write has happened yet: this workspace has no production `DATABASE_URL` or authenticated production session. The production actions require the updated build to be deployed and the owner to be signed in. Existing production images for the portfolio and NNS entries are reused; projects without approved images render compact text blocks.

## Pending decisions

- Decide whether signed-in tools such as Daymark and MACM Books should have sanitized screenshots, public demos, or code links only.
- Deploy the updated app, then apply the four owner presets above and verify the resulting public page.
