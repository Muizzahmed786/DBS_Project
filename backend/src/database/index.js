import mysql from "mysql2/promise";

let db;
const connectDB = async () => {

  try {
    db = mysql.createPool({
      host:process.env.HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database:process.env.DB_NAME,
      connectionLimit:process.env.CONNECTION_LIMIT
    });

    console.log("Connected to MYSQL DB");

  } catch (error) {
    console.log("DB CONNECTION FAILED!! ERROR:", error);
    process.exit(1);
  }
};

export {db, connectDB};