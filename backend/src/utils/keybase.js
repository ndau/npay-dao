import { CheckChecksum } from './checksum';

/********** signature/keybase.go */
const b32 = require('./b32');

export function unpack(data) {
  const key = {};
  if (data.length == 0) {
    return [null, new Error('empty data')];
  }
  const lk = data[0];
  const split = 1 + lk;
  if (data.length < split) {
    return [null, new Error("can't unpack: too few bytes")];
  }

  key.key = data.slice(1, split);
  let copied = key.key.length;
  if (copied != lk) {
    return [null, new Error('unpack: failed to copy full key data')];
  }

  const le = data.length - split;
  if (le < 0) {
    return [null, new Error('programming error in unpack')];
  }

  key.extra = data.slice(split); 
  copied = key.extra.length;
  if (copied != le) {
    return [null, new Error('unpack: failed to copy full extra data')];
  }

  return [key, null];
}


// UnmarshalText implements encoding.TextUnmarshaler
export function UnmarshalText(text, Unmarshal) {
  const bytes = b32.Decode(text);
  const [validBytes, checksumOk] = CheckChecksum(bytes);
  if (!checksumOk) {
    return new Error('key unmarshal failure: bad checksum');
  }
  console.log('checksum is good')
  return Unmarshal(validBytes);
}
