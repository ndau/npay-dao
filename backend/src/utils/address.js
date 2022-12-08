import { Algorithm } from './algorithm';

/********** signature/address.go */
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

// UnmarshalMsg implements msgp.Unmarshaler
export function UnmarshalMsg(bts) {
  console.log('UnmarshalMsg: ', bts);
  if (bts.length < 1) {
    return [null, new Error(ErrShortBytes)];
  }

  let zb0001;
  let lead = bts.charCodeAt(0);
  console.log('lead', lead);
  if ((lead & 0xf0) === 0x90) {
    zb0001 = lead & 0x0f;
    bts = bts.substring(1);
  }
  console.log('zb0001', zb0001);
  if (zb0001 != 2) {
    return [null, null, null, new Error(`Wanted: 2, Got: ${zb0001}`)];
  }
  console.log('bts......', Array.from(bts));
  let zb0002;
  lead = bts.charCodeAt(0);
  if (lead > Math.MaxUint8) {
    // Need to review again
    return [null, null, null, 'value too large for uint8'];
  }
  zb0002 = lead & 0xff;
  console.log('zb0002......', typeof zb0002, zb0002);
  const algorithm = Algorithm.AlgorithmID[zb0002];
  console.log('algorithm', algorithm);
  bts = bts.substring(1);

  const [data, o, err] = ReadBytesBytes(bts);
  if (err != null) {
    return [null, null, null, new Error(`Data: ${err}`)];
  }

  return [algorithm, data, o, err];
}

export function ReadBytesBytes(b, zc = false) {
  console.log('b......', typeof b, Array.from(b));
  const l = b.length;
  if (l < 1) {
    return [null, null, ErrShortBytes];
  }

  const lead = b.charCodeAt(0);
  console.log('lead', lead);
  let read;
  let err = null;
  switch (lead) {
    case mbin8:
      if (l < 2) {
        err = ErrShortBytes;
        return [null, null, err];
      }

      read = b.charCodeAt(1);
      console.log('read', read);
      b = b.substring(2);
      console.log('b......', typeof b, Array.from(b));
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

  const v = b.substring(0, read);
  const o = b.substring(read);
  return [v, o, null];
}
