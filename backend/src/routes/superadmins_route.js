const express = require("express");
const router = express.Router();

const superadmins = require("../controllers/superadmin_controller");

router.post("/superadmin",superadmins.createSuperAdmin);
router.get("/superadmin", superadmins.getSuperAdmins);

router.get("/superadmin/is-superadmin", superadmins.getIsSuperAdmin);

module.exports = router;
