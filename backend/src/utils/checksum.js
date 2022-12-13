/********** signature/checksum.go */
const crypto = require('node:crypto');

// The size of a SHA256 checksum in bytes.
const Size = 32;

// The size of a SHA224 checksum in bytes.
const Size224 = 28;
// ChecksumPadWidth is the moduland of which the length of a checksummed
// byte slice will always equal 0.
//
// In other words, we choose a checksum width such that
// `len(summedMsg) % ChecksumPadWidth == 0`.
//
// We choose 5 because we expect to encode this data in a base32 encoding,
// which needs no padding when the input size is a multiple of 5.
const ChecksumPadWidth = 5;
// ChecksumMinBytes is the minimum number of checksum bytes. The chance
// that a checksum will accidentally pass is roughly `1 / (256 ^ ChecksumMinBytes)`,
// so the value of 3 used gives a false positive rate of about 1 / 16 million.
const ChecksumMinBytes = 3;

// CheckChecksum validates the checksum of a summed byte slice.
//
// It returns the wrapped message stripped of checksum data and
// a boolean that indicates if the checksum was correct; if the
// boolean is false, the message is not valid.
export function CheckChecksum(checked) {
  if (checked.length < 1 + ChecksumMinBytes) {
    return [null, false];
  }
  const n = checked[0];
  const last = checked.length - n;
  if (last < 1) {
    return [null, false];
  }

  const message = checked.slice(1, last);
  const sumActual = checked.slice(last);

  const sumExpect = cksumN(message, n);
  const checksumOk = Buffer.compare(sumActual, sumExpect)
  console.log('checksumOk......', checksumOk);
  return [message, checksumOk === 0];
}

// return the trailing n bytes of the sha224 checksum of the input bytes
// given that sha-224 is already a simple truncation of sha-256, this means
// that the returned bytes are from the middle of a sha-256 checksum
export function cksumN(input, n) {
  const sum = crypto.createHash('sha224').update(input).digest();
  return new Uint8Array(sum).slice(Size224 - n);
}