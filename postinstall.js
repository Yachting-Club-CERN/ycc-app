// See https://www.tiny.cloud/docs/tinymce/6/react-pm-host/

const fse = require('fs-extra');
const path = require('path');

// Realpath for pnpm links
const source = fse.realpathSync(path.join(__dirname, 'node_modules', 'tinymce'));
const target = path.join(__dirname, 'public', 'tinymce');

const shouldCopy = file => {
  if (file.endsWith('.js')) {
    return file.endsWith('.min.js');
  } else if (file.endsWith('.css')) {
    return file.endsWith('.min.css');
  } else {
    return true;
  }
};

const copySubdir = file =>
  fse.copySync(path.join(source, file), path.join(target, file), {
    overwrite: true,
    filter: file => shouldCopy(file),
  });

fse.emptyDirSync(target);
[
  'icons',
  'models',
  'plugins',
  'skins',
  'themes',
  'license.txt',
  'tinymce.min.js',
].forEach(copySubdir);

// Full copy would be:
// fse.copySync(source, target, {overwrite: true});
