import { Algorithm } from './algorithm';
import { Buffer } from 'node:buffer';

const crypto = require('node:crypto');
const b32 = require('./b32');

/********** signature/address.go */

// predefined address kinds
export const KindUser = 'a';
export const KindNdau = 'n';
export const KindEndowment = 'e';
export const KindExchange = 'x';
export const KindBPC = 'b';
export const KindMarketMaker = 'm';

const ErrShortBytes = 'too few bytes';

const mfixint = 0x00; // 0XXXXXXX
const mnfixint = 0xe0; // 111XXXXX
const mfixmap = 0x80; // 1000XXXX
const mfixarray = 0x90; // 1001XXXX
const mfixstr = 0xa0; //// 101XXXXX
const mnil = 0xc0;
const mfalse = 0xc2;
const mtrue = 0xc3;
const mbin8 = 0xc4;
const mbin16 = 0xc5;
const mbin32 = 0xc6;
const mext8 = 0xc7;
const mext16 = 0xc8;
const mext32 = 0xc9;
const mfloat32 = 0xca;
const mfloat64 = 0xcb;
const muint8 = 0xcc;
const muint16 = 0xcd;
const muint32 = 0xce;
const muint64 = 0xcf;
const mint8 = 0xd0;
const mint16 = 0xd1;
const mint32 = 0xd2;
const mint64 = 0xd3;
const mfixext1 = 0xd4;
const mfixext2 = 0xd5;
const mfixext4 = 0xd6;
const mfixext8 = 0xd7;
const mfixext16 = 0xd8;
const mstr8 = 0xd9;
const mstr16 = 0xda;
const mstr32 = 0xdb;
const marray16 = 0xdc;
const marray32 = 0xdd;
const mmap16 = 0xde;
const mmap32 = 0xdf;

// All addresses start with this 2-byte prefix, followed by a kind byte.
const addrPrefix = 'nd';
const kindOffset = addrPrefix.length;

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
  const h = crypto.createHash('sha256').update(data).digest();
  const h1 = new Uint8Array(h).slice(h.byteLength - HashTrim);

  // an ndau address always starts with nd and a "kind" character
  // so we figure out what characters we want and build that into a header
  let p0 = b32.Index(addrPrefix[0]);
  let p1 = b32.Index(addrPrefix[1]);
  let k = b32.Index(kind);

  const prefix = (p0 << 11) + (p1 << 6) + (k << 1);

  const hdr = new Uint8Array([(prefix >> 8) & 0xff,prefix & 0xff]);
  const h2 = new Uint8Array(Buffer.concat([hdr, h1]));

  // then we checksum that result and append the checksum
  let ck = b32.Checksum16(h2);
  const h3 = new Uint8Array(Buffer.concat([h2, ck]));

  const r = b32.Encode(h3);
  return [{ addr: r }, null];
}

// IsValidKind returns true if the last letter of a is one of the currently-valid kinds
export function IsValidKind(k) {
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

// UnmarshalMsg implements msgp.Unmarshaler
export function UnmarshalMsg(bts) {
  if (bts.length < 1) {
    return [null, new Error(ErrShortBytes)];
  }

  let zb0001;
  let lead = bts[0];
  if ((lead & 0xf0) === 0x90) {
    zb0001 = lead & 0x0f;
    bts = bts.slice(1);
  }
  
  if (zb0001 != 2) {
    return [null, null, null, new Error(`Wanted: 2, Got: ${zb0001}`)];
  }
  let zb0002;
  lead = bts[0];
  if (lead > Math.MaxUint8) {
    // Need to review again
    return [null, null, null, 'value too large for uint8'];
  }
  zb0002 = lead & 0xff;
  const algorithm = Algorithm.AlgorithmID[zb0002];
  bts = bts.slice(1);

  const [data, o, err] = ReadBytesBytes(bts);
  if (err != null) {
    return [null, null, null, new Error(`Data: ${err}`)];
  }

  return [algorithm, data, o, err];
}

export function ReadBytesBytes(b, zc = false) {
  const l = b.length;
  if (l < 1) {
    return [null, null, ErrShortBytes];
  }

  const lead = b[0];
  let read;
  let err = null;
  switch (lead) {
    case mbin8:
      if (l < 2) {
        err = ErrShortBytes;
        return [null, null, err];
      }

      read = b[1];
      b = b.slice(2);
      break;

    // case mbin16:
    // 	if (l < 3) {
    // 		err = ErrShortBytes
    // 		return [null, null, ErrShortBytes];
    // 	}
    // 	read = int(big.Uint16(b[1:]))
    // 	b = b[3:]

    // case mbin32:
    // 	if l < 5 {
    // 		err = ErrShortBytes
    // 		return
    // 	}
    // 	read = int(big.Uint32(b[1:]))
    // 	b = b[5:]

    default: // badPrefix(BinType, lead)
      err = 'bad prefix';
      return [null, null, err];
  }

  if (b.length < read) {
    err = ErrShortBytes;
    return [null, null, err];
  }

  const v = b.slice(0, read);
  const o = b.slice(read);
  return [v, o, null];
}
