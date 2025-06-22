
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const SUBCATEGORY_PATH = path.join("/uploads/subCategory");

const subCategorySchema = mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  subCategoryImage: {
    type: String,
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", SUBCATEGORY_PATH));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

subCategorySchema.statics.uploadImage = multer({ storage: storage }).single("subCategoryImage");

const SubCategory = mongoose.model("SubCategory", subCategorySchema);
module.exports = SubCategory;
