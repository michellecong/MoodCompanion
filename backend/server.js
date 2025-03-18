const app = require("./app");
const config = require("config");
const http = require("http");

// 获取端口
const PORT = process.env.PORT || config.get("port") || 5000;
app.set("port", PORT);

// 创建 HTTP 服务器
const server = http.createServer(app);

// 错误处理
server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  switch (error.code) {
    case "EACCES":
      console.error(`端口 ${PORT} 需要提升权限`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`端口 ${PORT} 已被占用`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
