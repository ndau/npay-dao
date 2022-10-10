import React, { useState } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

interface votingOptionProps {
  votingOptionSetter: any;
  votingOption: String[];
}

const VotingOption = (props: votingOptionProps) => {
  const handleAnswerField = () => {
    props.votingOptionSetter([...props.votingOption, ""]);
  };

  const handleChangeOPtions = (e: any, index: any) => {
    const clone = [...props.votingOption];
    let obj = clone[index];
    obj = e.target.value;
    clone[index] = obj;
    props.votingOptionSetter([...clone]);
  };

  const handleRemoveOptions = (i: any) => {
    if (props.votingOption.length > 2) {
      props.votingOptionSetter(
        props.votingOption.filter((item: any, index: any) => index != i)
      );
    }
  };

  return (
    <>
      <hr style={{ color: "#0096FF", width: "100%" }}></hr>
      <h6
        style={{
          color: "#ffff",
          opacity: "60%",
          paddingTop: "5px",
        }}
      >
        Answers:
      </h6>
      {props.votingOption &&
        props.votingOption.map((item: any, index: string | number) => (
          <Row>
            <Col lg={8} md={8} sm={8} xs={8}>
              <Form.Control
                style={{
                  background: "#181F28",
                  borderColor: "#1A2F4A",
                }}
                size="lg"
                required
                value={item}
                placeholder="Voting Options"
                onChange={(e) => handleChangeOPtions(e, index)}
                // isInvalid={!!errors}
              />
              <p style={{ color: "#FF4433" }}></p>
            </Col>
            <Col lg={2} md={2} sm={2} xs={2}>
              <Button
                style={{
                  background: "#1A3356",
                  border: "#1A3356",
                  color: "#FF6363",
                  marginTop: "10px",
                }}
                onClick={(e) => handleRemoveOptions(index)}
              >
                Delete
              </Button>
            </Col>
          </Row>
        ))}
      <Button
        style={{
          background: "#808080",
          border: "none",
          width: "150px",
        }}
        onClick={handleAnswerField}
      >
        Add New Option
      </Button>
    </>
  );
};
export default VotingOption;
