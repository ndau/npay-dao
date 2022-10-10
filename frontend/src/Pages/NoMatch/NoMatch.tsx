import { Container } from "react-bootstrap";

const NoMatch = () => {
  return (
    <>
      {" "}
      <div
        style={{ backgroundColor: "#0B2140" }}
        className="  justify-content-center shadow-lg"
      >
        <Container
          fluid="No-Match"
          style={{
            backgroundColor: "#1A3356",
            padding: "10px",
            paddingTop: "20px",
            minHeight: "80vh",
          }}
        >
          <h1
            style={{
              color: "#ffff",
              padding: 120,
              marginBottom: 0,
              textAlign: "center",
            }}
          >
            No match found for this route!
          </h1>
        </Container>
      </div>
    </>
  );
};

export default NoMatch;
