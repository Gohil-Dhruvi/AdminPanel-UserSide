
const express = require('express');
const {
  addCategoryPage,
  addCategory,
  viewCategory,
  editCategoryPage,
  updateCategory,
  deleteCategory,
} = require('../controller/category.controller');

const Category = require("../model/category.model");

const routes = express.Router();

routes.get("/add-category", addCategoryPage);
routes.post("/add-category", Category.uploadImage, addCategory);

routes.get("/view-category", viewCategory);
routes.get("/edit-category/:id", editCategoryPage);
routes.post("/update-category/:id", Category.uploadImage, updateCategory);
routes.get("/delete-category/:id", deleteCategory);

module.exports = routes;
