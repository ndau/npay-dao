import { useEffect, useState, useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { QRCodeSVG } from "qrcode.react";
import useNdauConnectStore from "../../../store/ndauConnect_store";
import "./modal.css";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
// import WalletIcon from "../../../assets/images/icons/iconsWallet.png";
import useAdminPanelRefreshStore from "../../../store/adminPanelRefresh_store";
import { baseURL } from "../../../api/api";

const ndauConnectApi = baseURL.slice(0, -4);

function NdauConnect() {
  const [socketObjectState, setSocketObjectState] = useState<any>({});
  const [isModalOpenState, setIsModalOpenstate] = useState(false);

  const updateWalletAddress = useNdauConnectStore(
    (state) => state.updateWalletAddress
  );
  const walletAddress = useNdauConnectStore((state) => state.walletAddress);

  console.log(walletAddress, "walletAddress");
  const setSocket = useNdauConnectStore((state) => state.setSocket);
  const getAdmin = useNdauConnectStore((state) => state.getIsAdmin);
  const getSuperAdmin = useNdauConnectStore((state) => state.getIsSuperAdmin);

  const handleClose = () => setIsModalOpenstate(false);
  const handleShow = () => {
    setIsModalOpenstate(true);
  };
  // const ws = useRef<{socket: Socket}>(null);

  useEffect(() => {
    const socket = io(ndauConnectApi);

    console.log(socket, "socket");

    //even though socket is initialized here, it is not accessible via the global store until socket connection with wallet is established
    socket.on(
      "server-ndau_connection-established-website",
      ({ walletAddress: _walletAddress }) => {
        updateWalletAddress(_walletAddress);
        getAdmin();
        getSuperAdmin();
        toast.success("Wallet Connected", { position: "top-left" });

        //vote
        socket.on(
          "server-vote_create-fulfilled-website",
          ({ walletAddress, proposal_heading, voting_option_heading }) => {
            toast.success("Voted!");
            useAdminPanelRefreshStore.getState().refreshProposalDetailFunc();
          }
        );

        socket.on(
          "server-create_vote-failed-website",
          ({ walletAddress, proposal_heading, voting_option_heading }) => {
            toast.error("Something went wrong. Couldn't vote");
          }
        );

        socket.on(
          "server-vote_create-rejected-website",
          ({ walletAddress, proposal_heading, voting_option_heading }) => {
            toast.warn("User rejected casting vote");
          }
        );

        //feature proposal
        socket.on(
          "server-feature_proposal-fulfilled-website",
          ({ proposalId }) => {
            toast.success("Featured id successful");
            console.log("refresh");

            useAdminPanelRefreshStore
              .getState()
              .refreshUnapprovedProposalListFunc();
          }
        );

        socket.on(
          "server-feature_proposal-denied-website",
          ({ proposalId }) => {
            toast.warn("Proposal: " + proposalId + " Feature Denied");
          }
        );

        socket.on(
          "server-feature_proposal-failed-website",
          ({ proposalId }) => {
            toast.error(
              "Something went wrong. Couldn't Feature Proposal: " + proposalId
            );
          }
        );
        //feature proposal /////////////////////////////////

        //add admin
        socket.on("server-add_admin-fulfilled-website", ({ adminAddress }) => {
          useAdminPanelRefreshStore.getState().refreshAllAdminStateFunc();
          toast.success(
            "Admin: \n" + adminAddress.slice(0, 13) + "..." + "\n Added!"
          );
        });

        socket.on("server-add_admin-denied-website", ({ adminAddress }) => {
          toast.warn(
            "Adding Admin: \n" +
              adminAddress.slice(0, 13) +
              "..." +
              "\n Denied By User "
          );
        });

        socket.on("server-add_admin-failed-website", ({ adminAddress }) => {
          toast.error(
            "Something went wrong. Couldn't Add Admin: \n" +
              adminAddress.slice(0, 13) +
              "..."
          );
        });
        //add admin/////////////////////////////////

        //delete admin
        socket.on(
          "server-delete_admin-fulfilled-website",
          ({ adminAddress }) => {
            console.log("admin Address deleted:" + adminAddress);
            useAdminPanelRefreshStore.getState().refreshAllAdminStateFunc();
            toast.success("Admin: " + adminAddress + " Deleted!");
          }
        );

        socket.on("server-delete_admin-denied-website", ({ adminAddress }) => {
          toast.warn("Deleting Admin: " + adminAddress + " - Denied By User ");
        });

        socket.on("server-delete_admin-failed-website", ({ adminAddress }) => {
          toast.error(
            "Something went wrong. Couldn't Delete Admin: " + adminAddress
          );
        });
        //delete admin/////////////////////////////////

        // approve proposal

        socket.on(
          "server-proposal_approve-denied-website",
          ({ proposalId }) => {
            toast.warn("Proposal:" + proposalId + " approval denied");
          }
        );

        socket.on(
          "server-proposal_approve-fulfilled-website",
          ({ proposalId }) => {
            toast.success("Proposal:" + proposalId + " approved!");
            console.log("refresh");
            useAdminPanelRefreshStore
              .getState()
              .refreshUnapprovedProposalListFunc();
          }
        );

        socket.on(
          "server-proposal_approve-failed-website",
          ({ proposalId }) => {
            toast.error("Proposal:" + proposalId + " failed to approve");
          }
        );

        //approve proposal /////////

        // reject proposal

        socket.on("server-proposal_reject-denied-website", ({ proposalId }) => {
          toast.warn("Proposal:" + proposalId + " reject denied");
        });

        socket.on(
          "server-proposal_reject-fulfilled-website",
          ({ proposalId }) => {
            toast.success("Proposal:" + proposalId + " rejected!");

            console.log("refresh");
            useAdminPanelRefreshStore
              .getState()
              .refreshUnapprovedProposalListFunc();
          }
        );

        socket.on("server-proposal_reject-failed-website", ({ proposalId }) => {
          toast.error("Proposal:" + proposalId + " failed to reject");
        });

        //reject proposal /////////

        ///////
        socket.emit("website-ndau_connection-established-server", {
          is_login_successful: true,
          website_socket_id: socket.id,
        });

        setSocket(socket);

        handleClose();
      }
    );

    setSocketObjectState(socket);
  }, []);

  let qrCodeValue = JSON.stringify({
    website_socket_id: socketObjectState.id,
    website_url: window.location.href,
    website_title: "ndau_dao",
    request: "login",
  });

  return (
    <>
      <Button
        variant="primary"
        style={{
          background: "#F89D1C",
          border: "#0A1D35",
          marginBottom: "10px",
        }}
        onClick={handleShow}
      >
        {walletAddress ? (
          `${walletAddress.slice(0, 10)}...`
        ) : (
          <>
            {" "}
            <img src="assets/images/icons/iconsWallet.png" style={{ height: "25px", marginBottom: 2 }} alt=""/>
            {" Connect Wallet"}
          </>
        )}
      </Button>

      <Modal
        className="ndauConnect"
        centered
        show={isModalOpenState}
        onHide={handleClose}
      >
        <Modal.Header closeButton>
          <Modal.Title className="ndauConnect">
            Connect with Ndau Wallet
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="qrcode-box">
            <QRCodeSVG value={qrCodeValue} size={256} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NdauConnect;
