import { useState, useEffect } from "react";
import PollComponent from "../../Components/PollComponent/PollComponent";
import AllPollsFilterBar from "./AllPollsFilterBar/AllPollsFilterBar";
import { axiosRequest } from "../../api/api";
import Container from "react-bootstrap/Container";
import { Button, Form } from "react-bootstrap";
import useMediaQuery from "../../utils/hooks/useMediaQuery";
import { useNavigate } from "react-router-dom";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { adminProcessedProposalResponseI } from "../../types/responseTypes";
import { pollComponentProps } from "../../Components/PollComponent/PollComponent_types";
import { isTemplateSpan } from "typescript";
import useNdauConnectStore from "../../store/ndauConnect_store";

const pollButtonFullscreen = {
  color: "white",
  background: "#F89D1C",
  border: "#F89D1C",
};

const pollButtonMobile = {
  color: "white",
  background: "#F89D1C",
  border: "#F89D1C",
  marginTop: 10,
  marginBottom: 10,
};

const firstRowLgScreen = {
  color: "white",
  textAlign: "right",
  fontSize: "30px",
};

const firstRowSmScreen = {
  color: "white",
  textAlign: "center",
  fontSize: "30px",
};

type Props = {};

const getApprovedURL = "/proposal/approved?limit=10&order=desc";

const AllPolls = (props: Props) => {
  const walletAddress = useNdauConnectStore((state) => state.walletAddress);
  const checkMobile = useMediaQuery("(max-width: 992px)");

  const navigate = useNavigate();
  const [filteredProposalsTableState, setFilteredProposalsTableState] =
    useState<adminProcessedProposalResponseI[] | undefined>([]);
  const [searchResultState, setSearchResultState] = useState("");

  const [activationState, setActivationState] = useState("");

  const [afterState, setAfterState] = useState("");

  const [beforeState, setBeforeState] = useState("");

  useEffect(() => {
    async function getAllApprovedPolls() {
      let allApprovedPollsResponse = await axiosRequest(
        "get",
        getApprovedURL,
        undefined,
        {
          after: afterState,
          before: beforeState,
          proposal_status: activationState ? activationState : "All",
          search_term: searchResultState,
          loggedInWalletAddress: walletAddress,
        }
      );
      let allApprovedPolls = allApprovedPollsResponse.data.proposals;
      setFilteredProposalsTableState(allApprovedPolls);
    }
    getAllApprovedPolls();
  }, [
    afterState,
    beforeState,
    activationState,
    searchResultState,
    walletAddress,
  ]);

  return (
    <div>
      <div style={{ backgroundColor: "#0B2140" }}>
        <Container
          className="poll-container"
          fluid="lg"
          style={{ padding: "10px", paddingTop: "20px", minHeight: "80vh" }}
        >
          <Row style={{ paddingTop: 10 }}>
            <Col lg={1}></Col>
            <Col lg={2}>
              <div
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: "30px",
                }}
              >
                {"All Proposals"}
              </div>
            </Col>
            <Col lg={6} />
            <Col lg={2}>
              <div style={{ textAlign: "center" }}>
                {" "}
                <Button
                  onClick={() => {
                    navigate("/proposal-form");
                  }}
                  variant="warning"
                  style={!checkMobile ? pollButtonFullscreen : pollButtonMobile}
                >
                  <img
                    src="./Union 4.svg"
                    className="px-2"
                    style={{ marginTop: -5 }}
                  />{" "}
                  Add New Proposal
                </Button>{" "}
              </div>
            </Col>
            <Col lg={1} />
          </Row>
          <AllPollsFilterBar
            setPollStateSearch={setActivationState}
            setToFrom={setAfterState}
            setTo={setBeforeState}
            setSearchResult={setSearchResultState}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {filteredProposalsTableState &&
              filteredProposalsTableState.map(
                (item: adminProcessedProposalResponseI) => {
                  console.log(
                    item.hasUserAlreadyVotedObj,
                    "item.hasUserAlreadyVotedObj"
                  );
                  let hasUserAlreadyVotedObj;

                  if (item.hasUserAlreadyVotedObj) {
                    hasUserAlreadyVotedObj = {
                      status: item.hasUserAlreadyVotedObj.status,
                      index: item.hasUserAlreadyVotedObj.index,
                      voting_option_id:
                        item.hasUserAlreadyVotedObj.voting_option_id,
                    };
                  } else {
                    hasUserAlreadyVotedObj = {
                      status: false,
                      index: -1,
                      voting_option_id: -1,
                    };
                  }

                  // console.log(hasUserAlreadyVotedObj, "hasUserAlreadyVotedObj");

                  const pollComponentObj: pollComponentProps = {
                    addedOn: item.approved_on,
                    proposal: item.proposal_heading,
                    proposalId: item.proposal_id,
                    summary: item.summary,
                    closingOn: item.closing_date,
                    votingOptionsHeadings: item.voting_options_headings,
                    votingOptionsVotesCast: item.votes_cast_agg,
                    totalVotes: item.total_votes,
                    isActive: item.is_active,
                    hasUserAlreadyVotedObj,
                  };
                  return (
                    <div
                      style={{
                        width: "80%",
                        padding: "25px 0px",
                        borderTop: "1px solid #335599",
                      }}
                    >
                      <PollComponent {...pollComponentObj} />
                    </div>
                  );
                }
              )}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AllPolls;
