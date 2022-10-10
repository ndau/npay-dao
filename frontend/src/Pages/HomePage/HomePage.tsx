import { useNavigate } from "react-router-dom";
import FeaturedPolls from "./FeaturedPolls/FeaturedPolls";
import LatestCompletedPolls from "./LatestCompletedPolls/LatestCompletedPolls";
import LatestRunningPolls from "./LatestRunningPolls/LatestRunningPolls";
import { Button } from "react-bootstrap";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ backgroundColor: "#0B2140", paddingBottom: 20 }}>
        <div style={{ margin: "auto", width: "80%", paddingTop: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{ color: "white", textAlign: "left", fontSize: "30px" }}
              className="py-2"
            >
              Featured Polls
            </div>
            <div
              style={{
                color: "white",
                textAlign: "left",
                fontSize: "15px",
                cursor: "pointer",
              }}
              className="py-2"
              onClick={() => {
                navigate("/all-polls");
              }}
            >
              <Button
                style={{
                  marginTop: 0,
                  backgroundColor: "#F89D1C",
                  border: "#0A1D35",
                }}
              >
                View All
              </Button>
            </div>
          </div>

          <FeaturedPolls />

          <div className="row">
            <LatestRunningPolls />
            <LatestCompletedPolls />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
