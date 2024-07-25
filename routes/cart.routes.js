const express = require("express");
const nodemailer = require("nodemailer");

const { v4: uuidv4 } = require("uuid");

const User = require("../models/User.model");
const Cart = require("../models/Cart.model");
const Address = require("../models/Address.model");
const Order = require("../models/Order.model");

const { updateSignInStatus, getNumberOfCartElements } = require("../utils");

const router = express.Router();

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
  let nbCartElements = await getNumberOfCartElements(req);
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
    nbCartElements,
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

  const output = `
  <p>You have submitted an order</p>

  <h3>Order Details</h3>
  <ul>
    <li>First Name: ${currentUser.firstName}</li>
    <li>Last Name: ${currentUser.lastName}</li>
    <li>Email: ${currentUser.email}</li>
    <li>House Number: ${houseNumber}</li>
    <li>Street: ${street}</li>
    <li>City: ${city}</li>
    <li>State: ${state}</li>
    <li>Zip: ${zip}</li>
    <li>Country: ${country}</li>
    <li>Additional Info: ${additionalInfo}</li>
  </ul>

  <h3>Order</h3>
  <ul>
    ${currentUser.cart.products
      .map(
        (productInfo) =>
          `<li>${productInfo.product.name} - ${productInfo.quantity} - ${productInfo.product.price}</li>`
      )
      .join("")}
  </ul>

  <h3>Estimated Delivery</h3>
  <p>${new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )}</p>

  <h3>Thank you for shopping with us!</h3>
`;

  // Create a transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS, // your email password
    },
  });

  // Set up email data with unicode symbols
  let mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to: currentUser.email, // list of receivers
    subject: "Order Submitted", // Subject line
    text: `First Name: ${currentUser.firstName}\nLast Name: ${currentUser.lastName}\nEmail: ${currentUser.email}\nHouse Number: ${houseNumber}\nStreet: ${street}\nCity: ${city}\nState: ${state}\nZip: ${zip}\nCountry: ${country}\nAdditional Info: ${additionalInfo}`, // plain text body
    html: output, // html body
  };

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });

  const cart = await Cart.create({
    products: [],
  });
  await cart.save();
  currentUser.cart = cart._id;
  await currentUser.save();

  const [isSignedOut, firstNameInDb, userId, isAdmin] =
    await updateSignInStatus(req);
  let nbCartElements = await getNumberOfCartElements(req);
  res.render("cart-related/cart-checkout", {
    isSignedOut,
    firstName: firstNameInDb,
    userId,
    isAdmin,
    nbCartElements,
  });
});

module.exports = router;
