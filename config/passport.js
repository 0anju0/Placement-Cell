const passport = require("passport");
const User = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },

    async function (req, email, password, done) {
      try {
        // Find the user and establish the identity
        const user = await User.findOne({ email: email });

        if (!user) {
          console.log("Invalid UserName or Password");
          return done(null, false);
        }

        // Compare the Password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          console.log("Invalid UserName or Password");
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        console.log("Error in finding the user", error);
        return done(error);
      }
    }
  )
);

//serialize the user to keep user id in session cookie
passport.serializeUser(function (user, done) {
  return done(null, user.id);
});

//deserialize the user using id stored in cookies
passport.deserializeUser(async function (id, done) {
  try {
    let user = await User.findById(id);
    if (user) {
      return done(null, user);
    }
  } catch (error) {
    console.log("Error in finding user --> Passport");
    return done(error);
  }
});

//check for authentication
passport.checkAuthentication = function (req, res, next) {
  //if logged in then pass to next()
  if (req.isAuthenticated()) {
    return next();
  }
  //else redirect back
  return res.redirect(back);
};

//set authentication
passport.setAuthenticatedUser = function (req, res, next) {
  //if user logged in then store in locals
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
};

module.exports = passport;
