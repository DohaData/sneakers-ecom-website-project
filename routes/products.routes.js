const express = require("express");
const { updateSignInStatus, getProductSummary } = require("../utils");
const isAdmin = require("../middleware/isAdmin");
const Product = require("../models/Product.model");
const router = express.Router();

/* GET home page */
router.get("/", async (req, res, next) => {
  const products = await Product.find();
  const { minPrice, maxPrice, brands } = getProductSummary(products);
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  res.render("products/all-products", {
    products,
    minPrice,
    maxPrice,
    brands,
    isSignedOut,
    firstName,
    userId,
    isAdmin,
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
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  res.render("products/all-products", {
    products,
    minPrice,
    maxPrice,
    brands,
    isSignedOut,
    firstName,
    userId,
    isAdmin,
  });
});

/* Add product to inventory */
router.get("/add", isAdmin, async (req, res, next) => {
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  res.render("products/add-product", {
    isSignedOut,
    firstName,
    userId,
    isAdmin,
  });
});

router.post("/add", isAdmin, async (req, res, next) => {
  console.log(req.body);
  const {
    name,
    description,
    price,
    stock,
    imageUrl,
    availableSizes,
    model,
    brand,
    color,
  } = req.body;

  const sizesArray = availableSizes
    .split(",")
    .map((size) => parseFloat(size.trim()));

  await Product.create({
    name,
    description,
    price,
    stock,
    imageUrl,
    availableSizes: sizesArray,
    model,
    brand,
    color,
  });

  res.redirect("/products");
});

/* Update product in inventory */
router.get("/update/:id", isAdmin, async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(`${productId}`);
  const availableSizesString = product.availableSizes.join(",");
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  res.render("products/update-product", {
    product,
    availableSizesString,
    isSignedOut,
    firstName,
    userId,
    isAdmin,
  });
});

router.post("/update/:id", isAdmin, async (req, res, next) => {
  const productId = req.params.id;
  const {
    name,
    description,
    price,
    stock,
    imageUrl,
    availableSizes,
    model,
    brand,
    color,
  } = req.body;

  const sizesArray = availableSizes
    .split(",")
    .map((size) => parseFloat(size.trim()));

  await Product.findByIdAndUpdate(productId, {
    name,
    description,
    price,
    stock,
    imageUrl,
    availableSizes: sizesArray,
    model,
    brand,
    color,
  });
  res.redirect(`/products/${productId}`);
});

/* GET products page */
router.get("/:id", async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(`${productId}`);
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  res.render("products/product-details", {
    product,
    isSignedOut,
    firstName,
    userId,
    isAdmin,
  });
});

module.exports = router;
