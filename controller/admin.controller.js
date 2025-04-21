const Admin = require("../model/admin.model");
const path = require('path');
const fs = require('fs');

exports.AddAdminPage = async (req, res) => {
    try {
        res.render('add-admin'); 
    } catch (error) {
        console.log("Error rendering add-admin page:", error);
        return res.redirect('back');
    }
};

exports.AddNewAdmin = async (req,res) =>{
    try{
        let imagePath = "";
        if(req.file){
            imagePath = `/uploads/${req.file.filename}`;
            req.body.image = imagePath;
        }
        await Admin.create(req.body);
        req.flash("success", 'New Admin Added Success');
    return res.redirect("/admin/views-admin");
    }catch(error){
        console.log("Error rendering add-admin page:", error);
        return res.redirect('back');
    }
}

exports.ViewAdminsPage = async(req,res)=>{
    try {
        let admins = await Admin.find();
         res.render("views-admin",{admins});
    } catch (error) {
        console.log(error);
        return res.redirect("back")
    }
}

exports.EditAdminPage = async (req,res)=>{
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
}


exports.UpdateAdmin = async (req, res) => {
    try {
      let admin = await Admin.findById(req.params.id);
      if (admin) {
        if (req.file) {
          let imagePath = "";
          if (admin.image) {
            imagePath = path.join(__dirname, "..", "public", admin.image);
            if (fs.existsSync(imagePath)) {
              try {
                fs.unlinkSync(imagePath); 
              } catch (error) {
                console.log("Error deleting old image:", error);
              }
            }
          }
          imagePath = `/uploads/${req.file.filename}`;
          req.body.image = imagePath;
        }
  
        let updateAdmin = await Admin.findByIdAndUpdate(admin._id, req.body, {
          new: true,
        });
        if (updateAdmin) {
          req.flash("success", "Update Admin Success");
          return res.redirect("/admin/views-admin");
        }
      }
      return res.redirect("back");
    } catch (error) {
      console.log(error);
      return res.redirect("back");
    }
  };
  
  exports.DeleteAdminPage = async (req, res) => {
    try {
      let admin = await Admin.findById(req.params.id);
      if (!admin) return res.redirect("/admin/views-admin");
  
      if (admin.image) {
        let imagePath = path.join(__dirname, "..", "public", admin.image);
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
  
