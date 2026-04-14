import { describe, expect, test } from "vitest";

import {
  makeHelper,
  makeLicence,
  makeMember,
  makeTask,
  makeUser,
} from "@tests/factories";

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
  isSurveillanceTask,
  isUpcoming,
} from "@/pages/helpers/helpers-utils";
import dayjs from "@/utils/dayjs";

// =============================================================================
// Preset users
// =============================================================================

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

describe("isSurveillanceTask", () => {
  test.each(["Surveillance", "SURVEILLANCE NIGHT", "SUrveILLANCE NIGHT"])(
    "matches '%s'",
    (title) => {
      expect(isSurveillanceTask({ category: { title } })).toBe(true);
    },
  );

  test.each(["Maintenance", "Cleaning", "", "Boat Surveillance"])(
    "does not match '%s'",
    (title) => {
      expect(isSurveillanceTask({ category: { title } })).toBe(false);
    },
  );
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
    expect(
      isUpcoming(
        makeTask({ startsAt: future, endsAt: future.add(4, "hours") }),
      ),
    ).toBe(true);
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
      captain: makeHelper({ member: makeMember({ username: "JDOE" }) }),
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
      captain: makeHelper({ member: makeMember({ username: "OTHER" }) }),
    });
    expect(isSignedUpAsCaptain(task, makeUser({ username: "JDOE" }))).toBe(
      false,
    );
  });
});

describe("isSignedUpAsHelper", () => {
  test("user is helper", () => {
    const task = makeTask({
      helpers: [makeHelper({ member: makeMember({ username: "JDOE" }) })],
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
      captain: makeHelper({ member: makeMember({ username: "JDOE" }) }),
    });
    expect(isSignedUp(task, makeUser({ username: "JDOE" }))).toBe(true);
  });

  test("signed up as helper", () => {
    const task = makeTask({
      helpers: [makeHelper({ member: makeMember({ username: "JDOE" }) })],
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
  const futureTask = makeTask({
    startsAt: future,
    endsAt: future.add(4, "hours"),
  });

  test("can sign up for upcoming published pending task without captain", () => {
    expect(canSignUpAsCaptain(futureTask, regularUser)).toBe(true);
  });

  test("cannot sign up for past task", () => {
    const task = makeTask({ startsAt: past, endsAt: past.add(4, "hours") });
    expect(canSignUpAsCaptain(task, regularUser)).toBe(false);
  });

  test("cannot sign up for unpublished task", () => {
    expect(
      canSignUpAsCaptain(
        makeTask({
          startsAt: future,
          endsAt: future.add(4, "hours"),
          published: false,
        }),
        regularUser,
      ),
    ).toBe(false);
  });

  test("cannot sign up if captain already set", () => {
    expect(
      canSignUpAsCaptain(
        makeTask({
          startsAt: future,
          endsAt: future.add(4, "hours"),
          captain: makeHelper(),
        }),
        regularUser,
      ),
    ).toBe(false);
  });

  test("cannot sign up if already signed up as helper", () => {
    const task = makeTask({
      startsAt: future,
      endsAt: future.add(4, "hours"),
      helpers: [makeHelper({ member: makeMember({ username: "REGULAR" }) })],
    });
    expect(canSignUpAsCaptain(task, regularUser)).toBe(false);
  });

  test("cannot sign up if task is done", () => {
    const task = makeTask({
      startsAt: future,
      endsAt: future.add(4, "hours"),
      markedAsDoneAt: dayjs(),
    });
    expect(canSignUpAsCaptain(task, regularUser)).toBe(false);
  });

  test("cannot sign up without required licence", () => {
    const task = makeTask({
      startsAt: future,
      endsAt: future.add(4, "hours"),
      captainRequiredLicenceInfo: makeLicence({ licence: "SU" }),
    });
    expect(canSignUpAsCaptain(task, regularUser)).toBe(false);
  });

  test("can sign up with required licence", () => {
    const task = makeTask({
      startsAt: future,
      endsAt: future.add(4, "hours"),
      captainRequiredLicenceInfo: makeLicence({ licence: "SU" }),
    });
    expect(canSignUpAsCaptain(task, suUser)).toBe(true);
  });
});

describe("canSignUpAsHelper", () => {
  const futureTask = makeTask({
    startsAt: future,
    endsAt: future.add(4, "hours"),
  });

  test("can sign up for upcoming published pending task", () => {
    expect(canSignUpAsHelper(futureTask, regularUser)).toBe(true);
  });

  test("cannot sign up if max helpers reached", () => {
    const task = makeTask({
      startsAt: future,
      endsAt: future.add(4, "hours"),
      helperMaxCount: 1,
      helpers: [makeHelper({ member: makeMember({ username: "OTHER" }) })],
    });
    expect(canSignUpAsHelper(task, regularUser)).toBe(false);
  });

  test("cannot sign up if already captain", () => {
    const task = makeTask({
      startsAt: future,
      endsAt: future.add(4, "hours"),
      captain: makeHelper({ member: makeMember({ username: "REGULAR" }) }),
    });
    expect(canSignUpAsHelper(task, regularUser)).toBe(false);
  });

  test("cannot sign up if already helper", () => {
    const task = makeTask({
      startsAt: future,
      endsAt: future.add(4, "hours"),
      helpers: [makeHelper({ member: makeMember({ username: "REGULAR" }) })],
    });
    expect(canSignUpAsHelper(task, regularUser)).toBe(false);
  });
});

describe("canSignUp", () => {
  const futureTask = makeTask({
    startsAt: future,
    endsAt: future.add(4, "hours"),
  });

  test("true if can sign up as captain", () => {
    expect(canSignUp(futureTask, regularUser)).toBe(true);
  });

  test("true if can sign up as helper but not captain", () => {
    // Captain slot taken, but helper slot open
    const task = makeTask({
      startsAt: future,
      endsAt: future.add(4, "hours"),
      captain: makeHelper({ member: makeMember({ username: "OTHER" }) }),
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
      captain: makeHelper({ member: makeMember({ username: "CAPTAIN" }) }),
    });
    const captainUser = makeUser({ username: "CAPTAIN" });
    expect(canMarkAsDone(task, captainUser)).toBe(true);
  });

  test("regular user cannot mark as done", () => {
    expect(canMarkAsDone(pastTask, regularUser)).toBe(false);
  });

  test("cannot mark upcoming shift as done", () => {
    expect(
      canMarkAsDone(
        makeTask({ startsAt: future, endsAt: future.add(4, "hours") }),
        adminUser,
      ),
    ).toBe(false);
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
    expect(
      canValidate(
        makeTask({ startsAt: future, endsAt: future.add(4, "hours") }),
        adminUser,
      ),
    ).toBe(false);
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
