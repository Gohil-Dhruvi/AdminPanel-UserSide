const Product = require("../model/product.model");
const Category = require("../model/category.model");
const SubCategory = require("../model/subCategory.model");
const ExtraCategory = require("../model/extraCategory.model");
const fs = require("fs");
const path = require("path");

exports.viewProduct = async (req, res) => {
  try {
    const { category, search, page = 1 } = req.query;

    const filter = {};

    // Filter by category
    if (category) {
      filter.categoryId = category;
    }

    // Search by productName or description
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const itemsPerPage = 12;
    const skip = (page - 1) * itemsPerPage;

    // Get all products with filters, pagination, and population
    const allProducts = await Product.find(filter)
      .populate("categoryId")
      .populate("subCategoryId")
      .populate("extraCategoryId")
      .skip(skip)
      .limit(itemsPerPage);

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const categories = await Category.find();
    const colors = ['primary', 'success', 'danger', 'info', 'warning', 'dark'];

    res.render("Product/view-Product", {
      allProducts,
      categories,
      search,
      category,
      colors,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.log("Error fetching products:", err);
    req.flash("error", "Something went wrong!");
    res.redirect("back");
  }
};

exports.addProductPage = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    const subCategories = await SubCategory.find().lean();
    const extraCategories = await ExtraCategory.find().lean();

    const uniqueCategories = categories.filter(
      (cat, index, self) =>
        index === self.findIndex(
          (c) => c.category.toLowerCase() === cat.category.toLowerCase()
        )
    );

    res.render("Product/add-Product", {
      categories: uniqueCategories,
      subCategories,
      extraCategories,
    });
  } catch (error) {
    console.log("Add Product Page Error:", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};


exports.addProduct = async (req, res) => {
  try {
    let productImage = "";

    if (req.file) {
      productImage = `/uploads/Product/${req.file.filename}`;
    }

    await Product.create({
      productName: req.body.productName,
      description: req.body.description,
      price: req.body.price,
      categoryId: req.body.categoryId,
      subCategoryId: req.body.subCategoryId,
      extraCategoryId: req.body.extraCategoryId,
      productImage: productImage,
    });

    req.flash("success", "Product added successfully!");
    return res.redirect("/Product/view-Product");
  } catch (error) {
    console.log("Add Product Error:", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};


exports.editProductPage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    const categories = await Category.find().lean();
    const subCategories = await SubCategory.find().lean();
    const extraCategories = await ExtraCategory.find().lean();

    if (!product) {
      req.flash("error", "Product not found!");
      return res.redirect("/Product/view-Product");
    }

    const uniqueCategories = categories.filter(
      (cat, index, self) =>
        index === self.findIndex(
          (c) => c.category.toLowerCase() === cat.category.toLowerCase()
        )
    );

    res.render("Product/edit-Product", {
      product,
      categories: uniqueCategories,
      subCategories,
      extraCategories,
    });
  } catch (error) {
    console.log("Edit Product Page Error:", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash("error", "Product not found!");
      return res.redirect("/Product/view-Product");
    }

    let imagePath = product.productImage;

    if (req.file) {
      if (product.productImage && product.productImage !== "") {
        const oldImagePath = path.join(__dirname, "..", product.productImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      productImage = `/uploads/Product/${req.file.filename}`;

    }

    await Product.findByIdAndUpdate(req.params.id, {
      productName: req.body.productName,
      description: req.body.description,
      price: req.body.price,
      categoryId: req.body.categoryId,
      subCategoryId: req.body.subCategoryId,
      extraCategoryId: req.body.extraCategoryId,
      productImage: imagePath,
    });

    req.flash("success", "Product updated successfully!");
    return res.redirect("/Product/view-Product");
  } catch (error) {
    console.log("Update Product Error ===>", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("/Product/view-Product");
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      req.flash("error", "Product not found!");
      return res.redirect("/Product/view-Product");
    }

    if (product.productImage) {
      const imagePath = path.join(__dirname, "..", product.productImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      } else {
        console.log("Image file not found at:", imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    req.flash("success", "Product deleted successfully!");
    return res.redirect("/Product/view-Product");
  } catch (error) {
    console.error("Delete Product Error:", error);
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

exports.singleProductPage = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId)
      .populate("categoryId")
      .populate("subCategoryId")
      .populate("extraCategoryId");

    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("Product/single-Product", { products: [product] });

  } catch (error) {
    console.error("Error loading single product:", error);
    res.status(500).send("Internal Server Error");
  }
};
