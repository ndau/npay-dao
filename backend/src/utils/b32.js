// ----- ---- --- -- -
// Copyright 2019, 2020 The Axiom Foundation. All Rights Reserved.
//
// Licensed under the Apache License 2.0 (the "License").  You may not use
// this file except in compliance with the License.  You can obtain a copy
// in the file LICENSE in the source distribution or at
// https://www.apache.org/licenses/LICENSE-2.0.txt
// - -- --- ---- -----
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
  // The CRC16 polynomial used is AUG_CCITT: `0x1021`
  // [0 4129 8258 12387 16516 20645 24774 28903 33032 37161 41290 45419 49548 53677 57806 61935 4657 528 12915 8786 21173 17044 29431 25302 37689 33560 45947 41818 54205 50076 62463 58334 9314 13379 1056 5121 25830 29895 17572 21637 42346 46411 34088 38153 58862 62927 50604 54669 13907 9842 5649 1584 30423 26358 22165 18100 46939 42874 38681 34616 63455 59390 55197 51132 18628 22757 26758 30887 2112 6241 10242 14371 51660 55789 59790 63919 35144 39273 43274 47403 23285 19156 31415 27286 6769 2640 14899 10770 56317 52188 64447 60318 39801 35672 47931 43802 27814 31879 19684 23749 11298 15363 3168 7233 60846 64911 52716 56781 44330 48395 36200 40265 32407 28342 24277 20212 15891 11826 7761 3696 65439 61374 57309 53244 48923 44858 40793 36728 37256 33193 45514 41451 53516 49453 61774 57711 4224 161 12482 8419 20484 16421 28742 24679 33721 37784 41979 46042 49981 54044 58239 62302 689 4752 8947 13010 16949 21012 25207 29270 46570 42443 38312 34185 62830 58703 54572 50445 13538 9411 5280 1153 29798 25671 21540 17413 42971 47098 34713 38840 59231 63358 50973 55100 9939 14066 1681 5808 26199 30326 17941 22068 55628 51565 63758 59695 39368 35305 47498 43435 22596 18533 30726 26663 6336 2273 14466 10403 52093 56156 60223 64286 35833 39896 43963 48026 19061 23124 27191 31254 2801 6864 10931 14994 64814 60687 56684 52557 48554 44427 40424 36297 31782 27655 23652 19525 15522 11395 7392 3265 61215 65342 53085 57212 44955 49082 36825 40952 28183 32310 20053 24180 11923 16050 3793 7920]}

  const crc = new crc16();
  const ck = crc.Checksum(b);

  return new Uint8Array([(ck >> 8) & 0xff, ck & 0xff]);
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
  const table = {
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
    // CRC16_ARC         = Params{0x8005, 0x0000, true, true, 0x0000, 0xBB3D, "CRC-16/ARC"}
    // CRC16_AUG_CCITT   = Params{0x1021, 0x1D0F, false, false, 0x0000, 0xE5CC, "CRC-16/AUG-CCITT"}
    // CRC16_BUYPASS     = Params{0x8005, 0x0000, false, false, 0x0000, 0xFEE8, "CRC-16/BUYPASS"}
    // CRC16_CCITT_FALSE = Params{0x1021, 0xFFFF, false, false, 0x0000, 0x29B1, "CRC-16/CCITT-FALSE"}
    // CRC16_CDMA2000    = Params{0xC867, 0xFFFF, false, false, 0x0000, 0x4C06, "CRC-16/CDMA2000"}
    // CRC16_DDS_110     = Params{0x8005, 0x800D, false, false, 0x0000, 0x9ECF, "CRC-16/DDS-110"}
    // CRC16_DECT_R      = Params{0x0589, 0x0000, false, false, 0x0001, 0x007E, "CRC-16/DECT-R"}
    // CRC16_DECT_X      = Params{0x0589, 0x0000, false, false, 0x0000, 0x007F, "CRC-16/DECT-X"}
    // CRC16_DNP         = Params{0x3D65, 0x0000, true, true, 0xFFFF, 0xEA82, "CRC-16/DNP"}
    // CRC16_EN_13757    = Params{0x3D65, 0x0000, false, false, 0xFFFF, 0xC2B7, "CRC-16/EN-13757"}
    // CRC16_GENIBUS     = Params{0x1021, 0xFFFF, false, false, 0xFFFF, 0xD64E, "CRC-16/GENIBUS"}
    // CRC16_MAXIM       = Params{0x8005, 0x0000, true, true, 0xFFFF, 0x44C2, "CRC-16/MAXIM"}
    // CRC16_MCRF4XX     = Params{0x1021, 0xFFFF, true, true, 0x0000, 0x6F91, "CRC-16/MCRF4XX"}
    // CRC16_RIELLO      = Params{0x1021, 0xB2AA, true, true, 0x0000, 0x63D0, "CRC-16/RIELLO"}
    // CRC16_T10_DIF     = Params{0x8BB7, 0x0000, false, false, 0x0000, 0xD0DB, "CRC-16/T10-DIF"}
    // CRC16_TELEDISK    = Params{0xA097, 0x0000, false, false, 0x0000, 0x0FB3, "CRC-16/TELEDISK"}
    // CRC16_TMS37157    = Params{0x1021, 0x89EC, true, true, 0x0000, 0x26B1, "CRC-16/TMS37157"}
    // CRC16_USB         = Params{0x8005, 0xFFFF, true, true, 0xFFFF, 0xB4C8, "CRC-16/USB"}
    // CRC16_CRC_A       = Params{0x1021, 0xC6C6, true, true, 0x0000, 0xBF05, "CRC-16/CRC-A"}
    // CRC16_KERMIT      = Params{0x1021, 0x0000, true, true, 0x0000, 0x2189, "CRC-16/KERMIT"}
    // CRC16_MODBUS      = Params{0x8005, 0xFFFF, true, true, 0x0000, 0x4B37, "CRC-16/MODBUS"}
    // CRC16_X_25        = Params{0x1021, 0xFFFF, true, true, 0xFFFF, 0x906E, "CRC-16/X-25"}
    // CRC16_XMODEM      = Params{0x1021, 0x0000, false, false, 0x0000, 0x31C3, "CRC-16/XMODEM"}
  };

  // Init returns the initial value for CRC register corresponding to the specified algorithm.
  const Init = () => {
    return table.params.Init;
  };

  // Update returns the result of adding the bytes in data to the crc.
  const Update = (c, data) => {
    let crc = c;
    for (let i = 0; i < data.length; i++) {
      let d = data[i];
      if (table.params.RefIn) {
        d = reverseBits(d, 8);
      }
      crc = ((crc & 0xffff) << 8) ^ table.data[((crc & 0xffff) >> 8) ^ d];
    }
    return crc;
  };

  // Complete returns the result of CRC calculation and post-calculation processing of the crc.
  const Complete = (crc) => {
    if (table.params.RefOut) {
      return reverseBits(crc, 16) ^ table.params.XorOut;
    }
    return crc ^ table.params.XorOut;
  };

  return {
    // MakeTable returns the Table constructed from the specified algorithm.
    MakeTable: (polynomial) => {
      // Table is a 256-word table representing polinomial and algorithm settings for efficient processing.
      table.params = Params[polynomial];
      for (let n = 0; n < 256; n++) {
        let crc = n << 8;
        for (let i = 0; i < 8; i++) {
          const bit = (crc & 0x8000) != 0;
          crc <<= 1;
          if (bit) {
            crc ^= table.params.Poly;
          }
        }
        table.data[n] = crc & 0xffff;
      }

      return table;
    },
    // Checksum returns CRC checksum of data usign scpecified algorithm represented by the Table.
    Checksum: (data) => {
      let crc = Init();
      crc = Update(crc, data);
      return Complete(crc);
    },
  };
}
