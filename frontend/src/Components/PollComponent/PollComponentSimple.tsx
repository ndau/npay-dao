import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Styles from "./PollComponentStyles.module.css";
import { getHoursAndDaysFromMilliSeconds } from "../../utils/convertMilliSecondsToDays";
// import ClockImg from "../../assets/images/icons/clock.png";
import useMediaQuery from "../../utils/hooks/useMediaQuery";
import { getModulesClasses } from "../../utils/getModulesClasses";

type pollComponentPropsI = {
  pollComponentPropsObj: {
    addedOn: string;
    proposal: string;
    summary: string;
    closingOn: string;
    votingOptions:
      | string[]
      | {
          [key: string]: string;
        };
    totalVotes: number;
    isActive: boolean;
    proposalId: number;
  };
  children: JSX.Element | JSX.Element[];
};

const PollComponentSimple = (props: pollComponentPropsI) => {
  const isSmall = useMediaQuery("(max-width: 660px)");

  const pollComponentPropsObj = props.pollComponentPropsObj;
  const children = props.children;

  // let votingOptionsArray = [];
  // if (Array.isArray(pollComponentPropsObj.votingOptions)) {
  //   votingOptionsArray = pollComponentPropsObj.votingOptions;
  // } else {
  //   votingOptionsArray = Object.values(pollComponentPropsObj.votingOptions);
  // }

  const addedOn: Date = new Date(pollComponentPropsObj.addedOn);
  const closingOn: Date = new Date(pollComponentPropsObj.closingOn);
  let isActive = pollComponentPropsObj.isActive;
  let proposal = pollComponentPropsObj.proposal;
  let summary = pollComponentPropsObj.summary;

  const timeRemaining = getHoursAndDaysFromMilliSeconds(
    closingOn.getTime() - Date.now()
  );

  let status = `concluded`;
  let statusText = "Concluded";
  let size = "";
  if (isActive) {
    statusText = "Active";
    status = `active`;
  }
  if (isSmall) size = "small";

  let astr = getModulesClasses(["statusText", status, size], Styles);

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
          <p className={astr}>{statusText}</p>
        </Badge>
      </Card.Header>

      <Card.Body className={Styles.pollComponentCardBody}>
        <Card.Title className={Styles.proposal}>{proposal}</Card.Title>
        {!isSmall && (
          <Card.Subtitle className={Styles.summary}>{summary}</Card.Subtitle>
        )}

        {isActive && (
          <p className={Styles.remaining}>
            <img src="assets/images/icons/clock.png" className={Styles.timeRemainingIcon} alt=""/>
            {`${timeRemaining} REMAINING`}
          </p>
        )}
      </Card.Body>

      {children}
    </Card>
  );
};

export default PollComponentSimple;
