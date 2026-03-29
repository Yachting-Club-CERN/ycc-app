import { beforeEach, describe, expect, test, vi } from "vitest";

import { auth, User } from "@/context/auth/AuthenticationContext";

const mockKeycloak = vi.hoisted(() => ({
  init: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  updateToken: vi.fn(),
  loadUserInfo: vi.fn(),
  loadUserProfile: vi.fn(),
  authenticated: false,
  token: "mock-token",
  tokenParsed: undefined as Record<string, unknown> | undefined,
  idTokenParsed: undefined as Record<string, unknown> | undefined,
  subject: undefined,
  onTokenExpired: undefined as (() => void) | undefined,
}));

vi.mock("keycloak-js", () => ({
  default: function MockKeycloak(): typeof mockKeycloak {
    return mockKeycloak;
  },
}));

const keycloakUserInfo = {
  sub: "f:a9b693ac-d9aa-43c7-8b68-b3bb7d30cc8e:292",
  preferred_username: "HCHANG",
  email: "heather.chang@mailinator.com",
  given_name: "Heather",
  family_name: "Chang",
  groups: ["ycc-members-all-past-and-present"],
  roles: ["ycc-member-active", "offline_access"],
};

const keycloakProfile = {
  id: "f:a9b693ac-d9aa-43c7-8b68-b3bb7d30cc8e:292",
  username: "HCHANG",
  email: "heather.chang@mailinator.com",
  firstName: "Heather",
  lastName: "Chang",
};

const makeUser = (
  overrides: Partial<{
    keycloakId: string;
    memberId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    groups: string[];
    roles: string[];
  }> = {},
): User => {
  const defaults = {
    keycloakId: "f:uuid:42",
    memberId: 42,
    username: "JDOE",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    groups: [],
    roles: [],
  };
  const merged = { ...defaults, ...overrides };
  return new User(
    merged.keycloakId,
    merged.memberId,
    merged.username,
    merged.email,
    merged.firstName,
    merged.lastName,
    merged.groups,
    merged.roles,
  );
};

const initAuthenticated = async (
  overrides: {
    tokenParsed?: Record<string, unknown>;
    idTokenParsed?: Record<string, unknown>;
    userInfo?: Record<string, unknown>;
    profile?: Record<string, unknown>;
  } = {},
): Promise<void> => {
  mockKeycloak.init.mockResolvedValue(true);
  mockKeycloak.authenticated = true;
  mockKeycloak.tokenParsed = overrides.tokenParsed ?? {
    sub: keycloakUserInfo.sub,
  };
  mockKeycloak.idTokenParsed = overrides.idTokenParsed ?? {
    sub: keycloakUserInfo.sub,
  };
  mockKeycloak.loadUserInfo.mockResolvedValue(
    overrides.userInfo ?? keycloakUserInfo,
  );
  mockKeycloak.loadUserProfile.mockResolvedValue(
    overrides.profile ?? keycloakProfile,
  );

  await auth.init();
};

describe("User", () => {
  describe("activeMember", () => {
    test("true when role is present", () => {
      expect(makeUser({ roles: ["ycc-member-active"] }).activeMember).toBe(
        true,
      );
    });

    test("false when role is absent", () => {
      expect(makeUser().activeMember).toBe(false);
    });
  });

  describe("committeeMember", () => {
    test("true when role is present", () => {
      expect(
        makeUser({ roles: ["ycc-member-committee"] }).committeeMember,
      ).toBe(true);
    });

    test("false when role is absent", () => {
      expect(makeUser().committeeMember).toBe(false);
    });
  });

  describe("helpersAppAdmin", () => {
    test("true when role is present", () => {
      expect(
        makeUser({ roles: ["ycc-helpers-app-admin"] }).helpersAppAdmin,
      ).toBe(true);
    });

    test("false when role is absent", () => {
      expect(makeUser().helpersAppAdmin).toBe(false);
    });
  });

  describe("helpersAppEditor", () => {
    test("true when role is present", () => {
      expect(
        makeUser({ roles: ["ycc-helpers-app-editor"] }).helpersAppEditor,
      ).toBe(true);
    });

    test("false when role is absent", () => {
      expect(makeUser().helpersAppEditor).toBe(false);
    });
  });

  describe("helpersAppAdminOrEditor", () => {
    test("true when admin", () => {
      expect(
        makeUser({ roles: ["ycc-helpers-app-admin"] }).helpersAppAdminOrEditor,
      ).toBe(true);
    });

    test("true when editor", () => {
      expect(
        makeUser({ roles: ["ycc-helpers-app-editor"] }).helpersAppAdminOrEditor,
      ).toBe(true);
    });

    test("true when both", () => {
      expect(
        makeUser({
          roles: ["ycc-helpers-app-admin", "ycc-helpers-app-editor"],
        }).helpersAppAdminOrEditor,
      ).toBe(true);
    });

    test("false when neither", () => {
      expect(makeUser().helpersAppAdminOrEditor).toBe(false);
    });
  });

  describe("hasLicence", () => {
    test("matches case-insensitively", () => {
      const user = makeUser({ roles: ["ycc-licence-d"] });
      expect(user.hasLicence("D")).toBe(true);
      expect(user.hasLicence("d")).toBe(true);
    });

    test("returns false for missing licence", () => {
      expect(makeUser().hasLicence("D")).toBe(false);
    });

    test("works with multi-character licence names", () => {
      const user = makeUser({ roles: ["ycc-licence-motor"] });
      expect(user.hasLicence("Motor")).toBe(true);
      expect(user.hasLicence("MOTOR")).toBe(true);
    });
  });
});

describe("AuthenticationProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});

    mockKeycloak.authenticated = false;
    mockKeycloak.token = "mock-token";
    mockKeycloak.tokenParsed = undefined;
    mockKeycloak.idTokenParsed = undefined;
    mockKeycloak.subject = undefined;
    mockKeycloak.onTokenExpired = undefined;
    mockKeycloak.init.mockReset();
    mockKeycloak.login.mockReset();
    mockKeycloak.logout.mockReset();
    mockKeycloak.updateToken.mockReset();
    mockKeycloak.loadUserInfo.mockReset();
    mockKeycloak.loadUserProfile.mockReset();
  });

  test("not authenticated before init", () => {
    expect(auth.authenticated).toBe(false);
  });

  test("currentUser returns unknown user before init", () => {
    const user = auth.currentUser;
    expect(user.username).toBe("<unknown>");
    expect(user.memberId).toBe(-1);
  });

  test("successful authentication flow", async () => {
    await initAuthenticated({
      tokenParsed: {
        sub: keycloakUserInfo.sub,
        preferred_username: "HCHANG",
        email: "heather.chang@mailinator.com",
        given_name: "Heather",
        family_name: "Chang",
        roles: keycloakUserInfo.roles,
        groups: keycloakUserInfo.groups,
      },
      idTokenParsed: { sub: keycloakUserInfo.sub },
    });

    expect(auth.authenticated).toBe(true);
    expect(auth.currentUser.username).toBe("HCHANG");
    expect(auth.currentUser.memberId).toBe(292);
    expect(auth.currentUser.email).toBe("heather.chang@mailinator.com");
    expect(auth.currentUser.firstName).toBe("Heather");
    expect(auth.currentUser.lastName).toBe("Chang");
    expect(auth.currentUser.groups).toEqual([
      "ycc-members-all-past-and-present",
    ]);
    expect(auth.currentUser.roles).toEqual([
      "ycc-member-active",
      "offline_access",
    ]);
    expect(globalThis.oauth2Token).toBe("mock-token");
  });

  test("redirects to login when not authenticated", async () => {
    mockKeycloak.init.mockResolvedValue(false);
    mockKeycloak.login.mockResolvedValue(undefined);

    await auth.init();

    expect(mockKeycloak.login).toHaveBeenCalled();
  });

  test("handles init failure gracefully", async () => {
    mockKeycloak.init.mockRejectedValue(new Error("Network error"));

    await auth.init();

    expect(console.error).toHaveBeenCalledWith(
      "[auth] Authentication failed",
      expect.any(Error),
    );
  });

  test("handles user info/profile load failure", async () => {
    mockKeycloak.init.mockResolvedValue(true);
    mockKeycloak.authenticated = true;
    mockKeycloak.tokenParsed = { sub: keycloakUserInfo.sub };
    mockKeycloak.idTokenParsed = { sub: keycloakUserInfo.sub };
    mockKeycloak.loadUserInfo.mockRejectedValue(new Error("fail"));
    mockKeycloak.loadUserProfile.mockRejectedValue(new Error("fail"));

    await auth.init();

    expect(auth.authenticated).toBe(false);
  });

  test("UserFactory falls back to token data when profile/info are empty", async () => {
    await initAuthenticated({
      tokenParsed: {
        sub: "f:abc:99",
        preferred_username: "TOKEN_USER",
        email: "token@example.com",
        given_name: "Token",
        family_name: "User",
        groups: ["group-from-token"],
        roles: ["role-from-token"],
      },
      idTokenParsed: {},
      userInfo: {},
      profile: {},
    });

    expect(auth.currentUser.username).toBe("TOKEN_USER");
    expect(auth.currentUser.memberId).toBe(99);
    expect(auth.currentUser.email).toBe("token@example.com");
    expect(auth.currentUser.firstName).toBe("Token");
    expect(auth.currentUser.lastName).toBe("User");
    expect(auth.currentUser.groups).toEqual(["group-from-token"]);
    expect(auth.currentUser.roles).toEqual(["role-from-token"]);
  });

  test("UserFactory falls back to idToken when accessToken is also empty", async () => {
    await initAuthenticated({
      tokenParsed: {},
      idTokenParsed: {
        sub: "f:xyz:55",
        preferred_username: "ID_USER",
        email: "id@example.com",
        given_name: "Id",
        family_name: "Token",
        groups: ["id-group"],
        roles: ["id-role"],
      },
      userInfo: {},
      profile: {},
    });

    expect(auth.currentUser.username).toBe("ID_USER");
    expect(auth.currentUser.memberId).toBe(55);
    expect(auth.currentUser.roles).toEqual(["id-role"]);
  });

  test("UserFactory defaults to unknown when all sources are empty", async () => {
    await initAuthenticated({
      tokenParsed: {},
      idTokenParsed: {},
      userInfo: {},
      profile: {},
    });

    expect(auth.currentUser.username).toBe("<unknown>");
    expect(auth.currentUser.groups).toEqual([]);
    expect(auth.currentUser.roles).toEqual([]);
  });

  test("logout delegates to keycloak", async () => {
    mockKeycloak.logout.mockResolvedValue(undefined);

    await auth.logout();

    expect(mockKeycloak.logout).toHaveBeenCalled();
  });

  test("token refresh on expiry", async () => {
    await initAuthenticated();

    expect(mockKeycloak.onTokenExpired).toBeDefined();

    mockKeycloak.updateToken.mockResolvedValue(true);
    mockKeycloak.onTokenExpired!();

    await vi.waitFor(() => {
      expect(mockKeycloak.updateToken).toHaveBeenCalledWith(30);
    });
  });

  test("token not refreshed when still valid", async () => {
    await initAuthenticated();

    mockKeycloak.updateToken.mockResolvedValue(false);
    mockKeycloak.onTokenExpired!();

    await vi.waitFor(() => {
      expect(console.debug).toHaveBeenCalledWith("[auth] Token is still valid");
    });
  });

  test("token refresh failure triggers logout", async () => {
    mockKeycloak.logout.mockResolvedValue(undefined);

    await initAuthenticated();

    mockKeycloak.updateToken.mockRejectedValue(new Error("expired"));
    mockKeycloak.onTokenExpired!();

    await vi.waitFor(() => {
      expect(mockKeycloak.logout).toHaveBeenCalled();
    });
  });
});
