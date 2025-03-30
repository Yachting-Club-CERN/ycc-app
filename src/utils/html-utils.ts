import HTMLReactParser, {
  Element as DOMElement,
  Text as DOMText,
} from "html-react-parser";
import React from "react";

const forbiddenTags = [
  "base",
  "button",
  "canvas",
  "embed",
  "form",
  "frame",
  "frameset",
  "iframe",
  "input",
  "link",
  "meta",
  "object",
  "select",
  "script",
  "style",
  "svg",
  "textarea",
  "title",
];

/**
 * Sanitises HTML for React.
 *
 * @param html HTML to sanitise
 * @returns React component(s)
 */
export const sanitiseHtmlForReact = (html: string) => {
  const reactDom = HTMLReactParser(html, {
    // We trust our backend + React + RichTextEditor, but you never know...
    replace: (domNode) => {
      if (domNode instanceof DOMText) {
        // Always keep text
        return domNode;
      } else if (domNode instanceof DOMElement) {
        if (!forbiddenTags.includes(domNode.name)) {
          return null;
        } else if (
          domNode.name === "h1" ||
          domNode.name === "h2" ||
          domNode.name === "h3"
        ) {
          // Does not look good
          domNode.name = "h4";
        }

        return domNode;
      } else {
        // Always skip comments, processing instructions (XHTML only), etc.
        return null;
      }
    },
  });

  return typeof reactDom === "string"
    ? React.createElement("p", {}, reactDom)
    : reactDom;
};
