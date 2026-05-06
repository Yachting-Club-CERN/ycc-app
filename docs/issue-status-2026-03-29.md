# Issue tracker status (2026-04-14)

Categorized snapshot of open issues with brief relevance notes.

## Authentication / Access
- **#132 Replace Keycloak with Enrico's SSO** — Major auth change removing Keycloak library; impacts login flow, token validation, and role propagation across frontend and backend.
- **#137 2026 high-level task list** — Remaining open item: migrate from Keycloak to Enrico's custom auth; umbrella tracker for yearly housekeeping.

## UX / Navigation
- **#141 Boat emoji link is misleading** — Header emoji currently links to old reserve page; should be corrected or removed to avoid confusion.
- **#131 Page title contains task title** — Add task title to document title for better context/SEO when editing/viewing tasks.
- **#125 Add Thursday practice form link** — Surface Google Form link as dedicated menu item for easier discovery.

## Helper task features & rules
- **#140 Post helper shifts with minimum 2 helpers** — Enforce two-helper minimum on surveillance shifts; affects task creation defaults and notifications for insufficient helpers.
- **#114 PWA urgent-task badge** — Show badge when urgent tasks are available for the user to sign up; affects PWA notifications/UI.
- **#113 PWA offline mode** — Provide offline indicator and limited offline views (My tasks, member list); requires caching strategy.
- **#105 Admin page to list helper task categories** — Adds admin UI to view categories, supporting content maintenance.
- **#94 Use member helper task/interest preferences** — Incorporate stored preferences into task matching/sign-up UX.
- **#49 Auto-create motorboat booking reminder for surveillance shifts** — Add booking selection/reminder in task creation to prevent missed boat bookings.
- **#21 Display helper task category descriptions** — Show short/long descriptions (TinyMCE/HTML) in category views.

## Data/content correctness
- **#123 Phone number shuffles** — Fix ordering/labeling of work/home/WhatsApp numbers in app and emails.

## Monitoring / Analytics
- **#72 Front-end monitoring** — Add Sentry (or similar) to capture client errors and usage for helpers flow.
- **#14 Web analytics** — Add analytics (Google/Matomo) for site usage tracking; likely minimal UI impact but requires consent handling.

## Developer tooling / API client
- **#145 Migrate to Orval and Tanstack Query** — Modernize API client generation and data fetching; impacts data layer, caching, and request patterns.
