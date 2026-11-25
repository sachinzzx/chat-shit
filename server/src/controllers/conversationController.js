const store = require('../models/store');

exports.getConversations = (req, res) => {
    try {
        const convos = store.getConversations();
        res.json(convos);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch conversations', message: err.message });
    }
};

exports.getConversationById = (req, res) => {
    try {
        const { id } = req.params;
        const convo = store.getConversationById(id);
        if (!convo) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        res.json(convo);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch conversation', message: err.message });
    }
};

exports.createConversation = (req, res) => {
    try {
        const { type, name, participants_ids } = req.body;
        
        if (!participants_ids || !Array.isArray(participants_ids) || participants_ids.length === 0) {
            return res.status(400).json({ error: 'participants_ids must be a non-empty array' });
        }

        const newConvo = store.addConversation({
            type: type || 'DM',
            name: name ? name.trim() : (type === 'GROUP' ? 'New Squad' : 'Direct Chat'),
            participants_ids,
            createdBy: participants_ids[0],
        });

        // Broadcast to socket clients if available
        if (req.app.get('io')) {
            req.app.get('io').emit('conversation_created', newConvo);
        }

        console.log(`[Conversation] Created "${newConvo.name}" (${newConvo.type})`);
        res.status(201).json(newConvo);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create conversation', message: err.message });
    }
};
