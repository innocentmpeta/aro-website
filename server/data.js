const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/content.json');

function read() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function write(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { read, write };