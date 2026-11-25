const store = require('../models/store');

exports.getMessages = (req, res) => {
    try {
        const conversationId = req.query.conversation_id;
        const messages = store.getMessages(conversationId);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages', message: err.message });
    }
};

exports.sendMessage = (req, res) => {
    try {
        const { conversation_id, content, imageInfo, sender_id } = req.body;

        if (!conversation_id) {
            return res.status(400).json({ error: 'conversation_id is required' });
        }

        if (!content && !imageInfo) {
            return res.status(400).json({ error: 'Message must have content or imageInfo' });
        }

        const newMsg = store.addMessage({
            conversation_id,
            content: content || (imageInfo ? 'Sent an image' : ''),
            imageInfo: imageInfo || '',
            sender_id: sender_id || 'u1',
        });

        // Broadcast real-time message to active Socket.IO room
        const io = req.app.get('io');
        if (io) {
            io.to(conversation_id).emit('new_message', newMsg);
            io.emit('chat_activity', { conversation_id, lastMessage: newMsg });
        }

        console.log(`[Message] Sent in convo: ${conversation_id}`);
        res.status(201).json(newMsg);
    } catch (err) {
        res.status(500).json({ error: 'Failed to send message', message: err.message });
    }
};
