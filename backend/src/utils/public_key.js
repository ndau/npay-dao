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
  const [al, data, err] = unmarshal(serialized);
  if (err != null) {
    return [null, err];
  }
  console.log('algorithm:', al);
  console.log('public key data:', typeof data, data);

  const [key, ok] = unpack(data);
  key.algorithm = al;

  return [key, ok];
}
