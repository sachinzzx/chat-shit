const store = require('../models/store');

function initSocket(server, app) {
    let io = null;

    try {
        const { Server } = require('socket.io');
        io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
            maxHttpBufferSize: 5e7, // 50MB
        });

        app.set('io', io);

        const activeUsers = new Map();

        io.on('connection', (socket) => {
            console.log(`[Socket] Client connected: ${socket.id}`);

            // User registers online status
            socket.on('user_connected', (userId) => {
                activeUsers.set(socket.id, userId);
                io.emit('online_users', Array.from(new Set(activeUsers.values())));
                console.log(`[Socket] User ${userId} is online`);
            });

            // Join a conversation room
            socket.on('join_conversation', (convoId) => {
                socket.join(convoId);
                console.log(`[Socket] ${socket.id} joined room: ${convoId}`);
            });

            // Leave conversation room
            socket.on('leave_conversation', (convoId) => {
                socket.leave(convoId);
                console.log(`[Socket] ${socket.id} left room: ${convoId}`);
            });

            // Real-time message sent over socket
            socket.on('send_message', (data) => {
                const { conversation_id, content, imageInfo, sender_id } = data;
                if (!conversation_id) return;

                const msg = store.addMessage({
                    conversation_id,
                    content,
                    imageInfo,
                    sender_id,
                });

                // Broadcast to everyone in the room
                io.to(conversation_id).emit('new_message', msg);
                io.emit('chat_activity', { conversation_id, lastMessage: msg });
            });

            // Typing indicators
            socket.on('typing_start', ({ conversation_id, user_name }) => {
                socket.to(conversation_id).emit('user_typing', { conversation_id, user_name, isTyping: true });
            });

            socket.on('typing_stop', ({ conversation_id, user_name }) => {
                socket.to(conversation_id).emit('user_typing', { conversation_id, user_name, isTyping: false });
            });

            socket.on('disconnect', () => {
                const userId = activeUsers.get(socket.id);
                activeUsers.delete(socket.id);
                io.emit('online_users', Array.from(new Set(activeUsers.values())));
                console.log(`[Socket] Client disconnected: ${socket.id} (user: ${userId || 'unknown'})`);
            });
        });

        console.log('[Socket] Socket.IO real-time server initialized.');
    } catch (err) {
        console.warn('[Socket] Socket.io not loaded yet, running in pure REST mode:', err.message);
    }

    return io;
}

module.exports = initSocket;
