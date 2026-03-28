import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { sanitiseHtmlForReact } from "@/utils/html-utils";

const toSanitisedHtml = (input: string): string =>
  renderToStaticMarkup(sanitiseHtmlForReact(input));

describe("Safe tags are kept", () => {
  test.each([
    ["<a href='#'>link</a>", '<a href="#">link</a>'],
    ["<blockquote>quote</blockquote>", "<blockquote>quote</blockquote>"],
    ["<br/>", "<br/>"],
    ["<code>inline</code>", "<code>inline</code>"],
    ["<div>content</div>", "<div>content</div>"],
    ["<em>italic</em>", "<em>italic</em>"],
    ["<h4>heading 4</h4>", "<h4>heading 4</h4>"],
    ["<h5>heading 5</h5>", "<h5>heading 5</h5>"],
    ["<h6>heading 6</h6>", "<h6>heading 6</h6>"],
    ["<hr/>", "<hr/>"],
    ["<ol><li>item</li></ol>", "<ol><li>item</li></ol>"],
    ["<p>hello</p>", "<p>hello</p>"],
    ["<pre>code</pre>", "<pre>code</pre>"],
    ["<span>text</span>", "<span>text</span>"],
    ["<strong>bold</strong>", "<strong>bold</strong>"],
    [
      "<table><tr><td>cell</td></tr></table>",
      "<table><tr><td>cell</td></tr></table>",
    ],
    ["<ul><li>item</li></ul>", "<ul><li>item</li></ul>"],
  ])("keeps %s", (input, expected) => {
    expect(toSanitisedHtml(input)).toBe(expected);
  });
});

describe("Forbidden tags are removed", () => {
  test.each([
    ["base", '<base href="http://evil.com/"/>'],
    ["button", "<button>click</button>"],
    ["canvas", "<canvas></canvas>"],
    ["embed", '<embed src="x"/>'],
    ["form", "<form><input/></form>"],
    ["frame", '<frame src="x"/>'],
    ["frameset", "<frameset></frameset>"],
    ["iframe", '<iframe src="evil.com"></iframe>'],
    ["input", "<input type='text'/>"],
    ["link", '<link rel="stylesheet" href="x"/>'],
    ["meta", '<meta charset="utf-8"/>'],
    ["object", '<object data="x"></object>'],
    ["script", "<script>alert('xss')</script>"],
    ["select", "<select><option>opt</option></select>"],
    ["style", "<style>body{display:none}</style>"],
    ["svg", "<svg><circle/></svg>"],
    ["textarea", "<textarea>text</textarea>"],
    ["title", "<title>hijack</title>"],
  ])("removes <%s>", (_tag, input) => {
    const result = toSanitisedHtml(`<p>safe</p>${input}<p>content</p>`);
    expect(result).toBe("<p>safe</p><p>content</p>");
  });

  test("removes forbidden tag but keeps surrounding content", () => {
    const result = toSanitisedHtml("<p>before</p><script>alert(1)</script><p>after</p>");
    expect(result).toBe("<p>before</p><p>after</p>");
  });

  test("removes nested forbidden tags", () => {
    const result = toSanitisedHtml(
      "<div><p>text</p><iframe src='x'></iframe><p>content</p></div>",
    );
    expect(result).toBe("<div><p>text</p><p>content</p></div>");
  });
});

describe("Heading demotion (h1/h2/h3 -> h4)", () => {
  test.each([
    ["h1", "<h1>title</h1>", "<h4>title</h4>"],
    ["h2", "<h2>subtitle</h2>", "<h4>subtitle</h4>"],
    ["h3", "<h3>section</h3>", "<h4>section</h4>"],
  ])("demotes <%s> to <h4>", (_tag, input, expected) => {
    expect(toSanitisedHtml(input)).toBe(expected);
  });

  test.each([
    ["h4", "<h4>heading 4</h4>"],
    ["h5", "<h5>heading 5</h5>"],
    ["h6", "<h6>heading 6</h6>"],
  ])("does not demote <%s>", (_tag, input) => {
    expect(toSanitisedHtml(input)).toBe(input);
  });

  test("heading demotion preserves inner content", () => {
    expect(toSanitisedHtml("<h1><em>styled</em> title</h1>")).toBe(
      "<h4><em>styled</em> title</h4>",
    );
  });
});

describe("Plain text handling", () => {
  test("plain text is wrapped in <p>", () => {
    expect(toSanitisedHtml("just text")).toBe("<p>just text</p>");
  });
});

describe("HTML comments", () => {
  test("HTML comments are stripped", () => {
    const result = toSanitisedHtml("<p>before</p><!-- comment --><p>after</p>");
    expect(result).toBe("<p>before</p><p>after</p>");
  });
});

describe("Mixed content", () => {
  test("keeps safe content and removes forbidden tags", () => {
    const result = toSanitisedHtml("<p>hello</p><script>alert(1)</script><p>world</p>");
    expect(result).toBe("<p>hello</p><p>world</p>");
  });

  test("preserves text content in safe tags", () => {
    const result = toSanitisedHtml("<p>Hello <strong>world</strong></p>");
    expect(result).toBe("<p>Hello <strong>world</strong></p>");
  });

  test("preserves nested safe tags", () => {
    const result = toSanitisedHtml(
      "<div><p>text <em>emphasized <strong>bold</strong></em></p></div>",
    );
    expect(result).toBe(
      "<div><p>text <em>emphasized <strong>bold</strong></em></p></div>",
    );
  });

  test("preserves attributes on safe tags", () => {
    const result = toSanitisedHtml(
      '<a href="https://example.com" target="_blank">link</a>',
    );
    expect(result).toBe(
      '<a href="https://example.com" target="_blank">link</a>',
    );
  });

  test("complex mixed: safe, forbidden, headings, text", () => {
    const result = toSanitisedHtml(
      '<h1>Title</h1><p>text</p><script>xss</script><h2>Sub</h2><iframe src="x"></iframe><span>end</span>',
    );
    expect(result).toBe(
      "<h4>Title</h4><p>text</p><h4>Sub</h4><span>end</span>",
    );
  });
});

describe("Edge cases", () => {
  test("empty string returns empty array", () => {
    const result = sanitiseHtmlForReact("");
    expect(result).toStrictEqual([]);
  });

  test("whitespace only is wrapped in <p>", () => {
    const result = toSanitisedHtml("   ");
    expect(result).toBe("<p>   </p>");
  });

  test("multiple top-level elements", () => {
    const result = toSanitisedHtml("<p>one</p><p>two</p><p>three</p>");
    expect(result).toBe("<p>one</p><p>two</p><p>three</p>");
  });

  test("self-closing tags", () => {
    const result = toSanitisedHtml("<br/><hr/>");
    expect(result).toBe("<br/><hr/>");
  });

  test("deeply nested content", () => {
    const result = toSanitisedHtml(
      "<div><ul><li><strong><em>deep</em></strong></li></ul></div>",
    );
    expect(result).toBe(
      "<div><ul><li><strong><em>deep</em></strong></li></ul></div>",
    );
  });

  test("only forbidden tags returns empty", () => {
    const result = toSanitisedHtml("<script>alert(1)</script>");
    expect(result).toBe("");
  });

  test("forbidden tag with attributes", () => {
    const result = toSanitisedHtml(
      '<p>safe</p><iframe src="http://evil.com" width="100" height="100"></iframe>',
    );
    expect(result).toBe("<p>safe</p>");
  });
});
