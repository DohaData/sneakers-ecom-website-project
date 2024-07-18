const express = require("express");
const router = express.Router();

/* GET About Us page */
router.get('/', function(req, res) {
    res.render('about-us/about');
});

module.exports = router;