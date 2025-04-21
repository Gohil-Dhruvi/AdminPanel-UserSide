const Category = require("../model/category.model");
const Product = require("../model/product.model");
const User = require("../model/user.model");
const passport = require("passport");


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
  } catch (error) {
    console.error("Error in singleProduct:", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

// Render View Profile Page
exports.viewProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/user');
    }

    const user = await User.findById(req.session.user._id);

    if (!user) {
      return res.redirect('/user');
    }

    res.render('user/viewProfile', { user });
  } catch (err) {
    console.error('Error in viewProfile:', err);
    res.status(500).send('Internal Server Error');
  }
};


// Render Register Page
exports.registerPage = (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};

// Handle Register Logic
exports.handleRegister = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("User already exists with this email.");
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.redirect("register");
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).send("Internal Server Error");
  }
};


// Render Login Page
exports.loginPage = (req, res) => {
  try {
    res.render("loginUser"); 
    if (req.isAuthenticated()) {
      return res.redirect("/user");  // Already logged in
  }
  res.render("loginUser");  // Your pink theme login view
  } catch (error) {
    console.log(error);
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
      return res.redirect("/user/loginUser"); // ✅ Correct path to login page
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Login session error:", err);
        return res.status(500).send("Session Error");
      }

      req.session.user = user; // ✅ Save user in session
      return res.redirect("/user"); // ✅ Make sure this route exists
    });
  })(req, res, next);
};



exports.changeUserPasswordPage = (req, res) => {
  res.render("user/changePasswordUser");
};

exports.changeUserPassword = async (req, res) => {
  try {
    const { currentPass, newpass, confpass } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("back");
    }

    if (currentPass !== user.password) {
      req.flash("error", "Current password is incorrect.");
      return res.redirect("back");
    }

    if (newpass !== confpass) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("back");
    }

    if (currentPass === newpass) {
      req.flash("error", "New password must be different.");
      return res.redirect("back");
    }

    user.password = newpass;
    await user.save();

    req.flash("success", "Password changed successfully.");
    res.redirect("/user");
  } catch (error) {
    console.log("Change password error:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("back");
  }
};

exports.forgotUserPasswordPage = (req, res) => {
  res.render("forgotPasswordUser/forgotPasswordUser");
};

exports.sendUserResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "No user found with this email.");
      return res.redirect("back");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.otp = otp;
    req.session.userEmail = email;

    console.log("OTP for reset:", otp);
    req.flash("success", "OTP sent to email.");
    res.redirect("/user/Userverify-otp");
  } catch (error) {
    console.log(error);
    req.flash("error", "Failed to send OTP.");
    res.redirect("back");
  }
};

exports.UserverifyOTP = (req, res) => {
  const { otp } = req.body;

  if (otp === req.session.otp) {
    req.flash("success", "OTP verified.");
    res.render("forgotPasswordUser/resetPasswordUser");
  } else {
    req.flash("error", "Invalid OTP.");
    res.redirect("back");
  }
};

exports.resetUserPassword = async (req, res) => {
  const { newpass, confpass } = req.body;
  const email = req.session.userEmail;

  if (newpass !== confpass) {
    req.flash("error", "Passwords do not match.");
    return res.redirect("back");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("back");
    }

    user.password = newpass;
    await user.save();

    req.flash("success", "Password reset successful.");
    res.redirect("/user/loginUser");
  } catch (error) {
    console.log(error);
    req.flash("error", "Failed to reset password.");
    res.redirect("back");
  }
};

// In your user.controller.js
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).send("Failed to log out");
      }
      res.redirect("/loginUser"); 
  });
};

// Show product add-to-cart form
exports.showAddProductPage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId")
      .populate("subCategoryId")
      .populate("extraCategoryId");

    res.render("/add", { product });
  } catch (err) {
    console.log("Show Product Error:", err);
    res.redirect("/user");
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, productName, productPrice, productImage, discount } = req.body;

    const qty = parseInt(quantity) || 1;

    if (!req.session.cart) {
      req.session.cart = [];
    }

    const index = req.session.cart.findIndex(item => item.productId === productId);

    if (index !== -1) {
      req.session.cart[index].quantity += qty;
    } else {
      req.session.cart.push({
        productId,
        productName,
        productPrice: parseFloat(productPrice),
        productImage,
        discount: parseFloat(discount),
        quantity: qty
      });
    }

    res.redirect("/view");
  } catch (err) {
    console.log("Cart Add Error:", err);
    res.redirect("/user");
  }
};

// View cart
exports.viewCart = (req, res) => {
  try {
    const cart = req.session.cart || [];

    const cartItems = cart.map(item => {
      const totalPrice = (item.productPrice - item.discount) * item.quantity;
      return { ...item, totalPrice };
    });

    const grandTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    res.render("view", { cartItems, grandTotal });
  } catch (err) {
    console.log("Cart View Error:", err);
    res.redirect("/user");
  }
};

// Remove from cart
exports.removeFromCart = (req, res) => {
  try {
    const id = req.params.id;
    if (req.session.cart) {
      req.session.cart = req.session.cart.filter(item => item.productId !== id);
    }
    res.redirect("view");
  } catch (err) {
    console.log("Cart Remove Error:", err);
    res.redirect("/user");
  }
};

// Add to Favourites
exports.addToFavourites = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId)
      .populate("categoryId")
      .populate("subCategoryId")
      .populate("extraCategoryId");

    if (!product) {
      req.flash("error", "Product not found.");
      return res.redirect("back");
    }

    if (!req.session.favourites) {
      req.session.favourites = [];
    }

    const alreadyExists = req.session.favourites.some(item => item._id === productId);

    if (!alreadyExists) {
      req.session.favourites.push({
        _id: product._id,
        productName: product.productName,
        productPrice: product.productPrice,
        discount: product.discount,
        productImage: product.productImage,
        category: product.categoryId?.categoryName || '',
        subCategory: product.subCategoryId?.subCategoryName || '',
        extraCategory: product.extraCategoryId?.extraCategoryName || ''
      });
    }

    req.flash("success", "Product added to favourites.");
    res.redirect("/user/favourite/view");
  } catch (error) {
    console.log("Add to Favourites Error:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("back");
  }
};

// View Favourites
exports.viewFavourites = (req, res) => {
  try {
    const favourites = req.session.favourites || [];
    res.render("favourite", { favourites });
  } catch (error) {
    console.log("View Favourites Error:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/user");
  }
};

// Remove from Favourites
exports.removeFromFavourites = (req, res) => {
  try {
    const productId = req.params.id;
    if (req.session.favourites) {
      req.session.favourites = req.session.favourites.filter(item => item._id !== productId);
    }
    req.flash("success", "Removed from favourites.");
    res.redirect("/user/favourite/view");
  } catch (error) {
    console.log("Remove Favourites Error:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/user");
  }
};


