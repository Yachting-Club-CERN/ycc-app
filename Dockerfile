ARG NODE_VERSION="16"

ARG VITE_APP_ENVIRONMENT
ARG VITE_APP_KEYCLOAK_SERVER_URL
ARG VITE_APP_KEYCLOAK_REALM
ARG VITE_APP_KEYCLOAK_CLIENT
ARG VITE_APP_YCC_HULL_URL

# Helper for resources
FROM registry.access.redhat.com/ubi9/nodejs-$NODE_VERSION-minimal as builder

ARG VITE_APP_ENVIRONMENT
ARG VITE_APP_KEYCLOAK_SERVER_URL
ARG VITE_APP_KEYCLOAK_REALM
ARG VITE_APP_KEYCLOAK_CLIENT
ARG VITE_APP_YCC_HULL_URL

ENV VITE_APP_ENVIRONMENT "$VITE_APP_ENVIRONMENT"
ENV VITE_APP_KEYCLOAK_SERVER_URL "$VITE_APP_KEYCLOAK_SERVER_URL"
ENV VITE_APP_KEYCLOAK_REALM "$VITE_APP_KEYCLOAK_REALM"
ENV VITE_APP_KEYCLOAK_CLIENT "$VITE_APP_KEYCLOAK_CLIENT"
ENV VITE_APP_ENVIRONMENT "$VITE_APP_ENVIRONMENT"

WORKDIR "/opt/app-root/src"
# 1001 = uid from parent container
COPY --chown=1001:0 . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Main image
FROM registry.access.redhat.com/ubi9/nodejs-$NODE_VERSION-minimal

WORKDIR "/opt/app-root/src"
RUN npm install -g serve
COPY --chown=1001:0 --from=builder "/opt/app-root/src/build" "/opt/app-root/src/build"

EXPOSE 8080
ENTRYPOINT ["serve", "--no-clipboard", "-s", "-p", "8080", "build"]
