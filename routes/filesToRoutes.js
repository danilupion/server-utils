const fs = require('fs');
const path = require('path');
const { Router } = require('express');

/**
 *
 * @param dir {string} directory path to parse
 * @param exclude {string[]} list of paths to exclude
 * @param router {Router} router to us
 * @param basePath {string} base path for the route
 * @returns {object} keys are the names of the files found
 */
module.exports = (dir, { exclude = [path.join(dir, 'index.js')], router = new Router(), basePath = '/' } = {}) => {
  // Loop over files in this folder
  fs.readdirSync(dir).forEach(file => {
    const fileName = path.basename(file, path.extname(file));
    const filePath = path.join(dir, file);

    // Skip index.js
    if (exclude.includes(filePath)) {
      return;
    }

    // Register route with the same name as the file
    // eslint-disable-next-line import/no-dynamic-require, global-require
    router.use(`${basePath}${fileName}`, require(path.join(dir, fileName)));
  });

  return router;
};
