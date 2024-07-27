const express = require("express");
const {
  updateSignInStatus,
  getProductSummary,
  getNumberOfCartElements,
} = require("../utils");
const isAdmin = require("../middleware/isAdmin");
const Product = require("../models/Product.model");
const { storage } = require("../config/cloudinaryConfig"); // Assuming cloudinaryConfig is in the config folder
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage });

/* GET home page */
router.get("/", async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 9; // Number of products per page
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const products = await Product.find().skip(startIndex).limit(limit);
  const allProducts = await Product.find();
  const totalProducts = await Product.countDocuments();

  const totalPages = Math.ceil(totalProducts / limit);

  const { minPrice, maxPrice, brands } = getProductSummary(allProducts);
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  let nbCartElements = await getNumberOfCartElements(req);

  // Add this before rendering the template
  const paginationPages = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationPages.push({ number: i, active: i === page });
  }

  // Pass paginationPages to the template
  res.render("products/all-products", {
    products,
    minPrice,
    maxPrice,
    brands,
    isSignedOut,
    firstName,
    userId,
    isAdmin,
    nbCartElements,
    currentPage: page,
    totalPages: totalPages,
    paginationPages: paginationPages,
    previousPage: page - 1,
    nextPage: page + 1,
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
  let nbCartElements = await getNumberOfCartElements(req);
  res.render("products/all-products", {
    products,
    minPrice,
    maxPrice,
    brands,
    isSignedOut,
    firstName,
    userId,
    isAdmin,
    nbCartElements,
  });
});

// Add product to inventory
router.get("/add", isAdmin, async (req, res, next) => {
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  let nbCartElements = await getNumberOfCartElements(req);
  const allProducts = await Product.find();
  const brands = getProductSummary(allProducts).brands;
  res.render("products/add-product", {
    isSignedOut,
    firstName,
    userId,
    isAdmin,
    nbCartElements,
    brands,
  });
});

router.post("/add", isAdmin, upload.single("image"), async (req, res, next) => {
  const {
    name,
    description,
    price,
    stock,
    availableSizes,
    model,
    brand,
    color,
  } = req.body;

  const sizesArray = availableSizes
    .split(",")
    .map((size) => parseFloat(size.trim()));

  const imageUrl = req.file.path; // Use Cloudinary image URL

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

// Update product in inventory
router.get("/update/:id", isAdmin, async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(`${productId}`);
  const availableSizesString = product.availableSizes.join(",");
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  let nbCartElements = await getNumberOfCartElements(req);
  const allProducts = await Product.find();
  const brands = getProductSummary(allProducts).brands;
  res.render("products/update-product", {
    product,
    availableSizesString,
    isSignedOut,
    firstName,
    userId,
    isAdmin,
    nbCartElements,
    brands,
  });
});

router.post(
  "/update/:id",
  isAdmin,
  upload.single("image"),
  async (req, res, next) => {
    const productId = req.params.id;
    const {
      name,
      description,
      price,
      stock,
      availableSizes,
      model,
      brand,
      color,
    } = req.body;

    const sizesArray = availableSizes
      .split(",")
      .map((size) => parseFloat(size.trim()));

    let imageUrl = req.body.currentImageUrl; // Use existing image URL if no new image uploaded
    if (req.file) {
      imageUrl = req.file.path; // Use Cloudinary image URL
    }

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
  }
);

/* GET products page */
router.get("/:id", async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(`${productId}`);
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  let nbCartElements = await getNumberOfCartElements(req);
  res.render("products/product-details", {
    product,
    isSignedOut,
    firstName,
    userId,
    isAdmin,
    nbCartElements,
  });
});

module.exports = router;
