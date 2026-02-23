import oracledb from "oracledb";

const connectDB = async () => {
  let connection;

  try {
    console.log("USER:", process.env.DB_USER);
    console.log("PASS:", process.env.DB_PASSWORD);
    console.log("CONNECT:", process.env.DB_CONNECT_STRING);
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING || "localhost:1521/XE",
    });

    console.log("Connected to Oracle DB");

    const result = await connection.execute(
      `SELECT table_name FROM user_tables`
    );

    console.log(result.rows);

  } catch (error) {
    console.log("DB CONNECTION FAILED!! ERROR:", error);
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};

export default connectDB;