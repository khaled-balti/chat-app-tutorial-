const mongoose = require('mongoose')
const ConversationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    reciever: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    messages: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Message'
    },
}, {
    timestamps: true,
})
const ConversationModel = mongoose.model('Conversation', ConversationSchema)
module.exports = ConversationModel