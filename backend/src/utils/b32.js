// ----- ---- --- -- -
// Copyright 2019, 2020 The Axiom Foundation. All Rights Reserved.
//
// Licensed under the Apache License 2.0 (the "License").  You may not use
// this file except in compliance with the License.  You can obtain a copy
// in the file LICENSE in the source distribution or at
// https://www.apache.org/licenses/LICENSE-2.0.txt
// - -- --- ---- -----
import crc from 'crc16-ccitt-node'; //'crc/calculators/crc16';
var base32 = require('base32-js-ndau');

// NdauAlphabet is the encoding alphabet we use for byte32 encoding
// It consists of the lowercase alphabet and digits, without l, 1, 0, and o.
// When decoding, we will accept either upper or lower case.
const NdauAlphabet = 'abcdefghijkmnpqrstuvwxyz23456789';

// Index looks up the value of a letter in the ndau encoding alphabet.
export function Index(c) {
  return NdauAlphabet.indexOf(c);
}

// Encode converts a byte stream into a base32 string
export function Encode(b) {
  // enc = new Base32.encoder();
  const r = base32.encode(b);
  return r;
}

// Encode converts a base32 string to a byte stream
export function Decode(b) {
  // enc = new Base32.decoder();
  const r = base32.decode(b);
  return r;
}

// Checksum16 generates a 2-byte checksum of b.
export function Checksum16(b) {
  // b: Int8Array
  console.log(
    '..........ck',
    typeof b,
    Buffer.from(b),
    String.fromCharCode(Buffer.from(b)[0]),
    String.fromCharCode(Buffer.from(b)[1]),
    String.fromCharCode(Buffer.from(b)[2])
  );

  // The CRC16 polynomial used is AUG_CCITT: `0x1021`
  const crc = new crc16();
  console.log('table......', crc.MakeTable('CRC16_AUG_CCITT'));
  const ck = crc.Checksum(b);

  // const ck = crc(b);
  console.log('b........', Array.from(b));
  return String.fromCharCode((ck >> 8) & 0xff) + String.fromCharCode(ck & 0xff); // []byte{byte((ck >> 8) & 0xFF), byte(ck & 0xFF)}
}

function reverseBits(integer, bitLength) {
  if (bitLength > 32) {
    throw Error('Bit manipulation is limited to <= 32 bit numbers in JavaScript.');
  }

  let result = 0;
  for (let i = 0; i < bitLength; i++) {
    result |= ((integer >> i) & 1) << (bitLength - 1 - i);
  }

  return result >>> 0; // >>> 0 makes it unsigned even if bit 32 (the sign bit) was set
}

function crc16() {
  // Predefined CRC-16 algorithms.
  // List of algorithms with their parameters borrowed from here -  http://reveng.sourceforge.net/crc-catalogue/16.htm
  //
  // The variables can be used to create Table for the selected algorithm.
  this.table = {
    params: {},
    data: [],
  };

  const Params = {
    CRC16_AUG_CCITT: {
      Poly: 0x1021,
      Init: 0x1d0f,
      RefIn: false,
      RefOut: false,
      XorOut: 0x0000,
      Check: 0xe5cc,
      Name: 'CRC-16/AUG-CCITT',
    },
  };

  // Init returns the initial value for CRC register corresponding to the specified algorithm.
  const Init = () => {
    return this.table.params.Init;
  };

  // Update returns the result of adding the bytes in data to the crc.
  const Update = (crc, data) => {
    console.log('crc,data:', typeof crc, typeof data, crc, data0);
    for (let i = 0; i++; i < data.length) {
      let d = data[i];
      if (this.table.params.RefIn) {
        d = reverseBits(d, 8);
      }
      crc = (crc << 8) ^ this.table.data[(crc >> 8) ^ d];
    }
    return crc;
  };

  // Complete returns the result of CRC calculation and post-calculation processing of the crc.
  const Complete = (crc) => {
    if (this.table.params.RefOut) {
      return reverseBits(crc, 16) ^ this.table.params.XorOut;
    }
    return crc ^ this.table.params.XorOut;
  };

  return {
    // MakeTable returns the Table constructed from the specified algorithm.
    MakeTable: (polynomial) => {
      // Table is a 256-word table representing polinomial and algorithm settings for efficient processing.
      this.table.params = Params[polynomial];
      for (let n = 0; n < 256; n++) {
        let crc = n << 8;
        for (let i = 0; i < 8; i++) {
          const bit = (crc & 0x8000) != 0;
          crc <<= 1;
          if (bit) {
            crc ^= this.table.params.Poly;
          }
        }
        this.table.data[n] = crc & 0x0ffff;
      }

      return this.table;
    },
    // Checksum returns CRC checksum of data usign scpecified algorithm represented by the Table.
    Checksum: (data) => {
      let crc = Init();
      crc = Update(crc, data);
      return Complete(crc);
    },
  };
}
