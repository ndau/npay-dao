import React from "react";
import { axiosRequest } from "../../../api/api";
import PollComponent from "../../../Components/PollComponent/PollComponent";

import { adminProcessedProposalResponseI } from "../../../types/responseTypes";

type Props = {};

function FeaturedPolls({}: Props) {
  const [featuredPollState, setFeaturedPollState] = React.useState<
    adminProcessedProposalResponseI[] | undefined
  >([]);

  React.useEffect(() => {
    axiosRequest("get", "proposal/featured").then((val) => {
      if (val.data.proposals[0].voting_options_headings)
        setFeaturedPollState(val.data.proposals);
    });
  }, []);

  return (
    <div>
      {featuredPollState &&
        featuredPollState.map((val) => {
          let hasUserAlreadyVotedObj;

          if (val.hasUserAlreadyVotedObj) {
            hasUserAlreadyVotedObj = {
              status: val.hasUserAlreadyVotedObj.status,
              index: val.hasUserAlreadyVotedObj.index,
              voting_option_id: val.hasUserAlreadyVotedObj.voting_option_id,
            };
          } else {
            hasUserAlreadyVotedObj = {
              status: false,
              index: -1,
              voting_option_id: -1,
            };
          }
          return (
            <div className="py-2" key={val.proposal_id}>
              <PollComponent
                proposalId={val.proposal_id}
                addedOn={val.approved_on}
                proposal={val.proposal_heading}
                summary={val.summary}
                closingOn={val.closing_date}
                votingOptionsHeadings={{}}
                votingOptionsVotesCast={{}}
                totalVotes={val.total_votes}
                isActive={val.is_active}
                hasUserAlreadyVotedObj={hasUserAlreadyVotedObj}
              />
            </div>
          );
        })}
    </div>
  );
}

export default FeaturedPolls;
