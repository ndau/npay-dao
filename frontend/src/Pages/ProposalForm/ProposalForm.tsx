import { useState } from "react";
import Card from "react-bootstrap/Card";
import { Container } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { axiosRequest } from "../../api/api";
import { toast } from "react-toastify";
import VoteOption from "./votingOption/votingOption";
import useNdauConnectStore from "../../store/ndauConnect_store";
import { AxiosError } from "axios";

const submitProposalURL = "proposal";

const helperTextClass = {
  fontSize: 14,
  color: "grey",
  margin: 0,
};

interface FormInputsI {
  heading: string;
  summary: string;
  votingPeriod: string;
  walletAddress?: string;
}

const votingPeriodRegex =
  /^([1-9][yY])$|^(\b([1-9]|1[0-1])months|[1]month)$|^(\b(|[1-3][wW]))$|^(\b([1-9]|[12][0-9]|3[01])[dD]\b)$|^(\b([1-9]|1[0-9]|2[0-3])[hH]\b)$|(^\b([1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])[mM]\b$)|^(([1-9][yY])\W(\b([1-9]|1[0-1])months|[1]month))$|^(([1-9][yY])\W(\b([1-9]|1[0-1])months|[1]month))\W([1-3][wW])$|^(([1-9][yY])\W(\b([1-9]|1[0-1])months|[1]month)\W([1-3][wW])\W(([1-9]|[12][0-9]|3[01])[dD]))$|^(([1-9][yY])\W(\b([1-9]|1[0-1])months|[1]month)\W([1-3][wW])\W(([1-9]|[12][0-9]|3[01])[dD])\W(([1-9]|1[0-9]|2[0-3])[hH]))$|^(([1-9][yY])\W(\b([1-9]|1[0-1])months|[1]month)\W([1-3][wW])\W(([1-9]|[12][0-9]|3[01])[dD])\W(([1-9]|1[0-9]|2[0-3])[hH])\W(([1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])[mM]))$|^((\b([1-9]|1[0-1])months|[1]month)\W([1-3][wW])\W(([1-9]|[12][0-9]|3[01])[dD])\W(([1-9]|1[0-9]|2[0-3])[hH])\W(([1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])[mM]))$|^(([1-3][wW])\W(([1-9]|[12][0-9]|3[01])[dD])\W(([1-9]|1[0-9]|2[0-3])[hH])\W(([1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])[mM]))$|^((([1-9]|[12][0-9]|3[01])[dD])\W(([1-9]|1[0-9]|2[0-3])[hH])\W(([1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])[mM]))$|^((([1-9]|1[0-9]|2[0-3])[hH])\W(([1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])[mM]))$|^(([1-9]|1[0-1])months|[1]month\W[1-3][wW])$|^(([1-9]|1[0-1])months|[1]month\W([1-3][wW])\W([1-9]|[12][0-9]|3[01])[dD])$|^(([1-3][wW])\W([1-9]|[12][0-9]|3[01])[dD])$|^(([1-9]|[12][0-9]|3[01])[dD]\W(([1-9]|1[0-9]|2[0-3])[hH]))$|^((([1-9]|1[0-9]|2[0-3])[hH])\W(([1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])[mM]))$|^(([1-9]|1[0-1])months|[1]month)\W(([1-9]|[12][0-9]|3[01])[dD])$|^(([1-9]|1[0-1])months|[1]month)\W([1-3][wW])$|^(([1-9]|1[0-1])months|[1]month)\W([1-3][wW])\W(([1-9]|[12][0-9]|3[01])[dD])$/;

const schema = yup.object({
  heading: yup.string().required("Heading is  required"),
  summary: yup.string(),
  votingPeriod: yup
    .string()
    .required("Voting period is required")
    .matches(votingPeriodRegex, "Check your entry matches the time format"),
});

const ProposalForm = () => {
  const walletAddress = useNdauConnectStore((state) => state.walletAddress);

  const [optionArrayState, setOptionArrayState] = useState<String[]>(["", ""]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputsI>({ resolver: yupResolver(schema) });

  const proposalSubmitPostFunc = async (proposalSpec: FormInputsI) => {
    try {
      const response = await axiosRequest("post", submitProposalURL, {
        heading: proposalSpec.heading,
        summary: proposalSpec.summary,
        votingPeriod: proposalSpec.votingPeriod,
        votingOptions: optionArrayState,
        walletAddress: proposalSpec.walletAddress,
      });

      toast.success(response.data.message);
      reset();
      setOptionArrayState(["", ""]);
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data.message);
      } else {
        console.log("Unexpected error", err);
      }
    }
  };

  const onSubmitFunc = (proposalSpec: FormInputsI) => {
    proposalSpec.walletAddress = walletAddress;
    if (walletAddress) {
      proposalSubmitPostFunc(proposalSpec);
    } else {
      toast.warning("Wallet Not Connected");
    }
  };

  return (
    <>
      <div style={{ backgroundColor: "#0B2140" }} className="shadow-lg">
        <Container
          className="proposal-container"
          fluid="lg"
          style={{ padding: "10px", paddingTop: "20px", minHeight: "80vh" }}
        >
          <form onSubmit={handleSubmit(onSubmitFunc)}>
            <h4 style={{ color: "#ffff" }}>Add New Polls</h4>
            <Card
              style={{
                background: "#1A3356",
                color: "#fff",
                padding: 5,
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
                        placeholder="Add Title"
                        {...register("heading")}
                        isInvalid={!!errors}
                      />
                      <p style={{ color: "#FF4433" }}>
                        {errors.heading?.message}
                      </p>
                    </Row>
                    <Row>
                      <Form.Control
                        style={{
                          background: "#0F2748",
                          borderColor: "#70707059",
                        }}
                        size="lg"
                        placeholder="Duration/Period"
                        {...register("votingPeriod")}
                        isInvalid={!!errors}
                      />
                      <p style={{ color: "#FF4433", margin: 0 }}>
                        {errors.votingPeriod?.message}
                      </p>
                      <p style={helperTextClass}>
                        {" "}
                        time format should be (1-9y 1-11month/s 1-3w 1-31d 1-23h
                        1-59m)
                      </p>
                      <p style={helperTextClass}>y=Year from 1-9</p>
                      <p style={helperTextClass}> months=month from 1-11</p>
                      <p style={helperTextClass}> w=weeks from 1-3</p>
                      <p style={helperTextClass}>d= days from 1-31</p>
                      <p style={helperTextClass}>h=hours from 1-23</p>
                      <p style={helperTextClass}>m=minutes from 1-59</p>
                    </Row>
                  </Col>
                  <Col>
                    <Form.Control
                      style={{
                        background: "#0F2748",
                        borderColor: "#70707059",
                      }}
                      as="textarea"
                      // ref={summaryRef}
                      rows={4}
                      placeholder="Description/Summary"
                      {...register("summary")}
                    />
                  </Col>
                </Row>
                <VoteOption
                  votingOptionSetter={setOptionArrayState}
                  votingOption={optionArrayState}
                />
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
                    Publish
                  </Button>
                </div>
              </Col>
            </Row>
          </form>
        </Container>
      </div>
    </>
  );
};
export default ProposalForm;
