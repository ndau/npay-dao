import React from "react";
import { Col, Row, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import useMediaQuery from "../../utils/hooks/useMediaQuery";
// import ImageHeader from "../../assets/images/download.png";
// import TelegramIcon from "../../assets/images/icons/bxl-telegram.svg";
// import GitHubIcon from "../../assets/images/icons/logo-github.svg";

const logoStyleBigScreen = {
  paddingBottom: "12px",
  width: "35%",
  marginLeft: 33,
  paddingLeft: 5,
};

const logoStyleSmallScreen = {
  paddingBottom: "12px",
  width: "100%",
  paddingLeft: 10,
  marginLeft: -25,
};

const Footer = () => {
  const checkMobile = useMediaQuery("(max-width: 660px)");
  return (
    <>
      <div
        style={{
          backgroundColor: "#031021",
        }}
      >
        <Container fluid="md" style={{ paddingTop: "10px" }}>
          <Row>
            <Col
              style={{
                height: "100%",

                background: `url('../map2.png')`,
                backgroundSize: "100% 100%",
                paddingTop: 10,
              }}
              className="ps-5"
            >
              <div
                style={!checkMobile ? logoStyleBigScreen : logoStyleSmallScreen}
              >
                {" "}
                <img src="assets/images/download.png" style={{ width: "100%" }} alt=""/>
              </div>
              <div
                style={{ color: "white", width: "80%" }}
                className="justify-content-center"
              >
                <Row>
                  <Col lg={3} style={{ margin: 0 }}>
                    <Nav.Link
                      href="https://twitter.com/ndaucollective"
                      target={"_blanK"}
                      style={{ margin: 0, marginLeft: 0, marginTop: -10 }}
                    >
                      <img src="../icon1.svg" className="p-3"  alt=""/>
                    </Nav.Link>
                  </Col>
                  <Col lg={3} style={{ margin: 0, marginLeft: 0 }}>
                    <Nav.Link
                      href="https://t.me/ndau_community"
                      target={"_blanK"}
                      style={{ margin: 0, marginLeft: 0, marginTop: -10 }}
                    >
                      <img src="../bxl-telegram.svg" className="p-3"  alt=""/>
                    </Nav.Link>
                  </Col>
                  <Col lg={3} style={{ margin: 0, marginLeft: 0 }}>
                    <Nav.Link
                      href="https://github.com/ndau/"
                      target={"_blanK"}
                      style={{ margin: 0, marginLeft: 0, marginTop: -10 }}
                    >
                      <img src="assets/images/icons/logo-github.svg" className="p-3"  alt=""/>
                    </Nav.Link>
                  </Col>
                  <Col lg={3}></Col>
                </Row>
              </div>
            </Col>
            <Col style={{ color: "white" }}></Col>

            <Col
              style={{ color: "#C7C7C7", fontSize: "15px" }}
              className="pt-2"
            >
              <div style={{ color: "#F6931D", paddingBottom: "12px" }}>
                Company
              </div>
              <div style={{ paddingBottom: "12px" }}>
                <Nav.Link as={Link} to="/" style={{ color: "white" }}>
                  Home
                </Nav.Link>
              </div>
              <div style={{ paddingBottom: "12px" }}>
                {" "}
                <Nav.Link
                  href="https://ndau.io"
                  target={"_blanK"}
                  style={{ color: "white" }}
                >
                  About us
                </Nav.Link>
              </div>
            </Col>
          </Row>
        </Container>
        <hr />
        <div style={{ textAlign: "center", color: "#9B9B9B" }} className="pb-2">
          ndau explorer © 2019 Oneiro NA, Inc.
        </div>
      </div>
    </>
  );
};

export default Footer;
