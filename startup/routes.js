const userRouter = require("../routes/users");
const authRouter = require("../routes/auth");
const friendsRouter = require("../routes/friends");
const requestsRouter = require("../routes/requests");
const messagesRouter = require("../routes/messages");

module.exports = function(app, io) {
    app.use("/api/users", userRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/friends", friendsRouter);
    app.use("/api/requests", requestsRouter);
    app.use("/api/messages", messagesRouter(io));
}

