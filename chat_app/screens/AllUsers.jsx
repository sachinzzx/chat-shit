import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { API_BASE_URL, AUTH_HEADER } from '../config';
import { theme } from '../theme';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import CrimsonBackground from '../components/CrimsonBackground';

const ROLE_TAGS = ['👑 Kingpin', '🔥 Vibe Master', '⚡ Striker', '🎨 Creator', '☕ Night Owl'];

const AllUsers = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [err, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [type, setType] = useState('DM');
    const [convoName, setConvoName] = useState('');

    const fetchUsers = () => {
        setLoading(true);
        setError('');
        fetch(`${API_BASE_URL}/user`, {
            headers: {
                authorization: AUTH_HEADER,
            },
        })
            .then(res => res.json())
            .then(data => {
                setUsers(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                setError(error?.message || 'Failed to fetch users');
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleUserSelection = (userId) => {
        if (type === 'DM') {
            setSelectedUsers([userId]);
        } else {
            setSelectedUsers(prev =>
                prev.includes(userId)
                    ? prev.filter(id => id !== userId)
                    : [...prev, userId]
            );
        }
    };

    const handleCreateConversation = () => {
        if (selectedUsers.length === 0) {
            Alert.alert('Pick Someone First', 'Please select at least one squad mate.');
            return;
        }

        const defaultName = type === 'GROUP' ? 'Crimson Squad 🔥' : 'Direct Vibe';
        const finalName = convoName.trim() || defaultName;

        setCreating(true);

        fetch(`${API_BASE_URL}/conversation`, {
            method: 'POST',
            headers: {
                Authorization: AUTH_HEADER,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type,
                name: finalName,
                participants_ids: selectedUsers,
            }),
        })
            .then(response => response.json())
            .then(() => {
                setCreating(false);
                setConvoName('');
                setSelectedUsers([]);
                Alert.alert('Squad Ready! 👑', `Room "${finalName}" created.`, [
                    {
                        text: 'Open Chats 🔥',
                        onPress: () => navigation.navigate('Conversations'),
                    },
                ]);
            })
            .catch(e => {
                setCreating(false);
                Alert.alert('Error', e?.message || 'Failed to create conversation');
            });
    };

    const filteredUsers = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return users;
        return users.filter(
            u =>
                (u.name || '').toLowerCase().includes(q) ||
                (u.bio || '').toLowerCase().includes(q)
        );
    }, [users, searchQuery]);

    const selectedUserObjects = useMemo(() => {
        return users.filter(u => selectedUsers.includes(u.id));
    }, [users, selectedUsers]);

    return (
        <CrimsonBackground>
            <View style={styles.screen}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Assemble Squad 👑</Text>
                        <Text style={styles.headerSubtitle}>
                            Select members to ignite a new DM or Squad room
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.refreshBtn} onPress={fetchUsers}>
                        <Icon name="refresh" size={16} color="#FF4D4D" />
                    </TouchableOpacity>
                </View>

                <View style={styles.segmentContainer}>
                    <TouchableOpacity
                        style={[styles.segmentBtn, type === 'DM' && styles.segmentBtnActive]}
                        onPress={() => {
                            setType('DM');
                            if (selectedUsers.length > 1) {
                                setSelectedUsers(selectedUsers.slice(0, 1));
                            }
                        }}
                    >
                        <Text style={[styles.segmentBtnText, type === 'DM' && styles.segmentBtnTextActive]}>
                            ⚡ 1-on-1 DM
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.segmentBtn, type === 'GROUP' && styles.segmentBtnActive]}
                        onPress={() => setType('GROUP')}
                    >
                        <Text style={[styles.segmentBtnText, type === 'GROUP' && styles.segmentBtnTextActive]}>
                            👥 Group Squad 🔥
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.nameInputContainer}>
                    <TextInput
                        style={styles.nameInput}
                        placeholder={type === 'GROUP' ? '🔥 Squad Name (e.g. Red Moon Kings)...' : 'Chat Title (Optional)...'}
                        placeholderTextColor={theme.colors.textMuted}
                        value={convoName}
                        onChangeText={setConvoName}
                    />
                </View>

                {selectedUserObjects.length > 0 && (
                    <View style={styles.selectedSection}>
                        <Text style={styles.selectedTitle}>
                            SELECTED SQUAD ({selectedUserObjects.length}):
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {selectedUserObjects.map(u => (
                                <TouchableOpacity
                                    key={u.id}
                                    style={styles.selectedChip}
                                    onPress={() => toggleUserSelection(u.id)}
                                >
                                    <Avatar name={u.name} size={28} />
                                    <Text style={styles.selectedChipText}>{u.name.split(' ')[0]}</Text>
                                    <Text style={styles.chipRemoveText}>✕</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.searchBar}>
                    <Icon name="search" size={16} color="#FF4D4D" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search squad mates..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                    {loading ? (
                        <View style={styles.centerBox}>
                            <ActivityIndicator size="large" color={theme.colors.primaryBright} />
                            <Text style={styles.loadingText}>Finding squad mates...</Text>
                        </View>
                    ) : err ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>⚠️ {err}</Text>
                            <TouchableOpacity style={styles.retryBtn} onPress={fetchUsers}>
                                <Text style={styles.retryBtnText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user, idx) => {
                            const isSelected = selectedUsers.includes(user.id);
                            const role = ROLE_TAGS[idx % ROLE_TAGS.length];

                            return (
                                <TouchableOpacity
                                    key={user.id}
                                    style={[styles.userCard, isSelected && styles.userCardSelected]}
                                    onPress={() => toggleUserSelection(user.id)}
                                    activeOpacity={0.8}
                                >
                                    <Avatar name={user.name} size={50} showOnline hasStory hasCrown={idx === 0} />

                                    <View style={styles.userMain}>
                                        <View style={styles.nameRow}>
                                            <Text style={styles.userName}>{user.name}</Text>
                                            <View style={styles.roleTag}>
                                                <Text style={styles.roleTagText}>{role}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.userBio} numberOfLines={1}>
                                            {user.bio || '🔥 Ready to chat'}
                                        </Text>
                                    </View>

                                    <View style={[styles.selectCircle, isSelected && styles.selectCircleActive]}>
                                        {isSelected && <Text style={styles.checkText}>✓</Text>}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>No squad mates found</Text>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.footerDock}>
                    <TouchableOpacity
                        style={[
                            styles.launchBtn,
                            (selectedUsers.length === 0 || creating) && styles.launchBtnDisabled,
                        ]}
                        onPress={handleCreateConversation}
                        disabled={selectedUsers.length === 0 || creating}
                    >
                        {creating ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.launchBtnText}>
                                {type === 'GROUP'
                                    ? `Assemble Squad (${selectedUsers.length} Selected) 🔥`
                                    : selectedUsers.length === 1
                                    ? 'Start 1-on-1 Chat ⚡'
                                    : 'Pick a Squad Mate'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
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
        paddingTop: 14,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    refreshBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(22, 6, 9, 0.9)',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    segmentContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(16, 5, 8, 0.88)',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 18,
        marginHorizontal: 18,
        padding: 4,
        marginBottom: 10,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 14,
    },
    segmentBtnActive: {
        backgroundColor: '#B91C1C',
        borderWidth: 1,
        borderColor: '#FF4D4D',
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
    },
    segmentBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#A88B8E',
    },
    segmentBtnTextActive: {
        color: '#FFFFFF',
    },
    nameInputContainer: {
        marginHorizontal: 18,
        marginBottom: 10,
    },
    nameInput: {
        backgroundColor: 'rgba(16, 5, 8, 0.88)',
        borderWidth: 1.2,
        borderColor: 'rgba(255, 36, 36, 0.45)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 11,
        color: '#FFFFFF',
        fontSize: 14,
    },
    selectedSection: {
        paddingHorizontal: 18,
        marginBottom: 10,
    },
    selectedTitle: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FF4D4D',
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    selectedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(153, 27, 27, 0.4)',
        borderColor: '#FF3333',
        borderWidth: 1,
        paddingLeft: 4,
        paddingRight: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginRight: 8,
        gap: 6,
    },
    selectedChipText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    chipRemoveText: {
        color: '#FF7070',
        fontSize: 11,
        fontWeight: 'bold',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(14, 5, 7, 0.88)',
        borderWidth: 1.2,
        borderColor: 'rgba(255, 36, 36, 0.5)',
        borderRadius: 20,
        marginHorizontal: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        padding: 0,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 18,
        paddingBottom: 170,
    },
    centerBox: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        color: '#FF4D4D',
        marginTop: 10,
        fontSize: 13,
    },
    errorBox: {
        backgroundColor: 'rgba(40, 8, 12, 0.9)',
        borderWidth: 1,
        borderColor: '#FF2424',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    errorText: {
        color: '#FF4D4D',
        fontSize: 13,
        marginBottom: 10,
    },
    retryBtn: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 10,
    },
    retryBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 5, 8, 0.86)',
        borderColor: 'rgba(255, 36, 36, 0.4)',
        borderWidth: 1.2,
        borderRadius: 18,
        padding: 14,
        marginBottom: 10,
    },
    userCardSelected: {
        borderColor: '#FF2424',
        backgroundColor: 'rgba(153, 27, 27, 0.25)',
        borderWidth: 1.8,
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
    },
    userMain: {
        flex: 1,
        marginLeft: 14,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    roleTag: {
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 45, 45, 0.35)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleTagText: {
        fontSize: 10,
        color: '#FF7070',
        fontWeight: '700',
    },
    userBio: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 4,
    },
    selectCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        borderColor: 'rgba(255, 45, 45, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectCircleActive: {
        backgroundColor: '#FF2424',
        borderColor: '#FF4D4D',
    },
    checkText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '900',
    },
    emptyBox: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: theme.colors.textMuted,
        fontSize: 14,
    },
    footerDock: {
        position: 'absolute',
        bottom: 95,
        left: 18,
        right: 18,
    },
    launchBtn: {
        backgroundColor: '#DC2626',
        borderWidth: 1.5,
        borderColor: '#FF4D4D',
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.75,
        shadowRadius: 10,
        elevation: 8,
    },
    launchBtnDisabled: {
        backgroundColor: 'rgba(24, 7, 11, 0.9)',
        borderColor: 'rgba(255, 36, 36, 0.25)',
        opacity: 0.5,
    },
    launchBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
});

export default AllUsers;
