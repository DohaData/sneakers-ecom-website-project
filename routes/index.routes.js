const express = require("express");
const { updateSignInStatus, getNumberOfCartElements } = require("../utils");
const router = express.Router();

/* GET home page */
router.get("/", async (req, res, next) => {
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  let nbCartElements = await getNumberOfCartElements(req);
  res.render("index", { isSignedOut, firstName, userId, isAdmin, nbCartElements });
});

module.exports = router;
