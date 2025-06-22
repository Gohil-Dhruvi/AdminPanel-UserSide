const Category = require("../model/category.model");
const path = require("path");
const fs = require("fs");

exports.viewCategory = async (req, res) => {
    try {
        let categories = await Category.find();
        return res.render("category/view-category", { categories });
    } catch (error) {
        console.log("Something Wrong ===> ", error);
        req.flash("error", "Something went wrong!!!");
        return res.redirect("back");
    }
};

exports.addCategoryPage = async (req, res) => {
    try {
        return res.render("category/add-category");
    } catch (error) {
        console.log("Something Wrong ===> ", error);
        req.flash("error", "Something went wrong!!!");
        return res.redirect("back");
    }
};

exports.addCategory = async (req, res) => {
    try {
        let imagePath = "";
        if (req.file) {
            imagePath = `/uploads/category/${req.file.filename}`;
        }

        req.body.categoryImage = imagePath;

        const category = await Category.create(req.body);
        if (category) {
            req.flash("success", "New Category Added!");
        } else {
            req.flash("error", "Failed to add category!");
        }

        return res.redirect("/category/view-category");
    } catch (error) {
        console.log("Something Wrong ===> ", error);
        req.flash("error", "Something went wrong!");
        return res.redirect("/category/view-category");
    }
};

exports.editCategoryPage = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        return res.render("category/edit-category", { category });
    } catch (error) {
        console.log("Something Wrong ===> ", error);
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      req.flash("error", "Category not found!");
      return res.redirect("/category/view-category");
    }

    if (req.file) {
      let imagePath = "";
      if (category.categoryImage && category.categoryImage !== "") {
        imagePath = path.join(__dirname, "..", category.categoryImage);
        try {
          fs.unlinkSync(imagePath); 
        } catch (error) {
          console.log("Old image not found or already deleted.");
        }
      }

      req.body.categoryImage = `/uploads/category/${req.file.filename}`;
    } else {
      req.body.categoryImage = category.categoryImage; 
    }

    const updatedCategory = await Category.findByIdAndUpdate(category._id, req.body, { new: true });

    if (updatedCategory) {
      req.flash("success", "Category updated successfully!");
    } else {
      req.flash("error", "Failed to update category!");
    }

    return res.redirect("/category/view-category");
  } catch (error) {
    console.log("Update Category Error ===>", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("/category/view-category");
  }
};


exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            req.flash("error", "Category not found!");
            return res.redirect("/category/view-category");
        }

        if (category.categoryImage) {
            const imagePath = path.join(__dirname, "..", category.categoryImage);
            try {
                fs.unlinkSync(imagePath);
            } catch (err) {
                console.log("Image file already deleted or not found.");
            }
        }

        await Category.findByIdAndDelete(req.params.id);
        await SubCategory.deleteMany({ category: req.params.id }); 

        req.flash("success", "Category deleted successfully!");
        return res.redirect("/category/view-category");

    } catch (err) {
        console.log("Delete Category Error ===>", err);
        req.flash("error", "Something went wrong!");
        return res.redirect("/category/view-category");
    }
};
