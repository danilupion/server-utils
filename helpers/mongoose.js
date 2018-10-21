const mongoose = require('mongoose');

mongoose.Promise = Promise;

module.exports = {
  connect: ({ host, port, database }) =>
    mongoose.connect(
      `mongodb://${host}:${port}/${database}`,
      { useNewUrlParser: true },
    ),
};
