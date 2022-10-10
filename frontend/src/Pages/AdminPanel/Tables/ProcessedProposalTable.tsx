import React, { useEffect, useState } from "react";
import ProposalRowUnprocessed from "./ProposalRow/ProposalRowUnprocessed";
import ResponsiveRowProcessed from "./ProposalRow/MobileRowProcessed";
import Table from "react-bootstrap/Table";
import Placeholder from "react-bootstrap/Placeholder";
import "./Pagination.css";

import useMediaQuery from "../../../utils/hooks/useMediaQuery";

interface TableProps {
  apiData: Array<any>;
}

const ProcessedProposalsTable = (props: TableProps) => {
  const MobileBreakPoint = useMediaQuery("(min-width: 576px)");
  const itemsPerPage = 5;
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [pageCount, setPageCount] = useState(0);

  // We start with an empty list of items.

  // Here we use item offsets; we could also use page offsets
  // following the API or data you're working with.
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    // Fetch items from another resources.
    const endOffset = itemOffset + itemsPerPage;

    if (props.apiData) {
      setCurrentItems(props.apiData.slice(itemOffset, endOffset));
      setPageCount(Math.ceil(props.apiData.length / itemsPerPage));
    }
  }, [itemOffset, itemsPerPage, props.apiData]);

  // Invoke when user click to request another page.
  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % props.apiData.length;

    setItemOffset(newOffset);
  };

  return (
    <>
      {" "}
      {MobileBreakPoint ? (
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
                <div className="d-flex justify-content-center">
                  Voting Period
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <>
              {currentItems.map((item, index) => {
                let votingOptions =
                  item.voting_options_headings || item.voting_options;

                let proposal_text = item.heading || item.proposal_heading;

                return (
                  <ProposalRowUnprocessed
                    id={item.proposal_id}
                    heading={proposal_text}
                    summary={item.summary}
                    voting_options={votingOptions}
                    votingPeriod={item.votingPeriod}
                  />
                );
              })}
            </>
          </tbody>
        </Table>
      ) : (
        <Table responsive striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>
                {" "}
                <div className="d-flex justify-content-center">ID</div>
              </th>
              <th>
                {" "}
                <div className="d-flex justify-content-center">Heading</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => {
              let votingOptions =
                item.voting_options_headings || item.voting_options;

              let proposal_text = item.heading || item.proposal_heading;

              return (
                <ResponsiveRowProcessed
                  id={item.proposal_id}
                  heading={proposal_text}
                />
              );
            })}
          </tbody>
        </Table>
      )}
      {/* <Items currentItems={currentItems} /> */}
    </>
  );
};
export default ProcessedProposalsTable;
