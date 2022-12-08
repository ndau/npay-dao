import { Buffer } from 'node:buffer';
const crypto = require('node:crypto');
import { sha256, sha224 } from 'js-sha256';
const b32 = require('./b32');
import { Algorithm } from './algorithm';
import { UnmarshalText } from './keybase';
/*

func Generate(kind byte, data []byte) (Address, error) {
	if !IsValidKind(kind) {
		return emptyA(), newError(fmt.Sprintf("invalid kind: %x", kind))
	}
	if len(data) < MinDataLength {
		return emptyA(), newError("insufficient quantity of data")
	}
	// the hash contains the last HashTrim bytes of the sha256 of the data
	h := sha256.Sum256(data)
	h1 := h[len(h)-HashTrim:]

	// an ndau address always starts with nd and a "kind" character
	// so we figure out what characters we want and build that into a header
	prefix :=
		b32.Index(addrPrefix[0:1])<<11 +
			b32.Index(addrPrefix[1:2])<<6 +
			b32.Index(string(kind))<<1
	hdr := []byte{byte((prefix >> 8) & 0xFF), byte(prefix & 0xFF)}
	h2 := append(hdr, h1...)
	// then we checksum that result and append the checksum
	h2 = append(h2, b32.Checksum16(h2)...)

	r := b32.Encode(h2)
	return Address{addr: r}, nil
}

*/

// All addresses start with this 2-byte prefix, followed by a kind byte.
const addrPrefix = 'nd';
const kindOffset = addrPrefix.length;

// predefined address kinds
export const KindUser = 'a';
export const KindNdau = 'n';
export const KindEndowment = 'e';
export const KindExchange = 'x';
export const KindBPC = 'b';
export const KindMarketMaker = 'm';

// IsValidKind returns true if the last letter of a is one of the currently-valid kinds
function IsValidKind(k) {
  switch (k) {
    case KindUser:
    case KindNdau:
    case KindEndowment:
    case KindExchange:
    case KindBPC:
    case KindMarketMaker:
      return true;
  }
  return false;
}

// HashTrim is the number of bytes that we trim the input hash to.
//
// We don't want any dead characters, so since we trim the generated
// SHA hash anyway, we trim it to a length that plays well with the above,
// meaning that we want it to pad the result out to a multiple of 5 bytes
// so that a byte32 encoding has no filler).
//
// Note that ETH does something similar, and uses a 20-byte subset of a 32-byte hash.
// The possibility of collision is low: As of June 2018, the BTC hashpower is 42
// exahashes per second. If that much hashpower is applied to this problem, the
// likelihood of generating a collision in one year is about 1 in 10^19.
const HashTrim = 26;

// AddrLength is the length of the generated address, in characters
const AddrLength = 48;

// MinDataLength is the minimum acceptable length for the data to be used
// as input to generate. This will prevent simple errors like trying to
// create an address from an empty key.
const MinDataLength = 12;

// Generate creates an address of a given kind from an array of bytes (which
// would normally be a public key). It is an error if len(data) < MinDataLength
// or if kind is not a valid kind.
// Since length changes are explicitly disallowed, we can use a relatively simple
// crc model to have a short (16-bit) checksum and still be quite safe against
// transposition and typos.
export function Generate(kind, data) {
  if (!IsValidKind(kind)) {
    return [null, new Error(`invalid kind: ${kind}`)];
  }

  if (data.length < MinDataLength) {
    return [null, new Error('insufficient quantity of data')];
  }

  // the hash contains the last HashTrim bytes of the sha256 of the data
  const hash = crypto.createHash('sha256').update(Buffer.from(data)).digest('hex');
  let h = '';
  for (let c = 0; c < hash.length; c += 2) h += String.fromCharCode(parseInt(hash.substring(c, c + 2), 16));

  console.log('h......', typeof h, Array.from(h));

  const h1 = h.substring(h.length - HashTrim); // h1 := h[len(h)-HashTrim:]
  console.log('data:.........', data);
  console.log('h.....', h);
  console.log('h1.....', h1);

  // an ndau address always starts with nd and a "kind" character
  // so we figure out what characters we want and build that into a header
  let p0 = b32.Index(addrPrefix[0]);
  let p1 = b32.Index(addrPrefix[1]);
  let k = b32.Index(kind);

  console.log('p0,p1,k:', p0, p1, k);
  const prefix = (p0 << 11) + (p1 << 6) + (k << 1);
  console.log('prefix.....', prefix);

  const hdr = String.fromCharCode((prefix >> 8) & 0xff) + String.fromCharCode(prefix & 0xff);
  console.log('hdr.....', Array.from(hdr));
  const h2 = hdr + h1;
  console.log('h2.....', Array.from(h2));
  // then we checksum that result and append the checksum
  const h3 = h2 + b32.Checksum16(h2);
  console.log('h3.....', Array.from(h3));
  const r = b32.Encode(h3);
  return [{ addr: r }, null];
}


