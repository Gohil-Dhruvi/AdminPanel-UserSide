
const express = require('express');
const {
  addProductPage,
  addProduct,
  viewProduct,
  editProductPage,
  updateProduct,
  deleteProduct,
  singleProductPage
} = require('../controller/product.controller');
const Product = require("../model/product.model");

const routes = express.Router();

routes.get("/add-Product", addProductPage);
routes.post("/add-Product", Product.uploadImage, addProduct);

routes.get("/view-Product", viewProduct);
routes.get("/edit-Product/:id", editProductPage);
routes.post("/update-Product/:id", Product.uploadImage, updateProduct);
routes.get("/delete-Product/:id", deleteProduct);

routes.get("/single-Product/:id", singleProductPage);

module.exports = routes;
