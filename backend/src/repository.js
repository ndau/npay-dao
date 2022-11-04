import { db_query, pgp, getConditionClause, generateUpdatedSet, trimStringProperties, QUERY } from './db';

const repository = {
  update: async (schema, table, keys, fields, { isTx = false, errMsg = '', tracking_number = '' }) => {
    const { columns, values } = generateUpdatedSet(fields);
    const clause = getConditionClause(keys);
    const columnSet = new pgp.helpers.ColumnSet(columns, {
      table: { schema, table },
    });
    const sql = `${pgp.helpers.update(values, columnSet)} WHERE ${clause.conditions.join('AND ')}`;

    return db_query(QUERY.any, sql, clause.values, isTx, errMsg || `${tracking_number} Error updating table ${schema}.${table}, ${JSON.stringify(keys)}`);
  },

  getAllVotes: async ({ isTx = false, errMsg = '', tracking_number = '' } = {}) => {
    const sql = `SELECT * FROM votes`;
    return db_query(QUERY.any, sql, [], isTx, errMsg || `${tracking_number} Error reading data from the table votes`);
  },

  addVote: async (proposal_id, voting_option_id, user_address, ballot, signature, { isTx = false, errMsg = '', tracking_number = '' } = {}) => {
    const sql = `
			INSERT INTO votes (proposal_id, voting_option_id, user_address, ballot, signature)
			VALUES($1, $2, $3, $4, $5)
			RETURNING vote_id, proposal_id, voting_option_id`;

    return db_query(QUERY.one, sql, [proposal_id, voting_option_id, user_address, ballot, signature], isTx, errMsg || `${tracking_number} Error inserting voting option id ${voting_option_id} for the proposal ${proposal_id} into the votes table`);
  },

  getProposalVotesDetails: async (proposal_id, { isTx = false, errMsg = '', tracking_number = '' } = {}) => {
    const sql = `SELECT v.user_address, v.ballot, v.signature, v.voting_option_id, vo.summary
									 FROM proposals p
									 JOIN voting_options vo on p.proposal_id = vo.proposal_id
									 JOIN votes v on v.voting_option_id = vo.voting_option_id
									WHERE p.proposal_id = $1`;

    return db_query(QUERY.any, sql, [proposal_id], isTx, errMsg || `${tracking_number} Error getting proposal vote details for proposal id ${proposal_id}`);
  },
};

export default repository;
