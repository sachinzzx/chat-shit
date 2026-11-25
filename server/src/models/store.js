const fs = require('fs');
const path = require('path');
const config = require('../config');

class Store {
    constructor() {
        this.dataFile = path.join(config.dataDir, 'db.json');
        this.seedFile = path.join(config.dataDir, 'seed.json');
        this.data = {
            users: [],
            conversations: [],
            messages: [],
        };
        this.isSaving = false;
        this.saveScheduled = false;
        this.init();
    }

    init() {
        // Ensure directories exist
        if (!fs.existsSync(config.dataDir)) {
            fs.mkdirSync(config.dataDir, { recursive: true });
        }
        if (!fs.existsSync(config.uploadDir)) {
            fs.mkdirSync(config.uploadDir, { recursive: true });
        }

        // Load existing db.json or fallback to seed.json
        if (fs.existsSync(this.dataFile)) {
            try {
                const raw = fs.readFileSync(this.dataFile, 'utf-8');
                this.data = JSON.parse(raw);
                console.log('[Database] Loaded existing database from:', this.dataFile);
                return;
            } catch (err) {
                console.warn('[Database] Failed to parse db.json, falling back to seed:', err.message);
            }
        }

        // Seed initialization
        if (fs.existsSync(this.seedFile)) {
            try {
                const seedRaw = fs.readFileSync(this.seedFile, 'utf-8');
                this.data = JSON.parse(seedRaw);
                this.persist();
                console.log('[Database] Initialized database from seed file.');
                return;
            } catch (err) {
                console.warn('[Database] Failed to read seed file:', err.message);
            }
        }

        // In-code fallback if seed file is missing
        this.data = {
            users: [{ id: 'u1', name: 'Sachin Kumar', bio: 'App Developer' }],
            conversations: [],
            messages: [],
        };
        this.persist();
    }

    persist() {
        if (this.isSaving) {
            this.saveScheduled = true;
            return;
        }

        this.isSaving = true;
        fs.writeFile(this.dataFile, JSON.stringify(this.data, null, 2), 'utf-8', (err) => {
            this.isSaving = false;
            if (err) {
                console.error('[Database] Error saving to disk:', err.message);
            }
            if (this.saveScheduled) {
                this.saveScheduled = false;
                this.persist();
            }
        });
    }

    // --- Users ---
    getUsers() {
        return this.data.users || [];
    }

    getUserById(id) {
        return this.data.users.find(u => u.id === id);
    }

    addUser(userData) {
        const user = {
            id: userData.id || `u_${Date.now()}`,
            name: userData.name || 'Anonymous User',
            bio: userData.bio || 'Available for chat',
            status: userData.status || 'online',
            avatar: userData.avatar || '',
            createdAt: Date.now(),
        };
        this.data.users.push(user);
        this.persist();
        return user;
    }

    // --- Conversations ---
    getConversations() {
        return this.data.conversations || [];
    }

    getConversationById(id) {
        return this.data.conversations.find(c => c.id === id);
    }

    addConversation(convoData) {
        const convo = {
            id: convoData.id || `c_${Date.now()}`,
            name: convoData.name || (convoData.type === 'GROUP' ? 'New Squad' : 'Direct Message'),
            type: convoData.type || 'DM',
            createdBy: convoData.createdBy || (convoData.participants_ids && convoData.participants_ids[0]) || 'u1',
            participants_ids: convoData.participants_ids || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        this.data.conversations.unshift(convo);
        this.persist();
        return convo;
    }

    // --- Messages ---
    getMessages(conversationId) {
        if (!conversationId) return this.data.messages || [];
        return this.data.messages.filter(m => m.conversation_id === conversationId);
    }

    addMessage(msgData) {
        const msg = {
            id: msgData.id || `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            conversation_id: msgData.conversation_id,
            sender_id: msgData.sender_id || 'u1',
            content: msgData.content || (msgData.imageInfo ? 'Sent an image' : ''),
            imageInfo: msgData.imageInfo || '',
            timestamp: msgData.timestamp || Date.now(),
        };
        this.data.messages.push(msg);

        // Update conversation timestamp
        const convo = this.getConversationById(msgData.conversation_id);
        if (convo) {
            convo.updatedAt = Date.now();
        }

        this.persist();
        return msg;
    }

    getStats() {
        return {
            usersCount: (this.data.users || []).length,
            conversationsCount: (this.data.conversations || []).length,
            messagesCount: (this.data.messages || []).length,
            dbPath: this.dataFile,
        };
    }
}

const store = new Store();
module.exports = store;
