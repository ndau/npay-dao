const express = require("express");
const router = express.Router();

const votes = require("../controllers/votes_controller");

router.post("/vote", votes.addVote);
router.post("/vote/verify", votes.verifyVote);

module.exports = router;
