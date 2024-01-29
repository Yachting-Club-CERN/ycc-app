module.exports = {
  ...require('gts/.prettierrc.json'),
  plugins: [require('@trivago/prettier-plugin-sort-imports')],
  endOfLine: 'auto',
  importOrder: ['^@app/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
