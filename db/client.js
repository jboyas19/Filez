import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/filez",
});

export default client;