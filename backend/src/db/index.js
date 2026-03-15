import mysql from "mysql2/promise";

let connection;

const connectDB = async () => {

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
  }
};

export {connection, connectDB};