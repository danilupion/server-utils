const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');

const { Unauthorized } = require('../../error/httpStatusCodeErrors');

module.exports = {
  setup: jwtSecret => {
    const params = {
      secretOrKey: jwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    };

    /**
     * JWT strategy that will extend response with a new user property containing the id
     */
    const strategy = new Strategy(params, (payload, done) => {
      if (payload.userId) {
        return done(null, {
          id: payload.userId,
        });
      }

      return done(new Unauthorized());
    });

    passport.use(strategy);
  },
  middleware: passport.authenticate('jwt', { session: false }),
};
