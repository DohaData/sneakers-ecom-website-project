const express = require("express");
const { updateSignInStatus } = require("../utils");
const { getProductSummary } = require("../utils");
const Product = require("../models/Product.model");
const router = express.Router();

/* GET home page */
router.get("/", async (req, res, next) => {
  const products = await Product.find();
  const { minPrice, maxPrice, brands } = getProductSummary(products);
  const [isSignedOut, firstName] = await updateSignInStatus(req);
  res.render("products/all-products", {
    products,
    minPrice,
    maxPrice,
    brands,
    isSignedOut,
    firstName,
  });
});

/* GET filtered products */
router.get("/filter", async (req, res, next) => {
  const { minPriceSelected, maxPriceSelected, brand } = req.query;
  const filters = {};

  if (minPriceSelected) {
    filters.price = { $gte: Number(minPriceSelected) };
  }
  if (maxPriceSelected) {
    filters.price = { ...filters.price, $lte: Number(maxPriceSelected) };
  }
  if (brand) {
    if (Array.isArray(brand)) {
      filters.brand = { $in: brand };
    } else {
      filters.brand = brand;
    }
  }

  const products = await Product.find(filters);
  const allProducts = await Product.find();
  const { minPrice, maxPrice, brands } = getProductSummary(allProducts);
  const [isSignedOut, firstName] = await updateSignInStatus(req);

  res.render("products/all-products", {
    products,
    minPrice,
    maxPrice,
    brands,
    isSignedOut,
    firstName,
  });
});

/* GET products page */
router.get("/:id", async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(`${productId}`);
  const [isSignedOut, firstName] = await updateSignInStatus(req);
  res.render("products/product-details", { product, isSignedOut, firstName });
});

module.exports = router;
