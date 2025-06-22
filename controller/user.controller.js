const Category = require("../model/category.model");
const Product = require("../model/product.model");
const User = require("../model/user.model");
const passport = require("passport");
const { sendMail } = require("../config/mailer");


// Render Homepage with Filter, Search, Pagination
exports.userPage = async (req, res) => {
  const { category, search, page = 1 } = req.query;
  const perPage = 4;
  const filter = {};

  // Filter by category
  if (category) {
    filter.categoryId = category;
  }

  // Search by productName or description
  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    filter.$or = [
      { productName: searchRegex },
      { description: searchRegex }
    ];
  }

  try {
    const categories = await Category.find();

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    // Ensure products are populated with category, subcategory, and extraCategory info
    const allProducts = await Product.find(filter)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("categoryId")
      .populate("subCategoryId")
      .populate("extraCategoryId");

    return res.render("index", {
      categories,
      allProducts,
      search,
      category,
      currentPage: parseInt(page),
      totalPages
    });
  } catch (error) {
    console.error("Error in userPage:", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

// Render Single Product Page
exports.singleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId")
      .populate("subCategoryId")
      .populate("extraCategoryId");

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("back");
    }

    return res.render("get_product", { product });
  } catch (err) {
    console.error("Error in singleProduct:", err);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

// Render Register Page
exports.registerPage = (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error);
    res.redirect("/");  // Redirect to home if there's an error
  }
};

// Handle Register Logic
exports.handleRegister = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", { error: "User already exists with this email." });  // Send back error message
    }

    const newUser = new User({ username, email, password });

    await newUser.save();

    res.redirect("/user/loginUser");
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.loginPage = (req, res) => {
  try {
    if (req.isAuthenticated()) {
      return res.redirect("/user");
    }
    res.render("loginUser");
  } catch (error) {
    console.log("Login page error:", error);
    res.redirect("/");
  }
};

exports.handleLogin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/loginUser");
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Session login error:", err);
        return res.status(500).send("Login Session Error");
      }

      req.session.user = user;
      res.redirect("/user");
    });
  })(req, res, next);
};

exports.viewProfile = async (req, res) => {
  try {
    if (!req.user) {
      req.flash('error', 'Please login to view your profile');
      return res.redirect('/loginUser');
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/loginUser');
    }

    const success = req.flash('success');
    const error = req.flash('error');

    return res.render('view-profile', { 
      user,
      success: success.length > 0 ? success[0] : null,
      error: error.length > 0 ? error[0] : null
    });

  } catch (error) {
    console.error('Error in viewProfile:', error);
    req.flash('error', 'An error occurred while loading your profile');
    res.redirect('/loginUser');
  }
};

exports.changeUserPasswordPage = (req, res) => {
  const success = req.flash('success');
  const error = req.flash('error');
  
  res.render('change-password', {
    success: success.length > 0 ? success[0] : null,
    error: error.length > 0 ? error[0] : null,
  });
};

exports.changeUserPassword = async (req, res) => {
  try {
    const { currentPass, newpass, confpass } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/user/change-password');
    }

    // Compare passwords (assuming you're using plain text passwords - not recommended)
    // In a real app, you should use bcrypt.compare()
    if (currentPass !== user.password) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/user/change-password');
    }

    if (newpass !== confpass) {
      req.flash('error', 'New passwords do not match.');
      return res.redirect('/user/change-password');
    }

    if (currentPass === newpass) {
      req.flash('error', 'New password must be different from current password.');
      return res.redirect('/user/change-password');
    }

    // Update password (in a real app, you should hash the password here)
    user.password = newpass;
    await user.save();

    req.flash('success', 'Password changed successfully.');
    res.redirect('/user/view-profile');
  } catch (error) {
    console.error('Change password error:', error);
    req.flash('error', 'Something went wrong while changing your password.');
    res.redirect('/user/change-password');
  }
};

exports.forgotUserPasswordPage = (req, res) => {
  res.render("forgotPasswordUser/forgotPasswordUser", {
    error: req.flash("error"),
    success: req.flash("success")
  });
};

exports.sendUserResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "No user found with this email.");
      return res.redirect("/user/forgot-password");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.otp = otp;
    req.session.userEmail = email;

    await sendMail(email, otp);
    req.flash("success", "OTP sent to your email.");
    res.render("forgotPasswordUser/verifyOtpUser", {
      error: null,
      success: req.flash("success")
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Failed to send OTP.");
    res.redirect("/user/forgot-password");
  }
};

exports.UserverifyOTP = (req, res) => {
  const { otp } = req.body;
  if (otp === req.session.otp) {
    req.flash("success", "OTP verified.");
    res.render("forgotPasswordUser/resetPasswordUser", {
      error: null,
      success: req.flash("success")
    });
  } else {
    req.flash("error", "Invalid OTP.");
    res.render("forgotPasswordUser/verifyOtpUser", {
      error: req.flash("error"),
      success: null
    });
  }
};

exports.resetUserPassword = async (req, res) => {
  const { newpass, confpass } = req.body;
  const email = req.session.userEmail;

  if (newpass !== confpass) {
    req.flash("error", "Passwords do not match.");
    return res.redirect("/user/forgot-password");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/user/forgot-password");
    }

    user.password = newpass;
    await user.save();

    req.flash("success", "Password reset successful.");
    res.redirect("/user/loginUser");
  } catch (error) {
    console.log(error);
    req.flash("error", "Failed to reset password.");
    res.redirect("/user/forgot-password");
  }
};


// controllers/userController.js
exports.logoutUser = (req, res) => {
  try {
    req.logout(function (err) {
      if (err) {
        console.error("Logout Error:", err);
        return res.status(500).send("Failed to log out");
      }

      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).send("Failed to destroy session");
        }

        res.clearCookie("connect.sid"); // Optional: Clears session cookie
        res.redirect("/user/loginUser");
      });
    });
  } catch (error) {
    console.log("Logout Exception:", error);
    res.redirect("/user/loginUser");
  }
};

// Show product add-to-cart form
exports.showAddProductPage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId")
      .populate("subCategoryId")
      .populate("extraCategoryId");

    res.render("/add", { product }); // Corrected path
  } catch (err) {
    console.log("Show Product Error:", err);
    res.redirect("/user");
  }
};


// Add product to session cart
exports.addToCart = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (product) {
      if (!req.session.cart) {
        req.session.cart = [];
      }

      req.session.cart.push({
        _id: product._id,
        title: product.productName,
        price: product.price,
        image: product.productImage,
        discount: product.discount
      });

      res.redirect('/user/cart');
    } else {
      res.status(404).send("Product not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding to cart");
  }
};

// View Cart Page
exports.viewCart = (req, res) => {
  try {
    const cart = req.session.cart || [];
    res.render('cart', { cart });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading cart');
  }
};

// Remove from cart
exports.removeFromCart = (req, res) => {
  const idToRemove = req.params.id;

  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item._id.toString() !== idToRemove);
  }

  res.redirect('/user/cart');
};


// Add product to session favourites
exports.addToFavourites = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (product) {
      if (!req.session.favourites) {
        req.session.favourites = [];
      }

      // Prevent duplicates
      const exists = req.session.favourites.find(item => item._id.toString() === productId);
      if (!exists) {
        req.session.favourites.push({
          _id: product._id,
          title: product.productName,
          price: product.price,
          image: product.productImage,
          discount: product.discount
        });
      }

      res.redirect('/user/favourite');
    } else {
      res.status(404).send("Product not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding to favourites");
  }
};

// View Favourites
exports.viewFavourites = (req, res) => {
  try {
    const favourites = req.session.favourites || [];
    res.render('favourite', { favourites });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading favourites');
  }
};

// Remove from favourites
exports.removeFromFavourites = (req, res) => {
  const idToRemove = req.params.id;

  if (req.session.favourites) {
    req.session.favourites = req.session.favourites.filter(item => item._id.toString() !== idToRemove);
  }

  res.redirect('/user/favourite');
};

