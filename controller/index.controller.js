const { sendMail } = require("../config/mailConfig");
const Admin = require("../model/admin.model");

// Logout
exports.logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return false;
        }
        req.flash("success", "Logout Success");
        return res.redirect("/");
    });
};

// Login 
exports.loginPage = async (req, res) => {
    if (req.isAuthenticated()) {
        req.flash("success", "Login Success");
        return res.redirect("/dashboard");
    }
    return res.render("login");
};

// Login Admin
exports.loginAdmin = async (req, res) => {
    try {
        req.flash("success", "Login Success");
        return res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
        req.flash("success", "Login Success");
        return res.redirect("back");
    }
};

// Dashboard
exports.dashBoard = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            req.flash("success", "Login Success");
            return res.redirect("/");
        }
        return res.render("dashboard", { admin: req.user });
    } catch (error) {
        console.log(error);
        req.flash("success", "Login Success");
        return res.redirect("back");
    }
};

// Forgot Password Page
exports.forgotPasswordPage = (req, res) => {
    try {
        return res.render("forgotPassword/forgotpassword");
    } catch (error) {
        console.log(error);
        return res.redirect("back");
    }
};

// Send Email (OTP)
exports.sendEmail = async (req, res) => {
    try {
        let admin = await Admin.findOne({ email: req.body.email });
        if (admin) {
            let otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
            await sendMail(req.body.email, otp);
            res.cookie("email", req.body.email, { httpOnly: true });
            res.cookie("otp", otp, { httpOnly: true });
            return res.render("forgotPassword/otp");
        } else {
            console.log("Admin not found!");
            return res.redirect("back");
        }
    } catch (error) {
        console.log(error);
        return res.redirect("back");
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        let otp = req.cookies.otp;
        if (otp == req.body.otp) {
            return res.render("forgotPassword/newPassword");
        } else {
            console.log("OTP Mismatched.");
            return res.redirect("back");
        }
    } catch (error) {
        console.log(error);
        return res.redirect("back");
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        let { password, c_password } = req.body;
        let email = req.cookies.email;

        if (password === c_password) {
            let admin = await Admin.findOne({ email });
            if (admin) {
                await Admin.findOneAndUpdate({ email }, { password }, { new: true });
                console.log("Password Updated");
                res.clearCookie("email");
                res.clearCookie("otp");
                return res.redirect("/");
            } else {
                console.log("Admin not found");
                return res.redirect("/");
            }
        } else {
            console.log("Password & Confirm password do not match");
            return res.redirect("back");
        }
    } catch (error) {
        console.log(error);
        return res.redirect("back");
    }
};

// Change Password Page
exports.changePasswordPage = async (req, res) => {
    try {
        return res.render("changepassword");
    } catch (error) {
        console.log(error);
        return res.redirect("back");
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPass, newpass, confpass } = req.body;
        const user = req.user;

        if (currentPass === user.password) {
            if (currentPass !== newpass) {
                if (newpass === confpass) {
                    await Admin.findByIdAndUpdate(user._id, { password: newpass }, { new: true });
                    console.log("Password changed successfully");
                    return res.redirect("/dashboard");
                } else {
                    console.log("New and Confirm password do not match");
                    return res.redirect("back");
                }
            } else {
                console.log("New password cannot be same as current password");
                return res.redirect("back");
            }
        } else {
            console.log("Current password is incorrect");
            return res.redirect("back");
        }
    } catch (error) {
        console.log(error);
        return res.redirect("back");
    }
};

// Profile Page
exports.profilePage = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/"); 
        }

        const admin = await Admin.findById(req.user._id);

        if (!admin) {
            return res.redirect("/"); 
        }

        return res.render("profile", { admin });
    } catch (error) {
        console.log(error);
        return res.redirect("/"); 
    }
};
