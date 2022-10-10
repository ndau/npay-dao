const postgres = require("postgres");

exports.pg = postgres({
  host: "localhost", // Postgres ip address[s] or domain name[s]
  port: 5432, // Postgres server port[s]
  database: "ndau-dao", // Name of database to connect to
  username: "ndau-dao-user", // Username of database user
  password: `hc-r_gU+LC$VQ^RFkoP9`, // Password of database user
});
