import React, { useState } from "react";
import { Button, Container, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AddAdmin from "./AddAdmin/AddAdmin";
import AllAdmin from "./AllAdmin/AllAdmin";
import Arrow from "../../../assets/images/icons/backArrow.svg";

const ManageAdmin = () => {
  const [triggerUseEffectCounterState, setTriggerUseEffectCounterState] =
    useState(0);

  const navigate = useNavigate();

  const navigateFunc = () => {
    navigate("/admin");
  };

  return (
    <>
      <div style={{ backgroundColor: "#0B2140" }} className="shadow-lg">
        <Container
          fluid="lg"
          style={{ padding: "10px", paddingTop: "20px", minHeight: "80vh" }}
        >
          <h4
            className="d-flex justify-content-center"
            style={{ color: "#ffff" }}
          >
            Manage Admin
          </h4>
          <div className="d-flex justify-content-start">
            <Button
              style={{
                backgroundColor: "#0F2748",
                border: "none",
                color: "#DBE0E8",
                marginTop: -10,
              }}
              className="my-2"
              onClick={navigateFunc}
            >
              <img
                src={Arrow}
                style={{ height: "20px", marginRight: "10px" }}
              />
              {"    Back"}
            </Button>
          </div>
          <Tabs
            defaultActiveKey={"All-Admin"}
            id="fill-tab-example"
            fill
            style={{
              fontWeight: 700,
            }}
          >
            <Tab eventKey="All-Admin" title="All Admin">
              <AllAdmin
                triggerUseEffectCounterState={triggerUseEffectCounterState}
              />
            </Tab>
            <Tab eventKey="Add-Admin" title="Add Admin">
              <AddAdmin
                setTriggerUseEffectCounterState={
                  setTriggerUseEffectCounterState
                }
                triggerUseEffectCounterState={triggerUseEffectCounterState}
              />
            </Tab>
          </Tabs>
        </Container>
      </div>
    </>
  );
};

export default ManageAdmin;
