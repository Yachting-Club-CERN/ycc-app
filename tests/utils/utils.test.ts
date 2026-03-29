import { describe, expect, test } from "vitest";

import { mailtoHref } from "@/utils/utils";

describe("mailtoHref", () => {
  test.each([
    ["no params", {}, "mailto:"],
    ["to only", { to: "a@b.com" }, "mailto:a@b.com"],
    ["subject only", { subject: "Hi" }, "mailto:?subject=Hi"],
    ["body only", { body: "Hi" }, "mailto:?body=Hi"],
    [
      "to + subject",
      { to: "a@b.com", subject: "Hi" },
      "mailto:a@b.com?subject=Hi",
    ],
    ["to + body", { to: "a@b.com", body: "Hi" }, "mailto:a@b.com?body=Hi"],
    [
      "to + subject + body",
      { to: "a@b.com", subject: "Hello", body: "Hi there" },
      "mailto:a@b.com?subject=Hello&body=Hi%20there",
    ],
    [
      "subject + body without to",
      { subject: "Hello", body: "Hi" },
      "mailto:?subject=Hello&body=Hi",
    ],
    [
      "empty strings are falsy",
      { to: "a@b.com", subject: "", body: "" },
      "mailto:a@b.com",
    ],
    [
      "special characters are encoded",
      { to: "a@b.com", subject: "A & B", body: "Line 1\nLine 2" },
      "mailto:a@b.com?subject=A%20%26%20B&body=Line%201%0ALine%202",
    ],
  ])("%s", (_desc, props, expected) => {
    expect(mailtoHref(props)).toBe(expected);
  });
});
