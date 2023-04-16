# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Helpers task creation page

### Changed

- Improve filtering options on the task list page

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

[unreleased]: https://github.com/Yachting-Club-CERN/ycc-app/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Yachting-Club-CERN/ycc-app/releases/tag/v0.2.0
[0.1.0]: https://github.com/Yachting-Club-CERN/ycc-app/releases/tag/v0.1.0
