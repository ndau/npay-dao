import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import NdauConnect from "../../Layouts/Header/NdauConnect/NdauConnect";
import useNdauConnectStore from "../../store/ndauConnect_store";
import Dropdown from "react-bootstrap/Dropdown";
import { axiosRequest } from "../../api/api";
import { socketEmit } from "../../Layouts/Header/NdauConnect/NdauConnect";

const NPayConverter = () => {
  const walletAddress = useNdauConnectStore((state) => state.walletAddress);
  const resetVotes = useNdauConnectStore((state) => state.resetVotes);
  const logoutFunction = useNdauConnectStore((state) => state.logout);
  const socket = useNdauConnectStore((state) => state.socket);

  const handleLogout = (value) => {
    console.log(`Logout ${value}`);
    resetVotes();
    socket.disconnect();
    logoutFunction();
  };

  const handleClick = (props) => {
    socket.emit("ndau_burn_request", {
      walletAddress: "0909002904235",
    });
    console.log("ndau burn request successfully sent.");
  };
  return (
    <Box
      container
      bgcolor="#FFFFFF"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          width: "100vh",
          height: "90vh",
          borderRadius: "20px",
          backgroundColor: "#F8F8F8",
        }}
      >
        <Box
          container
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: "30px",
          }}
        >
          <Typography
            sx={{
              justifyContent: "center",
              alignItems: "center",
              fontFamily: "TilBold",
              fontSize: "50px",
              color: "#6743B4",
            }}
          >
            Ndau to Npay converter
          </Typography>
        </Box>
        <Box
          container
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            paddingBottom: "30px",
          }}
        >
          <Box container sx={{ paddingBottom: "30px", paddingRight: "15px" }}>
            <TextField
              label="Enter your Npay Wallet: "
              variant="standard"
            ></TextField>
          </Box>
          <Box container sx={{ paddingBottom: "30px", paddingLeft: "15px" }}>
            <TextField
              label="Amount to convert: "
              variant="standard"
            ></TextField>
          </Box>
        </Box>
        <Box
          container
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {walletAddress ? (
            <Button onClick={handleClick}>Convert</Button>
          ) : (
            <NdauConnect action="burn" />
          )}
        </Box>
        <Box></Box>
      </Box>
    </Box>
  );
};
export default NPayConverter;
