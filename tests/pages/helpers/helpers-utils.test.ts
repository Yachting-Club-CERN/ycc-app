import { describe, expect, test } from "vitest";

import { User } from "@/context/auth/AuthenticationContext";
import { LicenceInfo, MemberPublicInfo } from "@/model/dtos";
import {
  HelperTask,
  HelperTaskHelper,
  HelperTaskState,
  HelperTaskType,
} from "@/model/helpers-dtos";
import {
  canAddHelper,
  canAddOrRemoveMembers,
  canEdit,
  canMarkAsDone,
  canSetCaptain,
  canSignUp,
  canSignUpAsCaptain,
  canSignUpAsHelper,
  canValidate,
  getTaskCloneLocation,
  getTaskEditLocation,
  getTaskLocation,
  hasAnyoneSignedUp,
  isContact,
  isHappeningNow,
  isMultiDayShift,
  isSignedUp,
  isSignedUpAsCaptain,
  isSignedUpAsHelper,
  isUpcoming,
} from "@/pages/helpers/helpers-utils";
import dayjs from "@/utils/dayjs";

// =============================================================================
// Test factories
// =============================================================================

const makeMember = (
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

const makeHelper = (
  member: MemberPublicInfo = makeMember(),
): HelperTaskHelper => ({
  member,
  signedUpAt: dayjs("2025-01-01"),
});

const makeLicence = (licence = "SU"): LicenceInfo => ({
  id: 1,
  licence,
});

const makeUser = (overrides: Partial<User> = {}): User => {
  // User is a class with getters, so we construct it properly
  const defaults = {
    keycloakId: "f:abc:1",
    memberId: 1,
    username: "JDOE",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    groups: [],
    roles: ["ycc-member-active"],
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

const adminUser = makeUser({
  username: "ADMIN",
  roles: ["ycc-member-active", "ycc-helpers-app-admin"],
});

const editorUser = makeUser({
  username: "EDITOR",
  roles: ["ycc-member-active", "ycc-helpers-app-editor"],
});

const regularUser = makeUser({ username: "REGULAR", memberId: 99 });

const suUser = makeUser({
  username: "SULICENCE",
  memberId: 50,
  roles: ["ycc-member-active", "ycc-licence-su"],
});

const future = dayjs().add(7, "days");
const past = dayjs().subtract(7, "days");

const makeTask = (overrides: Partial<HelperTask> = {}): HelperTask => {
  const defaults = {
    id: 1,
    category: {
      id: 1,
      title: "Surveillance",
      shortDescription: "Watch",
      longDescription: null,
    },
    title: "Test Task",
    shortDescription: "A test",
    longDescription: null,
    contact: makeMember({ username: "CONTACT", id: 10 }),
    startsAt: future,
    endsAt: future.add(4, "hours"),
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

// =============================================================================
// Tests
// =============================================================================

describe("URL builders", () => {
  test("getTaskLocation", () => {
    expect(getTaskLocation(42)).toBe("/helpers/tasks/42");
  });

  test("getTaskEditLocation", () => {
    expect(getTaskEditLocation(42)).toBe("/helpers/tasks/42/edit");
  });

  test("getTaskCloneLocation", () => {
    expect(getTaskCloneLocation(42)).toBe("/helpers/tasks/new?from=42");
  });
});

describe("isMultiDayShift", () => {
  test("same-day shift is not multi-day", () => {
    const task = makeTask({
      startsAt: dayjs("2025-06-15T08:00:00"),
      endsAt: dayjs("2025-06-15T18:00:00"),
    });
    expect(isMultiDayShift(task)).toBe(false);
  });

  test("different-day shift is multi-day", () => {
    const task = makeTask({
      startsAt: dayjs("2025-06-15T08:00:00"),
      endsAt: dayjs("2025-06-16T18:00:00"),
    });
    expect(isMultiDayShift(task)).toBe(true);
  });

  test("deadline task is not multi-day", () => {
    const task = makeTask({
      startsAt: null,
      endsAt: null,
      deadline: future,
    });
    expect(isMultiDayShift(task)).toBe(false);
  });
});

describe("isHappeningNow", () => {
  test("shift happening now", () => {
    const task = makeTask({
      startsAt: dayjs().subtract(1, "hour"),
      endsAt: dayjs().add(1, "hour"),
    });
    expect(isHappeningNow(task)).toBe(true);
  });

  test("future shift is not happening now", () => {
    const task = makeTask({
      startsAt: future,
      endsAt: future.add(4, "hours"),
    });
    expect(isHappeningNow(task)).toBe(false);
  });

  test("past shift is not happening now", () => {
    const task = makeTask({
      startsAt: past,
      endsAt: past.add(4, "hours"),
    });
    expect(isHappeningNow(task)).toBe(false);
  });

  test("deadline task is never happening now", () => {
    const task = makeTask({
      startsAt: null,
      endsAt: null,
      deadline: dayjs().add(1, "hour"),
    });
    expect(isHappeningNow(task)).toBe(false);
  });
});

describe("isUpcoming", () => {
  test("future shift is upcoming", () => {
    expect(isUpcoming(makeTask())).toBe(true);
  });

  test("past shift is not upcoming", () => {
    const task = makeTask({
      startsAt: past,
      endsAt: past.add(4, "hours"),
    });
    expect(isUpcoming(task)).toBe(false);
  });

  test("future deadline is upcoming", () => {
    const task = makeTask({
      startsAt: null,
      endsAt: null,
      deadline: future,
    });
    expect(isUpcoming(task)).toBe(true);
  });

  test("past deadline is not upcoming", () => {
    const task = makeTask({
      startsAt: null,
      endsAt: null,
      deadline: past,
    });
    expect(isUpcoming(task)).toBe(false);
  });
});

describe("isContact", () => {
  test("matching username", () => {
    const task = makeTask({ contact: makeMember({ username: "JDOE" }) });
    expect(isContact(task, makeUser({ username: "JDOE" }))).toBe(true);
  });

  test("non-matching username", () => {
    const task = makeTask({ contact: makeMember({ username: "OTHER" }) });
    expect(isContact(task, makeUser({ username: "JDOE" }))).toBe(false);
  });
});

describe("isSignedUpAsCaptain", () => {
  test("user is captain", () => {
    const task = makeTask({
      captain: makeHelper(makeMember({ username: "JDOE" })),
    });
    expect(isSignedUpAsCaptain(task, makeUser({ username: "JDOE" }))).toBe(
      true,
    );
  });

  test("no captain", () => {
    expect(
      isSignedUpAsCaptain(makeTask(), makeUser({ username: "JDOE" })),
    ).toBe(false);
  });

  test("different captain", () => {
    const task = makeTask({
      captain: makeHelper(makeMember({ username: "OTHER" })),
    });
    expect(isSignedUpAsCaptain(task, makeUser({ username: "JDOE" }))).toBe(
      false,
    );
  });
});

describe("isSignedUpAsHelper", () => {
  test("user is helper", () => {
    const task = makeTask({
      helpers: [makeHelper(makeMember({ username: "JDOE" }))],
    });
    expect(isSignedUpAsHelper(task, makeUser({ username: "JDOE" }))).toBe(true);
  });

  test("user is not helper", () => {
    expect(isSignedUpAsHelper(makeTask(), makeUser({ username: "JDOE" }))).toBe(
      false,
    );
  });
});

describe("isSignedUp", () => {
  test("signed up as captain", () => {
    const task = makeTask({
      captain: makeHelper(makeMember({ username: "JDOE" })),
    });
    expect(isSignedUp(task, makeUser({ username: "JDOE" }))).toBe(true);
  });

  test("signed up as helper", () => {
    const task = makeTask({
      helpers: [makeHelper(makeMember({ username: "JDOE" }))],
    });
    expect(isSignedUp(task, makeUser({ username: "JDOE" }))).toBe(true);
  });

  test("not signed up", () => {
    expect(isSignedUp(makeTask(), makeUser({ username: "JDOE" }))).toBe(false);
  });
});

// =============================================================================
// hasAnyoneSignedUp
// =============================================================================

describe("hasAnyoneSignedUp", () => {
  test("no captain, no helpers", () => {
    expect(hasAnyoneSignedUp(makeTask())).toBe(false);
  });

  test("has captain", () => {
    expect(hasAnyoneSignedUp(makeTask({ captain: makeHelper() }))).toBe(true);
  });

  test("has helpers", () => {
    expect(hasAnyoneSignedUp(makeTask({ helpers: [makeHelper()] }))).toBe(true);
  });
});

describe("canEdit", () => {
  test("admin can always edit", () => {
    expect(canEdit(makeTask(), adminUser)).toBe(true);
  });

  test("editor can edit if contact", () => {
    const task = makeTask({ contact: makeMember({ username: "EDITOR" }) });
    expect(canEdit(task, editorUser)).toBe(true);
  });

  test("editor cannot edit if not contact", () => {
    expect(canEdit(makeTask(), editorUser)).toBe(false);
  });

  test("regular user cannot edit", () => {
    expect(canEdit(makeTask(), regularUser)).toBe(false);
  });
});

describe("canSignUpAsCaptain", () => {
  test("can sign up for upcoming published pending task without captain", () => {
    expect(canSignUpAsCaptain(makeTask(), regularUser)).toBe(true);
  });

  test("cannot sign up for past task", () => {
    const task = makeTask({ startsAt: past, endsAt: past.add(4, "hours") });
    expect(canSignUpAsCaptain(task, regularUser)).toBe(false);
  });

  test("cannot sign up for unpublished task", () => {
    expect(
      canSignUpAsCaptain(makeTask({ published: false }), regularUser),
    ).toBe(false);
  });

  test("cannot sign up if captain already set", () => {
    expect(
      canSignUpAsCaptain(makeTask({ captain: makeHelper() }), regularUser),
    ).toBe(false);
  });

  test("cannot sign up if already signed up as helper", () => {
    const task = makeTask({
      helpers: [makeHelper(makeMember({ username: "REGULAR" }))],
    });
    expect(canSignUpAsCaptain(task, regularUser)).toBe(false);
  });

  test("cannot sign up if task is done", () => {
    const task = makeTask({ markedAsDoneAt: dayjs() });
    expect(canSignUpAsCaptain(task, regularUser)).toBe(false);
  });

  test("cannot sign up without required licence", () => {
    const task = makeTask({ captainRequiredLicenceInfo: makeLicence("SU") });
    expect(canSignUpAsCaptain(task, regularUser)).toBe(false);
  });

  test("can sign up with required licence", () => {
    const task = makeTask({ captainRequiredLicenceInfo: makeLicence("SU") });
    expect(canSignUpAsCaptain(task, suUser)).toBe(true);
  });
});

describe("canSignUpAsHelper", () => {
  test("can sign up for upcoming published pending task", () => {
    expect(canSignUpAsHelper(makeTask(), regularUser)).toBe(true);
  });

  test("cannot sign up if max helpers reached", () => {
    const task = makeTask({
      helperMaxCount: 1,
      helpers: [makeHelper(makeMember({ username: "OTHER" }))],
    });
    expect(canSignUpAsHelper(task, regularUser)).toBe(false);
  });

  test("cannot sign up if already captain", () => {
    const task = makeTask({
      captain: makeHelper(makeMember({ username: "REGULAR" })),
    });
    expect(canSignUpAsHelper(task, regularUser)).toBe(false);
  });

  test("cannot sign up if already helper", () => {
    const task = makeTask({
      helpers: [makeHelper(makeMember({ username: "REGULAR" }))],
    });
    expect(canSignUpAsHelper(task, regularUser)).toBe(false);
  });
});

describe("canSignUp", () => {
  test("true if can sign up as captain", () => {
    expect(canSignUp(makeTask(), regularUser)).toBe(true);
  });

  test("true if can sign up as helper but not captain", () => {
    // Captain slot taken, but helper slot open
    const task = makeTask({
      captain: makeHelper(makeMember({ username: "OTHER" })),
    });
    expect(canSignUp(task, regularUser)).toBe(true);
  });

  test("false if neither", () => {
    const task = makeTask({ published: false });
    expect(canSignUp(task, regularUser)).toBe(false);
  });
});

describe("canAddOrRemoveMembers", () => {
  test("admin on published task", () => {
    expect(canAddOrRemoveMembers(makeTask(), adminUser)).toBe(true);
  });

  test("admin on unpublished task", () => {
    expect(
      canAddOrRemoveMembers(makeTask({ published: false }), adminUser),
    ).toBe(false);
  });

  test("regular user", () => {
    expect(canAddOrRemoveMembers(makeTask(), regularUser)).toBe(false);
  });
});

describe("canSetCaptain", () => {
  test("admin, no captain", () => {
    expect(canSetCaptain(makeTask(), adminUser)).toBe(true);
  });

  test("cannot if captain already set", () => {
    expect(canSetCaptain(makeTask({ captain: makeHelper() }), adminUser)).toBe(
      false,
    );
  });
});

describe("canAddHelper", () => {
  test("admin, space available", () => {
    expect(canAddHelper(makeTask(), adminUser)).toBe(true);
  });

  test("cannot if max reached", () => {
    const task = makeTask({
      helperMaxCount: 1,
      helpers: [makeHelper()],
    });
    expect(canAddHelper(task, adminUser)).toBe(false);
  });
});

describe("canMarkAsDone", () => {
  const pastTask = makeTask({
    startsAt: past,
    endsAt: past.add(4, "hours"),
    contact: makeMember({ username: "CONTACT" }),
  });

  test("admin can mark past task as done", () => {
    expect(canMarkAsDone(pastTask, adminUser)).toBe(true);
  });

  test("contact can mark past task as done", () => {
    const contactUser = makeUser({ username: "CONTACT" });
    expect(canMarkAsDone(pastTask, contactUser)).toBe(true);
  });

  test("captain can mark past task as done", () => {
    const task = makeTask({
      ...pastTask,
      captain: makeHelper(makeMember({ username: "CAPTAIN" })),
    });
    const captainUser = makeUser({ username: "CAPTAIN" });
    expect(canMarkAsDone(task, captainUser)).toBe(true);
  });

  test("regular user cannot mark as done", () => {
    expect(canMarkAsDone(pastTask, regularUser)).toBe(false);
  });

  test("cannot mark upcoming shift as done", () => {
    expect(canMarkAsDone(makeTask(), adminUser)).toBe(false);
  });

  test("cannot mark unpublished task as done", () => {
    const task = makeTask({ ...pastTask, published: false });
    expect(canMarkAsDone(task, adminUser)).toBe(false);
  });

  test("cannot mark already done task as done", () => {
    const task = makeTask({ ...pastTask, markedAsDoneAt: dayjs() });
    expect(canMarkAsDone(task, adminUser)).toBe(false);
  });

  test("deadline task can be marked as done by admin", () => {
    const task = makeTask({
      startsAt: null,
      endsAt: null,
      deadline: past,
      contact: makeMember({ username: "CONTACT" }),
    });
    expect(canMarkAsDone(task, adminUser)).toBe(true);
  });
});

describe("canValidate", () => {
  const pastTask = makeTask({
    startsAt: past,
    endsAt: past.add(4, "hours"),
    contact: makeMember({ username: "CONTACT" }),
  });

  test("admin can validate past task", () => {
    expect(canValidate(pastTask, adminUser)).toBe(true);
  });

  test("contact can validate past task", () => {
    const contactUser = makeUser({ username: "CONTACT" });
    expect(canValidate(pastTask, contactUser)).toBe(true);
  });

  test("regular user cannot validate", () => {
    expect(canValidate(pastTask, regularUser)).toBe(false);
  });

  test("cannot validate upcoming shift", () => {
    expect(canValidate(makeTask(), adminUser)).toBe(false);
  });

  test("cannot validate already validated task", () => {
    const task = makeTask({ ...pastTask, validatedAt: dayjs() });
    expect(canValidate(task, adminUser)).toBe(false);
  });

  test("can validate done (but not yet validated) task", () => {
    const task = makeTask({ ...pastTask, markedAsDoneAt: dayjs() });
    expect(canValidate(task, adminUser)).toBe(true);
  });

  test("cannot validate unpublished task", () => {
    const task = makeTask({ ...pastTask, published: false });
    expect(canValidate(task, adminUser)).toBe(false);
  });
});
