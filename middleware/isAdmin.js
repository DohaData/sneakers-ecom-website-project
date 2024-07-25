const User = require("../models/User.model");

module.exports = async (req, res, next) => {
    // checks if the user is logged in when trying to access a specific page
    if (!req.session.currentUserId || !req.session.isSignedUp) {
      return res.redirect("/auth/login");
    }

    const user = await User.findById(req.session.currentUserId);
    if (!user.isAdmin) {
      return res.redirect("/");
    }
  
    next();
  };
  