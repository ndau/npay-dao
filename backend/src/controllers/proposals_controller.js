const convertSecondsToVotingPeriod = require("../utils/convertSecondsToVotingPeriod");
const checkIsBodyIncomplete = require("../utils/checkIsBodyIncomplete");

const { pg } = require("../pg");
import repository from "../repository";

// const createVotingOptionsTableIfNotExists = async () => {
//   const createVotingOptionsTableQuery = pg`
//   CREATE TABLE IF NOT EXISTS voting_options (
//         voting_option_id SERIAL PRIMARY KEY,
//         summary TEXT,
//         proposal_id integer references proposals(proposal_id)
//     )`;

//   const votingOptionsTable = await createVotingOptionsTableQuery;
//   return votingOptionsTable;
// };

// const createProposalTableIfNotExists = async () => {
//   const createTableQuery = pg`
//     CREATE TABLE IF NOT EXISTS proposals (
//           proposal_id SERIAL PRIMARY KEY,
//           is_approved BOOLEAN,
//           approved_on TIMESTAMPTZ,
//           heading TEXT NOT NULL,
//           summary TEXT,
//           voting_period INTERVAL NOT NULL,
//           closing_date TIMESTAMPTZ,
//           is_featured BOOLEAN DEFAULT NULL
//       );
//     `;

//   const createIndexQuery = pg`
//     CREATE UNIQUE INDEX on proposals (is_featured)
//     where is_featured = true;`;

//   const proposalTable = await createTableQuery;
//   await createIndexQuery;
//   return proposalTable;
// };

exports.createProposal = async (req, res, next) => {
  try {
    const { heading, summary, votingPeriod, votingOptions, walletAddress } =
      req.body;

    const isAnyValUndefined = checkIsBodyIncomplete({
      heading,
      votingPeriod,
      votingOptions,
      walletAddress,
    });

    if (!walletAddress) {
      res.status(400).json({
        status: "false",
        message: "Wallet Not Available",
      });
      return;
    }
    const firstTwoLettersOfAddress = walletAddress.slice(0, 2);
    if (walletAddress.length != 48 || firstTwoLettersOfAddress !== "nd") {
      res.status(400).json({
        status: "false",
        message: "wallet-address does not belong to the ndau chain",
      });
      return;
    }

    if (isAnyValUndefined) {
      res.status(400).json({
        status: false,
        message: "All Inputs are Required..!",
      });
      return;
    } else {
      let proposalRow;
      let createProposalQuery;

      if (summary) {
        proposalRow = {
          heading,
          summary,
          voting_period: votingPeriod,
        };
      } else {
        proposalRow = {
          heading,
          voting_period: votingPeriod,
        };
      }

      createProposalQuery = pg`
      INSERT INTO proposals ${pg(proposalRow)} returning *`;

      // await createProposalTableIfNotExists();
      // await createVotingOptionsTableIfNotExists();
      // await createVotesTableIfNotExists();

      const addedProposal = await createProposalQuery;

      const addedProposalId = addedProposal[0].proposal_id;

      const votingOptionsRows = votingOptions.map((item, index) => {
        return {
          proposal_id: addedProposalId,
          summary: item,
        };
      });

      const createProposalVotingOptionsQuery = pg`INSERT INTO voting_options ${pg(
        votingOptionsRows
      )} returning *`;

      await createProposalVotingOptionsQuery;

      res.status(201).json({
        status: true,
        message: "Proposal submitted",
      });
    }
  } catch (e) {
    console.log(e, "error");
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.getAllProposals = async (req, res, next) => {
  try {
    let limit = null;
    let offset = "0";
    if (req.query.limit) limit = req.query.limit;
    if (req.query.offset) offset = req.query.offset;

    const getAllProposalQuery = pg`
    SELECT
      proposals.proposal_id,
      approved_on,
      proposal_heading,
      proposals.summary,
      closing_date,
      is_active,
      SUM(vote_count) total_votes,
      array_agg(voters) voters_arr,
      jsonb_object_agg(vOptId, vote_count) votes_cast_agg,
      jsonb_object_agg(vOptId,votingOptionHeading) voting_options_headings
      FROM
    (
      SELECT
        proposals.proposal_id,
        approved_on,
        heading proposal_heading,
        proposals.summary,
        voting_options.voting_option_id vOptId,
        closing_date,
        voting_options.summary votingOptionHeading,
        votes.user_address as voters,
        closing_date IS NOT NULL AND now() < closing_date is_active,
        COUNT(votes.vote_id) AS vote_count
    FROM
      proposals 
    INNER JOIN
        voting_options USING (proposal_id)
    LEFT JOIN
        votes USING (voting_option_id)
    GROUP BY
      proposals.proposal_id,
      voting_option_id,
      proposal_heading,
      votingOptionHeading,
      is_active,
      voters
      )
        proposals
    GROUP BY
      proposals.proposal_id,
      proposals.approved_on,
      proposals.summary,
      proposals.closing_date,
      proposal_heading,
      is_active
ORDER BY
  proposal_id
LIMIT ${limit} OFFSET ${offset}
`;

    const allProposals = await getAllProposalQuery;
    console.log(allProposals, "allProposals");

    res.status(200).json({
      status: true,
      proposals: allProposals,
    });
  } catch (e) {
    console.log(e, "error");
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.getUnapprovedProposals = async (req, res, next) => {
  try {
    let limit = null;
    let offset = "0";
    let isDesc = false;
    let search_term;
    let before;
    let after;

    if (req.query.limit) limit = req.query.limit;
    if (req.query.offset) offset = req.query.offset;
    if (req.query.order === "desc") isDesc = true;
    if (req.query.search_term) {
      search_term = req.query.search_term;
      console.log(search_term, "search_term");
    }

    if (req.query.after) {
      after = req.query.after;
      after = new Date(after).toISOString();
    }
    if (req.query.before) {
      before = req.query.before;
      before = new Date(before).toISOString();
    }

    const getUnapprovedProposalsCountQuery = pg`
    SELECT
      COUNT(proposal_id) unapproved_proposals_count
    FROM
      proposals
    WHERE
      is_approved IS NULL
      ${
        search_term
          ? pg`AND to_tsvector(heading) @@ websearch_to_tsquery(${search_term})`
          : pg``
      }
    `;
    const getUnapprovedProposalsCount = await getUnapprovedProposalsCountQuery;

    const getUnapprovedProposalsQuery = pg`
SELECT
  EXTRACT(epoch FROM voting_period) vp_seconds, proposal_id, heading, proposals.summary, ARRAY_AGG(voting_options.summary) voting_options
FROM
  proposals
INNER JOIN
  voting_options USING(proposal_id)
WHERE
  is_approved IS NULL
  ${
    search_term
      ? pg`AND to_tsvector(heading) @@ websearch_to_tsquery(${search_term})`
      : pg``
  }
  ${after ? pg`AND approved_on >= ${after}` : pg``}
  ${before ? pg`AND approved_on <= ${before}` : pg``}
GROUP BY
  proposals.proposal_id
  ${isDesc ? pg`ORDER BY proposal_id DESC` : pg`ORDER BY proposal_id`}
LIMIT ${limit} OFFSET ${offset}
`;

    const getUnapprovedProposals = await getUnapprovedProposalsQuery;

    getUnapprovedProposals.forEach((item, index) => {
      let seconds = Number(item.vp_seconds);
      item.votingPeriod = convertSecondsToVotingPeriod(seconds);
    });

    res.status(200).json({
      status: true,
      proposals: getUnapprovedProposals,
      total: getUnapprovedProposalsCount[0].unapproved_proposals_count,
    });
  } catch (e) {
    console.log(e, "error");
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.getLatestRunningProposals = async (req, res, next) => {
  try {
    let limit = null;
    let offset = "0";
    if (req.query.limit) limit = req.query.limit;
    if (req.query.offset) offset = req.query.offset;

    const getLatestRunningProposalsQuery = pg`
    SELECT
    proposals.proposal_id,
    approved_on,
    proposal_heading,
    proposals.summary,
    closing_date,
    is_active,
    SUM(vote_count) total_votes,
    jsonb_object_agg(vOptId, vote_count) votes_cast_agg,
    jsonb_object_agg(vOptId,votingOptionHeading) voting_options_headings
      FROM
    (
      SELECT
        proposals.proposal_id,
        approved_on,
        heading proposal_heading,
        proposals.summary,
        voting_options.voting_option_id vOptId,
        closing_date,
        voting_options.summary votingOptionHeading,
        closing_date IS NOT NULL AND now() < closing_date is_active,
        COUNT(votes.vote_id) AS vote_count
    FROM
      proposals 
    INNER JOIN
        voting_options USING (proposal_id)
    LEFT JOIN
        votes USING (voting_option_id)
  WHERE
    approved_on IS NOT NULL AND NOW() < closing_date

    GROUP BY
      proposals.proposal_id,
      voting_option_id,
      proposal_heading,
      votingOptionHeading,
      is_active
      )
        proposals
    GROUP BY
      proposals.proposal_id,
      proposals.approved_on,
      proposals.summary,
      proposals.closing_date,
      proposal_heading,
      is_active
    ORDER BY
      proposal_id DESC
    LIMIT ${limit} OFFSET ${offset}
    

`;

    const latestRunningProposals = await getLatestRunningProposalsQuery;

    res.status(200).json({
      status: true,
      proposals: latestRunningProposals,
    });
  } catch (e) {
    console.log(e, "error");
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.getApprovedProposals = async (req, res, next) => {
  try {
    let isDesc = false;
    let isActiveOnly = false;
    let isCompletedOnly = false;
    let before;
    let after;
    let proposal_status = "all";

    let loggedInWalletAddress;
    if (req.query.loggedInWalletAddress)
      loggedInWalletAddress = req.query.loggedInWalletAddress;

    // loggedInWalletAddress = "ndaeachf4ct2gkq5gtfxjkz25g8hfx33d2mbp76q6mjxkfkv";

    let search_term = undefined;
    if (req.query.search_term) search_term = req.query.search_term;
    let limit = null;
    if (req.query.limit) limit = req.query.limit;

    let offset = "0";
    if (req.query.offset) offset = req.query.offset;
    if (req.query.order === "desc") isDesc = true;

    if (req.query.after) {
      after = req.query.after;
      after = new Date(after).toISOString();
    }
    if (req.query.before) {
      before = req.query.before;
      before = new Date(before).toISOString();
    }

    if (req.query.proposal_status) proposal_status = req.query.proposal_status;
    if (proposal_status === "Active") isActiveOnly = true;
    else {
      if (proposal_status === "Concluded") isCompletedOnly = true;
    }

    const getApprovedProposalsCountQuery = pg`
    SELECT
      COUNT(proposal_id) approved_proposals_count
    FROM
      proposals
    WHERE
      approved_on IS NOT NULL
      ${
        search_term
          ? pg`AND to_tsvector(heading) @@ websearch_to_tsquery(${search_term})`
          : pg``
      }
    `;
    const approvedProposalsCount = await getApprovedProposalsCountQuery;

    const getApprovedProposalsQuery = pg`
    SELECT
      proposals.proposal_id,
      approved_on,
      proposal_heading,
      proposals.summary,
      closing_date,
      is_active,
      SUM(vote_count) total_votes,
      array_agg(voters) voters_arr,
      array_agg(voteCastOptionId) voting_option_id_arr,
      jsonb_object_agg(vOptId, vote_count) votes_cast_agg,
      jsonb_object_agg(vOptId,votingOptionHeading) voting_options_headings,
      vp_seconds
      FROM
    (
      SELECT
        proposals.proposal_id,
        approved_on,
        heading proposal_heading,
        proposals.summary,
        voting_options.voting_option_id vOptId,
        closing_date,
        voting_options.summary votingOptionHeading,
        votes.user_address as voters,
        votes.voting_option_id as voteCastOptionId,
        closing_date IS NOT NULL AND now() < closing_date is_active,
        COUNT(votes.vote_id) AS vote_count,
        EXTRACT(epoch FROM voting_period) vp_seconds
    FROM
      proposals 
    INNER JOIN
        voting_options USING (proposal_id)
    LEFT JOIN
        votes USING (voting_option_id)
    WHERE approved_on IS NOT NULL
    ${after ? pg`AND approved_on >= ${after}` : pg``}
    ${before ? pg`AND approved_on <= ${before}` : pg``}
    GROUP BY
      proposals.proposal_id,
      vOptId,
      proposal_heading,
      votingOptionHeading,
      voteCastOptionId,
      is_active,
      vp_seconds,
      voters
      )
        proposals
    WHERE
      is_active IS NOT NULL 
      ${
        isActiveOnly
          ? pg`AND is_active IS TRUE`
          : isCompletedOnly
          ? pg`AND is_active IS FALSE`
          : pg``
      }
      ${
        search_term
          ? pg`AND to_tsvector(proposal_heading) @@ websearch_to_tsquery(${search_term})`
          : pg``
      }
    GROUP BY
      proposals.proposal_id,
      proposals.approved_on,
      proposals.summary,
      proposals.closing_date,
      proposal_heading,
      is_active,
      vp_seconds
  ${isDesc ? pg`ORDER BY proposal_id DESC` : pg`ORDER BY proposal_id`}
LIMIT ${limit} OFFSET ${offset}
`;

    const approvedProposals = await getApprovedProposalsQuery;

    if (loggedInWalletAddress) {
      approvedProposals.forEach((item) => {
        let hasUserAlreadyVotedObj = {};
        let userVoteIndex = item.voters_arr.findIndex(
          (el) => el === loggedInWalletAddress
        );

        if (userVoteIndex === -1) {
          hasUserAlreadyVotedObj.status = false;
          item.hasUserAlreadyVotedObj = hasUserAlreadyVotedObj;
        } else {
          hasUserAlreadyVotedObj.status = true;
          hasUserAlreadyVotedObj.index = userVoteIndex;
          hasUserAlreadyVotedObj.voting_option_id =
            item.voting_option_id_arr[userVoteIndex];
          console.log(item.voters_arr[userVoteIndex], "userVoteIndex");
          item.hasUserAlreadyVotedObj = hasUserAlreadyVotedObj;
        }
      });
    }

    approvedProposals.forEach((item, index) => {
      let seconds = Number(item.vp_seconds);
      item.votingPeriod = convertSecondsToVotingPeriod(seconds);
    });

    res.status(200).json({
      status: true,
      proposals: approvedProposals,
      total: approvedProposalsCount[0].approved_proposals_count,
    });
  } catch (e) {
    console.log(e, "error");
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.getRejectedProposals = async (req, res, next) => {
  try {
    let limit = null;
    let offset = "0";
    let isDesc = false;
    if (req.query.limit) limit = req.query.limit;
    if (req.query.offset) offset = req.query.offset;
    if (req.query.order === "desc") isDesc = true;
    let search_term = undefined;
    if (req.query.search_term) search_term = req.query.search_term;

    const getRejectedProposalsCountQuery = pg`
    SELECT
      COUNT(proposal_id) rejected_proposals_count
    FROM
      proposals
    WHERE
      is_approved = false
      ${
        search_term
          ? pg`AND to_tsvector(heading) @@ websearch_to_tsquery(${search_term})`
          : pg``
      }
    `;
    const rejectedProposalsCount = await getRejectedProposalsCountQuery;

    const getRejectedProposalsQuery = pg`
    SELECT
    proposals.proposal_id,
    proposal_heading,
    proposals.summary,
    jsonb_object_agg(vOptId,votingOptionHeading) voting_options_headings,
    vp_seconds
      FROM
    (
      SELECT
        proposals.proposal_id,
        heading proposal_heading,
        proposals.summary,
        voting_options.voting_option_id vOptId,
        voting_options.summary votingOptionHeading,
        EXTRACT(epoch FROM voting_period) vp_seconds
    FROM
      proposals 
    INNER JOIN
        voting_options USING (proposal_id)
    LEFT JOIN
        votes USING (voting_option_id)
    WHERE is_approved = false
    ${
      search_term
        ? pg`AND to_tsvector(heading) @@ websearch_to_tsquery(${search_term})`
        : pg``
    }
    GROUP BY
      proposals.proposal_id,
      voting_option_id,
      proposal_heading,
      votingOptionHeading,
      vp_seconds
      )
        proposals
    GROUP BY
      proposals.proposal_id,
      proposals.summary,
      proposal_heading,
      vp_seconds
  ${isDesc ? pg`ORDER BY proposal_id DESC` : pg`ORDER BY proposal_id`}
LIMIT ${limit} OFFSET ${offset}
`;

    const rejectedProposals = await getRejectedProposalsQuery;

    rejectedProposals.forEach((item, index) => {
      let seconds = Number(item.vp_seconds);
      item.votingPeriod = convertSecondsToVotingPeriod(seconds);
    });

    res.status(200).json({
      status: true,
      proposals: rejectedProposals,
      total: rejectedProposalsCount[0].rejected_proposals_count,
    });
  } catch (e) {
    console.log(e, "error");
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.getLatestCompletedProposals = async (req, res, next) => {
  try {
    let limit = null;
    let offset = "0";
    if (req.query.limit) limit = req.query.limit;
    if (req.query.offset) offset = req.query.offset;

    const getLatestCompletedProposalsQuery = pg`

    SELECT
      proposals.proposal_id,
      approved_on,
      proposal_heading,
      proposals.summary,
      closing_date,
      false is_active,
      SUM(vote_count) total_votes,
      jsonb_object_agg(vOptId, vote_count) votes_cast_agg,
      jsonb_object_agg(vOptId,votingOptionHeading) voting_options_headings
        FROM
      (
        SELECT
          proposals.proposal_id,
          approved_on,
          heading proposal_heading,
          proposals.summary,
          voting_options.voting_option_id vOptId,
          closing_date,
          voting_options.summary votingOptionHeading,
          closing_date IS NOT NULL AND now() < closing_date is_active,
          COUNT(votes.vote_id) AS vote_count
      FROM
        proposals 
      INNER JOIN
          voting_options USING (proposal_id)
      LEFT JOIN
          votes USING (voting_option_id)
        WHERE
          NOW() > closing_date 
      GROUP BY
        proposals.proposal_id,
        voting_option_id,
        proposal_heading,
        votingOptionHeading,
        is_active
        )
          proposals
      GROUP BY
        proposals.proposal_id,
        proposals.approved_on,
        proposals.summary,
        proposals.closing_date,
        proposal_heading,
        is_active
ORDER BY
  closing_date DESC
LIMIT ${limit} OFFSET ${offset}
`;

    const latestCompletedProposals = await getLatestCompletedProposalsQuery;

    res.status(200).json({
      status: true,
      proposals: latestCompletedProposals,
    });
  } catch (e) {
    console.log(e, "error");
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.approveProposal = async ({ proposalIDToApprove }) => {
  try {
    const isAnyValUndefined = checkIsBodyIncomplete({ proposalIDToApprove });

    if (isAnyValUndefined) {
      return {
        status: false,
        message: "All Inputs are Required..!",
      };
    } else {
      const approveProposalQuery = pg`
UPDATE proposals
SET is_approved = ${true},  approved_on = ${Date.now()}, closing_date=(now() + voting_period)
WHERE
proposal_id = ${proposalIDToApprove} AND approved_on IS NULL
RETURNING proposal_id
`;

      const approvedProposal = await approveProposalQuery;

      console.log(approvedProposal, "approvedProposal");

      if (approvedProposal.length === 0) {
        return {
          status: false,
          message:
            "Error. Submitted Proposal-id is not found or already processed ",
        };
      } else {
        return {
          status: true,
          message: "Approved Proposal",
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

exports.rejectProposal = async ({ proposalIDToReject }) => {
  try {
    const isAnyValUndefined = checkIsBodyIncomplete({ proposalIDToReject });

    if (isAnyValUndefined) {
      return {
        status: false,
        message: "All Inputs are Required..!",
      };
    } else {
      const rejectProposalQuery = pg`
UPDATE proposals
  SET is_approved = ${false}
WHERE
  proposal_id = ${proposalIDToReject} AND approved_on IS NULL
RETURNING proposal_id
`;

      const rejectProposal = await rejectProposalQuery;

      console.log(rejectProposal, "rejectedProposal");

      if (rejectProposal.length === 0) {
        return {
          status: false,
          message:
            "Error. Submitted Proposal-id is not found or already processed ",
        };
      } else {
        return {
          status: true,
          message: "Rejected Proposal",
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

exports.featureProposal = async ({ proposalIDToFeature }) => {
  try {
    const isAnyValUndefined = checkIsBodyIncomplete({ proposalIDToFeature });

    if (isAnyValUndefined) {
      return {
        status: false,
        message: "All Inputs are Required..!",
      };
    } else {
      const isApprovedProposalQuery = pg`
      SELECT * FROM proposals
      WHERE
      proposal_id = ${proposalIDToFeature} AND is_approved=${true}
      `;

      const isApprovedProposal = await isApprovedProposalQuery;

      if (!(isApprovedProposal.length > 0)) {
        return {
          status: false,
          message: "proposal not approved",
        };
      }

      const setPreviousFeaturedToFalseQuery = pg`
        UPDATE proposals
        SET is_featured = NULL
        WHERE
        is_featured = ${true}  
        `;

      await setPreviousFeaturedToFalseQuery;

      const featureProposalQuery = pg`
        UPDATE proposals
        SET is_featured = ${true}
        WHERE
        proposal_id = ${proposalIDToFeature} AND is_approved IS NOT NULL
        RETURNING proposal_id
        `;

      const featuredProposal = await featureProposalQuery;

      console.log(featuredProposal, "featuredProposal");

      if (featuredProposal.length === 0) {
        return {
          status: false,
          message: "Error. Featured Proposal-id is not found or not approved ",
        };
      } else {
        return {
          status: true,
          message: "Approved Proposal",
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

exports.getFeaturedProposals = async (req, res, next) => {
  try {
    const isAnyValUndefined = checkIsBodyIncomplete(req.body);
    const loggedInWalletAddress = req.body.loggedInWalletAddress;

    // const loggedInWalletAddress =
    //   "ndaeachf4ct2gkq5gtfxjkz25g8hfx33d2mbp76q6mjxkfkv";

    if (isAnyValUndefined) {
      res.status(400).json({
        status: false,
        message: "All Inputs are Required..!",
      });
      return;
    } else {
      const getFeaturedProposalQuery = pg`
      SELECT
      proposals.proposal_id,
      approved_on,
      proposal_heading,
      proposals.summary,
      closing_date,
      is_active,
      SUM(vote_count) total_votes,
      jsonb_object_agg(vOptId, vote_count) votes_cast_agg,
      array_agg(voters) voters_arr,
      jsonb_object_agg(vOptId,votingOptionHeading) voting_options_headings
        FROM
      (
        SELECT
          proposals.proposal_id,
          approved_on,
          heading proposal_heading,
          proposals.summary,
          voting_options.voting_option_id vOptId,
          closing_date,
          voting_options.summary votingOptionHeading,
          closing_date IS NOT NULL AND now() < closing_date is_active,
          votes.user_address as voters,
          COUNT(votes.vote_id) AS vote_count
      FROM
        proposals 
      INNER JOIN
          voting_options USING (proposal_id)
      LEFT JOIN
          votes USING (voting_option_id)
      WHERE
          is_featured = ${true} 
      GROUP BY
        proposals.proposal_id,
        voting_option_id,
        proposal_heading,
        votingOptionHeading,
        is_active,
        voters
        )
          proposals
      GROUP BY
        proposals.proposal_id,
        proposals.approved_on,
        proposals.summary,
        proposals.closing_date,
        proposal_heading,
        is_active
          `;

      const featuredProposal = await getFeaturedProposalQuery;

      console.log(featuredProposal, "featuredProposal");

      let hasUserAlreadyVotedObj = {};

      if (loggedInWalletAddress) {
        let userVoteIndex = featuredProposal[0].voters_arr.findIndex(
          (item) => item === loggedInWalletAddress
        );

        if (userVoteIndex === -1) hasUserAlreadyVotedObj.status = false;
        else {
          hasUserAlreadyVotedObj.status = true;
          hasUserAlreadyVotedObj.index = userVoteIndex;
          hasUserAlreadyVotedObj.voting_option_id =
            proposalVotesDetails[0].voting_option_id;
          featuredProposal[0].hasUserAlreadyVotedObj = hasUserAlreadyVotedObj;
        }
      }

      res.status(200).json({
        status: true,
        proposals: featuredProposal,
      });
    }
  } catch (e) {
    console.log(e, "error");
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

// const getProposalVotesDetails = async (_proposalIdToGet) => {
//   const voteDetailsQuery = pg`
//   SELECT
//     votes.user_address, voting_option_id,voting_options.summary
//   FROM
//       proposals p
//     INNER JOIN
//         voting_options USING (proposal_id)
//     INNER JOIN
//         votes USING (voting_option_id)
//     WHERE
//         p.proposal_id = ${_proposalIdToGet}
//   `;

//   const voteDetails = await voteDetailsQuery;
//   return voteDetails;
// };

exports.getProposalDetails = async (req, res, next) => {
  const proposalIdToGet = req.query.proposal_Id;
  if (!proposalIdToGet) {
    res.status(400).json({
      status: false,
      message: "All Inputs are Required..!",
    });
    return;
  }

  let loggedInWalletAddress;
  if (req.query.loggedInWalletAddress)
    loggedInWalletAddress = req.query.loggedInWalletAddress;

  console.log(loggedInWalletAddress);

  // loggedInWalletAddress = "ndaeachf4ct2gkq5gtfxjkz25g8hfx33d2mbp76q6mjxkfkv";

  console.log(proposalIdToGet, "proposalIdToGet");
  try {
    const proposalVotesDetails = await repository.getProposalVotesDetails(
      proposalIdToGet
    );

    const proposalDetailsQuery = pg`
    SELECT
      proposals.proposal_id,
      approved_on,
      proposal_heading,
      proposals.summary,
      closing_date,
      is_active,
      SUM(vote_count) total_votes,
      jsonb_object_agg(vOptId, vote_count) votes_cast_agg,
      jsonb_object_agg(vOptId,votingOptionHeading) voting_options_headings
      FROM
    (
      SELECT
        proposals.proposal_id,
        approved_on,
        heading proposal_heading,
        proposals.summary,
        voting_options.voting_option_id vOptId,
        closing_date,
        voting_options.summary votingOptionHeading,
        closing_date IS NOT NULL AND now() < closing_date is_active,
        COUNT(votes.vote_id) AS vote_count
      FROM
        proposals 
      INNER JOIN
          voting_options USING (proposal_id)
      LEFT JOIN
          votes USING (voting_option_id)
      WHERE
      proposals.proposal_id = ${proposalIdToGet} AND is_approved
      GROUP BY
        proposals.proposal_id,
        voting_option_id,
        proposal_heading,
        votingOptionHeading,
        is_active
    ) proposals
    GROUP BY
      proposals.proposal_id,
      proposals.approved_on,
      proposals.summary,
      proposals.closing_date,
      proposal_heading,
      is_active
        `;

    const proposalDetails = await proposalDetailsQuery;

    console.log(proposalVotesDetails, "proposalVotesDetails");

    if (loggedInWalletAddress) {
      let hasUserAlreadyVotedObj = {};
      let userVoteIndex = proposalVotesDetails.findIndex(
        (item) => item.user_address === loggedInWalletAddress
      );

      if (userVoteIndex === -1) {
        hasUserAlreadyVotedObj.status = false;
        proposalDetails[0].hasUserAlreadyVotedObj = hasUserAlreadyVotedObj;
      } else {
        hasUserAlreadyVotedObj.status = true;
        hasUserAlreadyVotedObj.index = userVoteIndex;
        hasUserAlreadyVotedObj.voting_option_id =
          proposalVotesDetails[userVoteIndex].voting_option_id;
        proposalDetails[0].hasUserAlreadyVotedObj = hasUserAlreadyVotedObj;
      }
    }

    console.log(proposalDetails, "proposalDetails");

    res.status(200).json({
      status: true,
      proposalDetails: proposalDetails,
      proposalVotesDetails,
    });
  } catch (e) {
    console.log(e, "error");
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.test = async (req, res, next) => {
  console.log(req.body);
  console.log(res.params);
  console.log(req.query);
  res.status(200).json({
    walletAddress: "9083201293",
  });
};
