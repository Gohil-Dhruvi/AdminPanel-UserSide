
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const extraCategorySchema = mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
  },
  extraCategory: {
    type: String,
  },
  extraCategoryImage: {
    type: String,
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..","uploads/extraCategory"));
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}`);
  }
});

extraCategorySchema.statics.uploadImage = multer({ storage }).single("extraCategoryImage");

const ExtraCategory = mongoose.model("ExtraCategory", extraCategorySchema);
module.exports = ExtraCategory;
