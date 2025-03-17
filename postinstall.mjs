// See https://www.tiny.cloud/docs/tinymce/latest/react-pm-host/

import fse from "fs-extra";
import * as path from "path";

// Realpath for pnpm links
const source = fse.realpathSync(
  path.join(import.meta.dirname, "node_modules", "tinymce"),
);
const target = path.join(import.meta.dirname, "public", "tinymce");

const shouldCopy = (file) => {
  if (file.endsWith(".js")) {
    return file.endsWith(".min.js");
  } else if (file.endsWith(".css")) {
    return file.endsWith(".min.css");
  } else {
    return true;
  }
};

const copySubdir = (file) =>
  fse.copySync(path.join(source, file), path.join(target, file), {
    overwrite: true,
    filter: (file) => shouldCopy(file),
  });

fse.emptyDirSync(target);
[
  "icons",
  "models",
  "plugins",
  "skins",
  "themes",
  "license.md",
  "tinymce.min.js",
].forEach(copySubdir);

// Full copy would be:
// fse.copySync(source, target, {overwrite: true});
