
const express = require("express");
const routes = express.Router();

const {
  addSubCategoryPage,
  addSubCategory,
  viewSubCategory,
  deleteSubCategory,
  editSubCategoryPage,
  updateSubCategory
} = require("../controller/subCategory.controller");

const SubCategory = require("../model/subCategory.model");

// Routes
routes.get("/add-subCategory", addSubCategoryPage);
routes.post("/add-subCategory", SubCategory.uploadImage, addSubCategory);

routes.get("/view-subCategory", viewSubCategory);
routes.get("/delete-subCategory/:id", deleteSubCategory);

routes.get("/edit-subCategory/:id", editSubCategoryPage);
routes.post("/update-subCategory/:id", SubCategory.uploadImage, updateSubCategory);

module.exports = routes;
