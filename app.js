// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const projectName = "sneakers-ecom-website-project";

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const productsRoutes = require("./routes/products.routes");
app.use("/products", productsRoutes);

const aboutRoutes = require("./routes/about.routes");
app.use("/about", aboutRoutes);

const cartRoutes = require("./routes/cart.routes");
app.use("/cart", cartRoutes);

const contactRoutes = require ("./routes/contact.routes");
app.use("/contact", contactRoutes);

const profileRoutes = require ("./routes/profile.routes");
app.use("/profile", profileRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
