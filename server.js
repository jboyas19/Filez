const app = require("./app");
const client = require("./db/client");

const PORT = process.env.PORT || 3000;

async function startServer() {
  await client.connect();

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

startServer();
