const store = require('../models/store');

exports.getUsers = (req, res) => {
    try {
        const users = store.getUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users', message: err.message });
    }
};

exports.getUserProfile = (req, res) => {
    try {
        const userId = req.query.user_id || req.params.id;
        if (!userId) {
            return res.status(400).json({ error: 'user_id query param or path param is required' });
        }

        const user = store.getUserById(userId);
        if (!user) {
            // Provide a graceful fallback profile instead of failing
            return res.json({
                id: userId,
                name: `User ${userId}`,
                bio: 'ChatShit Squad Member',
                status: 'offline',
            });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user profile', message: err.message });
    }
};

exports.createUser = (req, res) => {
    try {
        const { name, bio, status, avatar } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'name is required' });
        }

        const newUser = store.addUser({
            name,
            bio,
            status,
            avatar,
        });

        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create user', message: err.message });
    }
};
