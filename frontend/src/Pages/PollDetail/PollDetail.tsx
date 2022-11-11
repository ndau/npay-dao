import { useState, useEffect } from 'react';
import { Button, Placeholder, ProgressBar, Table, Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosRequest } from '../../api/api';
import PollComponentSimple from '../../Components/PollComponent/PollComponentSimple';
import VoteOption from '../../Components/PollComponent/VoteOption/VoteOption';
import VoteButton from '../../Components/VoteButton/VoteButton';
import { adminProcessedProposalResponseI } from '../../types/responseTypes';
import { indexOfMax } from '../../utils/indexOfMax';
import useAdminPanelRefreshStore from '../../store/adminPanelRefresh_store';
import useNdauConnectStore from '../../store/ndauConnect_store';

const PollDetail = () => {
  const setRefreshProposalDetailFunc = useAdminPanelRefreshStore((state) => state.setRefreshProposalDetailFunc);
  const { proposalId = '' } = useParams();
  const walletAddress = useNdauConnectStore((state) => state.walletAddress);
  const voted = useNdauConnectStore((state) => !!state.votes[proposalId]);
  const setVoted = useNdauConnectStore((state) => state.setVoted);

  const goBack = () => navigate(-1);
  const [selectedVoteOptionIndexState, setSelectedVoteOptionIndexState] = useState<number | undefined>();
  const [pollDetailState, setPollDetailState] = useState<adminProcessedProposalResponseI | undefined>();
  const [proposalVotesState, setProposalVotesState] = useState<
    | {
        user_address: string;
        summary: string;
        ballot: string;
        signature: string;
        voting_power: number;
        createdon: string;
      }[]
    | undefined
  >();

  let votingOptionsArray: string[] = [];
  let votingOptionsIdArray: string[] = [];
  let votingPercentagesArray: number[] = [];
  let votingOptionIdsArray: number[] | string[] = [];
  let votesCastArray: number[] = [];
  // let mostVotesIndex: number | undefined;

  if (pollDetailState) {
    votingOptionsArray = Object.values(pollDetailState.voting_options_headings);
    votingOptionsIdArray = Object.keys(pollDetailState.voting_options_headings);

    console.log(votingOptionsIdArray, 'votingOptionsIdArray');

    votesCastArray = Object.values(pollDetailState.votes_cast_agg);
    votingOptionIdsArray = Object.keys(pollDetailState.voting_options_headings);

    votesCastArray.forEach((item, index) => {
      votingPercentagesArray[index] = (item / pollDetailState.total_votes) * 100;
    });
  }
  console.log('voted.................', voted, proposalId);
  useEffect(() => {
    async function getPollDetails() {
      let pollDetailResponse = await axiosRequest('get', 'proposal', undefined, {
        proposal_Id: proposalId,
        loggedInWalletAddress: walletAddress,
      });

      const proposalDetail = pollDetailResponse.data.proposalDetails[0];
      const {
        voting_options_headings,
        is_active: proposalCompleted,
        votes_cast_agg,
        hasUserAlreadyVotedObj,
      } = proposalDetail;

      setPollDetailState(proposalDetail);
      setVoted(hasUserAlreadyVotedObj && hasUserAlreadyVotedObj.status, proposalId);

      setProposalVotesState(pollDetailResponse.data.proposalVotesDetails);

      const userVotedForOptionId = hasUserAlreadyVotedObj?.voting_option_id;

      let votingOptionsIdArray = Object.keys(voting_options_headings);

      if (userVotedForOptionId) {
        let voteCastIndex = votingOptionsIdArray.findIndex((item) => Number(item) === userVotedForOptionId);
        if (voteCastIndex === -1) return;
        else {
          console.log(voteCastIndex, 'voteCastIndex');
          setSelectedVoteOptionIndexState(voteCastIndex);
        }
      }

      if (!proposalCompleted) {
        votesCastArray = Object.values(votes_cast_agg);
        const mostVotesIndex = indexOfMax(votesCastArray);
        setSelectedVoteOptionIndexState(mostVotesIndex);
      }
    }

    // setRefreshProposalDetailFunc(getPollDetails);

    getPollDetails();
  }, [walletAddress, voted]);

  const navigate = useNavigate();
  let selectedVoteOptionId;
  if (selectedVoteOptionIndexState !== undefined)
    selectedVoteOptionId = Number(votingOptionIdsArray[selectedVoteOptionIndexState]);

  return (
    <>
      <div style={{ backgroundColor: '#0B2140', paddingBottom: 20 }}>
        <Container
          className="poll-container"
          fluid="lg"
          style={{ padding: '10px', paddingTop: '20px', minHeight: '80vh' }}
        >
          <div style={{ width: '80%', margin: 'auto' }} className="py-3">
            <h4 className="text-white" style={{ textAlign: 'center' }}>
              Proposal
            </h4>
            <Button
              style={{
                backgroundColor: '#0F2748',
                border: 'none',
                color: '#DBE0E8',
              }}
              className="my-2"
              onClick={goBack}
            >
              <img src="assets/images/icons/backArrow.svg" style={{ height: '20px', marginRight: '10px' }} alt="" />
              {'    Back'}
            </Button>

            {pollDetailState ? (
              <PollComponentSimple
                pollComponentPropsObj={{
                  addedOn: pollDetailState.approved_on,
                  proposal: pollDetailState.proposal_heading,
                  proposalId: pollDetailState.proposal_id,
                  summary: pollDetailState.summary,
                  closingOn: pollDetailState.closing_date,
                  votingOptions: pollDetailState.voting_options_headings,
                  totalVotes: pollDetailState.total_votes,
                  isActive: pollDetailState.is_active,
                }}
              >
                <>
                  <div className="p-4" style={{ marginTop: -30 }}>
                    <h4 className="text-white " style={{ fontWeight: 'bold' }}>
                      Value Breakdown
                    </h4>

                    {votingOptionsArray.map((item, index) => (
                      <div key={votingOptionsIdArray[index]}>
                        <div
                          className="py-2"
                          style={{
                            color: '#ABABAB',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>{item}</div> <div>Votes Cast: {votesCastArray[index]}</div>
                        </div>

                        <ProgressBar variant="warning" now={votingPercentagesArray[index]} />
                      </div>
                    ))}
                  </div>

                  <div className="row p-4">
                    <div
                      className="col-md-6 p-4 "
                      style={{
                        borderTop: '2px solid #234065',
                        borderBottom: '2px solid #234065',
                      }}
                    >
                      <div>
                        <h6 className="text-white fw-bold">Voting Options</h6>
                        {votingOptionsArray.map((item, index) => (
                          <div
                            key={votingOptionIdsArray[index]}
                            onClick={
                              pollDetailState.is_active
                                ? !voted
                                  ? () => setSelectedVoteOptionIndexState(index)
                                  : undefined
                                : undefined
                            }
                            style={{ color: '#CCC', fontSize: '0.6em' }}
                          >
                            {`Option ${index + 1}`}
                            <VoteOption
                              voteOptionSummary={item}
                              selected={walletAddress ? index === selectedVoteOptionIndexState : false}
                              smMarginTop
                            />
                          </div>
                        ))}
                        {pollDetailState.is_active &&
                          // Need to ensure selectedVoteOptionIdState is not undefined, as index 0 is valid, but is a falsy value
                          (voted ? (
                            <Button
                              style={{
                                marginTop: 0,
                                backgroundColor: '#F89D1C',
                                border: '#0A1D35',
                              }}
                              disabled
                            >
                              Voted
                            </Button>
                          ) : (
                            <VoteButton selectedVoteOptionId={selectedVoteOptionId} />
                          ))}
                      </div>
                    </div>
                    <div
                      className="col-md-6  p-3"
                      style={{
                        borderLeft: '2px solid #234065',
                        borderTop: '2px solid #234065',
                        borderBottom: '2px solid #234065',
                      }}
                    >
                      <h6 className="text-white fw-bold">Voting Stats</h6>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          color: '#ABABAB',
                        }}
                      >
                        <div>Total Votes</div>
                        <div>{pollDetailState.total_votes}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h5 style={{ color: 'white', fontWeight: 'bold' }}>Voting By Address</h5>
                    <Table responsive borderless>
                      <thead
                        style={{
                          background:
                            'transparent linear-gradient(180deg, #093D60 0%, #132A47 100%) 0% 0% no-repeat padding-box',
                          color: 'white',
                        }}
                      >
                        <tr>
                          <th>DATE</th>
                          <th>
                            {/* <div style={checkMobile ? styleTableHeading : " "}> */}
                            <div>ADDRESS</div>
                          </th>
                          <th>OPTION</th>
                          <th>
                            {' '}
                            <div style={{ minWidth: 100 }}>VOTING POWER</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ backgroundColor: '#1A3356', color: '#F89D1C' }}>
                        {proposalVotesState?.map((item, idx) => {
                          return (
                            <tr key={item.user_address + idx}>
                              <td>{new Date(item.createdon).toLocaleDateString()}</td>
                              <td style={{ maxWidth: 360 }}>
                                {item.user_address}
                                <br />
                                <div style={{ color: 'darkgrey', fontStyle: 'italic', fontSize: 'small' }}>
                                  signature: {item.signature}
                                </div>
                              </td>
                              <td>{item.summary}</td>
                              <td>{item.voting_power || '0'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </>
              </PollComponentSimple>
            ) : (
              <Placeholder xs={12} className="vh-100" />
            )}
          </div>
        </Container>
      </div>
    </>
  );
};

export default PollDetail;
