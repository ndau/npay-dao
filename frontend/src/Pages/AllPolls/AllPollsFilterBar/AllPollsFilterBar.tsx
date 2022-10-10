import { Form } from "react-bootstrap";
import useMediaQuery from "../../../utils/hooks/useMediaQuery";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useDebounce } from "use-debounce";
import { useState } from "react";

const space = {
  paddingTop: 10,
};

interface AllPollsFilterBarProps {
  setPollStateSearch: any;
  setToFrom: Function;
  setTo: Function;
  setSearchResult: Function;
}

function AllPollsFilterBar(props: AllPollsFilterBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const checkMobile = useMediaQuery("(max-width: 992px)");

  const handleStatus = (e: any) => {
    props.setPollStateSearch(e.target.value);
  };

  const [searchDebounceValue] = useDebounce(searchValue, 500);

  const handleTo = (e: any) => {
    props.setTo(e.target.value);
  };

  const handleFrom = (e: any) => {
    props.setToFrom(e.target.value);
  };

  const handleSearchChange = (e: any) => {
    setSearchValue(e.target.value);
  };
  props.setSearchResult(searchDebounceValue);
  return (
    <>
      {!checkMobile ? (
        <div style={{ margin: "auto", width: "80%" }}>
          <div className="row py-3">
            <Row>
              <Col lg={6}>
                <div>
                  <Form.Control
                    style={{
                      background: "#181F28",
                      border: "2px solid #1A2F4A",
                    }}
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    onChange={(e) => {
                      handleSearchChange(e);
                    }}
                  />
                </div>
              </Col>
              <Col lg={6}>
                <Row>
                  <Col lg={2}>
                    <div
                      style={{ color: "#B2BEB5", marginTop: 5, fontSize: 18 }}
                    >
                      To
                    </div>
                  </Col>
                  <Col lg={10}>
                    <Form.Control
                      style={{
                        background: "#1A3356",
                        border: "2px solid #1A2F4A",
                      }}
                      type="date"
                      // aria-label="Search"
                      onChange={(e) => {
                        handleFrom(e);
                      }}
                    />
                  </Col>
                </Row>
              </Col>{" "}
            </Row>

            <Row style={space}>
              <Col lg={6}>
                <div>
                  <Form.Select
                    // aria-label="Default select example"
                    style={{
                      background: "#1A3356",
                      border: "2px solid #1A2F4A",
                    }}
                    onChange={(e) => {
                      handleStatus(e);
                    }}
                  >
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Concluded">Concluded</option>
                  </Form.Select>
                </div>
              </Col>
              <Col lg={6}>
                <Row>
                  <Col lg={2}>
                    <div
                      style={{ color: "#B2BEB5", marginTop: 5, fontSize: 18 }}
                    >
                      From
                    </div>
                  </Col>
                  <Col lg={10}>
                    <Form.Control
                      style={{
                        background: "#1A3356",
                        border: "2px solid #1A2F4A",
                      }}
                      type="date"
                      placeholder="from"
                      // aria-label="Search"
                      onChange={(e) => {
                        handleTo(e);
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>

          <div className="py-2"></div>
        </div>
      ) : (
        <div style={{ margin: "auto", width: "80%" }}>
          <div className="row py-2">
            <Row style={{ paddingTop: 10 }}>
              <Col lg={6}>
                <div>
                  <Form className="d-flex ">
                    <Form.Control
                      style={{
                        background: "#181F28",
                        border: "2px solid #1A2F4A",
                      }}
                      type="search"
                      placeholder="Search"
                      aria-label="Search"
                      onChange={(e) => {
                        handleSearchChange(e);
                      }}
                    />
                  </Form>
                </div>
              </Col>

              <Col lg={6} style={{ paddingTop: 10 }}>
                <div>
                  <Form.Select
                    // aria-label="Default select example"
                    style={{
                      background: "#1A3356",
                      border: "2px solid #1A2F4A",
                    }}
                    onChange={(e) => {
                      handleStatus(e);
                    }}
                  >
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Concluded">Concluded</option>
                  </Form.Select>
                </div>
              </Col>
            </Row>

            <Row style={space}>
              <Col lg={6}>
                <Row>
                  <Col lg={2} md={2} sm={2}>
                    <div
                      style={{ color: "#B2BEB5", marginTop: 5, fontSize: 18 }}
                    >
                      To
                    </div>
                  </Col>
                  <Col lg={10} md={10} sm={10}>
                    <Form.Control
                      style={{
                        background: "#1A3356",
                        border: "2px solid #1A2F4A",
                      }}
                      type="date"
                      // aria-label="Search"
                      onChange={(e) => {
                        handleFrom(e);
                      }}
                    />
                  </Col>
                </Row>
              </Col>{" "}
              <Col lg={6}>
                <Row style={{ paddingTop: 10 }}>
                  <Col lg={2} md={2} sm={2}>
                    <div
                      style={{ color: "#B2BEB5", marginTop: 5, fontSize: 18 }}
                    >
                      From
                    </div>
                  </Col>
                  <Col lg={10} md={10} sm={10}>
                    <Form.Control
                      style={{
                        background: "#1A3356",
                        border: "2px solid #1A2F4A",
                      }}
                      type="date"
                      placeholder="from"
                      // aria-label="Search"
                      onChange={(e) => {
                        handleTo(e);
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>

          <div className="py-2"></div>
        </div>
      )}
    </>
  );
}

export default AllPollsFilterBar;
