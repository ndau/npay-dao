import { Algorithm, unmarshal } from './algorithm';
import { UnmarshalText } from './keybase';

export function ndauSignatureToBytes(ndauSignature) {
  const [signature, err] = UnmarshalText(ndauSignature, Unmarshal);
  if (err && err.length > 0) {
    console.log(err);
    return [null, err];
  }
  return [signature, null];
}

// Unmarshal unmarshals the serialized binary data into the supplied signature instance
export function Unmarshal(serialized) {
  const signature = {};
  const [al, data, err] = unmarshal(serialized);
  const ss = Algorithm[al].SignatureSize;
  if (err === null && ss >= 0 && data.length != ss) {
    return [null, new Error(`Wrong size signature: expect len ${ss}, have ${data.length}"`)];
  }

  if (err != null) {
    return [null, err];
  }

  console.log('singature algorithm:', al);

  signature.algorithm = al;
  signature.data = data;

  return [signature, null];
}
