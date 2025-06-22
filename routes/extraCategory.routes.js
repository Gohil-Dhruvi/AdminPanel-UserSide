
const express = require("express");
const router = express.Router();

const {
  addExtraCategoryPage,
  addExtraCategory,
  viewExtraCategory,
  deleteExtraCategory,
  editExtraCategoryPage,
  updateExtraCategory
} = require("../controller/extraCategory.controller");

const ExtraCategory = require("../model/extraCategory.model");

router.get("/add-extraCategory", addExtraCategoryPage);
router.post("/add-extraCategory", ExtraCategory.uploadImage, addExtraCategory);

router.get("/view-extraCategory", viewExtraCategory);
router.get("/delete-extraCategory/:id", deleteExtraCategory);

router.get("/edit-extraCategory/:id", editExtraCategoryPage);
router.post("/update-extraCategory/:id", ExtraCategory.uploadImage, updateExtraCategory);

module.exports = router;
