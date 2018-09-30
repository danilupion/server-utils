const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');

module.exports = {
  setup: ({ clientId, clientSecret }) => {
    passport.use(
      new FacebookTokenStrategy(
        {
          clientID: clientId,
          clientSecret,
        },
        (accessToken, refreshToken, profile, cb) => cb(null, profile),
      ),
    );
  },
  middleware: passport.authenticate('facebook-token', { session: false }),
};
