import Keycloak, {
  KeycloakConfig,
  KeycloakProfile,
  KeycloakTokenParsed,
} from "keycloak-js";
import { createContext } from "react";

import config from "@/config";

const KEYCLOAK_CONFIG: KeycloakConfig = {
  url: config.keycloakServerUrl,
  realm: config.keycloakRealm,
  clientId: config.keycloakClient,
};

const KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY = 30;

// Keycloak user info looks like this (information might be present on the access or the id token too):
//
// email: "heather.chang@mailinator.com"
// email_verified: false
// family_name: "Chang"
// given_name: "Heather"
// groups: [ "ycc-members-all-past-and-present" ]
// name: "Heather Chang"
// preferred_username: "HCHANG"
// roles:[ "ycc-member-active", "offline_access", "uma_authorization" ]
// sub: "f:034bfedc-ed3d-4169-be68-9fd337eddff2:282"
//
// Note 1: inactive members miss the "ycc-member-active" role
// Note 2: sub = "f:" + Keycloak component id + ":" + YCC DB user id
// Note 3: for Keycloak user profile please refer to KeycloakProfile

// Defined as {} in keycloak-js as of 2023-03
type KeycloakUserInfo = {
  readonly email?: unknown;
  readonly email_verified?: unknown;
  readonly family_name?: unknown;
  readonly given_name?: unknown;
  readonly groups?: unknown;
  readonly name?: unknown;
  readonly preferred_username?: unknown;
  readonly roles?: unknown;
  readonly sub?: unknown;
};

class User {
  constructor(
    readonly keycloakId: string,
    readonly memberId: number,
    readonly username: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly groups: readonly string[],
    readonly roles: readonly string[],
  ) {}

  get activeMember(): boolean {
    return this.roles.includes("ycc-member-active");
  }

  get committeeMember(): boolean {
    return this.roles.includes("ycc-member-committee");
  }

  get helpersAppAdmin(): boolean {
    return this.roles.includes("ycc-helpers-app-admin");
  }

  get helpersAppEditor(): boolean {
    return this.roles.includes("ycc-helpers-app-editor");
  }

  get helpersAppAdminOrEditor(): boolean {
    return this.helpersAppAdmin || this.helpersAppEditor;
  }

  hasLicence = (licence: string): boolean => {
    return this.roles.includes(`ycc-licence-${licence.toLowerCase()}`);
  };
}

class UserFactory {
  // Super resilient
  static create(
    info?: KeycloakUserInfo,
    profile?: KeycloakProfile,
    accessToken?: KeycloakTokenParsed,
    idToken?: KeycloakTokenParsed,
  ): User {
    const keycloakId = UserFactory.parseAsString(
      profile?.id,
      info?.sub,
      accessToken?.sub,
      idToken?.sub,
    );

    // 292 is YCC DB ID from sub 'f:a9b693ac-d9aa-43c7-8b68-b3bb7d30cc8e:292'
    const memberId = parseInt(keycloakId.split(":").slice(-1)[0]);

    const username = UserFactory.parseAsString(
      profile?.username,
      info?.preferred_username,
      accessToken?.preferred_username,
      idToken?.preferred_username,
    );

    const email = UserFactory.parseAsString(
      profile?.email,
      info?.email,
      accessToken?.email,
      idToken?.email,
    );

    const firstName = UserFactory.parseAsString(
      profile?.firstName,
      info?.given_name,
      accessToken?.given_name,
      idToken?.given_name,
    );

    const lastName = UserFactory.parseAsString(
      profile?.lastName,
      info?.family_name,
      accessToken?.family_name,
      idToken?.family_name,
    );

    const groups = UserFactory.parseAsStringArray(
      info?.groups,
      accessToken?.groups,
      idToken?.groups,
    );

    const roles = UserFactory.parseAsStringArray(
      info?.roles,
      accessToken?.roles,
      idToken?.roles,
    );

    return new User(
      keycloakId,
      memberId,
      username,
      email,
      firstName,
      lastName,
      groups,
      roles,
    );
  }

  private static parseAsString(...potentialValues: unknown[]): string {
    return (
      potentialValues
        .map((value) => value?.toString())
        .find((value) => value) ?? _UNKNOWN
    );
  }

  private static parseAsStringArray(
    ...potentialValueArrays: unknown[]
  ): string[] {
    const potentialValueArray = potentialValueArrays.find((value) =>
      Array.isArray(value),
    ) as unknown[] | undefined;
    const valueArray = potentialValueArray
      ?.map((el) => el?.toString())
      .filter((el) => el) as string[] | undefined;
    return valueArray ?? [];
  }
}

const _UNKNOWN = "<unknown>";

const UNKNOWN_USER: User = new User(
  _UNKNOWN,
  -1,
  _UNKNOWN,
  _UNKNOWN,
  _UNKNOWN,
  _UNKNOWN,
  [],
  [],
);

class AuthenticationProvider {
  private readonly _keycloak: Keycloak;
  private _user: User | null;

  public constructor() {
    this._keycloak = new Keycloak(KEYCLOAK_CONFIG);
    this._user = null;
  }

  get authenticated(): boolean {
    return this._keycloak.authenticated ? !!this._user : false;
  }

  get currentUser(): User {
    // Simplify component code by not making it nullable
    return this._user || UNKNOWN_USER;
  }

  readonly init = async () => {
    this._keycloak.onTokenExpired = () => {
      this._keycloak
        .updateToken(KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY)
        .then((refreshed) => {
          if (refreshed) {
            this.updateGlobalToken();
            console.debug("[auth] Token was successfully refreshed");
          } else {
            console.debug("[auth] Token is still valid");
          }
        })
        .catch(async () => {
          console.info(
            "[auth] Failed to refresh the token or the session has expired",
          );
          await this.logout();
        });
    };

    try {
      const authenticated = await this._keycloak.init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso`,
        // checkLoginIframe: false, // Prevents flickering during loading on Firefox
      });

      if (authenticated) {
        console.debug("[auth] Authenticated:", authenticated);
        console.debug("[auth] Subject:", this._keycloak.subject);

        const accessToken = this._keycloak.tokenParsed;
        console.debug("[auth] Access token:", accessToken);
        const idToken = this._keycloak.idTokenParsed;
        console.debug("[auth] ID token:", idToken);

        const loadUserInfo = this._keycloak.loadUserInfo();
        loadUserInfo
          .then((info) => console.debug("[auth] User info", info))
          .catch(() => console.error("[auth] Failed to load user info"));

        // this._keycloak.

        const loadUserProfile = this._keycloak.loadUserProfile();
        loadUserProfile
          .then((profile) => console.debug("[auth] User profile", profile))
          .catch(() => console.error("[auth] Failed to load user info"));

        return Promise.all([loadUserInfo, loadUserProfile])
          .then(([info, profile]) => {
            this._user = UserFactory.create(
              info,
              profile,
              accessToken,
              idToken,
            );
            this.updateGlobalToken();
            console.debug("[auth] User:", this._user);
          })
          .catch(() => {
            console.error("[auth] Failed to load user info and profile");
            this._user = null;
          });
      } else {
        console.error("[auth] Not authenticated");
        await this._keycloak.login();
        return Promise.reject(new Error("Not authenticated"));
      }
    } catch (error) {
      return console.error("[auth] Authentication failed", error);
    }
  };

  public readonly logout = async () => {
    console.debug("[auth] Logging out");
    await this._keycloak.logout();
  };

  private readonly updateGlobalToken = () => {
    window.oauth2Token = this._keycloak.token;
  };
}

const auth = new AuthenticationProvider();

export { auth, User };

const AuthenticationContext = createContext<AuthenticationProvider>(auth);
export default AuthenticationContext;
