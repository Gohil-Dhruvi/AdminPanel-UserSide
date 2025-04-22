const express = require('express');
const routes = express.Router();
const passport = require('passport');
const { 
    dashBoard, loginPage, loginAdmin, logout, 
    forgotPasswordPage, sendEmail, verifyOTP, changePassword, changePasswordPage, resetPassword, profilePage 
} = require("../controller/index.controller");

// User Side
routes.use("/user", require("../routes/user.routes"));

// Public Pages
routes.get("/", loginPage);
routes.get("/dashboard", passport.checkAuthenticated, dashBoard);

// Admin Login
routes.post("/login", passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true
}), loginAdmin);
routes.get("/logout", logout);
routes.get("/profile", passport.checkAuthenticated, profilePage);

// Password Recovery
routes.get("/forgotPassword", forgotPasswordPage);
routes.post("/sendEmail", sendEmail);
routes.post("/verify-otp", verifyOTP);
routes.post("/reset-password", resetPassword);

// Change Password
routes.get("/changepassword", passport.checkAuthenticated, changePasswordPage);
routes.post("/changepassword", passport.checkAuthenticated, changePassword);

// Admin, Category, SubCategory, ExtraCategory, Product Routes (Authenticated)
routes.use("/admin", passport.checkAuthenticated, require('./admin.routes'));
routes.use("/category", passport.checkAuthenticated, require('./category.routes'));
routes.use("/subCategory", passport.checkAuthenticated, require('./subCategory.routes'));
routes.use("/extraCategory", passport.checkAuthenticated, require('./extraCategory.routes'));
routes.use("/Product", passport.checkAuthenticated, require('./product.routes'));

module.exports = routes;
