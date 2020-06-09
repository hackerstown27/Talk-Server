const router = require("express").Router();
const { User } = require("../modules/users");
const asyncHandler = require("../middleware/asyc");
const isAuth = require("../middleware/auth");
const findUsers = require("../middleware/requests");

router.get(
    "/",
    isAuth,
    asyncHandler(async (req, res) => {
        let invites = await User.findOne({ _id: req.userId })
            .populate({
                path: "requests",
                select: { name: 1, phoneNo: 1, profilePic: 1 },
                options: { sort: { name: 1 } },
            })
            .select({ requests: 1 });

        res.status(200).send(invites);
    })
);

router.post(
    "/",
    isAuth,
    findUsers,
    asyncHandler(async (req, res) => {
        let user = req.user;
        let reciever = req.reciever;
        if (
            user.requests.includes(reciever._id) ||
            reciever.requests.includes(user._id)
        ) {
            return res.status(400).send("Request Already Pending!");
        }
        reciever.requests.push(user._id);
        await reciever.save();
        res.status(200).send(`Request Sent To ${reciever.name}!`);
    })
);

router.put(
    "/accept",
    isAuth,
    findUsers,
    asyncHandler(async (req, res) => {
        let user = req.user;
        let reciever = req.reciever;
        if (user.requests.includes(reciever._id)) {
            const index = user.requests.indexOf(reciever._id);
            user.requests.splice(index, 1);
            user.friends.push(reciever._id);
            reciever.friends.push(user._id);
            await user.save();
            await reciever.save();
            return res.status(200).send("Friend Request Accepted.");
        }
        res.status(400).send("Bad Request");
    })
);

router.put(
    "/decline",
    isAuth,
    findUsers,
    asyncHandler(async (req, res) => {
        let user = req.user;
        let reciever = req.reciever;
        if (user.requests.includes(reciever._id)) {
            const index = user.requests.indexOf(reciever._id);
            user.requests.splice(index, 1);
            await user.save();
            return res.status(200).send("Friend Request Decline.");
        }
        res.status(400).send("Bad Request");
    })
);

router.delete(
    "/:recieverId",
    isAuth,
    findUsers,
    asyncHandler(async (req, res) => {
        let user = req.user;
        let reciever = req.reciever;
        if (reciever.requests.includes(user._id)) {
            const index = reciever.requests.indexOf(user._id);
            reciever.requests.splice(index, 1);
            await reciever.save();
            return res.status(200).send("Friend Request Deleted.");
        }
        res.status(400).send("Bad Request");
    })
);

module.exports = router;
