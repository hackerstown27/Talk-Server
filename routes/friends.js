const router = require("express").Router();
const { User } = require("../modules/users");
const asyncHandler = require("../middleware/asyc");
const isAuth = require("../middleware/auth");
const _ = require("lodash");

router.get(
    "/",
    isAuth,
    asyncHandler(async (req, res) => {
        const user = await User.findOne({
            _id: req.userId,
        })
            .populate({
                path: "friends",
                select: { name: 1, phoneNo: 1, profilePic: 1, status: 1 },
                options: { sort: { name: 1 } },
            })
            .select({ friends: 1 });
        res.status(200).send(user);
    })
);

router.get(
    "/find/:username",
    isAuth,
    asyncHandler(async (req, res) => {
        const user = await User.findOne({ _id: req.userId });
        let users = await User.find({
            $and: [
                {
                    name: {
                        $regex: RegExp(`^${req.params.username.trim()}`, "i"),
                    },
                },
                {
                    _id: {
                        $nin: [user._id, ...user.friends],
                    },
                },
            ],
        }).select({
            name: 1,
            profilePic: 1,
            phoneNo: 1,
            requests: 1,
        });

        users = JSON.parse(JSON.stringify(users));

        users = users.map((data) => {
            if (data.requests.includes(`${user._id}`)) {
                data.hasRequested = true;
            } else {
                data.hasRequested = false;
            }
            delete data.requests;
            return data;
        });

        res.status(200).send(users);
    })
);

router.delete(
    "/:recieverId",
    isAuth,
    asyncHandler(async (req, res) => {
        const user = await User.findOne({
            _id: req.userId,
        });

        const reciever = await User.findOne({
            _id: req.params.recieverId,
        });

        if (!reciever) {
            //reciever might be delete. & User has'nt Refreshed the page.
            return res.status(400).send("Please Try Again!");
        }

        const userIndex = user.friends.indexOf(reciever._id);
        const recieverIndex = reciever.friends.indexOf(user._id);
        if (userIndex !== -1 && recieverIndex !== -1) {
            user.friends.splice(userIndex, 1);
            await user.save();

            reciever.friends.splice(recieverIndex, 1);
            await reciever.save();
            return res
                .status(200)
                .send(`${reciever.name} Removed From Your Friends.`);
        }

        res.status(400).send(`${reciever.name} Is Not In Your Friends.`);
    })
);

module.exports = router;
