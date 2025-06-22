const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Admin = require("../model/admin.model");
const User = require("../model/user.model");

// Local strategy for login
passport.use(new LocalStrategy(
    {
        usernameField: 'email',  
        passwordField: 'password', 
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            // Add password verification logic (e.g. bcrypt.compare)
            if (user.password !== password) {  // Use bcrypt or another method to compare passwords
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));


// Passport Local Strategy for User Login
passport.use('user-local', new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
  
            if (!user || user.password !== password) {
                return done(null, false, { message: "Invalid credentials" });
            }
  
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// Serialize user to store in session (for Admin)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session (for Admin)
passport.deserializeUser(async (id, done) => {
    try {
        let adminRec = await Admin.findById(id);
        if (adminRec) {
            done(null, adminRec);
        } else {
            let userRec = await User.findById(id);
            done(null, userRec); // Deserialize User if Admin is not found
        }
    } catch (error) {
        done(error, null);
    }
});

// Admin Auth Check Middleware
passport.checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        return res.redirect("/");  // Redirect to login if not authenticated
    }
};

// User Auth Check Middleware (if required in future)
passport.checkUserAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect("/loginUser");
};

// Set Authenticated User Middleware
passport.setAuthenticateUser = (req, res, next) => {
    res.locals.user = req.isAuthenticated() ? req.user : null;
    next();
};

module.exports = passport;
