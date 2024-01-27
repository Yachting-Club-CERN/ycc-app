# YCC App

YCC Frontend Application. Skeleton based on [hello-react/03-react-keycloak](https://github.com/LajosCseppento/hello-react/tree/main/03-react-keycloak).

## Development

### Quick start

1. Start `ycc-local-db` (from `ycc-infra`)
2. Start `ycc-keycloak-local` (from `ycc-infra`) & configure it (see below)
3. Start `ycc-hull`
4. Populate test data if this is your first time
5. `pnpm install`
6. `pnpm start`

### Even quicker start

**Needs a CERN account.**

1. In `config.ts` choose `DEV_WITH_LOCAL_HULL_CONFIG`
2. Configure `ycc-hull` to use the DEVELOPMENT DB.
3. Start `ycc-hull`
4. `pnpm install`
5. `pnpm start`

## Configuring Keycloak

1. Create a realm `YCC-LOCAL` and select it
2. Add YCC user federation `ycc-db-local`
3. Create a client scope `ycc-client-groups-and-roles` which will allow clients to access Keycloak groups and roles for the user
4. Add mappers to the client scope:
   1. `Mappers -> Add mapper -> By configuration -> Group Membership`, token claim name: `groups`
   2. `Mappers -> Add mapper -> By configuration -> User realm role`, token claim name: `roles`, multivalued, type: `String`
   3. On all mappers enable `Add to user info`
5. Create a client `ycc-app-local`:
   1. For URLs use `http://localhost:3000`
   2. You need to enable `Standard flow` in capability config
   3. Add the `ycc-client-groups-and-roles` client scope

## Basic QA

```sh
pnpm lint
pnpm fix
```

You can run the end-to-end tests using Playwright:

```sh
pnpm exec playwright test --ui
```

This needs the full stack running with test data. There are several ways doing so:

- Run the tests on the DEV instance
- Run YCC App locally, connect it to the DEV environment
- Run YCC App and YCC Hull locally, connect both to the DEV environment
- Run all components locally (YCC App, YCC Hull, Keycloak server and the DB)

When writing end-to-end tests fewer longer ones are preferred over many short ones. This is because the first load of the page is slow. Also note that the tests share the same database and backend.

## Usage

Deployed on CERN OKD, built SPA served by `serve`.

### Testing Docker Build Locally

You can test the build locally. If you do not want to run the instance, but only inspect the contents, you can set the entry point in your local copy to `/bin/bash` for simplicity.

You can test the build with this command:

`docker build . -t ycc-app-local-test --build-arg REACT_APP_ENVIRONMENT=DEVELOPMENT`

Then start a new container from the image:

`docker run -p 3000:8080 -it ycc-app-local-test`
