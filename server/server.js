// server.js (ESM version)

import http from "http";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
app.set("port", PORT);

const server = http.createServer(app);

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

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
