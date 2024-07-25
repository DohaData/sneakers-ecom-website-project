const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User.model");
const Cart = require("../models/Cart.model");
const Address = require("../models/Address.model");
const Order = require("../models/Order.model");

const { updateSignInStatus } = require("../utils");

router.get("/", async (req, res, next) => {
  if (!req.session.currentUserId) {
    const cart = await Cart.create({
      products: [],
    });

    const currentUser = await User.create({
      isSignedUp: false,
      email: `guest${uuidv4()}@guest.com`,
      cart: cart._id,
    });

    req.session.currentUserId = currentUser._id;
    req.session.isSignedUp = currentUser.isSignedUp;
  }

  const currentUser = await User.findById(req.session.currentUserId)
    .populate({
      path: "cart",
      populate: {
        path: "products.product",
        model: "Product",
      },
    })
    .populate("address")
    .exec();
  const cart = currentUser.cart;

  let estimatedShippingDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  const cartItems = cart.products.map((productInfo) => {
    const product = productInfo.product.toObject();
    product.quantity = productInfo.quantity;
    product.selectedSize = productInfo.selectedSize;
    return product;
  });

  console.log(cartItems.map((product) => product.quantity));

  // Set the time to midnight (00:00:00)
  estimatedShippingDate.setHours(0, 0, 0, 0);
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  res.render("cart-related/cart", {
    cartItems,
    totalPrice: cart.products.reduce(
      (total, productInfo) =>
        total + productInfo.quantity * productInfo.product.price,
      0
    ),
    estimatedShippingDate: estimatedShippingDate.toISOString().split("T")[0],
    address: currentUser.address,
    personalInfo: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.isSignedUp ? currentUser.email : undefined,
    },
    isSignedOut,
    firstName,
    userId,
    isAdmin,
  });
});

router.get("/add-product/:productId", async (req, res, next) => {
  const productId = req.params.productId;
  const quantity = Number(req.query.quantity | 1);
  const selectedSize = Number(req.query.size);

  if (!req.session.currentUserId) {
    const cart = await Cart.create({
      products: [],
    });

    const currentUser = await User.create({
      isSignedUp: false,
      email: `guest${uuidv4()}@guest.com`,
      cart: cart._id,
    });

    req.session.currentUserId = currentUser._id;
    req.session.isSignedUp = currentUser.isSignedUp;
  }

  const currentUser = await User.findById(req.session.currentUserId)
    .populate({
      path: "cart",
      populate: {
        path: "products.product",
        model: "Product",
      },
    })
    .exec();
  const cart = currentUser.cart;

  const productIndex = cart.products.findIndex(
    (productInfo) =>
      productInfo.product._id.toString() === productId &&
      productInfo.selectedSize === selectedSize
  );

  console.log(productIndex);

  if (productIndex > -1) {
    cart.products[productIndex].quantity += quantity;
  } else {
    cart.products.push({ product: productId, quantity, selectedSize });
  }

  await cart.save();
  currentUser.cart = cart;

  res.redirect("/products");
});

router.get("/remove-product/:productId", async (req, res, next) => {
  const productId = req.params.productId;
  const selectedSize = Number(req.query.size);

  const currentUser = await User.findById(req.session.currentUserId)
    .populate({
      path: "cart",
      populate: {
        path: "products.product",
        model: "Product",
      },
    })
    .exec();
  const cart = currentUser.cart;

  cart.products = cart.products.filter(
    (productInfo) =>
      !(
        productInfo.product._id.toString() === productId &&
        productInfo.selectedSize === selectedSize
      )
  );

  await cart.save();

  res.redirect("/cart");
});

router.get("/decrease-product-quantity/:productId", async (req, res, next) => {
  const productId = req.params.productId;
  const selectedSize = Number(req.query.size);

  const currentUser = await User.findById(req.session.currentUserId)
    .populate({
      path: "cart",
      populate: {
        path: "products.product",
        model: "Product",
      },
    })
    .exec();
  const cart = currentUser.cart;

  const productIndex = cart.products.findIndex(
    (productInfo) =>
      productInfo.product._id.toString() === productId &&
      productInfo.selectedSize === selectedSize
  );

  console.log(productIndex);

  if (productIndex > -1) {
    cart.products[productIndex].quantity -= 1;
    console.log(cart.products[productIndex].quantity);
    if (cart.products[productIndex].quantity === 0) {
      cart.products = cart.products.filter(
        (productInfo) =>
          !(
            productInfo.product._id.toString() === productId &&
            productInfo.selectedSize === selectedSize
          )
      );
    }
  }

  await cart.save();

  res.redirect("/cart");
});

router.get("/increase-product-quantity/:productId", async (req, res, next) => {
  const productId = req.params.productId;
  const selectedSize = Number(req.query.size);

  const currentUser = await User.findById(req.session.currentUserId)
    .populate({
      path: "cart",
      populate: {
        path: "products.product",
        model: "Product",
      },
    })
    .exec();
  const cart = currentUser.cart;

  console.log(cart.products);

  console.log(productId, selectedSize);

  const productIndex = cart.products.findIndex(
    (productInfo) =>
      productInfo.product._id.toString() === productId &&
      productInfo.selectedSize === selectedSize
  );

  console.log(productIndex);

  if (productIndex > -1) {
    cart.products[productIndex].quantity += 1;
  }

  await cart.save();

  res.redirect("/cart");
});

router.post("/checkout", async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    houseNumber,
    street,
    city,
    state,
    zip,
    country,
    additionalInfo,
  } = req.body;
  const currentUser = await User.findById(req.session.currentUserId)
    .populate({
      path: "cart",
      populate: {
        path: "products.product",
        model: "Product",
      },
    })
    .exec();

  const address = await Address.create({
    houseNumber,
    street,
    city,
    state,
    zip,
    country,
    additionalInfo,
  });
  currentUser.address = address._id;

  await Order.create({
    user: currentUser._id,
    cart: currentUser.cart._id,
    status: "SUBMITTED",
    shippingAddress: address._id,
    estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  const cart = await Cart.create({
    products: [],
  });
  await cart.save();

  currentUser.cart = cart._id;

  await currentUser.save();
  const [isSignedOut, firstNameInDb, userId, isAdmin] =
    await updateSignInStatus(req);
  res.render("cart-related/cart-checkout", {
    isSignedOut,
    firstName: firstNameInDb,
    userId,
    isAdmin,
  });
});

module.exports = router;
