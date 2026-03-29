function generateLicenceNumber(rtoId) {
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digit
  const year = new Date().getFullYear();

  return `DL-${rtoId}-${year}-${random}`;
}

export default generateLicenceNumber;