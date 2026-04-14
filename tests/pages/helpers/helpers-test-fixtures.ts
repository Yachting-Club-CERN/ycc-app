import { makeUser } from "@tests/factories";

export const adminUser = makeUser({
  username: "ADMIN",
  roles: ["ycc-member-active", "ycc-helpers-app-admin"],
});

export const editorUser = makeUser({
  username: "EDITOR",
  roles: ["ycc-member-active", "ycc-helpers-app-editor"],
});

export const regularUser = makeUser({
  username: "REGULAR",
  roles: ["ycc-member-active"],
});
