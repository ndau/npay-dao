import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Styles from "./PollComponentStyles.module.css";
import { getHoursAndDaysFromMilliSeconds } from "../../utils/convertMilliSecondsToDays";
import { getModulesClasses } from "../../utils/getModulesClasses";
import VoteOption from "./VoteOption/VoteOption";
import ClockImg from "../../assets/images/icons/clock.png";
import { useEffect, useState } from "react";
import useMediaQuery from "../../utils/hooks/useMediaQuery";
import { useNavigate } from "react-router-dom";
import VoteButton from "../VoteButton/VoteButton";
import {
  destructuredPollComponentValuesI,
  pollComponentProps,
} from "./PollComponent_types";
import { indexOfMax } from "../../utils/indexOfMax";
import useNdauConnectStore from "../../store/ndauConnect_store";

const PollComponent = (pollComponentPropsObj: pollComponentProps) => {
  const [selectedVoteOptionIndexState, setSelectedVoteOptionIndexState] =
    useState<number | undefined>();

  const votingOptionsTextArray = Object.values(
    pollComponentPropsObj.votingOptionsHeadings
  );

  const votingOptionsIdArray = Object.keys(
    pollComponentPropsObj.votingOptionsHeadings
  );

  const {
    proposal,
    summary,
    proposalId,
    isActive,
    totalVotes,
    isHideVoteButton,
  }: destructuredPollComponentValuesI = pollComponentPropsObj;

  const addedOn: Date = new Date(pollComponentPropsObj.addedOn);
  const closingOn: Date = new Date(pollComponentPropsObj.closingOn);

  const isSmall = useMediaQuery("(max-width: 768px)");

  let hasVoted =
    pollComponentPropsObj.hasUserAlreadyVotedObj &&
    pollComponentPropsObj.hasUserAlreadyVotedObj.status;

  const timeRemaining = getHoursAndDaysFromMilliSeconds(
    closingOn.getTime() - Date.now()
  );

  let status = `concluded`;
  let statusText = "Concluded";
  let size = "";
  let flexEndClass = "";
  if (isHideVoteButton) flexEndClass = "flex-end";

  if (isActive) {
    statusText = "Active";
    status = `active`;
  }
  if (isSmall) {
    size = "small";
  }

  let selectedVoteOptionId;
  if (selectedVoteOptionIndexState !== undefined)
    selectedVoteOptionId = Number(
      votingOptionsIdArray[selectedVoteOptionIndexState]
    );

  const navigate = useNavigate();

  useEffect(() => {
    let votesCastArray: number[] = [];
    let mostVotesIndex: number | undefined;

    if (!isActive) {
      votesCastArray = Object.values(
        pollComponentPropsObj.votingOptionsVotesCast
      );
      mostVotesIndex = indexOfMax(votesCastArray);

      setSelectedVoteOptionIndexState(mostVotesIndex);
    }

    const userVotedForOptionId =
      pollComponentPropsObj.hasUserAlreadyVotedObj?.voting_option_id;

    if (userVotedForOptionId) {
      let voteCastIndex = votingOptionsIdArray.findIndex(
        (item) => Number(item) === userVotedForOptionId
      );
      if (voteCastIndex === -1) return;
      else {
        console.log(voteCastIndex, "voteCastIndex");
        setSelectedVoteOptionIndexState(voteCastIndex);
      }
    }
  }, [pollComponentPropsObj.hasUserAlreadyVotedObj]);

  return (
    <Card className={Styles.pollComponentCard}>
      <Card.Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          border: "none",
        }}
      >
        <p
          className={getModulesClasses(
            ["pollComponentCard", "pollComponentHeader"],
            Styles
          )}
        >
          {"POSTED " + addedOn.toUTCString().toLocaleUpperCase()}
        </p>
        <Badge
          bg="dark"
          className={getModulesClasses(["statusBadge", status, size], Styles)}
        >
          <div
            className={getModulesClasses(["statusLight", status, size], Styles)}
          />
          <p
            className={getModulesClasses(["statusText", status, size], Styles)}
          >
            {statusText}
          </p>
        </Badge>
      </Card.Header>
      <Card.Body className={Styles.pollComponentCardBody}>
        <Card.Title className={Styles.proposal}>{proposal}</Card.Title>
        {!isSmall && (
          <Card.Subtitle className={Styles.summary}>{summary}</Card.Subtitle>
        )}

        {isActive && (
          <p className={Styles.remaining}>
            <img src={ClockImg} className={Styles.timeRemainingIcon} />
            {`${timeRemaining} REMAINING`}
          </p>
        )}

        <div>
          {votingOptionsTextArray.map((item, index) => (
            <div
              onClick={
                !isActive || hasVoted
                  ? undefined
                  : () => setSelectedVoteOptionIndexState(index)
              }
            >
              <VoteOption
                voteOptionSummary={item}
                selected={index === selectedVoteOptionIndexState}
              />
            </div>
          ))}
        </div>
      </Card.Body>
      <hr style={{ color: "#FFFFFF", width: "90%", margin: "auto" }}></hr>
      <Card.Footer className={Styles.cardFooter}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p className={Styles.totalVotersText}>Total Voters </p>
          <p style={{ textAlign: "center" }}>{totalVotes}</p>
        </div>
        <div
          className={getModulesClasses(
            ["voteButtonsContainer", flexEndClass, size],
            Styles
          )}
        >
          <Button
            onClick={() => navigate(`/poll-detail/${proposalId}`)}
            className={getModulesClasses([size, status], Styles)}
            variant="secondary"
          >
            View
          </Button>
          {isActive &&
            // Need to ensure selectedVoteOptionIdState is not undefined, as index 0 is valid, but is a falsy value
            (hasVoted ? (
              <Button
                style={{
                  marginTop: 0,
                  backgroundColor: "#F89D1C",
                  border: "#0A1D35",
                }}
                disabled
              >
                Voted
              </Button>
            ) : (
              !isHideVoteButton && (
                <VoteButton
                  selectedVoteOptionId={selectedVoteOptionId}
                  dynamicClassName={getModulesClasses([size], Styles)}
                />
              )
            ))}
        </div>
      </Card.Footer>
    </Card>
  );
};

export default PollComponent;
