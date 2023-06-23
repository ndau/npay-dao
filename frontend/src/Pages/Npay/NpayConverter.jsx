import Box from "@mui/material/Box";
import { useEffect } from "react";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import NdauConnect from "../../Layouts/Header/NdauConnect/NdauConnect";
import useNdauConnectStore from "../../store/ndauConnect_store";
import TopBar from "../../Layouts/Header/TopBar";
import Paper from "@mui/material/Paper";
import { axiosRequest } from "../../api/api";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import "./NpayConverter.css";

// const FAQ = [
//   { q: "question 1", a: "answer 1" },
//   { q: "question 2", a: "answer 2" },
// ];
// function createData(name, npay_address, amount, time) {
//   return { name, npay_address, amount, time };
// }

const NPayConverter = () => {
  const transactions = useNdauConnectStore((state) => state.transactions);
  const walletAddress = useNdauConnectStore((state) => state.walletAddress);
  const resetVotes = useNdauConnectStore((state) => state.resetVotes);
  const logoutFunction = useNdauConnectStore((state) => state.logout);
  const socket = useNdauConnectStore((state) => state.socket);
  const [amount, setAmount] = useState("");
  const [npayWalletAddress, setnpayWalletAddresss] = useState("");
  const [FAQ, setFAQ] = useState([]);

  useEffect(() => {
    const getFAQ = async () => {
      const resp = await axiosRequest("get", "admin/faq");
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
      className="bg"
      sx={{
        display: "flex",
        flexDirection: "column",
        // justifyContent: "space-around",
        alignItems: "center",
        height: "200vh",
        widht: "100%",
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
          width: "900px",
          height: "20%",
          borderRadius: "24px",
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
              paddingBottom: "20px",
            }}
          >
            <Box container>
              <TextField
                label="Enter Your Wallet Address."
                variant="standard"
                title={npayWalletAddress}
                sx={{
                  width: "25vw",
                  paddingRight: "20px",
                  "& .MuiInputBase-root": {
                    height: "30px",
                  },
                }}
                onChange={(e) => setnpayWalletAddresss(e.target.value)}
              ></TextField>
            </Box>
            <Box container>
              <TextField
                label="Amount to convert: "
                variant="standard"
                title={amount}
                sx={{
                  width: "10vw",
                  "& .MuiInputBase-root": {
                    height: "30px",
                  },
                }}
                onChange={(e) => setAmount(e.target.value)}
              ></TextField>
            </Box>
          </Box>
          <Box
            container
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {walletAddress ? (
              <Button
                variant="contain"
                onClick={handleClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& .MuiButtonBase-root": {
                    height: "20px",
                  },
                }}
              >
                <Typography sx={{ fontFamily: "Rubik" }}>Convert</Typography>
              </Button>
            ) : (
              <NdauConnect action="burn" />
            )}
          </Box>
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
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 500, backgroundColor: "#F0EBFF", height: "80%" }}
              aria-label="simple table"
            >
              <TableHead
                container
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  paddingLeft:"30px",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
              >
                <TableRow>
                  <TableCell align="right" sx={{ fontFamily: "Rubik" }}>
                    Your Transaction
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: "Rubik" }}>
                    Npay Address
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: "Rubik" }}>
                    Amount
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: "Rubik" }}>
                    Time{" "}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell sx={{ paddingRight: "100px" }} align="right">
                      {row.transactions_hash}
                    </TableCell>
                    <TableCell align="right">{row.npay_address}</TableCell>
                    <TableCell align="right">{row.amount}</TableCell>
                    <TableCell align="right">{row.createdon}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
      <Paper
        container
        elevation={4}
        sx={{
          display: "flex",
          width: "900px",
          height: "60%",
          borderRadius: "24px",
          backgroundColor: "#F0EBFF",
        }}
      >
        <Typography
          sx={{ fontFamily: "Rubik", fontSize: "24px", paddingLeft: "40px",paddingTop:"40px" }}
        >
          FAQ
        </Typography>
        {FAQ.map((x) => (
          <Box key={x.id}>
            <Typography sx={{ fontFamily: "Rubik" }}>{x.questions}</Typography>
            <Typography>{x.answers}</Typography>
          </Box>
        ))}
      </Paper>
      <Typography sx={{ fontFamily: "Rubik" }}>
        Powered By {""}
        <img
          className="footer"
          src="../../assets/images/icons/ndau.svg "
        ></img>{" "}
        All rights reserved.
      </Typography>
    </Box>
  );
};
export default NPayConverter;
