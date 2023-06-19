import * as React from "react";
import "./PowerBy.css";
import Box from "@mui/material/Box";

function PowerBy(props) {
  if (props.header === "true") {
    return (
      <Box container sx={{ width: "100%", height: "15%" }}>
        <Box
          sx={{
            backgroundColor: "#73848C",
            height: "100%",
            width: "100%",
          }}
        >
          <img src="../../assets/images/icons/npayme_logo.svg "></img>
        </Box>
      </Box>
    );
  } else {
    return (
      <Box container sx={{ width: "100%", height: "15%" }}>
        <Box
          sx={{
            backgroundColor: "#73848C",
            height: "100%",
            width: "100%",
          }}
        >
          Powered By Ndau
        </Box>
      </Box>
    );
  }
}

export default PowerBy;
