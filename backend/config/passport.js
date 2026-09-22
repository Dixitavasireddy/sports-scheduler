const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../models');

// Configure Passport Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        if (!email || !password) {
          return done(null, false, { message: 'Email and password are required' });
        }

        const user = await User.findOne({
          where: { email: email.trim().toLowerCase() },
        });

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isMatch = await user.validPassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] },
    });
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

module.exports = passport;
