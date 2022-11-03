import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import useNdauConnectStore from "../../../../store/ndauConnect_store";

interface addAdminFormSubmittedDataI {
  adminAddress: string;
}

interface AddAdminProps {
  setTriggerUseEffectCounterState: any;
  triggerUseEffectCounterState: any;
}

const schema = yup.object({
  adminAddress: yup
    .string()
    .required("Admin address is required")
    .matches(
      /^[n][d][a-zA-Z0-9]{46}$/,
      `Should have 48 characters - Should begin with 'nd'`
    ),
});

const AddAdmin = (props: AddAdminProps) => {
  const socket = useNdauConnectStore((state) => state.socket);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [adminAddress, setAdminAddress] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<addAdminFormSubmittedDataI>({ resolver: yupResolver(schema) });

  const onSubmitFunc = (addAdminFormData: addAdminFormSubmittedDataI) => {
    if (socket) {
      setIsModalOpen(true);
      setAdminAddress(addAdminFormData.adminAddress);
    } else {
      toast.warn("Wallet Not Connected");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  async function AddAminApiCall(adminAddress: string) {
    if (socket) {
      try {
        console.log(adminAddress, "adminAddress");

        socket.emit("website-add_admin-request-server", {
          adminAddress,
          website_socket_id: socket.id,
        });

        props.setTriggerUseEffectCounterState(
          props.triggerUseEffectCounterState + 1
        );
        reset();
      } catch (error: any) {
        toast.error(error.response.data.message);
        console.error(error);
      }
    } else {
      toast.warn("Wallet Not Connected");
    }
    setIsModalOpen(false);
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitFunc)}>
        <Card
          style={{
            background: "#1A3356",
            color: "#ffff",
            padding: "10px",
          }}
        >
          <Card.Body>
            <Row>
              <Col>
                <Row>
                  <Form.Control
                    style={{
                      background: "#0F2748",
                      borderColor: "#70707059",
                    }}
                    size="lg"
                    placeholder="Address"
                    {...register("adminAddress")}
                    isInvalid={!!errors}
                  />
                  <p style={{ color: "#FF4433" }}>
                    {errors.adminAddress?.message}
                  </p>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        <Row style={{ paddingTop: "10px" }}>
          <Col>
            <div style={{ justifyContent: "right" }}>
              <Button
                style={{
                  background: "#F89D1C",
                  border: "none",
                  width: "100px",
                }}
                type="submit"
              >
                Add
              </Button>
            </div>
          </Col>
        </Row>
      </form>
      <Modal show={isModalOpen} animation={false}>
        <Modal.Header>
          <Modal.Title>{"Are you sure?"}</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => AddAminApiCall(adminAddress)}
          >
            Add
          </Button>
          <Button variant="secondary" onClick={() => closeModal()}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default AddAdmin;
