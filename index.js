const express = require("express");
const app = express();
const config = require("config");
const error = require("./middleware/error");

const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static("uploads"));

require("./startup/db")();
require("./startup/config")(app);
require("./startup/routes")(app, io);

app.use(error);

server.listen(config.get("PORT"), () => {
    console.log(`server started on ${config.get("PORT")}`);
});
