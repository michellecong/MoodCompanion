const app = require("./app");
// const config = require("config");
const http = require("http");
require("dotenv").config();

// aquire port from environment or use default
const PORT = process.env.PORT || 3000;
app.set("port", PORT);

// create server
const server = http.createServer(app);

// handle server errors
server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  switch (error.code) {
    case "EACCES":
      console.error(`PORT ${PORT} Needs elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`PORT ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// start server
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
