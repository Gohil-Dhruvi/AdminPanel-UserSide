const Admin = require("../model/admin.model");
const path = require('path');
const fs = require('fs');

// Add Admin Page (renders the page to add a new admin)
exports.AddAdminPage = async (req, res) => {
  try {
      res.render('add-admin'); 
  } catch (error) {
      console.log("Error rendering add-admin page:", error);
      return res.redirect('back');
  }
};

// Add New Admin (handles the form submission to create a new admin)
exports.AddNewAdmin = async (req, res) => {
  try {
      let imagePath = "";
      if (req.file) {
          // Check if the image type is specified (e.g., 'product', 'category', etc.)
          const folder = getUploadFolder(req.body.imageType);  // Assuming you pass an 'imageType' field in the form
          imagePath = `/uploads/${folder}/${req.file.filename}`;  // Store the image in the appropriate folder
          req.body.image = imagePath;  // Add image path to request body
      }
      await Admin.create(req.body);  // Save the new admin to the database
      req.flash("success", 'New Admin Added Successfully');
      return res.redirect("/admin/views-admin");  
  } catch (error) {
      console.log("Error adding new admin:", error);
      return res.redirect('back');
  }
};

// View All Admins (fetches all admins from the database and displays them)
exports.ViewAdminsPage = async (req, res) => {
  try {
      let admins = await Admin.find();  // Fetch all admins from the database
      res.render("views-admin", { admins });  // Render the admin list page with admins data
  } catch (error) {
      console.log(error);
      return res.redirect("back");
  }
};

// Edit Admin Page (fetches admin details to show in the edit form)
exports.EditAdminPage = async (req, res) => {
  try {
      let admin = await Admin.findById(req.params.id);  // Fetch admin by ID
      if (admin) {
          return res.render("edit-admin", { admin });  // Render the edit page with admin data
      }
      return res.redirect("/admin/views-admin");  // If admin not found, redirect to the list page
  } catch (error) {
      console.log(error);
      return res.redirect("back");
  }
};

// Update Admin (handles the form submission to update an admin's details)
exports.UpdateAdmin = async (req, res) => {
  try {
      let admin = await Admin.findById(req.params.id);  // Fetch the admin to update
      if (admin) {
          // Handle image update
          if (req.file) {
              // Delete the old image if it exists
              if (admin.image) {
                  let imagePath = path.join(__dirname, "..", "uploads", admin.image);
                  if (fs.existsSync(imagePath)) {
                      try {
                          fs.unlinkSync(imagePath);  // Delete old image
                      } catch (error) {
                          console.log("Error deleting old image:", error);
                      }
                  }
              }

              // Determine the folder based on imageType or any other logic
              const folder = getUploadFolder(req.body.imageType);  // Assuming 'imageType' is part of the form
              let newImagePath = `/uploads/${folder}/${req.file.filename}`;
              req.body.image = newImagePath;  // Add new image path to request body
          }

          // Update the admin details in the database
          let updatedAdmin = await Admin.findByIdAndUpdate(admin._id, req.body, { new: true });
          if (updatedAdmin) {
              req.flash("success", "Admin updated successfully");
              return res.redirect("/admin/views-admin");  // Redirect to the admin list page
          }
      }
      return res.redirect("back");  // If admin not found, redirect back
  } catch (error) {
      console.log(error);
      return res.redirect("back");
  }
};

// Delete Admin (deletes an admin and their image)
exports.DeleteAdminPage = async (req, res) => {
  try {
      let admin = await Admin.findById(req.params.id);  // Fetch the admin to delete
      if (!admin) return res.redirect("/admin/views-admin");  // If admin not found, redirect to the list page

      // Delete the image file if it exists
      if (admin.image) {
          let imagePath = path.join(__dirname, "..", "uploads", admin.image);
          if (fs.existsSync(imagePath)) {
              try {
                  fs.unlinkSync(imagePath);  // Delete the image
              } catch (error) {
                  console.log("Error deleting image:", error);
              }
          }
      }

      await Admin.findByIdAndDelete(req.params.id);  
      return res.redirect("/admin/views-admin");  
  } catch (error) {
      console.error(error);
      return res.redirect("back");
  }
};
