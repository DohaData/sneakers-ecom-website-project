function getProductSummary(products) {
  const minPrice = Math.min(...products.map((product) => product.price));
  const maxPrice = Math.max(...products.map((product) => product.price));
  const brands = [...new Set(products.map((product) => product.brand))];
  return { minPrice, maxPrice, brands };
}
module.exports = {getProductSummary};
