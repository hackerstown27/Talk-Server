const { User } = require("../modules/users");
const asyncHandler = require("../middleware/asyc");

module.exports = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({
        _id: req.userId,
    });
    const reciever = await User.findOne({
        _id: req.body.recieverId || req.params.recieverId,
    });

    if (!reciever) {
        return res.status(400).send("Bad Request");
    }

    req.user = user;
    req.reciever = reciever;
    next();
});
