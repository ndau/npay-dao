// const equals = require('uint8arrays/equals');

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
  console.log('n:', typeof n, n);
  const last = checked.length - n;
  console.log('last:', last);
  if (last < 1) {
    return [null, false];
  }

  console.log('checked:', typeof checked, checked);

  const message = checked.slice(1, last);
  console.log('message:', typeof message, message);

  const sumActual = checked.slice(last);
  console.log('sumActual:', typeof sumActual, sumActual);

  // const result = Uint8Array.from(sumActual);
  // console.log('sumActual bufffer......', result);

  // console.log('sumActual bufffer......', Buffer.from(sumActual));
  const sumExpect = cksumN(message, n);
  console.log('sumExpect......', Array.from(sumExpect));
  const checksumOk = Buffer.compare(sumActual, sumExpect)
  console.log('checksumOk......', checksumOk);
  return [message, checksumOk === 0];
}

// return the trailing n bytes of the sha224 checksum of the input bytes
// given that sha-224 is already a simple truncation of sha-256, this means
// that the returned bytes are from the middle of a sha-256 checksum
function cksumN(input, n) {
  //const sum = sha224(input);
  const sum = crypto.createHash('sha224').update(input).digest();
  // console.log('sum length:', sum.length, typeof sum);
  // let bytes = '';
  // for (let c = 0; c < sum.length; c += 2) bytes += String.fromCharCode(parseInt(sum.substring(c, c + 2), 16));

  console.log('sum str......', typeof sum, Array.from(sum));

  // sum = sha256.Sum224(input)
  // return sum[sha256.Size224-int(n):]
  return new Uint8Array(sum).slice(Size224 - n);
}