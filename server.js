const express = require('express');
const port = 9000;
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const flash = require("connect-flash");
const db = require('./config/dbconnection');
const localSt = require("./config/strategies");
const flashConnect = require("./config/flashConnect");

const app = express();

// middleware setup
app.set("view engine", "ejs");
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Session middleware setup
app.use(session({
    name: 'test',
    secret: 'admin',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());
app.use(flashConnect.setFlash);

// Passport User Authentication Middleware (make sure these are functions)
app.use(passport.setAuthenticateUser); // Make sure `setAuthenticateUser` is defined correctly in passport.js
app.use(passport.setAuthenticateUser);

// Routes
app.use("/", require('./routes/index.routes'));
app.use("/user", require('./routes/user.routes'));

// Server start
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
