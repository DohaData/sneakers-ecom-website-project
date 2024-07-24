const express = require("express");
const router = express.Router();
const { updateSignInStatus } = require("../utils");
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
    const orders = await Order.find({ user: userId })
      .populate({
        path: "cart",
        populate: {
          path: "products.product",
          model: "Product",
        },
      })
      .populate("shippingAddress")
      .exec();
    orders.forEach((order) => {
      order.totalPrice = order.cart.products.reduce((subTotal, productItem) => {
        return subTotal + productItem.quantity * productItem.product.price;
      }, 0);
    });

    res.render("profile/profile", {
      firstName,
      isSignedOut,
      orders,
    });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
