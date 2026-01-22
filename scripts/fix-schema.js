import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { URL } from "url";

dotenv.config({ path: ".env.local" });

async function fixSchema() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not found");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const url = new URL(connectionString);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  });

  try {
    console.log("Altering events table...");
    await connection.execute(
      "ALTER TABLE events MODIFY COLUMN resource VARCHAR(255) NOT NULL",
    );
    console.log("Schema updated successfully.");
  } catch (error) {
    console.error("Error updating schema:", error);
  } finally {
    await connection.end();
  }
}

fixSchema();
