const PI = Math.PI;
// exports.area = (r) => PI * r * r;
// exports.area = function(r) {
//   return PI * r * r;
// };
var area = function(r) {
  return PI * r * r;
};
exports.area = area;
exports.circumference = (r) => 2 * PI * r;
