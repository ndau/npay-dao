const express = require("express");
const router = express.Router();

const proposal = require("../controllers/proposals_controller");

router.get("/proposal/all", proposal.getAllProposals);
router.get("/proposal/approved", proposal.getApprovedProposals);
router.get("/proposal/rejected", proposal.getRejectedProposals);
router.get("/proposal/latest-running", proposal.getLatestRunningProposals);
router.get("/proposal/latest-completed", proposal.getLatestCompletedProposals);
router.get("/proposal/unapproved", proposal.getUnapprovedProposals);
router.get("/proposal/featured", proposal.getFeaturedProposals);
router.get("/proposal", proposal.getProposalDetails);
router.get("/proposal/test", proposal.test);

router.post("/proposal/test", proposal.test);
router.post("/proposal", proposal.createProposal);

module.exports = router;
