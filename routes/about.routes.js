const express = require("express");
const router = express.Router();
const { updateSignInStatus } = require("../utils");

/* GET About Us page */
router.get("/", async (req, res) => {
  const [isSignedOut, firstName] = await updateSignInStatus(req);
  res.render("about-us/about", { firstName, isSignedOut });
});

module.exports = router;
