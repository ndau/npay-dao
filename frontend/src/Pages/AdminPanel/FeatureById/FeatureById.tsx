import { toast } from "react-toastify";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useNdauConnectStore from "../../../store/ndauConnect_store";

interface FeatureFormI {
  proposalId: number;
}

const schema = yup.object({
  proposalId: yup.number().required("id is required & should be a number"),
});

const FeatureById = () => {
  const socket = useNdauConnectStore((state) => state.socket);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeatureFormI>({ resolver: yupResolver(schema) });

  const onSubmitFunc = ({ proposalId }: FeatureFormI) => {
    if (socket) {
      console.log(proposalId, "featureFormSubmittedData");
      reset();
      socket.emit("website-feature_proposal-request-server", {
        proposalIdToFeature: proposalId,
        website_socket_id: socket.id,
      });
    } else {
      toast.warn("Wallet Not Connected");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitFunc)}>
        <h4 style={{ color: "#ffff" }}>Feature By Id</h4>
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
                    placeholder="ID"
                    {...register("proposalId")}
                    isInvalid={!!errors}
                  />
                  <p style={{ color: "#FF4433" }}>
                    {errors.proposalId?.message}
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
                Approve
              </Button>
            </div>
          </Col>
        </Row>
      </form>
    </>
  );
};

export default FeatureById;
