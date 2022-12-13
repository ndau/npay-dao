export interface pollResponseBaseObjI {
  approved_on: string;
  proposal_heading: string;
  summary: string;
  closing_date: string;
  total_votes: number;
  is_active: boolean;
  proposal_id: number;
}

export interface adminProcessedProposalResponseI extends pollResponseBaseObjI {
  voting_options_headings: {
    [key: string]: string;
  };
  votes_cast_agg: {
    [key: number]: number;
  };
  hasUserAlreadyVotedObj?: {
    status: boolean;
    index: number;
    voting_option_id: number;
  };
}

export interface unapprovedProposalResponseI extends pollResponseBaseObjI {
  voting_options: string[];
}
