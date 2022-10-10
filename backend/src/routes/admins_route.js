const express = require("express");
const router = express.Router();

const admins = require("../controllers/admins_controller");

router.post("/admin", admins.createAdmin);
router.get("/admin", admins.getAdmins);
router.delete("/admin", admins.deleteAdmin);
router.get("/admin/is-admin", admins.getIsAdmin);

module.exports = router;
