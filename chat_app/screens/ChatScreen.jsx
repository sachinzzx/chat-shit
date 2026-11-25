import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, AUTH_HEADER } from '../config';
import { theme } from '../theme';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import CrimsonBackground from '../components/CrimsonBackground';
import { pushMessageToFirebase, isFirebaseConfigured } from '../services/firebase';

const REACTIONS = ['🔥', '🩸', '⚡', '❤️', '😂', '👑'];

const ChatScreen = ({ navigation, route }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentMessage, setCurrentMessage] = useState('');
    const [participantsName, setParticipantsName] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [sending, setSending] = useState(false);
    const [previewModalImage, setPreviewModalImage] = useState(null);
    const [showAttachmentDrawer, setShowAttachmentDrawer] = useState(false);
    const [messageReactions, setMessageReactions] = useState({});

    const scrollViewRef = useRef(null);
    const convoData = route?.params?.data;
    const conversationId = convoData?.conversationId;
    const conversationName = convoData?.name || 'Squad Chat';

    const fetchMessages = () => {
        if (!conversationId) return;
        setLoading(true);
        fetch(`${API_BASE_URL}/message?conversation_id=${conversationId}`, {
            headers: {
                authorization: AUTH_HEADER,
            },
        })
            .then(response => response.json())
            .then(data => {
                setLoading(false);
                setMessages(data);
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            })
            .catch(err => {
                setLoading(false);
                setError(err?.message || 'Failed to load messages');
            });
    };

    const pickImageFromGallery = async () => {
        setShowAttachmentDrawer(false);
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission Needed', 'Media library access is needed to share photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setSelectedImage({
                    uri: asset.uri,
                    base64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri,
                });
            }
        } catch (err) {
            console.warn('Pick image error:', err);
        }
    };

    const takePhotoFromCamera = async () => {
        setShowAttachmentDrawer(false);
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission Needed', 'Camera access is needed to snap photos.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setSelectedImage({
                    uri: asset.uri,
                    base64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri,
                });
            }
        } catch (err) {
            console.warn('Camera error:', err);
        }
    };

    useEffect(() => {
        fetchMessages();

        const participants = convoData?.participants;
        if (Array.isArray(participants) && participants.length > 0) {
            const promiseAll = participants.map(d => {
                return fetch(`${API_BASE_URL}/user/profile?user_id=${d}`, {
                    method: 'GET',
                    headers: {
                        Authorization: AUTH_HEADER,
                    },
                })
                    .then(response => response.json())
                    .then(t => t?.name ?? d)
                    .catch(() => d);
            });

            Promise.all(promiseAll)
                .then(d => {
                    setParticipantsName(d);
                })
                .catch(e => {
                    setError(e?.message || String(e));
                });
        }
    }, [conversationId]);

    const handleSendMessage = async () => {
        if (!conversationId) return;
        const textToSend = currentMessage.trim();
        const imageToSend = selectedImage?.base64;

        if (!textToSend && !imageToSend) return;

        setSending(true);

        const payload = {
            conversation_id: conversationId,
            content: textToSend || 'Sent a photo',
        };
        if (imageToSend) {
            payload.imageInfo = imageToSend;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/message`, {
                method: 'POST',
                headers: {
                    Authorization: AUTH_HEADER,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            await res.json();

            if (isFirebaseConfigured()) {
                pushMessageToFirebase(conversationId, payload);
            }

            setCurrentMessage('');
            setSelectedImage(null);
            setSending(false);
            fetchMessages();
        } catch (e) {
            setSending(false);
            setError(e?.message || 'Failed to send message');
        }
    };

    const addReactionToMessage = (msgId, emoji) => {
        setMessageReactions(prev => {
            const current = prev[msgId] || [];
            if (current.includes(emoji)) {
                return { ...prev, [msgId]: current.filter(e => e !== emoji) };
            }
            return { ...prev, [msgId]: [...current, emoji] };
        });
    };

    const messageList = Array.isArray(messages)
        ? messages
        : (messages?.data && Array.isArray(messages.data) ? messages.data : []);

    return (
        <CrimsonBackground>
            <KeyboardAvoidingView
                style={styles.screen}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Crimson Glass Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Icon name="back" size={26} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Avatar name={conversationName} size={44} showOnline hasStory hasCrown />

                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {conversationName}
                        </Text>
                        <Text style={styles.headerStatus} numberOfLines={1}>
                            {participantsName.length > 0
                                ? `👑 ${participantsName.length} Squad Members`
                                : '🟢 Online • Red Moon Room'}
                        </Text>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => Alert.alert('Voice Call', `Dialing ${conversationName}...`)}
                        >
                            <Icon name="call" size={17} color="#FF4D4D" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => Alert.alert('Video Room', `Starting video squad call with ${conversationName}...`)}
                        >
                            <Icon name="video" size={17} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Crimson Reaction Pill Strip */}
                <View style={styles.reactionBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reactionScroll}>
                        {REACTIONS.map((emoji) => (
                            <TouchableOpacity
                                key={emoji}
                                style={styles.reactionPill}
                                onPress={() => setCurrentMessage(prev => `${prev ? prev + ' ' : ''}${emoji}`)}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.reactionEmoji}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Messages Scroll */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messageScroll}
                    contentContainerStyle={styles.messageListContent}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    <View style={styles.dateDivider}>
                        <Text style={styles.dateDividerText}>🔥 TODAY • RED MOON ENCRYPTED</Text>
                    </View>

                    {loading && messageList.length === 0 ? (
                        <View style={styles.centerBox}>
                            <ActivityIndicator size="small" color={theme.colors.primaryBright} />
                            <Text style={styles.loadingText}>Loading crimson feed...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>⚠️ {error}</Text>
                        </View>
                    ) : messageList.length === 0 ? (
                        <View style={styles.emptyThread}>
                            <Text style={styles.emptyThreadEmoji}>👑</Text>
                            <Text style={styles.emptyThreadTitle}>Drop First Vibe</Text>
                            <Text style={styles.emptyThreadSubtitle}>
                                Send a message or snap a photo to light up the room!
                            </Text>
                        </View>
                    ) : (
                        messageList.map((msg, index) => {
                            const isImage = Boolean(msg.imageInfo);
                            const content = msg.content;
                            const isSent = (index % 2 === 1) || Boolean(msg.isMine);
                            const msgId = msg.id || index;
                            const reactions = messageReactions[msgId] || [];

                            const imageUri = isImage
                                ? (msg.imageInfo.startsWith('http') ||
                                   msg.imageInfo.startsWith('file:') ||
                                   msg.imageInfo.startsWith('data:')
                                    ? msg.imageInfo
                                    : `data:image/jpeg;base64,${msg.imageInfo}`)
                                : null;

                            return (
                                <View
                                    key={msgId}
                                    style={[
                                        styles.bubbleRow,
                                        isSent ? styles.bubbleRowSent : styles.bubbleRowReceived,
                                    ]}
                                >
                                    {!isSent && (
                                        <Avatar name={conversationName} size={32} style={styles.bubbleAvatar} />
                                    )}

                                    <View style={styles.bubbleCol}>
                                        {!isSent && (
                                            <Text style={styles.senderTag}>@{conversationName.replace(/\[DM\]/gi, '').trim().split(' ')[0]}</Text>
                                        )}

                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            onLongPress={() => addReactionToMessage(msgId, '🔥')}
                                            style={[
                                                styles.bubble,
                                                isSent ? styles.bubbleSent : styles.bubbleReceived,
                                            ]}
                                        >
                                            {isImage && (
                                                <TouchableOpacity
                                                    activeOpacity={0.9}
                                                    onPress={() => setPreviewModalImage(imageUri)}
                                                >
                                                    <Image
                                                        source={{ uri: imageUri }}
                                                        style={styles.messageImage}
                                                        resizeMode="cover"
                                                    />
                                                </TouchableOpacity>
                                            )}

                                            {content ? (
                                                <Text style={styles.messageText}>
                                                    {content}
                                                </Text>
                                            ) : null}

                                            <View style={styles.bubbleFooter}>
                                                <Text style={styles.timeLabel}>
                                                    12:{40 + (index % 19)} PM
                                                </Text>
                                                {isSent && <Text style={styles.readCheck}>✓✓</Text>}
                                            </View>
                                        </TouchableOpacity>

                                        {reactions.length > 0 && (
                                            <View style={[styles.reactionBadgeRow, isSent && styles.reactionBadgeRowSent]}>
                                                {reactions.map((r, rIdx) => (
                                                    <View key={rIdx} style={styles.reactionBadge}>
                                                        <Text style={styles.reactionBadgeText}>{r} 1</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>

                {/* Attached Image Tray */}
                {selectedImage && (
                    <View style={styles.attachmentTray}>
                        <Image source={{ uri: selectedImage.uri }} style={styles.attachmentThumb} />
                        <View style={styles.attachmentMeta}>
                            <Text style={styles.attachmentTitle}>Photo Attached 📸</Text>
                            <Text style={styles.attachmentSub}>Tap lightning bolt to send</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.closeAttachBtn}
                            onPress={() => setSelectedImage(null)}
                        >
                            <Icon name="close" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Expandable Media Drawer */}
                {showAttachmentDrawer && (
                    <View style={styles.mediaDrawer}>
                        <View style={styles.drawerRow}>
                            <TouchableOpacity style={styles.drawerItem} onPress={takePhotoFromCamera}>
                                <Text style={styles.drawerEmoji}>📸</Text>
                                <Text style={styles.drawerLabel}>Camera</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.drawerItem} onPress={pickImageFromGallery}>
                                <Text style={styles.drawerEmoji}>🖼️</Text>
                                <Text style={styles.drawerLabel}>Gallery</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.drawerItem}
                                onPress={() => {
                                    setShowAttachmentDrawer(false);
                                    setCurrentMessage('🎙️ [Voice Vibe 0:14]');
                                }}
                            >
                                <Text style={styles.drawerEmoji}>🎙️</Text>
                                <Text style={styles.drawerLabel}>Voice</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.drawerItem}
                                onPress={() => {
                                    setShowAttachmentDrawer(false);
                                    setCurrentMessage('👑 [King Sticker]');
                                }}
                            >
                                <Text style={styles.drawerEmoji}>👑</Text>
                                <Text style={styles.drawerLabel}>Sticker</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Crimson Bottom Input Bar */}
                <View style={styles.inputBar}>
                    <TouchableOpacity
                        style={[
                            styles.drawerToggleBtn,
                            showAttachmentDrawer && styles.drawerToggleBtnActive,
                        ]}
                        onPress={() => setShowAttachmentDrawer(!showAttachmentDrawer)}
                        activeOpacity={0.8}
                    >
                        <Icon name={showAttachmentDrawer ? "close" : "plus"} size={18} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.inputField}
                        placeholder="Drop a message..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={currentMessage}
                        onChangeText={setCurrentMessage}
                        multiline
                        maxLength={1000}
                    />

                    <TouchableOpacity
                        style={[
                            styles.sendPillBtn,
                            (!currentMessage.trim() && !selectedImage) && styles.sendPillBtnDisabled,
                        ]}
                        onPress={handleSendMessage}
                        disabled={(!currentMessage.trim() && !selectedImage) || sending}
                        activeOpacity={0.85}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.sendIcon}>⚡</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Fullscreen Image Modal */}
                <Modal
                    visible={Boolean(previewModalImage)}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setPreviewModalImage(null)}
                >
                    <View style={styles.modalBg}>
                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setPreviewModalImage(null)}
                        >
                            <Icon name="close" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                        {previewModalImage && (
                            <Image
                                source={{ uri: previewModalImage }}
                                style={styles.modalFullImage}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </CrimsonBackground>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 12,
        backgroundColor: 'rgba(14, 5, 7, 0.92)',
        borderBottomWidth: 1.5,
        borderBottomColor: theme.colors.border,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(34, 9, 14, 0.9)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
        marginLeft: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    headerStatus: {
        fontSize: 11,
        color: '#FF4D4D',
        marginTop: 2,
        fontWeight: '700',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(26, 7, 11, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    reactionBar: {
        backgroundColor: 'rgba(10, 3, 5, 0.85)',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 36, 36, 0.2)',
    },
    reactionScroll: {
        paddingHorizontal: 16,
        gap: 10,
    },
    reactionPill: {
        backgroundColor: 'rgba(24, 7, 11, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255, 45, 45, 0.35)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    reactionEmoji: {
        fontSize: 16,
    },
    messageScroll: {
        flex: 1,
    },
    messageListContent: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingBottom: 24,
    },
    dateDivider: {
        alignSelf: 'center',
        backgroundColor: 'rgba(20, 6, 9, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(255, 36, 36, 0.3)',
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 12,
        marginVertical: 12,
    },
    dateDividerText: {
        color: '#FF6B6B',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    centerBox: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        color: '#FF4D4D',
        marginTop: 8,
        fontSize: 12,
    },
    errorBox: {
        backgroundColor: 'rgba(40, 8, 12, 0.9)',
        borderWidth: 1,
        borderColor: '#FF2424',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    errorText: {
        color: '#FF4D4D',
        fontSize: 13,
        textAlign: 'center',
    },
    emptyThread: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyThreadEmoji: {
        fontSize: 40,
        marginBottom: 10,
    },
    emptyThreadTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    emptyThreadSubtitle: {
        color: '#A88B8E',
        fontSize: 13,
        marginTop: 4,
    },
    bubbleRow: {
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    bubbleRowSent: {
        justifyContent: 'flex-end',
    },
    bubbleRowReceived: {
        justifyContent: 'flex-start',
    },
    bubbleAvatar: {
        marginRight: 8,
        marginBottom: 4,
    },
    bubbleCol: {
        maxWidth: '82%',
    },
    senderTag: {
        color: '#FF4D4D',
        fontSize: 11,
        fontWeight: '800',
        marginBottom: 3,
        marginLeft: 6,
    },
    bubble: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    bubbleSent: {
        backgroundColor: '#991B1B',
        borderWidth: 1.5,
        borderColor: '#FF3B3B',
        borderBottomRightRadius: 4,
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.55,
        shadowRadius: 8,
        elevation: 6,
    },
    bubbleReceived: {
        backgroundColor: 'rgba(18, 6, 9, 0.92)',
        borderBottomLeftRadius: 4,
        borderWidth: 1.2,
        borderColor: 'rgba(255, 36, 36, 0.45)',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    messageImage: {
        width: 240,
        height: 180,
        borderRadius: 14,
        marginBottom: 8,
    },
    bubbleFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        marginTop: 4,
    },
    timeLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.65)',
    },
    readCheck: {
        color: '#FF6B6B',
        fontSize: 11,
        fontWeight: '900',
    },
    reactionBadgeRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: -6,
        marginLeft: 8,
    },
    reactionBadgeRowSent: {
        justifyContent: 'flex-end',
        marginRight: 8,
    },
    reactionBadge: {
        backgroundColor: '#1F080C',
        borderWidth: 1,
        borderColor: '#FF3333',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 10,
    },
    reactionBadgeText: {
        fontSize: 11,
        color: '#FFFFFF',
    },
    attachmentTray: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(26, 7, 11, 0.95)',
        borderColor: '#FF3333',
        borderWidth: 1,
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 8,
        borderRadius: 14,
    },
    attachmentThumb: {
        width: 48,
        height: 48,
        borderRadius: 10,
    },
    attachmentMeta: {
        flex: 1,
        marginLeft: 10,
    },
    attachmentTitle: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 13,
    },
    attachmentSub: {
        color: '#A88B8E',
        fontSize: 11,
        marginTop: 2,
    },
    closeAttachBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#DC2626',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mediaDrawer: {
        backgroundColor: 'rgba(14, 5, 7, 0.96)',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    drawerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    drawerItem: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(34, 9, 14, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255, 36, 36, 0.4)',
        width: '23%',
    },
    drawerEmoji: {
        fontSize: 22,
        marginBottom: 6,
    },
    drawerLabel: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        paddingBottom: Platform.OS === 'ios' ? 24 : 14,
        backgroundColor: 'rgba(12, 4, 6, 0.94)',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: 8,
    },
    drawerToggleBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(34, 9, 14, 0.95)',
        borderWidth: 1,
        borderColor: '#FF3333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    drawerToggleBtnActive: {
        backgroundColor: '#DC2626',
    },
    inputField: {
        flex: 1,
        minHeight: 42,
        maxHeight: 110,
        backgroundColor: 'rgba(20, 6, 9, 0.9)',
        borderWidth: 1.2,
        borderColor: 'rgba(255, 36, 36, 0.45)',
        borderRadius: 21,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#FFFFFF',
        fontSize: 14,
    },
    sendPillBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#DC2626',
        borderWidth: 1.5,
        borderColor: '#FF4D4D',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.85,
        shadowRadius: 8,
        elevation: 6,
    },
    sendPillBtnDisabled: {
        backgroundColor: 'rgba(34, 9, 14, 0.8)',
        borderColor: 'rgba(255, 36, 36, 0.2)',
        opacity: 0.45,
    },
    sendIcon: {
        fontSize: 19,
    },
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalClose: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(220, 38, 38, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalFullImage: {
        width: '92%',
        height: '75%',
    },
});

export default ChatScreen;
