const express = require("express");

const { createServer } = require("http");
require("dotenv").config();

const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

app.use(cors());
require("dotenv").config();

let routes = {
  proposalRouter: require("./src/routes/proposals_route"),
  voteRouter: require("./src/routes/votes_route"),
  adminRouter: require("./src/routes/admins_route"),
  superAdminRouter: require("./src/routes/superadmins_route"),
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api", routes.proposalRouter);
app.use("/api", routes.voteRouter);
app.use("/api", routes.adminRouter);
app.use("/api", routes.superAdminRouter);

//Server Port
const port = process.env.PORT || 3001;
httpServer.listen(port, () => console.log(`listening on port ${port}`));

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
  allowEIO3: true,
});

require("./src/socket/ndauConnect")(io);

exports.httpServer = httpServer;
