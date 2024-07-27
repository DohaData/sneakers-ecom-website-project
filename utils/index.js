const fetch = require("node-fetch");
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
    return [!user.isSignedUp, user.firstName, user._id, user.isAdmin];
  }
  return [true, undefined, undefined, undefined];
}

async function getNumberOfCartElements(req) {
  let nbCartElements = 0;
  if (req.session.currentUserId) {
    const user = await User.findById(req.session.currentUserId).populate({
      path: "cart",
      populate: {
        path: "products.product",
        model: "Product",
      },
    });
    nbCartElements = user?.cart?.products.reduce(
      (total, productInfo) => total + productInfo.quantity,
      0
    );
  }
  return nbCartElements;
}

async function getCountryFromIP(ip) {
  const response = await fetch(
    `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IP_GEOLOCATION_API_KEY}&ip=${ip}`
  );
  const data = await response.json();

  if (data && data.country_name) {
    return data.country_name;
  }

  return null;
}

module.exports = {
  getProductSummary,
  updateSignInStatus,
  getNumberOfCartElements,
  getCountryFromIP,
};
