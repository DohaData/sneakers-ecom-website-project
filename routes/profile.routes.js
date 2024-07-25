const express = require("express");
const router = express.Router();
const { updateSignInStatus, getNumberOfCartElements } = require("../utils");
const Order = require("../models/Order.model"); // Make sure the path is correct
/* GET Profile page */
router.get("/:userId", async (req, res) => {
  try {
    const [isSignedOut, firstName, _] = await updateSignInStatus(req);
    if (isSignedOut) {
      return res.redirect("/auth/login"); // Redirect to sign-in if not signed in
    }
    // Assuming req.user contains the authenticated user's details
    const userId = req.params.userId;
    // Fetch orders for the signed-in user
    let orders = await Order.find({ user: userId })
      .populate({
        path: "cart",
        populate: {
          path: "products.product",
          model: "Product",
        },
      })
      .populate("shippingAddress")
      .exec();
    orders = orders.map((order) => order.toObject());
    let formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    });
    orders.forEach((order) => {
      order.totalPrice = order.cart.products.reduce((subTotal, productItem) => {
        return subTotal + productItem.quantity * productItem.product.price;
      }, 0);
      order.createdAt = formatter.format(new Date(order.createdAt));
    });
    let nbCartElements = await getNumberOfCartElements(req);
    res.render("profile/profile", {
      firstName,
      isSignedOut,
      orders,
      nbCartElements,
    });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
