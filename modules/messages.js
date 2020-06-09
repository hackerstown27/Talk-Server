const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    to: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    body: {
        message: {
            type: String,
            required: true,
            minlength: 1,
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        hasRead: {
            type: Boolean,
            default: false,
        },
    },
});

const Message = mongoose.model("Message", messageSchema);

module.exports.Message = Message;
