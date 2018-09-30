/**
 * @param debug {boolean} Whether to show debug info or not
 * @returns {{responseErrorHandler: responseErrorHandler, errorHandler: errorHandler}}
 */
module.exports = (debug = false) => {
  /**
   * Error handler
   * @param {Error} err
   * @param {Response} res
   */
  const handleError = (err, res) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode);

    if (debug) {
      res.send({
        message: err.message,
        stack: ((err.originalError && err.originalError.stack) || err.stack).split('\n'),
      });
    }
    res.end();
  };

  return {
    /**
     * Express middleware that adds a custom error handler to response
     * @param {Request} req
     * @param {Response} res
     * @param {function} next
     */
    responseErrorHandler: (req, res, next) => {
      res.errorHandler = err => {
        handleError(err, res);
      };

      next();
    },

    /**
     * Express error middleware
     * @param {Error} err
     * @param {Request} req
     * @param {Response} res
     * @param {function} next
     */
    // eslint-disable-next-line no-unused-vars
    errorHandler: (err, req, res, next) => {
      handleError(err, res);
    },
  };
};
