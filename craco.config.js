/* eslint-disable node/no-unpublished-require */
// CRACO to save import aliases
const {CracoAliasPlugin} = require('react-app-alias');

module.exports = {
  plugins: [
    {
      plugin: CracoAliasPlugin,
      options: {},
    },
  ],
};
