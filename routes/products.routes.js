const express = require("express");
const { updateSignInStatus } = require("../utils");
const { getProductSummary } = require("../utils");
const Product = require("../models/Product.model");
const router = express.Router();

/* GET home page */
router.get("/", async (req, res, next) => {
  const products = await Product.find();
  const { minPrice, maxPrice, brands } = getProductSummary(products);
  const isSignedOut = await updateSignInStatus(req);
  res.render("products/all-products", {
    products,
    minPrice,
    maxPrice,
    brands,
    isSignedOut,
  });
});

/* GET filtered products */
router.get("/filter", async (req, res, next) => {
  const { minPriceSelected, maxPriceSelected, brand } = req.query;
  const filters = {};
  if (minPriceSelected) filters.price = { $gte: minPriceSelected };
  if (maxPriceSelected)
    filters.price = { ...filters.price, $lte: maxPriceSelected };
  if (brand) filters.brand = brand;

  const products = await Product.find(filters);
  const allProducts = await Product.find();
  const { minPrice, maxPrice, brands } = getProductSummary(allProducts);
  const isSignedOut = await updateSignInStatus(req);
  res.render("products/all-products", {
    products,
    minPrice,
    maxPrice,
    brand,
    isSignedOut,
  });
});

/* GET products page */
router.get("/:id", async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(`${productId}`);
  const isSignedOut = await updateSignInStatus(req);
  res.render("products/product-details", { product, isSignedOut });
});

module.exports = router;
