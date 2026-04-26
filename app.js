const express = require("express");
const client = require("./db/client");

const app = express();

app.use(express.json());

app.get("/files", async (req, res, next) => {
  try {
    const { rows } = await client.query(`
      SELECT files.*, folders.name AS folder_name
      FROM files
      JOIN folders ON files.folder_id = folders.id
      ORDER BY files.id;
    `);

    res.send(rows);
  } catch (error) {
    next(error);
  }
});

app.get("/folders", async (req, res, next) => {
  try {
    const { rows } = await client.query(`
      SELECT *
      FROM folders
      ORDER BY id;
    `);

    res.send(rows);
  } catch (error) {
    next(error);
  }
});

app.get("/folders/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      rows: [folder],
    } = await client.query(
      `
      SELECT 
        folders.*,
        COALESCE(json_agg(files.*) FILTER (WHERE files.id IS NOT NULL), '[]') AS files
      FROM folders
      LEFT JOIN files ON files.folder_id = folders.id
      WHERE folders.id = $1
      GROUP BY folders.id;
      `,
      [id]
    );

    if (!folder) {
      return res.status(404).send({ error: "Folder not found" });
    }

    res.send(folder);
  } catch (error) {
    next(error);
  }
});

app.post("/folders/:id/files", async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      rows: [folder],
    } = await client.query("SELECT * FROM folders WHERE id = $1;", [id]);

    if (!folder) {
      return res.status(404).send({ error: "Folder not found" });
    }

    if (!req.body) {
      return res.status(400).send({ error: "Request body required" });
    }

    const { name, size } = req.body;

    if (!name || !size) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const {
      rows: [file],
    } = await client.query(
      `
      INSERT INTO files (name, size, folder_id)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [name, size, id]
    );

    res.status(201).send(file);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  res.status(500).send({ error: error.message });
});

module.exports = app;
