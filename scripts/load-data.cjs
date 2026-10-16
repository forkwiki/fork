// Loads src/data.js (a browser script) into Node and returns the dataset.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

module.exports = function loadData() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'data.js'), 'utf8');
  const sandbox = { window: {}, Date, Math, Map, Set, Object, Array, String, Number, JSON };
  vm.runInNewContext(code, sandbox, { filename: 'src/data.js' });
  return sandbox.window.FORK_DATA;
};
