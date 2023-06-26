import repository from "../repository";

const { pg } = require("../pg");
const checkIsBodyIncomplete = require("../utils/checkIsBodyIncomplete");

// const createAdminsTableIfNotExists = async () => {
//   const createAdminsTableQuery = pg`
//     CREATE TABLE IF NOT EXISTS admins (
//         admin_ID SERIAL PRIMARY KEY,
//         wallet_address TEXT UNIQUE
//     )
//     `;

//   const adminsTable = await createAdminsTableQuery;
//   return adminsTable;
// };

exports.createAdmin = async ({ adminAddress }) => {
  try {
    const isAnyValUndefined = checkIsBodyIncomplete({ adminAddress });

    if (isAnyValUndefined) {
      return {
        status: false,
        message: "All Inputs are Required..!",
      };
    } else {
      // await createAdminsTableIfNotExists();

      const adminObject = {
        wallet_address: adminAddress,
      };

      const createAdminQuery = pg`
    INSERT INTO
        admins ${pg(adminObject)}
    returning *
    `;

      const createdAdmin = await createAdminQuery;

      return {
        status: true,
        message: "Admin created",
      };
    }
  } catch (e) {
    console.log(e, " create admin error");
    if (e.message.includes("duplicate key value violates unique constraint")) {
      return {
        status: false,
        message: "Duplicate address not allowed",
      };
    } else {
      return {
        status: false,
        message: "Server error",
      };
    }
  }
};

exports.getAdmins = async (req, res, next) => {
  try {
    let limit = null;
    let offset = "0";
    if (req.query.limit) limit = req.query.limit;
    if (req.query.offset) offset = req.query.offset;

    const getAdminsCountQuery = pg`
    SELECT
      COUNT(admin_id) admin_count
    FROM
      admins
    `;

    const adminsCount = await getAdminsCountQuery;

    const getAdminsListQuery = pg`
    SELECT
      wallet_address, admin_id
    FROM
      admins 
    ORDER BY
      admin_ID DESC
    LIMIT ${limit} OFFSET ${offset}
`;

    const adminsList = await getAdminsListQuery;

    res.status(200).json({
      status: true,
      admins: adminsList,
      total: adminsCount[0].admin_count,
    });
  } catch (e) {
    console.log(e, " get admins error");
    res.status(500).json({
      status: false,
      msg: "server error",
    });
  }
};

exports.deleteAdmin = async ({ adminId }) => {
  try {
    const isAnyValUndefined = checkIsBodyIncomplete({ adminId });

    if (isAnyValUndefined) {
      return {
        status: false,
        message: "All Inputs are Required..!",
      };
    } else {
      try {
        let deleteAdminQuery = pg`
  DELETE FROM
    admins
  WHERE
    admin_id = ${adminId}
  returning *
  `;

        const deletedAdmin = await deleteAdminQuery;

        if (deletedAdmin.length > 0) {
          return {
            status: true,
            message: "admin deleted",
          };
        } else {
          return {
            status: false,
            message: "admin not found",
          };
        }
      } catch (e) {
        console.log(e, "delete admin error");
        return {
          status: "false",
          message: "server error",
        };
      }
    }
  } catch (e) {
    return {
      status: "false",
      message: "server error",
    };
  }
};

exports.getIsAdmin = async (req, res, next) => {
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
      let findAdminQuery = pg`
  SELECT 
    admin_id
  FROM
      admins
  WHERE
    wallet_address = ${walletAddress}
  `;

      const foundAdmin = await findAdminQuery;

      if (foundAdmin.length > 0) {
        res.status(200).json({
          isAdmin: true,
          message: "wallet address is admin",
        });
      } else {
        res.status(200).json({
          isAdmin: false,
          message: "admin not found",
        });
      }
    } catch (e) {
      console.log(e, "get isadmin error");
      res.status(500).json({
        status: "false",
        message: "server error",
      });
    }
  }
};

exports.getFAQ = async (req, res, next) => {
  const result = await repository.getFAQ();

  res.status(200).json({
    status: true,
    result,
  });
};

exports.getConversion = async (req, res, next) => {
  const ndau_address = req.query.ndau_address;
  const result = await repository.getConversion(ndau_address);

  console.log(req.params);
  console.log(req.query);
  res.status(200).json({
    status: true,
    result,
  });
};
