const mongoose = require('mongoose')
const ConversationModel = require('../models/ConversationModel')
const getConversation = async(userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid userId:', userId);
        return [];
    }

    const currentUserConversation = await ConversationModel.find({
        $or: [{ sender: userId }, { reciever: userId }],
    })
        .sort({ updatedAt: -1 })
        .populate('messages').populate('sender').populate('reciever')

    const conversation = currentUserConversation.map((conv) => {
        const countUnseenMsg = conv.messages.reduce(
            (prev, curr) => {
                const msgByUserId = curr?.msgByUserId.toString()
                if (msgByUserId !== userId) {
                    return prev + (curr.seen ? 0 : 1)
                }
                else {
                    return prev
                }
            },
            0
        );
        return {
            _id: conv._id,
            sender: conv.sender,
            reciever: conv.reciever,
            unseenMsg: countUnseenMsg,
            lastMsg: conv.messages[conv.messages.length - 1],
        };
    });
    return conversation
}
module.exports = getConversation