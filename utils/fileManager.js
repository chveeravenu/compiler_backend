const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const dirPath = path.join(__dirname, '..', 'temp');

// Ensure temp folder exists
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

const generateFile = async (ext, content) => {
  const filename = `${uuid()}.${ext}`;
  const filepath = path.join(dirPath, filename);
  await fs.promises.writeFile(filepath, content);
  return filepath;
};

module.exports = { generateFile };
