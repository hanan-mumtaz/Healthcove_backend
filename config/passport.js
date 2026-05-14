require("dotenv").config(); // ✅ Load environment variables
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ✅ Register Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      passReqToCallback: true,
      prompt: "select_account",
      proxy: true, // ✅ CRITICAL: Add this line for Vercel/Production
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth Profile:", profile);
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if user exists by email (if they previously signed up manually)
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (!user) {
            // ✅ NEW USER: Save name AND picture
            user = new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              picture: profile.photos[0].value, // 📸 ADD THIS LINE
            });
            await user.save();
          } else {
            // ✅ EXISTING MANUAL USER: Link Google ID and update picture
            user.googleId = profile.id;
            user.picture = profile.photos[0].value; // 📸 ADD THIS LINE
            await user.save();
          }
        } else {
          // ✅ EXISTING GOOGLE USER: Just update the picture in case it changed
          user.picture = profile.photos[0].value; 
          await user.save();
        }

        // ✅ IMPORTANT: Your JWT only has 'id'. 
        // Ensure your /auth/me route on the backend returns the full user object!
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        done(null, { user, token });
      } catch (error) {
        console.error("Google OAuth Error:", error);
        done(error, null);
      }
    }
  )
);



// ✅ Serialize & Deserialize
passport.serializeUser((user, done) => done(null, user.user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
