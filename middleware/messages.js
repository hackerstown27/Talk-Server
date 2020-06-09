const asyncHandler = require("../middleware/asyc");
const { User } = require("../modules/users");

module.exports = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ _id: req.userId });
    const recieverId = req.body.recieverId || req.params.recieverId;
    const reciever = await User.findOne({ _id: recieverId });

    const haveFriend = user.friends.includes(recieverId);
    if (!reciever || !haveFriend) return res.status(400).send("Bad Request.");

    req.user = user;
    req.reciever = reciever;

    next();
});
