const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const ed = require('@noble/ed25519');
const { pg } = require('../pg');
const checkIsBodyIncomplete = require('../utils/checkIsBodyIncomplete');
import { Generate, KindUser } from '../utils/js-ndau';
import { ndauSignatureToBytes } from '../utils/signature';
import { ndauPubkeyToBytes, ndauPubkeyToHex } from '../utils/public_key';
console.log('testing generate....');
//const [pk, _] = ndauPubkeyToBytes('npuba4jaftckeebccsnesydawnbjfp4kq35zdqvte2wpap5kzv8kes9sahv2cigyf2sg9yac4aaaaaa5f9y8n76iwbzc4w6r2u5kf8rznqr38s3e8gjzgibanq28vwbrir3fc3mh25r2');

const [pk, _] = ndauPubkeyToBytes('npuba8jadtbbebkhxhaegq2pywt8k5v5wfwv8v6q5rkz95gk43ea7sfg4zn2wepzjczzfaxhmgpx');
// console.log(_);


const testPayload =
  'eyJ2b3RlIjoieWVzIiwicHJvcG9zYWwiOnsicHJvcG9zYWxfaWQiOjEyLCJwcm9wb3NhbF9oZWFkaW5nIjoidGVzdGVyMSIsInZvdGluZ19vcHRpb25faWQiOjI2fSwicHVia2V5IjoibnB1YmE4amFkdGJiZWJraHhoYWVncTJweXd0OGs1djV3Znd2OHY2cTVya3o5NWdrNDNlYTdzZmc0em4yd2VwempjenpmYXhobWdweCJ9';
const testPubkey = 'npuba8jadtbbebkhxhaegq2pywt8k5v5wfwv8v6q5rkz95gk43ea7sfg4zn2wepzjczzfaxhmgpx';
const testSign =
  'a4jadtcavk64pvs7uc6aawtikevu7jzzvhtu6vfjqt2tsq7vbci2myzm3wrntb8cz3v6gv4ag3khazhhibqqh3t4kk7wueyxkesr6xeuaper8ce686ny7hqv';

// const testPub = ndauPubkeyToHex(testPubkey);
// console.log('tesetPub', testPub);

// const hexPayload = testPayload
//   .split('')
//   .map((d) => d.charCodeAt(0).toString(16))
//   .join('');
// console.log('hexPayload:', hexPayload);

// const [sign, al] = ndauSignatureToBytes(testSign);


console.log(
  Generate(
    'a',
    pk.key
  )
);

// (async function () {
//   console.log(
//     'sign.data...........',
//     sign.data
//   );
//   const isValid = await ed.verify(sign.data, hexPayload, ndauPubkeyToBytes(testPubkey));
//   console.log(isValid);
// })();


// console.log('Parse pubkey....');
// ndauPubkeyToHex(
//   'npuba8jadtbbebkhxhaegq2pywt8k5v5wfwv8v6q5rkz95gk43ea7sfg4zn2wepzjczzfaxhmgpx',
// );

//'npuba4jaftckeebccsnesydawnbjfp4kq35zdqvte2wpap5kzv8kes9sahv2cigyf2sg9yac4aaaaaa5f9y8n76iwbzc4w6r2u5kf8rznqr38s3e8gjzgibanq28vwbrir3fc3mh25r2'
// exports.createVotesTableIfNotExists = async () => {
//   const createVotesTableQuery = pg`
//     CREATE TABLE IF NOT EXISTS votes (
//           vote_id SERIAL PRIMARY KEY,
//           voting_option_id integer references voting_options(voting_option_id),
//           user_address TEXT
//       )`;

//   const voteTable = await createVotesTableQuery;
//   return voteTable;
// };

const getProposalDetailsForVotingOption = async (_votingOptionId) => {
  const getProposalIdForVotingOptionQuery = pg`
  SELECT
    proposal_id,heading,voting_options.summary
  FROM
    proposals
  INNER JOIN
    voting_options USING(proposal_id)
  WHERE
    voting_option_id = ${_votingOptionId}
  `;

  const proposalId = await getProposalIdForVotingOptionQuery;
  return proposalId;
};

const getIsVotingOpenForProposal = async (_proposalId) => {
  const isVotingOpenQuery = pg`
  SELECT
  now() < closing_date is_voting_open
  FROM
    proposals
  WHERE
    proposal_id = ${_proposalId}
  `;

  const isVotingOpen = await isVotingOpenQuery;
  return isVotingOpen;
};

const getUserVotesForThisProposal = async (userAddress, votingOptionId) => {
  const userVotesForThisProposalQuery = pg`
  SELECT
    voting_option_id, t.proposal_id, voting_option_proposal_id
  FROM
  (
    SELECT
    proposal_id voting_option_proposal_id,
    proposal_id
  FROM
    voting_options
  INNER JOIN proposals USING(proposal_id)
  WHERE
    voting_option_id = ${votingOptionId}
  LIMIT 1
  ) t
  INNER JOIN voting_options USING(proposal_id)
  INNER JOIN votes USING(voting_option_id)
  WHERE
    user_address = ${userAddress} AND t.proposal_id = voting_option_proposal_id
  `;

  const userVotesForThisProposal = await userVotesForThisProposalQuery;
  return userVotesForThisProposal;
};

exports.getVoteObjectForConfirmation = async ({ votingOptionId, userAddress }) => {
  try {
    const isAnyValUndefined = checkIsBodyIncomplete({
      votingOptionId,
      userAddress,
    });

    if (isAnyValUndefined) {
      return {
        status: false,
        message: 'All Inputs are Required..!',
      };
    } else {
      let proposalIdArr = await getProposalDetailsForVotingOption(votingOptionId);

      const proposalId = proposalIdArr[0].proposal_id;

      const voteObjectForConfirmation = {
        proposal_heading: proposalIdArr[0].heading,
        proposal_id: proposalId,
        voting_option_id: votingOptionId,
        voting_option_heading: proposalIdArr[0].summary,
      };

      const isVotingOpenQueryResult = await getIsVotingOpenForProposal(proposalId);

      const isValidProposal = isVotingOpenQueryResult.length > 0;

      if (isValidProposal) {
        const isVotingOpen = isVotingOpenQueryResult[0].is_voting_open;

        if (isVotingOpen) {
          const userVotesForThisProposal = await getUserVotesForThisProposal(userAddress, votingOptionId);
          const hasUserAlreadyVotedForThisProposal = Boolean(userVotesForThisProposal.length);

          if (hasUserAlreadyVotedForThisProposal) {
            return {
              status: false,
              hasUserAlreadyVotedForThisProposal,
            };
          } else {
            return voteObjectForConfirmation;
          }
        } else {
          return {
            status: false,
            isVotingOpen,
          };
        }
      } else {
        return {
          status: false,
          isValidProposal,
        };
      }
    }
  } catch (e) {
    console.log(e, 'error');
    return {
      status: false,
      message: 'Server Error',
    };
  }
};

exports.hasUserVoted = async (req, res, next) => {};

exports.addVote = async (req, res, next) => {
  const { payload, signature } = req.body;

  // const buff = Buffer.from(payload, 'base64');
  const vote = JSON.parse(buff.toString('utf-8'));
  const pubkey = vote.pubkey;

  console.log('vote, pubkey, signature', vote, pubkey, signature);
  console.log('legn........', pubkey.length);
  const pubkeyHex = pubkey.substring(4);
  console.log('pubkeyHex........', pubkey.pubkeyHex);
  const pubkeyBytes = Uint8Array.from(pubkeyHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  console.log('pubkeyBytes........', pubkeyBytes);
  const signatureBytes = Uint8Array.from(signature);

  console.log('signatureBytes........', signatureBytes);
  try {
    //const sha256 = crypto.createHash('sha256');
    // const msg = sha256.update(payload).digest();
    // generate privKey
    // let privKey = crypto.randomBytes(32);
    // do {
    //   privKey = crypto.randomBytes(32);
    // } while (!secp256k1.privateKeyVerify(privKey));

    // // get the public key in a compressed format
    // const pubKey = secp256k1.publicKeyCreate(privKey);

    // // sign the message
    // const sigObj = secp256k1.ecdsaSign(msg, privKey);

    // // verify the signature
    // console.log(secp256k1.ecdsaVerify(sigObj.signature, msg, pubKey));
    // // => true

    const privateKey = ed.utils.randomPrivateKey();
    console.log('priv:', typeof privateKey, privateKey);
    const msg = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
    const publicKey = await ed.getPublicKey(privateKey);
    console.log('publicKey:', typeof publicKey, publicKey);
    const signature = await ed.sign(buff, privateKey);
    console.log('signature:', typeof signature, signature);
    const isValid = await ed.verify(signature, buff, pubkey);

    console.log(isValid);
  } catch (e) {
    console.log('error', e);
  }
};

// exports.createVote = async (votingOptionId, userAddress) => {
//   const voteObject = {
//     voting_option_id: votingOptionId,
//     user_address: userAddress,
//   };

//   console.log(voteObject, "voteObject");

//   try {
//     const createVoteQuery = pg`
//       INSERT INTO
//         votes ${pg(voteObject)}
//       returning *
// `;

//     const createdVote = await createVoteQuery;
//     console.log(createdVote, "createdVote");

//     return {
//       status: true,
//       message: "Vote Created",
//     };
//   } catch (e) {
//     console.log(e, "error creating vote");
//     return {
//       status: false,
//     };
//   }
// };
