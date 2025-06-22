const Category = require("../model/category.model");
const SubCategory = require("../model/subCategory.model");
const path = require("path");
const fs = require("fs");

exports.viewSubCategory = async (req, res) => {
  try {
    const subCategories = await SubCategory.find().populate("category");
    return res.render("subCategory/view-subCategory", { subCategories });
  } catch (err) {
    console.log("View SubCategory Error ===>", err);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

exports.addSubCategoryPage = async (req, res) => {
  try {
    const categories = await Category.find().lean();

    const uniqueCategories = categories.filter(
      (cat, index, self) =>
        index === self.findIndex((c) => c.category.toLowerCase() === cat.category.toLowerCase())
    );

    res.render("subCategory/add-subCategory", { categories: uniqueCategories });
  } catch (err) {
    res.status(500).send("Error loading form");
  }
};


exports.addSubCategory = async (req, res) => {
  try {
    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/subCategory/${req.file.filename}`;
    }

    const subCategory = await SubCategory.create({
      category: req.body.category,
      subCategory: req.body.subCategory,
      subCategoryImage: imagePath,
    });

    req.flash("success", "Subcategory added successfully!");
    return res.redirect("/subCategory/view-subCategory");
  } catch (error) {
    console.log("Add SubCategory Error ===>", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("/subCategory/view-subCategory");
  }
};

exports.editSubCategoryPage = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).lean();
    const categories = await Category.find().lean();

    const uniqueCategories = categories.filter(
      (cat, index, self) =>
        index === self.findIndex((c) => c.category.toLowerCase() === cat.category.toLowerCase())
    );

    res.render("subCategory/edit-subCategory", {
      subCategory,
      categories: uniqueCategories,
    });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).send("Server Error");
  }
};


exports.updateSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      req.flash("error", "Subcategory not found!");
      return res.redirect("/subCategory/view-subCategory");
    }

    let imagePath = subCategory.subCategoryImage;

    if (req.file) {
      if (subCategory.subCategoryImage && subCategory.subCategoryImage !== "") {
        const oldImagePath = path.join(__dirname, "..", subCategory.subCategoryImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      imagePath = `/uploads/subCategory/${req.file.filename}`;
    }

    await SubCategory.findByIdAndUpdate(req.params.id, {
      category: req.body.category,
      subCategory: req.body.subCategory,
      subCategoryImage: imagePath,
    });

    req.flash("success", "Subcategory updated successfully!");
    return res.redirect("/subCategory/view-subCategory");
  } catch (error) {
    console.log("Update SubCategory Error ===>", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("/subCategory/view-subCategory");
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      req.flash("error", "Subcategory not found!");
      return res.redirect("/subCategory/view-subCategory");
    }

    if (subCategory.subCategoryImage) {
      const imagePath = path.join(__dirname, "..", subCategory.subCategoryImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await SubCategory.findByIdAndDelete(req.params.id);

    req.flash("success", "Subcategory deleted successfully!");
    return res.redirect("/subCategory/view-subCategory");
  } catch (error) {
    console.log("Delete SubCategory Error ===>", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("/subCategory/view-subCategory");
  }
};
