import { Algorithm, unmarshal } from './algorithm';
import { UnmarshalText, unpack } from './keybase';

/********** signature/public_key.go */

const PublicKeyPrefix = 'npub';


export function ndauPubkeyToBytes(ndauPubkey) {
  const lep = PublicKeyPrefix.length;
  const prefix = ndauPubkey.substring(0, lep);
  if (PublicKeyPrefix != prefix) {
    return [null, new Error(`public key must begin with ${PublicKeyPrefix}; got ${prefix}`)];
  }

  const base32EncodedPubkey = ndauPubkey.substring(lep);
  console.log('base32EncodedPubkey:', base32EncodedPubkey);

  // const base32DecodedPubkey = b32.Decode(base32EncodedPubkey);
  // console.log('base32DecodedPubkey:', base32DecodedPubkey);

  // var result = [];

  // for (var i = 0; i < base32DecodedPubkey.length; i += 2) {
  //   result.push(parseInt(base32DecodedPubkey.substring(i, i + 2), 16));
  // }
  // result = Uint8Array.from(result);
  // console.log('result:', result);

  // const byteArrayPubkey = Buffer.from(base32DecodedPubkey);
  // console.log('byteArrayPubkey:', byteArrayPubkey);

  const [key, err] = UnmarshalText(base32EncodedPubkey, Unmarshal);
  if (err && err.length > 0) {
    console.log(err);
    if (key.key.length != Algorithm[key.algorithm].PublicKeySize) {
      return [
        null,
        new Error(
          `Wrong size public key: expect len ${Algorithm[key.algorithm].PublicKeySize}, have ${key.key.length}"`
        ),
      ];
    }
  }

  return [key, null];
}

export function ndauPubkeyToHex(ndauPubkey) {
  const [key, err] = ndauPubkeyToBytes(ndauPubkey);
  if (err && err.length > 0) {
    return [null, err];
  }

  const hexKey = Buffer.from(key.key).toString('hex');

  console.log(typeof key.key, hexKey);

  return hexKey;
}

// Unmarshal unmarshals the serialized binary data into the supplied key instance
export function Unmarshal(serialized) {
  console.log('serialized:', serialized);
  const [al, data, err] = unmarshal(serialized);
  if (err != null) {
    console.log('errr:', err);
    return [null, err];
  }
  console.log('algorithm:', al);
  console.log('data:', typeof data, data);

  const [key, ok] = unpack(data);
  console.log(key);
  console.log('key.key:', typeof key, key.key);
  key.algorithm = al;

  return [key, ok];
}
