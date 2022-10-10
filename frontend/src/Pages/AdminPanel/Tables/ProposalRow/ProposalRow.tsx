import React, { useState, useEffect } from "react";
import { Col, Row, Container, Button } from "react-bootstrap";
import ApproveOrRejectModal from "./ApproveOrRejectModal/ApproveOrRejectModal";
import VotingOptions from "./VotingOption/VotingOption";

interface RowsPropsi {
  id: number;
  heading: string | null;
  summary: string | null;
  voting_options: any;
  votingPeriod: string;
}

let title: string;
let isApprove: boolean;

const Rows = (props: RowsPropsi) => {
  const [isModalOpenState, setIsModalOpenState] = useState(false);

  const openApproveModal = () => {
    title = "Are you sure you want to put this proposal up for voting?";
    isApprove = true;
    setIsModalOpenState(true);
  };

  const openRejectModal = () => {
    title = "Are you sure you want to discard this proposal?";
    isApprove = false;
    setIsModalOpenState(true);
  };

  const closeModalFunc = () => {
    setIsModalOpenState(false);
  };

  return (
    <>
      <tr>
        <td>
          <div className="d-flex justify-content-center  ">{props.id}</div>
        </td>
        <td>{props.heading}</td>
        <td>{props.summary}</td>
        <td className="d-flex justify-content-start">
          <VotingOptions voting_options={props.voting_options} />
        </td>
        <td>{props.votingPeriod}</td>
        <td>
          <div className="d-flex flex-row justify-content-center mt-2">
            <div className="p-2">
              <Button
                style={{ backgroundColor: "green", borderColor: "green" }}
                variant="primary"
                size="sm"
                onClick={openApproveModal}
              >
                Approve
              </Button>
            </div>
            <div className="p-2">
              <Button
                style={{ backgroundColor: "#F28C28", borderColor: "#F28C28" }}
                variant="primary"
                size="sm"
                onClick={openRejectModal}
              >
                Reject
              </Button>
            </div>
          </div>
        </td>
      </tr>

      {isModalOpenState === true ? (
        <ApproveOrRejectModal
          title={title}
          isModalOpen={isModalOpenState}
          isApprove={isApprove}
          proposalId={props.id}
          closeModal={closeModalFunc}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default Rows;
