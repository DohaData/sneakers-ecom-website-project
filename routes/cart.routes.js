const express = require("express");
const nodemailer = require("nodemailer");

const { v4: uuidv4 } = require("uuid");

const User = require("../models/User.model");
const Cart = require("../models/Cart.model");
const Address = require("../models/Address.model");
const Order = require("../models/Order.model");

const {
  updateSignInStatus,
  getNumberOfCartElements,
  getCountryFromIP,
} = require("../utils");

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

  if (!currentUser.cart) {
    currentUser.cart = await Cart.create({
      products: [],
    });
  }

  const cart = currentUser.cart;

  let estimatedShippingDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  const cartItems = cart.products.map((productInfo) => {
    const product = productInfo.product.toObject();
    product.quantity = productInfo.quantity;
    product.selectedSize = productInfo.selectedSize;
    return product;
  });

  // Set the time to midnight (00:00:00)
  estimatedShippingDate.setHours(0, 0, 0, 0);
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );

  let nbCartElements = await getNumberOfCartElements(req);

  const ip = req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(",")[0].trim()
    : req.socket.remoteAddress;

  const countryFromIp = await getCountryFromIP(ip);
  const defaultAddress = currentUser.address || {
    houseNumber: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: countryFromIp || "",
    additionalInfo: "",
  };

  res.render("cart-related/cart", {
    cartItems,
    totalPrice: cart.products.reduce(
      (total, productInfo) =>
        total + productInfo.quantity * productInfo.product.price,
      0
    ),
    estimatedShippingDate: estimatedShippingDate.toISOString().split("T")[0],
    address: defaultAddress,
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

  if (!currentUser.cart) {
    currentUser.cart = await Cart.create({
      products: [],
    });
  }

  const cart = currentUser.cart;

  const productIndex = cart.products.findIndex(
    (productInfo) =>
      productInfo.product._id.toString() === productId &&
      productInfo.selectedSize === selectedSize
  );

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

  if (productIndex > -1) {
    cart.products[productIndex].quantity -= 1;
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

  const productIndex = cart.products.findIndex(
    (productInfo) =>
      productInfo.product._id.toString() === productId &&
      productInfo.selectedSize === selectedSize
  );

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
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #333;
        line-height: 1.6;
      }
      .container {
        width: 90%;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      h3 {
        color: #007BFF;
      }
      ul {
        list-style-type: none;
        padding: 0;
      }
      ul li {
        background: #f9f9f9;
        margin: 5px 0;
        padding: 10px;
        border-radius: 5px;
      }
      .product-list li {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .product-name {
        font-weight: bold;
      }
      .product-price {
        color: #555;
      }
      .thank-you {
        text-align: center;
        margin-top: 30px;
        font-size: 1.2em;
        color: #28A745;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <p>You have submitted an order.</p>
  
      <h3>Order Details</h3>
      <ul>
        <li><strong>First Name:</strong> ${currentUser.firstName}</li>
        <li><strong>Last Name:</strong> ${currentUser.lastName}</li>
        <li><strong>Email:</strong> ${currentUser.email}</li>
        <li><strong>House Number:</strong> ${houseNumber}</li>
        <li><strong>Street:</strong> ${street}</li>
        <li><strong>City:</strong> ${city}</li>
        <li><strong>State:</strong> ${state}</li>
        <li><strong>Zip:</strong> ${zip}</li>
        <li><strong>Country:</strong> ${country}</li>
        <li><strong>Additional Info:</strong> ${additionalInfo || "N/A"}</li>
      </ul>
  
      <h3>Order Summary</h3>
      <ul class="product-list">
        ${currentUser.cart.products
          .map(
            (productInfo) =>
              `<li>
                <span class="product-name">${productInfo.product.name}</span> 
                <span>${
                  productInfo.quantity
                } x $${productInfo.product.price.toFixed(2)}</span>
                <span class="product-price">$${(
                  productInfo.quantity * productInfo.product.price
                ).toFixed(2)}</span>
              </li>`
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
  
      <div class="thank-you">
        <h3>Thank you for shopping with us!</h3>
      </div>
    </div>
  </body>
  </html>
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
