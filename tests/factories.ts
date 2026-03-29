import { User } from "@/context/auth/AuthenticationContext";
import { LicenceInfo, MemberPublicInfo } from "@/model/dtos";
import {
  HelperTask,
  HelperTaskCategory,
  HelperTaskHelper,
  HelperTaskState,
  HelperTaskType,
} from "@/model/helpers-dtos";
import dayjs from "@/utils/dayjs";

export const makeMember = (
  overrides: Partial<MemberPublicInfo> = {},
): MemberPublicInfo => ({
  id: 1,
  username: "JDOE",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  mobilePhone: null,
  homePhone: null,
  workPhone: null,
  ...overrides,
});

export const makeCategory = (
  overrides: Partial<HelperTaskCategory> = {},
): HelperTaskCategory => ({
  id: 1,
  title: "Surveillance",
  shortDescription: "Watch",
  longDescription: null,
  ...overrides,
});

export const makeHelper = (
  overrides: Partial<HelperTaskHelper> = {},
): HelperTaskHelper => ({
  member: makeMember(),
  signedUpAt: dayjs("2025-01-01"),
  ...overrides,
});

export const makeLicence = (
  overrides: Partial<LicenceInfo> = {},
): LicenceInfo => ({
  id: 1,
  licence: "SU",
  ...overrides,
});

export const makeTask = (overrides: Partial<HelperTask> = {}): HelperTask => {
  const defaults = {
    id: 1,
    category: makeCategory(),
    title: "Test Task",
    shortDescription: "A test",
    longDescription: null,
    contact: makeMember(),
    startsAt: dayjs.tz("2025-06-15 08:00:00", "Europe/Zurich"),
    endsAt: dayjs.tz("2025-06-15 18:00:00", "Europe/Zurich"),
    deadline: null,
    urgent: false,
    captainRequiredLicenceInfo: null,
    helperMinCount: 1,
    helperMaxCount: 3,
    published: true,
    captain: null,
    helpers: [],
    markedAsDoneAt: null,
    markedAsDoneBy: null,
    markedAsDoneComment: null,
    validatedAt: null,
    validatedBy: null,
    validationComment: null,
  };
  const merged = { ...defaults, ...overrides };
  return {
    ...merged,
    get type(): HelperTaskType {
      if (merged.startsAt && merged.endsAt && !merged.deadline)
        return HelperTaskType.Shift;
      if (!merged.startsAt && !merged.endsAt && merged.deadline)
        return HelperTaskType.Deadline;
      return HelperTaskType.Unknown;
    },
    get state(): HelperTaskState {
      if (merged.validatedAt) return HelperTaskState.Validated;
      if (merged.markedAsDoneAt) return HelperTaskState.Done;
      return HelperTaskState.Pending;
    },
    get searchString(): string {
      return "";
    },
  };
};

export const makeUser = (
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
  const merged = {
    keycloakId: "f:uuid:42",
    memberId: 42,
    username: "JDOE",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    groups: [],
    roles: [],
    ...overrides,
  };
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

// =============================================================================
// Raw factories (for Zod schema tests that need plain JSON input)
// =============================================================================

export const makeCategoryRaw = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  id: 1,
  title: "Surveillance",
  shortDescription: "Watch",
  longDescription: null,
  ...overrides,
});

export const makeMemberRaw = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  id: 1,
  username: "JDOE",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  mobilePhone: null,
  homePhone: null,
  workPhone: null,
  ...overrides,
});

export const makeTaskRaw = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  id: 1,
  category: makeCategoryRaw(),
  title: "Test Task",
  shortDescription: "A test",
  longDescription: null,
  contact: makeMemberRaw(),
  startsAt: "2025-06-15T08:00:00",
  endsAt: "2025-06-15T18:00:00",
  deadline: null,
  urgent: false,
  captainRequiredLicenceInfo: null,
  helperMinCount: 1,
  helperMaxCount: 3,
  published: true,
  captain: null,
  helpers: [],
  markedAsDoneAt: null,
  markedAsDoneBy: null,
  markedAsDoneComment: null,
  validatedAt: null,
  validatedBy: null,
  validationComment: null,
  ...overrides,
});
