const express = require("express");
const { updateSignInStatus, getNumberOfCartElements } = require("../utils");
const router = express.Router();

/* GET About Us page */
router.get("/", async (req, res) => {
  let nbCartElements = await getNumberOfCartElements(req);
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  res.render("about-us/about", {
    firstName,
    isSignedOut,
    userId,
    isAdmin,
    nbCartElements,
  });
});

module.exports = router;
