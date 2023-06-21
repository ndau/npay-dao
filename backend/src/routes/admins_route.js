const express = require("express");
const router = express.Router();

const admins = require("../controllers/admins_controller");


router.get("/admin", admins.getAdmins);
router.get("/admin/is-admin", admins.getIsAdmin);
router.get("/admin/faq",admins.getFAQ);
router.get("/admin/ndau_conversion",admins.getConversion);

module.exports = router;
