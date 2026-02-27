import mysql from "mysql2/promise";

const connectDB = async () => {
  let connection;

  try {
    connection = await mysql.createConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database:process.env.DB_NAME
    });

    console.log("Connected to MYSQL DB");

    const [rows] = await connection.execute(
    'SELECT * from student'
  );

    console.log(rows);

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