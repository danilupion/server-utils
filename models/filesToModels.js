const fs = require('fs');
const path = require('path');

/**
 * @param dir {string} directory path to parse
 * @param exclude {string[]} list of paths to exclude
 * @returns {object} keys are the names of the files found
 */
module.exports = (dir, { exclude = [path.join(dir, 'index.js')] } = {}) =>
  fs.readdirSync(dir).reduce((accumulated, file) => {
    const fileName = path.basename(file, path.extname(file));
    const className = fileName.charAt(0).toUpperCase() + fileName.slice(1);
    const filePath = path.resolve(dir, file);

    return exclude.includes(filePath)
      ? { ...accumulated }
      : {
          ...accumulated,
          // eslint-disable-next-line import/no-dynamic-require, global-require
          [className]: require(filePath),
        };
  }, {});
