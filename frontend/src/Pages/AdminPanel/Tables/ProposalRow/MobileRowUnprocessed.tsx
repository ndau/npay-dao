import { useState } from "react";
import { Button } from "react-bootstrap";
import ApproveOrRejectModal from "./ApproveOrRejectModal/ApproveOrRejectModal";

interface MobileUnprocessedRowPropsI {
  id: number;
  heading: string | null;
}

const MobileRowUnprocessed = (props: MobileUnprocessedRowPropsI) => {
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const handleShowApprove = () => {
    setShowApprove(true);
  };

  const handleCloseReject = (modalOpener: boolean) => {
    setShowApprove(modalOpener);
    setShowReject(modalOpener);
  };
  const handleShowReject = () => setShowReject(true);

  return (
    <>
      <tr>
        <td>
          <div className="d-flex justify-content-center  ">{props.id}</div>
        </td>
        <td>{props.heading}</td>

        <td>
          <div className="d-flex flex-row justify-content-center mt-2">
            <div className="p-2">
              <Button
                style={{ backgroundColor: "green", borderColor: "green" }}
                variant="primary"
                size="sm"
                onClick={handleShowApprove}
              >
                Approve
              </Button>
            </div>
            <div className="p-2">
              <Button
                style={{ backgroundColor: "#F28C28", borderColor: "#F28C28" }}
                variant="primary"
                size="sm"
                onClick={handleShowReject}
              >
                Reject
              </Button>
            </div>
          </div>
        </td>
      </tr>
      {showApprove === true ? (
        <ApproveOrRejectModal
          title={"Are you sure, you want to approve?"}
          isModalOpen={showApprove}
          isApprove={true}
          proposalId={props.id}
          closeModal={handleCloseReject}
        />
      ) : (
        ""
      )}
      {showReject === true ? (
        <ApproveOrRejectModal
          title={"Are you sure, you want to reject?"}
          isModalOpen={showReject}
          isApprove={false}
          proposalId={props.id}
          closeModal={handleCloseReject}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default MobileRowUnprocessed;
