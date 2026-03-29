type TestUser = {
  username: string;
  display: string;
};

export const TEST_USERS = {
  ADMIN: {
    username: "MHUFF",
    display: "Michele HUFF (MHUFF)",
  },
  CONTACT: {
    username: "JYORK",
    display: "Jennifer YORK (JYORK)",
  },
  MEMBER: {
    username: "KHARTMAN",
    display: "Katie HARTMAN (KHARTMAN)",
  },
} as const satisfies Record<string, TestUser>;
