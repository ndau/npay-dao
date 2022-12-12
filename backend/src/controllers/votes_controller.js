import { ndauSignatureToBytes } from '../utils/signature';
import { ndauPubkeyToBytes, ndauPubkeyToHex } from '../utils/public_key';
import { Generate } from '../utils/address';
import repository from '../repository';
import { getAccount} from '../helpers/fetch';

const crypto = require('crypto');
const secp256k1 = require('@noble/secp256k1');
const ed = require('@noble/ed25519');

const { pg } = require('../pg');
const checkIsBodyIncomplete = require('../utils/checkIsBodyIncomplete');

// console.log('testing generate....');
// const testPayload =
//   'eyJ2b3RlIjoieWVzIiwicHJvcG9zYWwiOnsicHJvcG9zYWxfaWQiOjEyLCJwcm9wb3NhbF9oZWFkaW5nIjoidGVzdGVyMSIsInZvdGluZ19vcHRpb25faWQiOjI2fSwicHVia2V5IjoibnB1YmE4amFkdGJiZWJraHhoYWVncTJweXd0OGs1djV3Znd2OHY2cTVya3o5NWdrNDNlYTdzZmc0em4yd2VwempjenpmYXhobWdweCJ9';

// // ed25591
// // const testPubkey = 'npuba8jadtbbebkhxhaegq2pywt8k5v5wfwv8v6q5rkz95gk43ea7sfg4zn2wepzjczzfaxhmgpx';
// // const testSign = 'a4jadtcavk64pvs7uc6aawtikevu7jzzvhtu6vfjqt2tsq7vbci2myzm3wrntb8cz3v6gv4ag3khazhhibqqh3t4kk7wueyxkesr6xeuaper8ce686ny7hqv';
// // const [pk, _] = ndauPubkeyToBytes(testPubkey);

// // secp256k1
// const testPubkey =
//   'npuba4jaftckeebfpp3th3xixp2x3i6zq4zgekrugsp7zx7et7haeahky7vf36g25miaaaaaaaaaaaajtz94r9s6wdadvigzjwu28y45rf4xpm7sd583cmrrpb2uj9hb8vt6mmn2mtmz';
// const testSign =
//   'ayjaftcggbcaeid9rj2tfhxvykx7r9fzauqnjuknxx7b6eidr7bb52kuwymv62y6vwbcauxqg6sfxd3jydfzfven8k3n6mk7ne68rd7f5rmhdew28j5znsay362yif8w';
// const [pk, _] = ndauPubkeyToBytes(testPubkey);

// // wallet
// // const [pk, _] = ndauPubkeyToBytes('npuba4jaftckeeb4wuqt578x5duj8zp4s3e9w2ngx89shf9gmrhk78k453ibing573sg36a3iaaaaaaujp29k993teer7ygkk2x2x5akwghv2m23yikxxghgujezsck5muascnn6rn6e');

// const testPub = ndauPubkeyToHex(testPubkey);
// console.log('tesetPub', testPub);

// const hexPayload = Buffer.from(atob(testPayload)).toString('hex');
// const bytePayload = new Uint8Array(Buffer.from(atob(testPayload)));
// const hashPayload = crypto.createHash('sha256').update(bytePayload).digest();
// console.log('hexPayload:', hexPayload);

// const [sign, al] = ndauSignatureToBytes(testSign);

// console.log(Generate('a', pk.key));

// (async function () {
//   console.log('sign.data...........', sign.data);
//   // const isValid = await ed.verify(sign.data, hexPayload, pk.key);
//   const isValid = await secp256k1.verify(sign.data, hashPayload, pk.key);
//   console.log(isValid);
// })();

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
  try {
    b64DecodedMsg = atob(payload);
    const ballot = JSON.parse(decodedMsg);
    const { pubkey, proposal, wallet_address } = vote;
    const { proposal_id, voting_option_id } = proposal;

    console.log('ballot, pubkey, wallet_address, signature', ballot, pubkey, wallet_address, signature);

    const account = await getAccount(address);
    if (!account) {
      res.status(400).json({
        status: false,
        message: "Wallet address not found or blank",
      });
    }

    const { validationKeys } = account[address];
    const ndauPubkey = validationKeys[0];

    const [sign, al] = ndauSignatureToBytes(signature);
    const [pk, _] = ndauPubkeyToBytes(ndauPubkey);
    // const wallet_address = Generate('a', pk.key);

    let hexPayload;
    let bytePayload;
    let hashPayload;
    let isValid = false;
    switch (al) {
      case 'Ed25519':
        hexPayload = Buffer.from(b64DecodedMsg).toString('hex');
        isValid = await ed.verify(sign.data, hexPayload, pk.key);
        break;
      case 'Secp256k1':
        bytePayload = new Uint8Array(Buffer.from(b64DecodedMsg));
        hashPayload = crypto.createHash('sha256').update(bytePayload).digest();
        isValid = await secp256k1.verify(sign.data, hashPayload, pk.key);
        break;
      default:
    }

    console.log('Signature verified: ', isValid);
    if (isValid) {
      // Save vote to database
      const result = await repository.addVote(proposal_id, voting_option_id, wallet_address, ballot, signature, {
        tracking_number,
      });
      if (result && result.vote_id) {
        res.status(201).json({
          status: true,
          message: "Ballot added",
        });
      } else {
        res.status(500).json({
          status: "false",
          message: "server error: failed to save ballot to database",
        });
       
      }
    } else {
      res.status(400).json({
        status: false,
        message: "Failed in signature verification process",
      });
    }
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
