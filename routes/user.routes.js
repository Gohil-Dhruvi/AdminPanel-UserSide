
const express = require("express");
const { 
    userPage, 
    singleProduct, 
    viewProfile, 
    registerPage, 
    handleRegister, 
    loginPage, 
    handleLogin, 
    logoutUser,
    forgotUserPasswordPage, 
    sendUserResetEmail, 
    UserverifyOTP, 
    resetUserPassword, 
    changeUserPasswordPage, 
    changeUserPassword,
    addToCart,
    showAddProductPage, 
    viewCart, 
    removeFromCart,   
    addToFavourites,
    viewFavourites,
    removeFromFavourites
} = require("../controller/user.controller");
const routes = express.Router();
const passport = require('passport');

// Public Pages
routes.get("/", userPage);
routes.get("/single-product/:id", singleProduct);

// Auth Pages
routes.get("/register", registerPage);
routes.post("/register", handleRegister);
routes.get("/loginUser", loginPage);
routes.post("/loginUser", handleLogin);
routes.get("/logoutUser", logoutUser);

// Password Recovery
routes.get("/forgotUserPassword", forgotUserPasswordPage);
routes.post("/sendUserResetEmail", sendUserResetEmail);
routes.post("/verifyUserotp", UserverifyOTP);
routes.post("/resetUserPassword", resetUserPassword);

// Cart
routes.get("/add/:id", showAddProductPage); 
routes.post("/add", addToCart);           
routes.get("/view", viewCart);              
routes.get("/remove/:id", removeFromCart);  

// Favourite
routes.get("/favourite/add/:id", addToFavourites);
routes.get("/favourite/view", viewFavourites);
routes.get("/favourite/remove/:id", removeFromFavourites);

// Authenticated Routes          
routes.get("/user/view-profile", passport.checkUserAuthenticated, viewProfile); 
routes.get("/changeUserPassword", passport.checkUserAuthenticated, changeUserPasswordPage); 
routes.post("/changeUserPassword", passport.checkUserAuthenticated, changeUserPassword); 

// routes.get("/favourite/add/:id", userController.addToFavourites);
// routes.get("/favourite/view", userController.viewFavourites);
// routes.get("/favourite/remove/:id", userController.removeFromFavourites);


module.exports = routes;
