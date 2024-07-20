const express = require('express');
const { updateSignInStatus } = require("../utils");
const router = express.Router();

/* GET home page */
router.get("/", async (req, res, next) => {
  const isSignedOut = await updateSignInStatus(req);
  res.render("index", { isSignedOut });
});

module.exports = router;
