import { test, expect } from "vitest";

import toJson from "../toJson";

export const check = (
  value: unknown,
  expected: string,
  format?: boolean,
): void => {
  expect(toJson(value, format)).toEqual(expected);
};

test("general data types", () => {
  // Booleans
  check(false, "false");
  check(true, "true");

  // Numbers
  check(0, "0");
  check(1, "1");

  // Special numbers
  check(
    NaN,
    `{
  "$specialValue": "NaN"
}`,
  );
  check(
    -Infinity,
    `{
  "$specialValue": "-Infinity"
}`,
  );
  check(Infinity, '{"$specialValue":"Infinity"}', false);
  check(BigInt(123), '{"$specialValue":"BigInt(123)"}', false);

  // Strings
  check("a", '"a"');
  check("bc\nd", '"bc\\nd"');

  // Specials
  check(null, "null");
  check(
    undefined,
    `{
  "$specialValue": "undefined"
}`,
  );
  check(
    Symbol("sym"),
    `{
  "$specialValue": "Symbol(sym)"
}`,
  );
  check(
    function () {},
    `{
  "$specialValue": "function() {\\n    }"
}`,
  );
  check(
    function (a: number, b: number) {
      return a + b;
    },
    `{
  "$specialValue": "function(a, b) {\\n      return a + b;\\n    }"
}`,
  );
  check(
    (c: number, d: number) => c + d,
    `{
  "$specialValue": "(c, d) => c + d"
}`,
  );

  // Errors
  check(
    Error("Error", { cause: Error("Cause") }),
    `{
  "$error": "Error: Error",
  "$causeChain": [
    "Error: Cause"
  ]
}`,
  );
  check(
    new Error("Error 2", { cause: new Error("Cause 2", { cause: NaN }) }),
    `{
  "$error": "Error: Error 2",
  "$causeChain": [
    "Error: Cause 2",
    {
      "$specialValue": "NaN"
    }
  ]
}`,
  );
});

test("complex object with special values", () => {
  check(
    {
      booleans: [false, true],
      numbers: [0, 1],
      specialNumbers: [NaN, -Infinity, Infinity, BigInt(123)],
      strings: ["a", " bc\nd "],
      specials: [
        null,
        undefined,
        Symbol("sym"),
        function (): void {},
        function (a: number, b: number): number {
          return a + b;
        },
        (c: number, d: number): number => c + d,
      ],
      errors: [
        Error("Error", { cause: Error("Cause") }),
        new Error("Error 2", { cause: new Error("Cause 2", { cause: NaN }) }),
      ],
    },
    `{
  "booleans": [
    false,
    true
  ],
  "numbers": [
    0,
    1
  ],
  "specialNumbers": [
    {
      "$specialValue": "NaN"
    },
    {
      "$specialValue": "-Infinity"
    },
    {
      "$specialValue": "Infinity"
    },
    {
      "$specialValue": "BigInt(123)"
    }
  ],
  "strings": [
    "a",
    " bc\\nd "
  ],
  "specials": [
    null,
    {
      "$specialValue": "undefined"
    },
    {
      "$specialValue": "Symbol(sym)"
    },
    {
      "$specialValue": "function() {\\n        }"
    },
    {
      "$specialValue": "function(a, b) {\\n          return a + b;\\n        }"
    },
    {
      "$specialValue": "(c, d) => c + d"
    }
  ],
  "errors": [
    {
      "$error": "Error: Error",
      "$causeChain": [
        "Error: Cause"
      ]
    },
    {
      "$error": "Error: Error 2",
      "$causeChain": [
        "Error: Cause 2",
        {
          "$specialValue": "NaN"
        }
      ]
    }
  ]
}`,
  );
});
