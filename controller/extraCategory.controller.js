const ExtraCategory = require("../model/extraCategory.model");
const Category = require("../model/category.model");
const SubCategory = require("../model/subCategory.model");
const fs = require("fs");
const path = require("path");

exports.viewExtraCategory = async (req, res) => {
  try {
    const extraCategories = await ExtraCategory.find()
      .populate("categoryId")
      .populate("subCategoryId");

    return res.render("extraCategory/view-extraCategory", { extraCategories });
  } catch (error) {
    console.log("View ExtraCategory Error ===>", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

exports.addExtraCategoryPage = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    const subCategories = await SubCategory.find().lean();

    const uniqueCategories = categories.filter(
      (cat, index, self) =>
        index === self.findIndex(
          (c) => c.category.toLowerCase() === cat.category.toLowerCase()
        )
    );

    res.render("extraCategory/add-extraCategory", {
      categories: uniqueCategories,
      subCategories,
    });
  } catch (error) {
    console.log("Add ExtraCategory Page Error ===>", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};


exports.addExtraCategory = async (req, res) => {
  try {
    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/extraCategory/${req.file.filename}`;
    }

    await ExtraCategory.create({
      extraCategory: req.body.extraCategory,
      categoryId: req.body.categoryId,
      subCategoryId: req.body.subCategoryId,
      extraCategoryImage: imagePath,
    });

    req.flash("success", "Extra Category added successfully!");
    return res.redirect("/extraCategory/view-extraCategory");
  } catch (error) {
    console.log("Add ExtraCategory Error ===>", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

exports.editExtraCategoryPage = async (req, res) => {
  try {
    const extraCategory = await ExtraCategory.findById(req.params.id).lean();
    const categories = await Category.find().lean();
    const subCategories = await SubCategory.find().lean();

    if (!extraCategory) {
      req.flash("error", "Extra Category not found!");
      return res.redirect("/extraCategory/view-extraCategory");
    }

    const uniqueCategories = categories.filter(
      (cat, index, self) =>
        index === self.findIndex(
          (c) => c.category.toLowerCase() === cat.category.toLowerCase()
        )
    );

    res.render("extraCategory/edit-extraCategory", {
      extraCategory,
      categories: uniqueCategories,
      subCategories,
    });
  } catch (error) {
    console.log("Edit ExtraCategory Page Error ===>", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

exports.updateExtraCategory = async (req, res) => {
  try {
    const extraCategory = await ExtraCategory.findById(req.params.id);
    if (!extraCategory) {
      req.flash("error", "Extra Category not found!");
      return res.redirect("/extraCategory/view-extraCategory");
    }

    let imagePath = extraCategory.extraCategoryImage;

    if (req.file) {
      if (extraCategory.extraCategoryImage && extraCategory.extraCategoryImage !== "") {
        const oldImagePath = path.join(__dirname, "..", extraCategory.extraCategoryImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      imagePath = `/uploads/extraCategory/${req.file.filename}`;
    }

    await ExtraCategory.findByIdAndUpdate(req.params.id, {
      extraCategory: req.body.extraCategory,
      categoryId: req.body.categoryId,
      subCategoryId: req.body.subCategoryId,
      extraCategoryImage: imagePath,
    });

    req.flash("success", "Extra Category updated successfully!");
    return res.redirect("/extraCategory/view-extraCategory");
  } catch (error) {
    console.log("Update ExtraCategory Error ===>", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

exports.deleteExtraCategory = async (req, res) => {
  try {
    const extraCategory = await ExtraCategory.findById(req.params.id);
    if (!extraCategory) {
      req.flash("error", "Extra Category not found!");
      return res.redirect("/extraCategory/view-extraCategory");
    }

    if (extraCategory.extraCategoryImage) {
      const imagePath = path.join(__dirname, "..", extraCategory.extraCategoryImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await ExtraCategory.findByIdAndDelete(req.params.id);

    req.flash("success", "Extra Category deleted successfully!");
    return res.redirect("/extraCategory/view-extraCategory");
  } catch (err) {
    console.log("Delete ExtraCategory Error ===>", err);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};
