# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Helper task cloning
- Helper task search
  - By free text, state, year
  - Remember previously selected search options
- Data validation using Zod
- Year-aware helper task list
- Confirmation dialog when signing up to helper tasks
- Confirmation dialog when posting multi-day shifts
- Helper task validation
- Helper tasks report view

### Changed

- Use Day.js over Date
- Always display and interpret dates in YCC time zone
- Add helper task type selector when specifying helper task timing

## [1.0.0] - 2024-01-30

### Fixed

- CTRL/SHIFT + click on a helper task in the list opens the task in a new tab/window

### Added

- End-to-end tests using Playwright

### Changed

- Display ongoing shifts on the helper tasks page
- Upgrade to YCC Hull API v1
- Migrate build from CRA to Vite
- Dependency upgrades (2024-01), notable:
  - TypeScript 5.3
  - Material UI X 6
  - `ubi9/nodejs-20-minimal` image for production

## [0.4.0] - 2023-06-26

### Changed

- Streamline API and model naming

## [0.3.0] - 2023-05-01

### Added

- Helpers task create/edit feature

### Changed

- Improve filtering options on the helper task list page

## [0.2.0] - 2023-04-12

### Added

- New DTOs: `LicenceInfo`, `HelperTaskCategory`, `HelperTask`, `HelperTaskHelper`
- Helper task list page
- Helper task details page
- Helper task subscription for captains and helpers
- Date format utilities

### Changed

- `User.id` superseded by `User.keycloakId: string` and `User.memberId: number`
- Members dialog info can be used with a simplified hook `useMemberInfoDialog()`
  - Also renamed `MembersDataGridDialog` to `MemberInfoDialog`

## [0.1.0] - 2023-04-05

### Added

- Initial version of the new & fancy YCC App service
- Mobile-friendly layout
- Members list page with popup dialog
- User profile page
- Keycloak integration
- YCC Hull integration
- Deployment on CERN OKD TEST

[unreleased]: https://github.com/Yachting-Club-CERN/ycc-app/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Yachting-Club-CERN/ycc-app/releases/tag/v1.0.0
[0.4.0]: https://github.com/Yachting-Club-CERN/ycc-app/releases/tag/v0.4.0
[0.3.0]: https://github.com/Yachting-Club-CERN/ycc-app/releases/tag/v0.3.0
[0.2.0]: https://github.com/Yachting-Club-CERN/ycc-app/releases/tag/v0.2.0
[0.1.0]: https://github.com/Yachting-Club-CERN/ycc-app/releases/tag/v0.1.0
