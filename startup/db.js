const mongoose = require("mongoose");
const config = require("config");

module.exports = function() {
    mongoose
    .connect(config.get("DB_URL"), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => console.log("successfully connected to mongodb ..."))
    .catch(() => console.log("failed to connect with mongodb !"));
}