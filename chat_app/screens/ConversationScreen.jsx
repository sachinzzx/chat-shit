import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { API_BASE_URL, AUTH_HEADER } from '../config';
import { theme } from '../theme';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import CrimsonBackground from '../components/CrimsonBackground';

const MASCOT_LOGO = require('../assets/mascot-logo.jpg');
const SACHIN_AVATAR = require('../assets/avatar-sachin.jpg');

const SQUAD_STORIES = [
    { id: 'me', name: 'My Story', isUser: true },
    { id: 's1', name: 'Sachin', hasStory: true, isOnline: true, hasCrown: true },
    { id: 's2', name: 'Vaibhav', hasStory: true, isOnline: true },
    { id: 's3', name: 'Ananya', hasStory: true, isOnline: true },
    { id: 's4', name: 'Rohit', hasStory: true, isOnline: false },
];

const ConversationScreen = ({ navigation }) => {
    const [conversation, setConversation] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'DM' | 'GROUP' | 'ROOMS'

    const fetchConversations = (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError('');

        fetch(`${API_BASE_URL}/conversation`, {
            method: 'GET',
            headers: {
                authorization: AUTH_HEADER,
            },
        })
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    setConversation([]);
                    setLoading(false);
                    setRefreshing(false);
                    return;
                }

                const promiseAll = data.map(d => {
                    if (!d.createdBy) {
                        return Promise.resolve('first');
                    }
                    return fetch(`${API_BASE_URL}/user/profile?user_id=${d.createdBy}`, {
                        method: 'GET',
                        headers: {
                            Authorization: AUTH_HEADER,
                        },
                    })
                        .then(response => response.json())
                        .then(t => t?.name ?? 'first')
                        .catch(() => 'first');
                });

                Promise.all(promiseAll)
                    .then(creators => {
                        const updated = data.map((item, index) => ({
                            ...item,
                            createdByName: creators[index],
                        }));
                        setConversation(updated);
                        setLoading(false);
                        setRefreshing(false);
                    })
                    .catch(() => {
                        setConversation(data);
                        setLoading(false);
                        setRefreshing(false);
                    });
            })
            .catch(err => {
                setError(err?.message || 'Unable to sync with server');
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const filteredConversations = useMemo(() => {
        return conversation.filter(item => {
            const name = (item.name || '').toLowerCase();
            const creator = (item.createdByName || '').toLowerCase();
            const query = searchQuery.toLowerCase().trim();

            const matchesSearch = !query || name.includes(query) || creator.includes(query);
            if (!matchesSearch) return false;

            if (activeFilter === 'DM') {
                return (item.type || '').toUpperCase() === 'DM';
            }
            if (activeFilter === 'GROUP' || activeFilter === 'ROOMS') {
                return (item.type || '').toUpperCase() === 'GROUP';
            }
            return true;
        });
    }, [conversation, searchQuery, activeFilter]);

    return (
        <CrimsonBackground>
            <View style={styles.screen}>
                {/* Header Row */}
                <View style={styles.header}>
                    <View style={styles.brandGroup}>
                        <View style={styles.mascotWrap}>
                            <Image source={MASCOT_LOGO} style={styles.mascotImg} resizeMode="cover" />
                        </View>
                        <View>
                            <View style={styles.titleLine}>
                                <Text style={styles.brandMain}>Chat.</Text>
                                <View>
                                    <Text style={styles.brandCrimson}>Shit</Text>
                                    <View style={styles.crimsonBrushUnderline} />
                                </View>
                            </View>
                            <Text style={styles.tagline}>Chat • Squad • Vibes 👑</Text>
                        </View>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.bellBtn}
                            onPress={() => fetchConversations(true)}
                            activeOpacity={0.75}
                        >
                            <Icon name="bell" size={18} color="#FFFFFF" />
                            <View style={styles.bellUnreadDot} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('AllUsers')}
                            activeOpacity={0.8}
                        >
                            <Avatar
                                name="Sachin"
                                size={44}
                                imageSource={SACHIN_AVATAR}
                                hasStory
                                showOnline
                                isOnline
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Status Summary Pill */}
                <TouchableOpacity
                    style={styles.statusPill}
                    activeOpacity={0.8}
                    onPress={() => fetchConversations(true)}
                >
                    <View style={styles.statusOnlineDot} />
                    <Text style={styles.statusText}>5 Online Squad Members</Text>
                    <Text style={styles.statusDivider}>|</Text>
                    <Text style={styles.statusIcon}>👥</Text>
                    <Text style={styles.statusText}>{conversation.length} Active Rooms</Text>
                    <Text style={styles.statusArrow}>›</Text>
                </TouchableOpacity>

                {/* Squad Stories Row */}
                <View style={styles.storiesRowWrap}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.storiesContent}
                    >
                        {SQUAD_STORIES.map(story => {
                            if (story.isUser) {
                                return (
                                    <TouchableOpacity
                                        key={story.id}
                                        style={styles.storyItem}
                                        onPress={() => navigation.navigate('CameraScreen')}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.myStoryCircle}>
                                            <Text style={styles.myStoryPlus}>+</Text>
                                        </View>
                                        <Text style={styles.storyLabel}>My Story</Text>
                                    </TouchableOpacity>
                                );
                            }

                            return (
                                <TouchableOpacity
                                    key={story.id}
                                    style={styles.storyItem}
                                    onPress={() => setSearchQuery(story.name)}
                                    activeOpacity={0.8}
                                >
                                    <Avatar
                                        name={story.name}
                                        size={54}
                                        hasStory={story.hasStory}
                                        hasCrown={story.hasCrown}
                                        showOnline
                                        isOnline={story.isOnline}
                                    />
                                    <Text style={styles.storyLabel} numberOfLines={1}>
                                        {story.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Crimson Glass Search Bar */}
                <View style={styles.searchPill}>
                    <Icon name="search" size={16} color={theme.colors.primaryGlow} style={{ marginRight: 10 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search messages, squads, or @users..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close" size={14} color={theme.colors.primaryGlow} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => setActiveFilter('ALL')}>
                            <Icon name="sliders" size={16} color={theme.colors.primaryBright} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Pills Row */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                        {[
                            { key: 'ALL', label: '🔥 All Vibes' },
                            { key: 'DM', label: '⚡ DMs' },
                            { key: 'GROUP', label: '👥 Squads' },
                            { key: 'ROOMS', label: '🚪 Rooms' },
                        ].map(filter => {
                            const isActive = activeFilter === filter.key;
                            return (
                                <TouchableOpacity
                                    key={filter.key}
                                    style={[
                                        styles.filterPill,
                                        isActive && styles.filterPillActive,
                                    ]}
                                    onPress={() => setActiveFilter(filter.key)}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.filterPillText,
                                            isActive && styles.filterPillTextActive,
                                        ]}
                                    >
                                        {filter.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Conversations List */}
                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchConversations(true)}
                            tintColor={theme.colors.primaryBright}
                        />
                    }
                >
                    {loading && !refreshing ? (
                        <View style={styles.centerBox}>
                            <ActivityIndicator size="large" color={theme.colors.primaryBright} />
                            <Text style={styles.loadingText}>Syncing crimson network...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorCard}>
                            <Text style={styles.errorEmoji}>⚠️</Text>
                            <Text style={styles.errorTitle}>Connection Interrupted</Text>
                            <Text style={styles.errorDesc}>{error}</Text>
                            <TouchableOpacity style={styles.retryBtn} onPress={() => fetchConversations()}>
                                <Text style={styles.retryText}>Reconnect ⚡</Text>
                            </TouchableOpacity>
                        </View>
                    ) : filteredConversations.length > 0 ? (
                        <>
                            {filteredConversations.map((item, index) => {
                                const isGroup = (item.type || '').toUpperCase() === 'GROUP';
                                const chatTitle = item.name || (isGroup ? 'Squad Alpha' : '[DM] sachin');
                                const isFirst = index === 0;

                                return (
                                    <TouchableOpacity
                                        key={item.id || item.conversationId || index}
                                        style={styles.chatCard}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            navigation.navigate('Chat', {
                                                data: {
                                                    name: chatTitle,
                                                    conversationId: item.id || item.conversationId || item._id,
                                                    participants: item.participants_ids || [],
                                                },
                                            });
                                        }}
                                    >
                                        <Avatar
                                            name={chatTitle}
                                            size={54}
                                            hasStory
                                            showOnline
                                            isOnline={!isGroup || isFirst}
                                            bracketInitial={!isGroup}
                                            imageSource={false}
                                        />

                                        <View style={styles.cardBody}>
                                            <View style={styles.cardTopRow}>
                                                <View style={styles.cardTitleWrap}>
                                                    <Text style={styles.cardTitle} numberOfLines={1}>
                                                        {!isGroup && !chatTitle.startsWith('[DM]') ? `[DM] ${chatTitle}` : chatTitle}
                                                    </Text>
                                                    {isGroup && (
                                                        <View style={styles.squadTag}>
                                                            <Text style={styles.squadTagText}>SQUAD</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.timeText}>
                                                    {isFirst ? 'Just now' : `${index * 9 + 2}m`}
                                                </Text>
                                            </View>

                                            <View style={styles.cardBottomRow}>
                                                <Text style={styles.snippetText} numberOfLines={1}>
                                                    <Text style={styles.senderRed}>{item.createdByName || 'first'}: </Text>
                                                    {isGroup ? 'Drop the vibes in squad chat 🔥' : 'Yo, check this out!'}
                                                </Text>

                                                {isFirst ? (
                                                    <View style={styles.newBadgeWrap}>
                                                        <View style={styles.newBadge}>
                                                            <Text style={styles.newBadgeText}>NEW</Text>
                                                        </View>
                                                        <View style={styles.newRedDot} />
                                                    </View>
                                                ) : (
                                                    <Text style={styles.doubleCheckRed}>✓✓</Text>
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}

                            {/* Good Vibes Only Decorative Showcase over Red Moon Art */}
                            <View style={styles.vibeShowcase}>
                                <Text style={styles.vibeWhite}>Good Vibes</Text>
                                <Text style={styles.vibeRed}>Only</Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyEmoji}>🩸</Text>
                            <Text style={styles.emptyTitle}>No Chats Found</Text>
                            <Text style={styles.emptyDesc}>
                                {searchQuery ? 'No matching chats for your search.' : 'Tap the glowing + button below to assemble your squad!'}
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </CrimsonBackground>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 8,
    },
    brandGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    mascotWrap: {
        width: 48,
        height: 48,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: theme.colors.borderBright,
        overflow: 'hidden',
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 10,
        elevation: 8,
    },
    mascotImg: {
        width: '100%',
        height: '100%',
    },
    titleLine: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    brandMain: {
        fontSize: 27,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    brandCrimson: {
        fontSize: 27,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FF2424',
        textShadowColor: 'rgba(255, 20, 20, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    crimsonBrushUnderline: {
        height: 3,
        backgroundColor: '#FF2424',
        borderRadius: 2,
        marginTop: -2,
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
    },
    tagline: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        marginTop: 2,
        letterSpacing: 0.5,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bellBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(22, 6, 9, 0.88)',
        borderWidth: 1.2,
        borderColor: theme.colors.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    bellUnreadDot: {
        position: 'absolute',
        top: 6,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF1F1F',
        borderWidth: 1,
        borderColor: '#050204',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'rgba(18, 6, 9, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255, 36, 36, 0.45)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginTop: 4,
        marginBottom: 10,
        gap: 6,
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
    },
    statusOnlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.onlineDot,
    },
    statusText: {
        color: '#F3E8EA',
        fontSize: 11,
        fontWeight: '700',
    },
    statusDivider: {
        color: 'rgba(255, 255, 255, 0.25)',
        fontSize: 12,
        marginHorizontal: 2,
    },
    statusIcon: {
        fontSize: 12,
    },
    statusArrow: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    storiesRowWrap: {
        marginBottom: 10,
    },
    storiesContent: {
        paddingHorizontal: 18,
        gap: 14,
    },
    storyItem: {
        alignItems: 'center',
        width: 62,
    },
    myStoryCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#FF3333',
        backgroundColor: 'rgba(255, 30, 30, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    myStoryPlus: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '600',
        marginTop: -2,
    },
    storyLabel: {
        color: '#E5D5D7',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 5,
    },
    searchPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(14, 5, 7, 0.88)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 36, 36, 0.55)',
        borderRadius: 24,
        marginHorizontal: 18,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 10,
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 13.5,
        padding: 0,
    },
    filterContainer: {
        marginBottom: 12,
    },
    filterRow: {
        paddingHorizontal: 18,
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: 'rgba(18, 6, 9, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(255, 45, 45, 0.3)',
    },
    filterPillActive: {
        backgroundColor: '#B91C1C',
        borderColor: '#FF4D4D',
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 6,
    },
    filterPillText: {
        color: '#D4B8BC',
        fontSize: 12,
        fontWeight: '700',
    },
    filterPillTextActive: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 18,
        paddingBottom: 130,
    },
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 5, 8, 0.86)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 36, 36, 0.55)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 12,
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    cardBody: {
        flex: 1,
        marginLeft: 14,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        marginRight: 8,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    squadTag: {
        backgroundColor: 'rgba(153, 27, 27, 0.45)',
        borderWidth: 1,
        borderColor: '#FF3333',
        paddingHorizontal: 7,
        paddingVertical: 1.5,
        borderRadius: 8,
    },
    squadTagText: {
        color: '#FF7070',
        fontSize: 9.5,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    timeText: {
        color: '#C9A9AD',
        fontSize: 11.5,
        fontWeight: '600',
    },
    cardBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    snippetText: {
        color: '#E5D5D7',
        fontSize: 13,
        flex: 1,
        marginRight: 8,
    },
    senderRed: {
        color: '#FF3B3B',
        fontWeight: '700',
    },
    newBadgeWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    newBadge: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    newBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
    },
    newRedDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#FF2424',
    },
    doubleCheckRed: {
        color: '#FF3333',
        fontSize: 13,
        fontWeight: '900',
    },
    vibeShowcase: {
        alignItems: 'flex-end',
        marginTop: 32,
        marginRight: 10,
        paddingBottom: 20,
    },
    vibeWhite: {
        color: 'rgba(255, 255, 255, 0.92)',
        fontSize: 28,
        fontWeight: '900',
        fontStyle: 'italic',
        transform: [{ rotate: '-4deg' }],
        textShadowColor: 'rgba(0, 0, 0, 0.9)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 6,
    },
    vibeRed: {
        color: '#FF2424',
        fontSize: 34,
        fontWeight: '900',
        fontStyle: 'italic',
        marginTop: -6,
        marginRight: 20,
        transform: [{ rotate: '-4deg' }],
        textShadowColor: 'rgba(255, 20, 20, 0.85)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },
    centerBox: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        color: '#FF4D4D',
        marginTop: 10,
        fontSize: 13,
        fontWeight: '700',
    },
    errorCard: {
        backgroundColor: 'rgba(40, 8, 12, 0.9)',
        borderWidth: 1,
        borderColor: '#FF2424',
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
        marginTop: 20,
    },
    errorEmoji: {
        fontSize: 32,
    },
    errorTitle: {
        color: '#FF4D4D',
        fontSize: 16,
        fontWeight: '800',
        marginTop: 8,
    },
    errorDesc: {
        color: '#D4B8BC',
        fontSize: 13,
        marginTop: 4,
        textAlign: 'center',
        marginBottom: 14,
    },
    retryBtn: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    emptyCard: {
        backgroundColor: 'rgba(18, 6, 9, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(255, 36, 36, 0.35)',
        borderRadius: 20,
        padding: 36,
        alignItems: 'center',
        marginTop: 20,
    },
    emptyEmoji: {
        fontSize: 36,
        marginBottom: 10,
    },
    emptyTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    emptyDesc: {
        color: '#A88B8E',
        fontSize: 13,
        marginTop: 6,
        textAlign: 'center',
    },
});

export default ConversationScreen;
