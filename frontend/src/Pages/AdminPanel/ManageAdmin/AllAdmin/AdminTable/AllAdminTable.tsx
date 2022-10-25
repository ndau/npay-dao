import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import { toast } from "react-toastify";

import useNdauConnectStore from "../../../../../store/ndauConnect_store";

// const admin = "admin";
interface AllAdminProps {
  allAdminData: Array<any>;
  CallAllAdminApi: Function;
}

const AllAdminTable = (props: AllAdminProps) => {
  const socket = useNdauConnectStore((state) => state.socket);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [idState, setIdState] = useState("");

  async function DeleteAdminApiCall(admin_id: string) {
    console.log(admin_id, "delete admin id");
    if (socket) {
      try {
        socket.emit("website-delete_admin-request-server", {
          adminAddress: admin_id,
          website_socket_id: socket.id,
        });
        props.CallAllAdminApi();
      } catch (error) {
        toast.error("Something went wrong. Please try again!");
        console.error(error);
      }
    } else {
      toast.warn("Wallet Not Connected");
    }
  }

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const openModal = (event: any) => {
    if (socket) {
      setIsModalOpen(true);
      setIdState(event);
    } else {
      toast.warn("Wallet Not Connected");
    }
  };

  const handleConfirmDeleteAdmin = () => {
    DeleteAdminApiCall(idState);
    setIsModalOpen(false);
  };

  return (
    <>
      {" "}
      <Table striped bordered hover variant="dark" responsive>
        <thead>
          <tr>
            <th>Id</th>
            <th>Admin Address</th>

            <th>
              <div className="d-flex flex-row justify-content-center">
                Action
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {props.allAdminData &&
            props.allAdminData.map((item: any) => (
              <tr>
                <td>{item.admin_id}</td>
                <td>{item.wallet_address}</td>
                <td>
                  <div className="d-flex flex-row justify-content-center mt-1">
                    <div className="p-1">
                      <Button
                        style={{
                          backgroundColor: "#D22B2B",
                          borderColor: "#D22B2B",
                        }}
                        variant="primary"
                        size="sm"
                        onClick={() => openModal(item.admin_id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      <Modal show={isModalOpen} animation={false}>
        <Modal.Header>
          <Modal.Title>{"Are you sure?"}</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="primary" onClick={handleConfirmDeleteAdmin}>
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
export default AllAdminTable;
