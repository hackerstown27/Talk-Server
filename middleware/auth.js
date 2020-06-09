const jwt = require("jsonwebtoken");
const config = require("config");
const { User } = require("../modules/users");
const asyncHandler = require("../middleware/asyc");

module.exports = asyncHandler(async (req, res, next) => {
    try {
        const decodedToken = jwt.verify(
            req.headers["x-auth-token"],
            config.get("jwtPrivateKey")
        );
        req.userId = decodedToken._id;
        const user = await User.findOne({ _id: decodedToken._id });
        const tokenGenOn = new Date(decodedToken.tokenGenOn);
        const tokenExpOn = new Date(tokenGenOn.getTime() + 3600000);
        const hasTokenExp = Date.now() > tokenExpOn.getTime();
        if (!user || hasTokenExp)
            res.status(401).send("Please Re-login, You are unauthorized !");
        else next();
    } catch (e) {
        res.status(401).send("Please Re-login, You are unauthorized !");
    }
});
