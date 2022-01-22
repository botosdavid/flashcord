const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser(function(user, done) {
    done(null, user._id);
});
  
passport.deserializeUser(async function(id, done) {
    const user = await User.findById(id);
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: '25649677923-p9vqfus96u74c9p0gmreefma4o1emtcl.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "https://flashcord.herokuapp.com/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
        try{
            let user = await User.findOne({ googleId: profile.id });
            if(!user){
                const newUser = new User({
                    name: profile.displayName,
                    socketId: null,
                    googleId: profile.id
                })
                user = await newUser.save();
            }
            return done(null, user);
        }catch{
            console.log('Error while saving user');
        }
    }
));