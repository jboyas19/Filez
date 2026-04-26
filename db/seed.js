import client from "./client.js";

async function seed() {
  await client.connect();

  // clear tables first
  await client.query("DELETE FROM files;");
  await client.query("DELETE FROM folders;");

  const folderNames = ["Documents", "Pictures", "Music"];

  for (const name of folderNames) {
    const {
      rows: [folder],
    } = await client.query(
      "INSERT INTO folders(name) VALUES($1) RETURNING *;",
      [name]
    );

    for (let i = 1; i <= 5; i++) {
      await client.query(
        "INSERT INTO files(name, size, folder_id) VALUES($1, $2, $3);",
        [`${name}-file-${i}`, i * 100, folder.id]
      );
    }
  }

  await client.end();
}

seed();