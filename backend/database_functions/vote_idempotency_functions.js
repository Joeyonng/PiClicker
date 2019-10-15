let idempotencyByte = 0;

module.exports.incrementIdempotencyByte = () => {
  if (idempotencyByte < 255) {
    idempotencyByte++;
  } else {
    idempotencyByte = 0;
  }
};

module.exports.getIdempotencyByte = () => {
  return idempotencyByte;
};
