/**
 * Firebase Service for ChatShit App
 * 
 * Configured automatically from google-services.json:
 * Project: chat-shit-a9666
 * App ID: 1:933525374336:android:0abc2d57af9161e294ad65
 * 
 * Works out of the box in Expo / React Native without native compilation issues.
 */

export const firebaseConfig = {
    apiKey: "AIzaSyCzy2_ys5R55URnHshIwe8jzWYQepmtbCk",
    authDomain: "chat-shit-a9666.firebaseapp.com",
    databaseURL: "https://chat-shit-a9666-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chat-shit-a9666",
    storageBucket: "chat-shit-a9666.firebasestorage.app",
    messagingSenderId: "933525374336",
    appId: "1:933525374336:android:0abc2d57af9161e294ad65",
};

export const isFirebaseConfigured = () => {
    return Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);
};

/**
 * Save a message to Firebase (supports Realtime Database & Firestore REST)
 */
export async function pushMessageToFirebase(conversationId, messagePayload) {
    if (!isFirebaseConfigured()) {
        return null;
    }

    const payloadWithTime = {
        ...messagePayload,
        timestamp: Date.now(),
    };

    // 1. Try Realtime Database first if active
    try {
        const rtdbUrl = `${firebaseConfig.databaseURL}/conversations/${conversationId}/messages.json?auth=${firebaseConfig.apiKey}`;
        const res = await fetch(rtdbUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadWithTime),
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (err) {
        // Fall through to Firestore
    }

    // 2. Try Cloud Firestore REST
    try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/conversations/${conversationId}/messages?key=${firebaseConfig.apiKey}`;
        const res = await fetch(firestoreUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fields: {
                    conversation_id: { stringValue: conversationId },
                    content: { stringValue: messagePayload.content || '' },
                    imageInfo: { stringValue: messagePayload.imageInfo || '' },
                    timestamp: { integerValue: String(Date.now()) },
                },
            }),
        });
        return await res.json();
    } catch (err) {
        console.warn('[Firebase] pushMessage error:', err);
        return null;
    }
}

/**
 * Fetch messages from Firebase
 */
export async function fetchMessagesFromFirebase(conversationId) {
    if (!isFirebaseConfigured()) {
        return [];
    }

    // Try Realtime Database
    try {
        const rtdbUrl = `${firebaseConfig.databaseURL}/conversations/${conversationId}/messages.json?auth=${firebaseConfig.apiKey}`;
        const res = await fetch(rtdbUrl);
        if (res.ok) {
            const data = await res.json();
            if (data) {
                return Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                }));
            }
        }
    } catch (err) {
        // Fall through
    }

    // Try Firestore REST
    try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/conversations/${conversationId}/messages?key=${firebaseConfig.apiKey}`;
        const res = await fetch(firestoreUrl);
        if (res.ok) {
            const json = await res.json();
            if (json.documents && Array.isArray(json.documents)) {
                return json.documents.map(doc => {
                    const fields = doc.fields || {};
                    return {
                        id: doc.name.split('/').pop(),
                        conversation_id: fields.conversation_id?.stringValue || conversationId,
                        content: fields.content?.stringValue || '',
                        imageInfo: fields.imageInfo?.stringValue || '',
                        timestamp: Number(fields.timestamp?.integerValue) || Date.now(),
                    };
                });
            }
        }
    } catch (err) {
        console.warn('[Firebase] fetchMessages error:', err);
    }

    return [];
}

/**
 * Upload image to Firebase Cloud Storage via REST
 */
export async function uploadImageToFirebaseStorage(base64Data, filename = `img_${Date.now()}.jpg`) {
    if (!firebaseConfig.storageBucket || !firebaseConfig.apiKey) {
        return null;
    }

    try {
        const bucket = firebaseConfig.storageBucket;
        const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=chat_images%2F${filename}&key=${firebaseConfig.apiKey}`;

        // Clean base64 header if present
        const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

        const res = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'image/jpeg',
            },
            body: cleanBase64,
        });

        if (res.ok) {
            const json = await res.json();
            const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/chat_images%2F${filename}?alt=media&token=${json.downloadTokens}`;
            return downloadUrl;
        }
    } catch (err) {
        console.warn('[Firebase] uploadImage error:', err);
    }
    return null;
}
