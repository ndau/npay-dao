import Box from "@mui/material/Box";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import NdauConnect from "../../Layouts/Header/NdauConnect/NdauConnect";
import useNdauConnectStore from "../../store/ndauConnect_store";

const NPayConverter = () => {
  const walletAddress = useNdauConnectStore((state) => state.walletAddress);
  const resetVotes = useNdauConnectStore((state) => state.resetVotes);
  const logoutFunction = useNdauConnectStore((state) => state.logout);
  const socket = useNdauConnectStore((state) => state.socket);
  const [amount, setAmount] = useState("");
  const [npayWalletAddress, setnpayWalletAddresss] = useState("");

  const handleLogout = (value) => {
    console.log(`Logout ${value}`);
    resetVotes();
    socket.disconnect();
    logoutFunction();
  };

  const handleClick = (props) => {
    socket.emit("ndau_burn_request", {
      npayWalletAddress: npayWalletAddress,
      amount: amount,
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
        <form>
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
                title={npayWalletAddress}
                onChange={(e) => setnpayWalletAddresss(e.target.value)}
              ></TextField>
            </Box>
            <Box container sx={{ paddingBottom: "30px", paddingLeft: "15px" }}>
              <TextField
                label="Amount to convert: "
                variant="standard"
                title={amount}
                onChange={(e) => setAmount(e.target.value)}
              ></TextField>
            </Box>
          </Box>
        </form>
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
