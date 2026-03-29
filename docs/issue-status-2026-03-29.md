# Issue tracker status (2026-03-29)

Categorised snapshot of open issues with brief relevance notes.

## Authentication / Access
- **#132 Replace Keycloak with Enrico's SSO** — Major auth change removing Keycloak library; impacts login flow, token validation, and role propagation across frontend and backend.

## UX / Navigation
- **#133 Improve FAB/edit task UX** — Clarify the "+" FAB behaviour on the edit task page to reduce editor confusion.
- **#131 Page title contains task title** — Add task title to document title for better context/SEO when editing/viewing tasks.

## Helper task features & rules
- **#134 Helper statistics** — Annual AGM statistics need in-app generation instead of ad-hoc SQL/Excel; requires new reporting UI/logic.
- **#130 Remove mid-June sign-up limit on surveillance tasks** — Relax current business rule limiting early sign-ups; affects signup validation logic.
- **#106 Allow members to replace each other on tasks** — Introduces replacement workflow, confirmations, and notifications; touches task eligibility rules.
- **#105 Admin page to list helper task categories** — Adds admin UI to view categories, supporting content maintenance.
- **#94 Use member helper task/interest preferences** — Incorporate stored preferences into task matching/sign-up UX.
- **#114 PWA urgent-task badge** — Show badge when urgent tasks are available for the user to sign up; affects PWA notifications/UI.
- **#113 PWA offline mode** — Provide offline indicator and limited offline views (My tasks, member list); requires caching strategy.
- **#28 User-friendly helper task images** — Standardise image storage in DB and rendering in rich text; impacts task editor/viewer.
- **#21 Display helper task category descriptions** — Show short/long descriptions (TinyMCE/HTML) in category views.
- **#49 Auto-create motorboat booking reminder for surveillance shifts** — Add booking selection/reminder in task creation to prevent missed boat bookings.

## Data/content correctness
- **#123 Phone number shuffles** — Fix ordering/labeling of work/home/WhatsApp numbers in app and emails.
- **#125 Add Thursday practice form link** — Surface Google Form link as dedicated menu item for easier discovery.

## Monitoring / Analytics
- **#72 Front-end monitoring** — Add Sentry (or similar) to capture client errors and usage for helpers flow.
- **#14 Web analytics** — Add analytics (Google/Matomo) for site usage tracking; likely minimal UI impact but requires consent handling.
