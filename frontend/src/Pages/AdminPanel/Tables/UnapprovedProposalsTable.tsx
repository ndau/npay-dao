import ProposalRow from "./ProposalRow/ProposalRow";
import MobileRowUnprocessed from "./ProposalRow/MobileRowUnprocessed";
import Table from "react-bootstrap/Table";
import useMediaQuery from "../../../utils/hooks/useMediaQuery";
import "./Pagination.css";
import Placeholder from "react-bootstrap/Placeholder";
interface TablePropsI {
  currentUnapprovedProposalsArr: Array<any>;
}
const UnapprovedProposalsTable = ({
  currentUnapprovedProposalsArr,
}: TablePropsI) => {
  const MobileBreakPoint = useMediaQuery("(min-width: 576px)");
  return (
    <>
      {MobileBreakPoint ? (
        <Table responsive striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>
                <div className="d-flex justify-content-left">ID</div>
              </th>
              <th>
                {" "}
                <div className="d-flex justify-content-left">Heading</div>
              </th>
              <th>
                {" "}
                <div className="d-flex justify-content-left">Summary</div>
              </th>
              <th>
                {" "}
                <div className="d-flex justify-content-left">
                  Voting Options
                </div>
              </th>
              <th>
                {" "}
                <div className="d-flex justify-content-left">Voting Period</div>
              </th>
              <th>
                {" "}
                <div className="d-flex justify-content-center">Aproval</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <>
              {currentUnapprovedProposalsArr.length > 0 ? (
                <>
                  {currentUnapprovedProposalsArr.map((item, index) => {
                    let votingOptions =
                      item.voting_options_headings || item.voting_options;
                    let proposal_text = item.heading || item.proposal_heading;
                    return (
                      <ProposalRow
                        id={item.proposal_id}
                        heading={proposal_text}
                        summary={item.summary}
                        voting_options={votingOptions}
                        votingPeriod={item.votingPeriod}
                      />
                    );
                  })}{" "}
                </>
              ) : (
                <Placeholder xs={12} className="vh-100" />
              )}
            </>
          </tbody>
        </Table>
      ) : (
        <Table responsive striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>
                {" "}
                <div className="d-flex justify-content-left">ID</div>
              </th>
              <th>
                {" "}
                <div className="d-flex justify-content-left">Heading</div>
              </th>
              <th>
                {" "}
                <div className="d-flex justify-content-center">Aproval</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentUnapprovedProposalsArr.map((item, index) => {
              let votingOptions =
                item.voting_options_headings || item.voting_options;
              let proposal_text = item.heading || item.proposal_heading;
              return (
                <MobileRowUnprocessed
                  id={item.proposal_id}
                  heading={proposal_text}
                />
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
};
export default UnapprovedProposalsTable;
