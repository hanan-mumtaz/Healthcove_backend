require("dotenv").config();
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
      // Uses ENV variable on Vercel, or falls back to local path
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      passReqToCallback: true,
      prompt: "select_account",
      proxy: true, // ✅ REQUIRED for Vercel/HTTPS handling
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth Profile ID:", profile.id);
        
        let user = await User.findOne({ googleId: profile.id });
        const userEmail = profile.emails[0].value;
        const userPicture = profile.photos[0].value;

        if (!user) {
          // Check if user exists by email (to link a manual signup to Google)
          user = await User.findOne({ email: userEmail });
          
          if (!user) {
            // NEW USER: Create fresh account
            user = new User({
              name: profile.displayName,
              email: userEmail,
              googleId: profile.id,
              picture: userPicture,
              role: 'client' // Default role for new signups
            });
            await user.save();
          } else {
            // EXISTING MANUAL USER: Link Google ID and update picture
            user.googleId = profile.id;
            user.picture = userPicture;
            await user.save();
          }
        } else {
          // EXISTING GOOGLE USER: Update picture if it changed
          if (user.picture !== userPicture) {
            user.picture = userPicture;
            await user.save();
          }
        }

        // ✅ Generate Custom JWT Token
        const token = jwt.sign(
          { id: user._id }, 
          process.env.JWT_SECRET, 
          { expiresIn: "7d" }
        );

        // Pass both user and token to the serializer
        return done(null, { user, token });
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error, null);
      }
    }
  )
);

/**
 * ✅ DEFENSIVE SERIALIZATION
 * This handles both {user, token} objects from Google 
 * AND standard user objects from local login.
 */
passport.serializeUser((data, done) => {
  try {
    // If data is the wrapper {user, token}, extract the ID
    // If data is just the user document, use data._id
    const id = data.user ? data.user._id : data._id;
    
    if (!id) {
      return done(new Error("Serialization failed: No User ID found"), null);
    }
    done(null, id);
  } catch (error) {
    done(error, null);
  }
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;