const express = require("express");
const router = express.Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Cart = require("../models/Cart.model");

// Require necessary middleware to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

const { updateSignInStatus, getNumberOfCartElements } = require("../utils");

// GET /auth/signup
router.get("/signup", isLoggedOut, async (req, res) => {
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  let nbCartElements = await getNumberOfCartElements(req);
  res.render("auth/signup", {
    firstName,
    isSignedOut,
    userId,
    isAdmin,
    nbCartElements,
  });
});

// POST /auth/signup
router.post("/signup", isLoggedOut, async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  const [isSignedOut, _] = await updateSignInStatus(req);
  // Check that email, and password are provided
  if (email === "" || password === "") {
    return res.status(400).render("auth/signup", {
      errorMessage:
        "All fields are mandatory. Please provide your email and password.",
      isSignedOut,
    });
  }

  // Email validation
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Please enter a valid email address.",
      isSignedOut,
    });
  }

  // Password validation
  const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
  if (!passwordPattern.test(password)) {
    return res.status(400).render("auth/signup", {
      errorMessage:
        "Password must be at least 6 characters long and contain a mix of letters, numbers, and special characters.",
      isSignedOut,
    });
  }

  // Confirm password validation
  if (password !== confirmPassword) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Passwords do not match.",
      isSignedOut,
    });
  }

  try {
    // Create a new cart for the user
    const cart = await Cart.create({
      products: [],
    });

    // Hash the password and create the user
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isSignedUp: true,
      cart: cart._id, // Associate the cart with the user
    });

    res.redirect("/auth/login");
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(500).render("auth/signup", {
        errorMessage: error.message,
        isSignedOut,
        firstName,
      });
    } else if (error.code === 11000) {
      res.status(500).render("auth/signup", {
        errorMessage: "Email needs to be unique. Provide a valid email.",
        isSignedOut,
      });
    } else {
      res.status(500).render("auth/signup", {
        errorMessage: "An error occurred. Please try again.",
        isSignedOut,
      });
    }
  }
});

// GET /auth/login
router.get("/login", isLoggedOut, async (req, res) => {
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  let nbCartElements = await getNumberOfCartElements(req);
  res.render("auth/login", {
    isSignedOut,
    firstName,
    userId,
    isAdmin,
    nbCartElements,
  });
});

// POST /auth/login
router.post("/login", isLoggedOut, async (req, res, next) => {
  const { email, password } = req.body;
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );

  // Check that email, and password are provided
  if (email === "" || password === "") {
    return res.status(400).render("auth/login", {
      errorMessage:
        "All fields are mandatory. Please provide email and password.",
      isSignedOut,
      firstName,
      userId,
      isAdmin,
    });
  }

  try {
    const user = await User.findOne({ email });

    // If the user isn't found, send an error message
    if (!user) {
      return res.status(400).render("auth/login", {
        errorMessage: "Wrong credentials.",
        isSignedOut,
        firstName,
      });
    }

    // Compare the provided password with the hashed password in the database
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (!isSamePassword) {
      return res.status(400).render("auth/login", {
        errorMessage: "Wrong credentials.",
        isSignedOut,
        firstName,
      });
    }

    if (req.session.currentUserId) {
      const unsignedUser = await User.findById(req.session.currentUserId);
      user.cart = unsignedUser.cart;
      await user.save();
      await User.findByIdAndDelete(req.session.currentUserId);
    }

    // Add the user object to the session object
    req.session.currentUserId = user._id;
    req.session.isSignedUp = user.isSignedUp;

    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

// GET /auth/logout
router.get("/logout", isLoggedIn, async (req, res) => {
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render("auth/logout", {
        errorMessage: err.message,
        isSignedOut,
        firstName,
        userId,
        isAdmin,
      });
    }

    res.redirect("/");
  });
});

module.exports = router;
