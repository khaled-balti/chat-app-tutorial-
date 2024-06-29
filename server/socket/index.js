const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const ConversationModel = require('../models/ConversationModel');
const MessageModel = require('../models/MessageModel');
const mongoose = require('mongoose');
const getConversation = require('../helpers/getConversation')

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
});

const onlineUser = new Set();

io.on('connection', async (socket) => {
    console.log('connected user', socket.id);
    const token = socket.handshake.auth.token;

    try {
        const user = await getUserDetailsFromToken(token);

        if (!user) {
            console.error('Invalid user token');
            socket.disconnect();
            return;
        }

        socket.join(user._id.toString());
        onlineUser.add(user._id.toString());
        io.emit('onlineUser', Array.from(onlineUser));

        socket.on('message page', async (userId) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    console.error('Invalid userId:', userId);
                    return;
                }

                const user = await UserModel.findById(userId).select('-password');
                const payload = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profile_pic: user.profile_pic,
                    online: onlineUser.has(userId),
                };
                socket.emit('message user', payload);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        });

        socket.on('all messages', async (userId) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(user._id)) {
                    console.error('Invalid userId or user._id:', userId, user._id);
                    return;
                }

                const getConversation = await ConversationModel.findOne({
                    $or: [
                        { sender: user._id, reciever: userId },
                        { sender: userId, reciever: user._id },
                    ],
                })
                    .populate('messages')
                    .sort({ updatedAt: -1 });

                socket.emit('message', getConversation?.messages || []);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        });

        socket.on('new message', async (data) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(data.sender) || !mongoose.Types.ObjectId.isValid(data.reciever)) {
                    console.error('Invalid sender or reciever:', data.sender, data.reciever);
                    return;
                }

                let conversation = await ConversationModel.findOne({
                    $or: [
                        { sender: data.sender, reciever: data.reciever },
                        { sender: data.reciever, reciever: data.sender },
                    ],
                });

                if (!conversation) {
                    const createConversation = new ConversationModel({
                        sender: data.sender,
                        reciever: data.reciever,
                    });
                    conversation = await createConversation.save();
                }

                const message = new MessageModel({
                    text: data.text,
                    imageUrl: data.imageUrl,
                    videoUrl: data.videoUrl,
                    msgByUserId: data.msgByUserId,
                });

                const messageSave = await message.save();
                await ConversationModel.updateOne(
                    { _id: conversation._id },
                    {
                        $push: {
                            messages: messageSave._id,
                        },
                    }
                );

                const getConversations = await ConversationModel.findOne({
                    $or: [
                        { sender: data.sender, reciever: data.reciever },
                        { sender: data.reciever, reciever: data.sender },
                    ],
                })
                    .populate('messages')
                    .sort({ updatedAt: -1 });

                    io.to(data?.sender).emit('message', getConversations?.messages || []);
                    io.to(data?.reciever).emit('message', getConversations?.messages || []);
                    const conversationSender = await getConversation(data?.sender);
                    const conversationReciever = await getConversation(data?.reciever);
                    io.to(data?.sender).emit('conversation', conversationSender);
                    io.to(data?.reciever).emit('conversation', conversationReciever);
                // socket.emit('conversation', conversationSideBar);
            } catch (error) {
                console.error('Error handling new message:', error);
            }
        });

        socket.on('sidebar', async (userId) => {
            try {
                const conversation = await getConversation(userId);
                socket.emit('conversation', conversation);
            } catch (error) {
                console.error('Error fetching sidebar data:', error);
            }
        });
        socket.on('seen', async(msgByUserId) => {
            const conversation = await ConversationModel.findOne({
                $or: [
                    { sender: user?._id, reciever: msgByUserId },
                    { sender: msgByUserId, reciever: user?._id },
                ],
            })
            const conversationMessageId = conversation?.messages || []
            const updateMessages = await MessageModel.updateMany(
                {_id: {"$in": conversationMessageId}, msgByUserId},
                {"$set": {seen: true}}
            )
            const conversationSender = await getConversation(user?._id.toString());
            const conversationReciever = await getConversation(msgByUserId);
            io.to(user?._id.toString()).emit('conversation', conversationSender);
            io.to(msgByUserId).emit('conversation', conversationReciever);
        })
        socket.on('disconnect', () => {
            onlineUser.delete(user._id.toString());
            console.log('disconnected', socket.id);
        });
    } catch (error) {
        console.error('Error in connection handler:', error);
        socket.disconnect();
    }
});

module.exports = {
    app,
    server,
};
