import Box from "@mui/material/Box";
import { useEffect} from "react";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import NdauConnect from "../../Layouts/Header/NdauConnect/NdauConnect";
import useNdauConnectStore from "../../store/ndauConnect_store";
import TopBar from "../../Layouts/Header/TopBar";
import Paper from "@mui/material/Paper";
import {axiosRequest} from "../../api/api";

// const FAQ = [
//   { q: "question 1", a: "answer 1" },
//   { q: "question 2", a: "answer 2" },
// ];

const NPayConverter = () => {
  const walletAddress = useNdauConnectStore((state) => state.walletAddress);
  const resetVotes = useNdauConnectStore((state) => state.resetVotes);
  const logoutFunction = useNdauConnectStore((state) => state.logout);
  const socket = useNdauConnectStore((state) => state.socket);
  const [amount, setAmount] = useState("");
  const [npayWalletAddress, setnpayWalletAddresss] = useState("");
  const [FAQ,setFAQ] = useState([]);

  useEffect(() => {
    const getFAQ = async () => {
      const resp = await axiosRequest(
        "get",
        "admin/faq",
      );
      console.log(resp.data.result);
      setFAQ(resp.data.result);
    };
    getFAQ();
  }, []);

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
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#CCCCFF",
      }}
    >
      <TopBar />
      <Typography
        sx={{
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Rubik",
          fontSize: "50px",
          color: "#6743B4",
          marginTop: "50px",
        }}
      >
        NDAU CONVERTER
      </Typography>
      <Typography sx={{ fontFamily: "Rubik", marginBottom: "30px" }}>
        Burn your ndau to mint npay
      </Typography>
      <Paper
        container
        elevation={4}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          width: "80%",
          borderRadius: "36px",
          backgroundColor: "#F0EBFF",
          marginBottom: "30px",
        }}
      >
        <form>
          <Box
            container
            sx={{
              display: "flex",
              // flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <Box container>
              <TextField
                label="Enter your Npay Wallet: "
                variant="outlined"
                title={npayWalletAddress}
                sx={{ width: "40vw" }}
                onChange={(e) => setnpayWalletAddresss(e.target.value)}
              ></TextField>
            </Box>
            <Box container>
              <TextField
                label="Amount to convert: "
                variant="outlined"
                title={amount}
                sx={{ width: "20vh" }}
                onChange={(e) => setAmount(e.target.value)}
              ></TextField>
            </Box>
          </Box>
          {walletAddress ? (
            <Button
              onClick={handleClick}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40%",
              }}
            >
              <Typography sx={{ fontFamily: "Rubik" }}>Convert</Typography>
            </Button>
          ) : (
            <NdauConnect action="burn" />
          )}
        </form>

        <Box
          container
          sx={{
            borderTop: "1px solid",
            borderColor: "#ABA7B6",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Your Transaction
        </Box>
      </Paper>
      <Paper
        container
        elevation={4}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "flex-start",
          width: "80%",
          borderRadius: "36px",
          backgroundColor: "#F0EBFF",
        }}
      >
        <Typography>FAQ</Typography>
        {/* <Typography>Question 1</Typography>
        <Typography>Answer 1</Typography> */}
        {FAQ.map((x) => (
          <>
            <Typography>{x.questions}</Typography>
            <Typography>{x.answers}</Typography>
          </>
        ))}
      </Paper>
    </Box>
  );
};
export default NPayConverter;
