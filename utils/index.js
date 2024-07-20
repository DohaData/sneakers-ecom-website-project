const User = require("../models/User.model");

function getProductSummary(products) {
  const minPrice = Math.min(...products.map((product) => product.price));
  const maxPrice = Math.max(...products.map((product) => product.price));
  const brands = [...new Set(products.map((product) => product.brand))];
  return { minPrice, maxPrice, brands };
}
async function updateSignInStatus(req) {
  if (req.session.currentUserId) {
      const user = await User.findById(req.session.currentUserId);
      return [!user.isSignedUp, user.firstName];
  }
  return [true, undefined];
}

module.exports = { getProductSummary, updateSignInStatus };
