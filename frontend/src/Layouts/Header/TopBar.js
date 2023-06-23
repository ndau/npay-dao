import { Typography } from "@mui/material";
import "./TopBar.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
const TopBar = (props) => {
  return (
    <Box
      container
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        width: "100%",
        height: "3%",
      }}
    >
      <Box
        container
        sx={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#AF92FF",
          justifyContent: "space-around",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography sx={{ fontFamily: "Rubik" }}>
          <img
            src="../../assets/images/icons/npayme_logo.svg "
          ></img>
        </Typography>
        <Link to="/">
          <Typography sx={{ fontFamily: "Rubik" }}>
            Return To BPC DAO
          </Typography>
        </Link>
      </Box>
    </Box>
  );
};

export default TopBar;
