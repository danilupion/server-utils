let connectionPromise;

module.exports = (connect, { host, port, database }) => {
  if (connectionPromise === undefined) {
    connectionPromise = connect(
      `mongodb://${host}:${port}/${database}`,
      {
        useNewUrlParser: true,
        bufferCommands: false,
      },
    );
  }

  return connectionPromise;
};
