function generateChallanNo() {
  const random = Math.floor(1000 + Math.random() * 9000);
  const time = Date.now().toString().slice(-4);
  return `CH-${time}${random}`;
}
export default generateChallanNo;