const Admin = require("../model/admin.model");
const path = require('path');
const fs = require('fs');

// Add Admin (renders the page to add a new admin)
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
          const folder = getUploadFolder(req.body.imageType); 
          imagePath = `/uploads/${folder}/${req.file.filename}`;  
          req.body.image = imagePath;  
      }
      await Admin.create(req.body);  
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
      let admins = await Admin.find();  
      res.render("views-admin", { admins });  
  } catch (error) {
      console.log(error);
      return res.redirect("back");
  }
};

// Edit Admin Page (fetches admin details to show in the edit form)
exports.EditAdminPage = async (req, res) => {
  try {
      let admin = await Admin.findById(req.params.id);  
      if (admin) {
          return res.render("edit-admin", { admin });  
      }
      return res.redirect("/admin/views-admin");  
  } catch (error) {
      console.log(error);
      return res.redirect("back");
  }
};

// Update Admin (handles the form submission to update an admin's details)
exports.UpdateAdmin = async (req, res) => {
  try {
      let admin = await Admin.findById(req.params.id);  
      if (admin) {
          if (req.file) {
              if (admin.image) {
                  let imagePath = path.join(__dirname, "..", "uploads", admin.image);
                  if (fs.existsSync(imagePath)) {
                      try {
                          fs.unlinkSync(imagePath);  
                      } catch (error) {
                          console.log("Error deleting old image:", error);
                      }
                  }
              }

              const folder = getUploadFolder(req.body.imageType);  
              let newImagePath = `/uploads/${folder}/${req.file.filename}`;
              req.body.image = newImagePath; 
          }

          // Update the admin details in the database
          let updatedAdmin = await Admin.findByIdAndUpdate(admin._id, req.body, { new: true });
          if (updatedAdmin) {
              req.flash("success", "Admin updated successfully");
              return res.redirect("/admin/views-admin");  
          }
      }
      return res.redirect("back");  
  } catch (error) {
      console.log(error);
      return res.redirect("back");
  }
};

// Delete Admin (deletes an admin and their image)
exports.DeleteAdminPage = async (req, res) => {
  try {
      let admin = await Admin.findById(req.params.id);  
      if (!admin) return res.redirect("/admin/views-admin"); 

      if (admin.image) {
          let imagePath = path.join(__dirname, "..", "uploads", admin.image);
          if (fs.existsSync(imagePath)) {
              try {
                  fs.unlinkSync(imagePath);  
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
