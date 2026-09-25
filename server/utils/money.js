const toPaise = (rupees) => Math.round(Number(rupees) * 100);
const toRupees = (paise) => Number((Number(paise || 0) / 100).toFixed(2));
module.exports = { toPaise, toRupees };
