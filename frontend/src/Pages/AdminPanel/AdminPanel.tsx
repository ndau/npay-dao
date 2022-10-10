import { Button, Container, Form, Row, Col } from "react-bootstrap";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Dropdown from "react-bootstrap/Dropdown";
import { useNavigate } from "react-router-dom";
import UnapprovedProposalsList from "./UnapprovedProposalsList/UnapprovedProposalsList";
import ProcessedProposalsList from "./ProcessedProposalsList/ProcessedProposalList";
import { useState } from "react";
import FeatureById from "./FeatureById/FeatureById";
import useMediaQuery from "../../utils/hooks/useMediaQuery";
import { useDebounce } from "use-debounce";
import useNdauConnectStore from "../../store/ndauConnect_store";

const styleManageButtonLgScreen = {
  textAlign: "start" as "start",
  paddingBottom: 5,
};
const styleSortbyButtonLgScreen = {
  textAlign: "end" as "end",
  paddingBottom: 5,
};
const styleButtonSmScreen = {
  textAlign: "center" as "center",
  paddingBottom: 5,
};

const AdminPanel = () => {
  const checkMobile = useMediaQuery("(max-width: 768px)");

  let isSuperAdmin = useNdauConnectStore((state) => state.isSuperAdmin);

  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("asce");
  const [checkTab, setCheckTab] = useState("");
  const [searchProposal, setSearchProposal] = useState("");
  const [searchDebounceValue] = useDebounce(searchProposal, 500);

  const sorting = (e: string) => {
    setSortBy(e);
  };
  const checkTabfunc = (e: string) => {
    setCheckTab(e);
  };
  const navigateFunc = () => {
    navigate("/manage-admin");
  };
  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchProposal(e.target.value);
  };

  return (
    <>
      <div style={{ backgroundColor: "#0B2140" }} className="shadow-lg">
        <Container
          className="admin-container"
          fluid="lg"
          style={{ padding: "10px", paddingTop: "20px", minHeight: "80vh" }}
        >
          {checkTab != "Feature" ? (
            <>
              <Row>
                <Col lg={2} md={3}>
                  <div
                    style={
                      !checkMobile
                        ? styleManageButtonLgScreen
                        : styleButtonSmScreen
                    }
                  >
                    {isSuperAdmin && (
                      <Button
                        style={{
                          marginTop: 0,
                          backgroundColor: "#F89D1C",
                          border: "#0A1D35",
                          paddingBottom: 10,
                        }}
                        onClick={navigateFunc}
                      >
                        Manage Admin
                      </Button>
                    )}
                  </div>
                </Col>
                <Col lg={1} md={1} />
                <Col lg={6} md={5}>
                  <div
                    // className="d-flex justify-content-center"
                    style={{ paddingBottom: 10 }}
                  >
                    <Form.Control
                      style={{
                        background: "#181F28",
                        border: "2px solid #1A2F4A",
                      }}
                      type="search"
                      placeholder="Search"
                      onChange={(e) => {
                        handleSearchChange(e);
                      }}
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                    />
                  </div>
                </Col>
                <Col lg={1} md={1} />
                <Col lg={2} md={2}>
                  <div
                    style={
                      !checkMobile
                        ? styleSortbyButtonLgScreen
                        : styleButtonSmScreen
                    }
                  >
                    <Dropdown
                      onSelect={(e: any) => {
                        sorting(e);
                      }}
                    >
                      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                        Sort by
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item eventKey="asce">Acending</Dropdown.Item>
                        <Dropdown.Item eventKey="desc">Decending</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </Col>
              </Row>
            </>
          ) : (
            <Button
              style={{
                backgroundColor: "#F89D1C",
                border: "#0A1D35",
                marginTop: -2,
                marginBottom: 28,
              }}
              onClick={navigateFunc}
            >
              Manage Admin
            </Button>
          )}

          <Tabs
            defaultActiveKey={"unapproved"}
            id="fill-tab-example"
            onSelect={(e: any) => {
              checkTabfunc(e);
            }}
            fill
            style={{
              fontWeight: 700,
            }}
          >
            <Tab eventKey="unapproved" title="Unapproved">
              <UnapprovedProposalsList
                sortingOrder={sortBy}
                searchQuery={searchDebounceValue}
              />
            </Tab>

            <Tab eventKey="approve" title="Approved">
              <ProcessedProposalsList
                processedProposalEndpoint="proposal/approved"
                sortingOrder={sortBy}
                searchQuery={searchDebounceValue}
              />
            </Tab>

            <Tab eventKey="reject" title="Rejected">
              <ProcessedProposalsList
                processedProposalEndpoint="proposal/rejected"
                sortingOrder={sortBy}
                searchQuery={searchDebounceValue}
              />
            </Tab>
            <Tab eventKey="Feature" title="Feature By Id">
              <FeatureById />
            </Tab>
          </Tabs>
        </Container>
      </div>
    </>
  );
};

export default AdminPanel;
