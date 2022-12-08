import { UnmarshalMsg } from './address';

/********** signature/algorithm.go */

export const Algorithm = {
  AlgorithmID: [null, 'Ed25519', 'Secp256k1'],
  Ed25519: {
    PublicKeySize: 32,
    PrivateKeySize: 64,
    SignatureSize: 64,
    // SeedSize = 32
  },
  Secp256k1: {
    PublicKeySize: 33, // PubKeyBytesLenCompressed
    SignatureSize: -1,
    // SignatureSize: we'd estimate 70, but
    // strictly speaking, this is only occasionally true: the actual signature
    // size depends on the encoded size of arbitrarily-sized bigints, plus
    // some structure. The min size for single byte encodings is 8, and the
    // constant is 6; picking 70 means that the bigints can be up to 32
    // bytes each, which seems plausible.
    //
    // Instead, we return a negative value to indicate that size shouldn't
    // be checked in RawSignature

    // PubKeyBytesLenUncompressed: 65
    // PubKeyBytesLenHybrid      : 65
  },
};

// Unmarshal the serialized binary data into an Algorithm instance and
// the originally supplied data.
export function unmarshal(serialized) {
  const [al, data, leftovers, err] = UnmarshalMsg(serialized);

  console.log('data......', typeof data, Array.from(data));
  if (err != null) {
    return [null, null, err];
  }
  console.log('leftovers......', typeof leftovers, Array.from(leftovers));
  if (leftovers.length > 0) {
    return null, null, new Error('Leftovers present after deserialization');
  }
  return [al, data, null];
  // return cloneAl(idMap[container.Algorithm]), container.Data, nil;
}
