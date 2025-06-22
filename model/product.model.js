
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    sizes: {
      type: [String],
      default: []
    },
    colors: {
      type: [String],
      default: []
    },
    material: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Kids"],
      default: "Unisex"
    },
    productImage: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      default: 1
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    brand: {
      type: String,
      trim: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true
    },
    extraCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExtraCategory",
      required: true
    },
    productImage: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "/uploads/Product"));
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});


productSchema.statics.uploadImage = multer({ storage }).single("productImage");

const Product = mongoose.model("Product", productSchema);
module.exports = Product;


