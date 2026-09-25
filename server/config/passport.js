const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const env = require("./env");

if (env.googleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const primaryEmail = profile.emails?.[0];
          const email = primaryEmail?.value?.toLowerCase();
          if (!email || primaryEmail?.verified === false)
            return done(
              new Error("Google account did not provide a verified email"),
            );
          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          }).select("+sessionVersion");
          if (!user) {
            user = await User.create({
              name: (profile.displayName || "CarBook User").slice(0, 80),
              email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || "",
              emailVerifiedAt: new Date(),
            });
          } else {
            user.googleId = user.googleId || profile.id;
            user.avatar = profile.photos?.[0]?.value || user.avatar;
            user.emailVerifiedAt = user.emailVerifiedAt || new Date();
            await user.save();
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
}

module.exports = passport;
