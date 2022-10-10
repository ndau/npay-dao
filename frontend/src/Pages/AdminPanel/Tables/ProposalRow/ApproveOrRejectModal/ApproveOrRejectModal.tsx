import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { socketBase } from "../../../../../types/socketTypes";
import useNdauConnectStore from "../../../../../store/ndauConnect_store";

const rejectProposalEvent = "website-proposal_reject-request-server";
const approveProposalEvent = "website-proposal_approve-request-server";

interface modalElementsPropsI {
  proposalId: number;
  title: string;
  isApprove: boolean;
  isModalOpen: boolean;
  closeModal: any;
}

//Api call function is taking a option to check if its rejected or approved then it will call the respected api
const approveOrRejectFunc = async (
  id: number,
  isApprove: boolean,
  closeAllModals: Function,
  _socket: socketBase | null,
  _walletAddress: string
) => {
  if (_socket) {
    if (isApprove) {
      _socket.emit(approveProposalEvent, {
        proposalIdToApprove: id,
        website_socket_id: _socket.id,
        wallet_address: _walletAddress,
      });
      closeAllModals();
    } else {
      _socket.emit(rejectProposalEvent, {
        proposalIdToReject: id,
        website_socket_id: _socket.id,
        wallet_address: _walletAddress,
      });
      closeAllModals();
    }
  } else {
    toast.warning("wallet not connected");
  }
};

const ApproveOrRejectModal = ({
  proposalId,
  isApprove,
  closeModal,
  title,
  isModalOpen,
}: modalElementsPropsI) => {
  const walletAddress = useNdauConnectStore((state) => state.walletAddress);
  const socket = useNdauConnectStore((state) => state.socket);

  return (
    <>
      <Modal show={isModalOpen} animation={false}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() =>
              approveOrRejectFunc(
                proposalId,
                isApprove,
                closeModal,
                socket,
                walletAddress
              )
            }
          >
            Confirm
          </Button>
          <Button variant="secondary" onClick={() => closeModal()}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApproveOrRejectModal;
