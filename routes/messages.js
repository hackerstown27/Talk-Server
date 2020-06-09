const router = require("express").Router();
const { Message } = require("../modules/messages");
const { User } = require("../modules/users");
const isAuth = require("../middleware/auth");
const asycHandler = require("../middleware/asyc");
const checkRelation = require("../middleware/messages");

function messageRouter(io) {
    io.on("connection", (client) => {
        console.log("connection established with one node");
        io.on("disconnect", () => {
            console.log("connection dismised with one node");
        });
    });

    router.get(
        "/inbox",
        isAuth,
        asycHandler(async (req, res) => {
            let users = await User.findOne({ _id: req.userId })
                .populate({
                    path: "recentMessages",
                    select: { name: 1, phoneNo: 1, profilePic: 1, status: 1 },
                })
                .select({ recentMessages: 1 });

            let newMessages = await Message.distinct("from", {
                to: req.userId,
                "body.hasRead": false,
            });

            newMessages = JSON.parse(JSON.stringify(newMessages));
            users = JSON.parse(JSON.stringify(users));

            users = users.recentMessages.map((user) => {
                return { ...user, hasNewMsg: newMessages.includes(user._id) };
            });

            res.status(200).send(users);
        })
    );

    router.get(
        "/:recieverId",
        isAuth,
        checkRelation,
        asycHandler(async (req, res) => {
            const messages = await Message.find({
                $or: [
                    {
                        to: req.reciever._id,
                        from: req.user._id,
                    },
                    {
                        to: req.user._id,
                        from: req.reciever._id,
                    },
                ],
            });
            await Message.updateMany(
                {
                    to: req.user._id,
                    from: req.reciever._id,
                },
                { "body.hasRead": true }
            );
            res.status(200).send(messages);
        })
    );

    router.post(
        "/",
        isAuth,
        checkRelation,
        asycHandler(async (req, res) => {
            const message = {
                to: req.reciever._id,
                from: req.user._id,
                body: {
                    message: `${req.body.message}`,
                },
            };

            const userIndex = req.user.recentMessages.indexOf(req.reciever._id);
            const recieverIndex = req.reciever.recentMessages.indexOf(
                req.user._id
            );

            if (userIndex !== -1) {
                req.user.recentMessages.splice(userIndex, 1);
            }
            if (recieverIndex !== -1) {
                req.reciever.recentMessages.splice(recieverIndex, 1);
            }
            req.user.recentMessages.unshift(req.reciever._id);
            req.reciever.recentMessages.unshift(req.user._id);
            await req.user.save();
            await req.reciever.save();
            const newMessage = new Message(message);
            await newMessage.save();
            res.status(200).send(newMessage);
        })
    );

    router.post(
        "/addToInbox",
        isAuth,
        checkRelation,
        asycHandler(async (req, res) => {
            const userIndex = req.user.recentMessages.indexOf(
                `${req.reciever._id}`
            );

            if (userIndex !== -1) {
                req.user.recentMessages.splice(userIndex, 1);
            }

            req.user.recentMessages.unshift(`${req.reciever._id}`);
            await req.user.save();

            res.status(200).send("Added To Inbox");
        })
    );
    return router;
}

module.exports = messageRouter;
