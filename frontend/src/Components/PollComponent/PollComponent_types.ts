export interface pollComponentProps {
  addedOn: string;
  proposal: string;
  summary: string;
  closingOn: string;
  votingOptionsHeadings: {
    [key: number]: string;
  };
  votingOptionsVotesCast: {
    [key: number]: number;
  };
  totalVotes: number;
  isActive: boolean;
  proposalId: number;
  hasUserAlreadyVotedObj: {
    status: boolean;
    index: number;
    voting_option_id: number;
  };
}

export interface destructuredPollComponentValuesI {
  proposal: string;
  summary: string;
  proposalId: number;
  isActive: boolean;
  totalVotes: number;
}
