import { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "react-bootstrap/Modal";
import { QRCodeSVG } from "qrcode.react";
import "./modal.css";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
// import WalletIcon from "../../../assets/images/icons/iconsWallet.png";
import useAdminPanelRefreshStore from "../../../store/adminPanelRefresh_store";
import useNdauConnectStore from "../../../store/ndauConnect_store";
import { baseURL } from "../../../api/api";
import { axiosRequest } from "../../../api/api";

const ndauConnectApi = baseURL.slice(0, -4);
let socket: any;

export const socketEmit = (event, data) => {
  if (socket) {
    socket.emit(event, data);
  }
};

function NdauConnect(props) {
  const [socketObjectState, setSocketObjectState] = useState<any>({});
  const [isModalOpenState, setIsModalOpenstate] = useState(false);
  const action = props.action;

  const updateWalletAddress = useNdauConnectStore(
    (state) => state.updateWalletAddress
  );
  const walletAddress = useNdauConnectStore((state) => state.walletAddress);
  const updateTransactions = useNdauConnectStore(
    (state) => state.updateTransactions
  );
  const setVoted = useNdauConnectStore((state) => state.setVoted);

  const setSocket = useNdauConnectStore((state) => state.setSocket);
  const getAdmin = useNdauConnectStore((state) => state.getIsAdmin);
  const getSuperAdmin = useNdauConnectStore((state) => state.getIsSuperAdmin);

  const handleClose = () => setIsModalOpenstate(false);
  const handleShow = () => {
    setIsModalOpenstate(true);
  };

  const handleClick = async () => {
    socketEmit("ndau_burn_wallet_connect", {
      website_socket_id: socket.id,
      app_socket_id: "31231",
      action: "burn",
      wallet_address: "ndau11DD92Ab8acd3Ce5741523C447B18821e7bba8",
    });
    // const resp = await axiosRequest(
    //   "get",
    //   "proposal/test",
    //   {},
    //   {
    //     walletAddress: "10391230213",
    //     walletName: "Liliane",
    //   }
    // );

    // console.log(resp);
  };

  useEffect(() => {
    socket = io(ndauConnectApi);

    console.log(socket, "socket");
    if (socket) {
      //even though socket is initialized here, it is not accessible via the global store until socket connection with wallet is established
      socket.on(
        "server-ndau_connection-established-website",
        async ({ walletAddress: _walletAddress }) => {
          console.log("received wallet connect event");
          updateWalletAddress(_walletAddress);
          getAdmin();
          getSuperAdmin();

          const resp = await axiosRequest(
            "get",
            "admin/ndau_conversion",
            {},
            {
              ndau_address: _walletAddress,
            }
          );
          if (resp.data.status === true) {
            updateTransactions(resp.data.result);
          }
        }
      );
      socket.on("ndau_burn_reject", ({}) => {
        console.log("request rejected");
        toast.error("Conversion Failed.", { position: "top-left" });
      });

      socket.on(
        "ndau_burn_approve",
        async ({ walletAddress: _walletAddress }) => {
          toast.success("Conversion Success.", { position: "top-left" });

          console.log("received wallet connect event");
          updateWalletAddress(_walletAddress);
          getAdmin();
          getSuperAdmin();

          const resp = await axiosRequest(
            "get",
            "admin/ndau_conversion",
            {},
            {
              ndau_address: _walletAddress,
            }
          );
          if (resp.data.status === true) {
            updateTransactions(resp.data.result);
          }
        }
      );

      socket.on("website-proposal_approve-request-server", ({}) => {
        console.log("request confirmed");
        toast.success("Requet Confirm", { position: "top-left" });

        socket.emit("ndau_burn_confirm");
      });
      //vote
      socket.on(
        "server-vote_create-fulfilled-website",
        ({
          walletAddress,
          proposal_id,
          proposal_heading,
          voting_option_heading,
        }) => {
          toast.success("Voted!");
          setVoted(true, proposal_id);
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

      socket.on("server-feature_proposal-denied-website", ({ proposalId }) => {
        toast.warn("Proposal: " + proposalId + " Feature Denied");
      });

      socket.on("server-feature_proposal-failed-website", ({ proposalId }) => {
        toast.error(
          "Something went wrong. Couldn't Feature Proposal: " + proposalId
        );
      });
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
      socket.on("server-delete_admin-fulfilled-website", ({ adminAddress }) => {
        console.log("admin Address deleted:" + adminAddress);
        useAdminPanelRefreshStore.getState().refreshAllAdminStateFunc();
        toast.success("Admin: " + adminAddress + " Deleted!");
      });

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

      socket.on("server-proposal_approve-denied-website", ({ proposalId }) => {
        toast.warn("Proposal:" + proposalId + " approval denied");
      });

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

      socket.on("server-proposal_approve-failed-website", ({ proposalId }) => {
        toast.error("Proposal:" + proposalId + " failed to approve");
      });

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
    setSocketObjectState(socket);
  }, []);

  let qrCodeValue = JSON.stringify({
    website_socket_id: socketObjectState.id,
    website_url: window.location.href,
    website_title: "ndau_dao",
    request: "login",
    action,
  });

  return (
    <>
      <Button
        onClick={handleShow}
        variant="contained"
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
          backgroundColor: "#b6a6e6",
          height: "40px",
          width: "10vw",
          "&:hover": {
            color: "#E6E6E6",
            backgroundColor: "#957EDB",
          },
        }}
      >
        {walletAddress ? (
          `${walletAddress.slice(0, 10)}...`
        ) : (
          <>{"Wallet Connect"}</>
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
            <QRCodeSVG value={qrCodeValue} size={218} includeMargin />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClick}>Test</Button>
          <Button onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NdauConnect;
