const fs = require('fs');
const path = require('path');

const xp = path.resolve(__dirname, './__private__/x.js');

const xf = fs.readFileSync(xp, 'utf8');

const xfi = xf.replace(/\d+/, (match) => {
  return parseInt(match) + 1;
});

fs.writeFileSync(xp, xfi);
