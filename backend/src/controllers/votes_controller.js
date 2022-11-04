const { pg } = require("../pg");
const checkIsBodyIncomplete = require("../utils/checkIsBodyIncomplete");

exports.createVotesTableIfNotExists = async () => {
  const createVotesTableQuery = pg`
    CREATE TABLE IF NOT EXISTS votes (
          vote_id SERIAL PRIMARY KEY,
          voting_option_id integer references voting_options(voting_option_id),
          user_address TEXT
      )`;

  const voteTable = await createVotesTableQuery;
  return voteTable;
};

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

exports.getVoteObjectForConfirmation = async ({
  votingOptionId,
  userAddress,
}) => {
  try {
    const isAnyValUndefined = checkIsBodyIncomplete({
      votingOptionId,
      userAddress,
    });

    if (isAnyValUndefined) {
      return {
        status: false,
        message: "All Inputs are Required..!",
      };
    } else {
      let proposalIdArr = await getProposalDetailsForVotingOption(
        votingOptionId
      );

      const proposalId = proposalIdArr[0].proposal_id;

      const voteObjectForConfirmation = {
        proposal_heading: proposalIdArr[0].heading,
        proposal_id: proposalId,
        voting_option_id: votingOptionId,
        voting_option_heading: proposalIdArr[0].summary,
      };

      const isVotingOpenQueryResult = await getIsVotingOpenForProposal(
        proposalId
      );

      const isValidProposal = isVotingOpenQueryResult.length > 0;

      if (isValidProposal) {
        const isVotingOpen = isVotingOpenQueryResult[0].is_voting_open;

        if (isVotingOpen) {
          const userVotesForThisProposal = await getUserVotesForThisProposal(
            userAddress,
            votingOptionId
          );
          const hasUserAlreadyVotedForThisProposal = Boolean(
            userVotesForThisProposal.length
          );

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
    console.log(e, "error");
    return {
      status: false,
      message: "Server Error",
    };
  }
};

exports.hasUserVoted = async(req,res,next) => {}

exports.createVote = async (votingOptionId, userAddress) => {
  const voteObject = {
    voting_option_id: votingOptionId,
    user_address: userAddress,
  };

  console.log(voteObject, "voteObject");

  try {
    const createVoteQuery = pg`
      INSERT INTO
        votes ${pg(voteObject)}
      returning *
`;

    const createdVote = await createVoteQuery;
    console.log(createdVote, "createdVote");

    return {
      status: true,
      message: "Vote Created",
    };
  } catch (e) {
    console.log(e, "error creating vote");
    return {
      status: false,
    };
  }
};
