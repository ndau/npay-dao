const { pg } = require("../pg");
const checkIsBodyIncomplete = require("../utils/checkIsBodyIncomplete");

const createSuperAdminsTableIfNotExists = async () => {
  const createSuperAdminsTableQuery = pg`
    CREATE TABLE IF NOT EXISTS superadmins (
        superadmin_id SERIAL PRIMARY KEY,
        wallet_address TEXT UNIQUE
    )
    `;

  const superAdminsTable = await createSuperAdminsTableQuery;
  return superAdminsTable;
};

exports.createSuperAdmin = async (req, res, next) => {
  try {
    const { superAdminAddress, password } = req.body;
    const isAnyValUndefined = checkIsBodyIncomplete({
      superAdminAddress,
      password,
    });

    if (isAnyValUndefined) {
      res.status(400).json({
        status: false,
        message: "All Inputs are Required..!",
      });
      return;
    } else {
      await createSuperAdminsTableIfNotExists();

      if (password === process.env.superadmin_password) {
        console.log("is authorized");
        const adminObject = {
          wallet_address: superAdminAddress,
        };

        const createSuperAdminQuery = pg`
      INSERT INTO
          superadmins ${pg(adminObject)}
      returning *
      `;
        const createdSuperAdmin = await createSuperAdminQuery;

        console.log(createdSuperAdmin, " created SuperAdmin");

        res.status(201).json({
          status: true,
          message: "SuperAdmin created",
        });
      } else {
        res.status(410).json({
          status: false,
          message: "Forbidden",
        });
      }
    }
  } catch (e) {
    console.log(e, "create superadmin error");
    if (e.message.includes("duplicate key value violates unique constraint")) {
      res.status(400).json({
        status: false,
        message: "Duplicate address not allowed",
      });
    } else {
      res.status(500).json({
        status: false,
        message: "Server error",
      });
    }
  }
};

exports.getSuperAdmins = async (req, res, next) => {
  try {
    let limit = null;
    let offset = "0";
    if (req.query.limit) limit = req.query.limit;
    if (req.query.offset) offset = req.query.offset;

    const getSuperAdminsCountQuery = pg`
    SELECT
      COUNT(admin_id) admin_count
    FROM
      superadmins
    `;

    const superAdminsCount = await getSuperAdminsCountQuery;

    const getSuperAdminsListQuery = pg`
    SELECT
      wallet_address, admin_id
    FROM
    superadmins 
    ORDER BY
      admin_ID DESC
    LIMIT ${limit} OFFSET ${offset}
`;

    const superAdminsList = await getSuperAdminsListQuery;

    res.status(200).json({
      status: true,
      superadmins: superAdminsList,
      total: superAdminsCount[0].admin_count,
    });
  } catch (e) {
    console.log(e, " get admins error");
    res.status(500).json({
      status: false,
      msg: "server error",
    });
  }
};

exports.getIsSuperAdmin = async (req, res, next) => {
  const { walletAddress } = req.query;

  const isAnyValUndefined = checkIsBodyIncomplete({ walletAddress });

  if (isAnyValUndefined) {
    res.status(400).json({
      status: false,
      message: "All Inputs are Required..!",
    });
    return;
  } else {
    try {
      let findSuperAdminQuery = pg`
  SELECT 
    superadmin_id
  FROM
      superadmins
  WHERE
    wallet_address = ${walletAddress}
  `;

      const foundSuperAdmin = await findSuperAdminQuery;

      if (foundSuperAdmin.length > 0) {
        res.status(200).json({
          isSuperAdmin: true,
          message: "wallet address is superadmin",
        });
      } else {
        res.status(200).json({
          isAdmin: false,
          message: "superadmin not found",
        });
      }
    } catch (e) {
      console.log(e, "getIsSuperAdmin error");
      res.status(500).json({
        status: "false",
        message: "server error",
      });
    }
  }
};
