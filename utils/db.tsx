// utils/db.js
import mysql from "mysql2/promise";


// const pool = mysql.createPool({
//   host: process.env.DB_HOST || "db",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "roris123",
//   database: process.env.DB_NAME || "mtax_db",
  
// });

const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  
});

export default pool;
