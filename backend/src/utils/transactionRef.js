function generateSecureRef() {
  return 'TXN-' + crypto.randomUUID();
}
export default generateSecureRef;