import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme';
import Icon from '../components/Icon';
import CrimsonBackground from '../components/CrimsonBackground';

const PRESETS = ['🩸 Blood Moon', '🔥 Crimson Ember', '⚡ Dark Neon', '👑 Raw Gold'];

const ImagePickerScreen = ({ navigation }) => {
    const [image, setImage] = useState(null);
    const [meta, setMeta] = useState(null);
    const [activePreset, setActivePreset] = useState('🩸 Blood Moon');

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            setImage(asset.uri);
            setMeta({
                width: asset.width,
                height: asset.height,
                fileName: asset.fileName || 'crimson_export.jpg',
            });
        }
    };

    return (
        <CrimsonBackground>
            <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>CRIMSON MEDIA LAB 🔥</Text>
                    </View>
                    <Text style={styles.title}>Media Studio</Text>
                    <Text style={styles.subtitle}>
                        Pick, style, and drop media straight into your squad chats
                    </Text>
                </View>

                {image ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />

                        <View style={styles.presetsSection}>
                            <Text style={styles.presetHeading}>VIBE PRESET:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                                {PRESETS.map(p => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[
                                            styles.presetPill,
                                            activePreset === p && styles.presetPillActive,
                                        ]}
                                        onPress={() => setActivePreset(p)}
                                    >
                                        <Text
                                            style={[
                                                styles.presetText,
                                                activePreset === p && styles.presetTextActive,
                                            ]}
                                        >
                                            {p}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {meta && (
                            <View style={styles.metaRow}>
                                <View style={styles.metaItem}>
                                    <Text style={styles.metaLabel}>RESOLUTION</Text>
                                    <Text style={styles.metaVal}>{meta.width} × {meta.height} px</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Text style={styles.metaLabel}>STATUS</Text>
                                    <Text style={styles.metaVal}>READY TO DROP ⚡</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => {
                                    setImage(null);
                                    setMeta(null);
                                }}
                            >
                                <Text style={styles.secondaryButtonText}>Clear</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={pickImage}
                            >
                                <Text style={styles.primaryButtonText}>Change Photo</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.sendToChatButton}
                            onPress={() => {
                                Alert.alert('Vibe Ready 🔥', 'Jump into any chat room to share this photo!');
                                navigation.navigate('Conversations');
                            }}
                        >
                            <Text style={styles.sendToChatText}>Drop in Squad Chat 👑</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.dropZone}
                        onPress={pickImage}
                        activeOpacity={0.85}
                    >
                        <View style={styles.iconCircle}>
                            <Icon name="photo" size={38} color="#FF3B3B" />
                        </View>
                        <Text style={styles.dropZoneTitle}>Select from Gallery</Text>
                        <Text style={styles.dropZoneSubtitle}>
                            Tap to browse camera roll & albums
                        </Text>
                        <View style={styles.browseButton}>
                            <Text style={styles.browseButtonText}>Open Photo Roll 📸</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </CrimsonBackground>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    container: {
        padding: 20,
        paddingBottom: 120,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        marginBottom: 20,
    },
    tag: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        borderColor: '#FF2424',
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginBottom: 8,
    },
    tagText: {
        color: '#FF4D4D',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.8,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    dropZone: {
        width: '100%',
        backgroundColor: 'rgba(16, 5, 8, 0.85)',
        borderColor: 'rgba(255, 36, 36, 0.55)',
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderRadius: 24,
        paddingVertical: 70,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(220, 38, 38, 0.15)',
        borderWidth: 1,
        borderColor: '#FF3333',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    dropZoneTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 6,
    },
    dropZoneSubtitle: {
        color: theme.colors.textMuted,
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: '#DC2626',
        borderWidth: 1,
        borderColor: '#FF4D4D',
        paddingHorizontal: 26,
        paddingVertical: 14,
        borderRadius: 16,
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
    },
    browseButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
    previewContainer: {
        width: '100%',
        backgroundColor: 'rgba(16, 5, 8, 0.88)',
        borderColor: 'rgba(255, 36, 36, 0.5)',
        borderWidth: 1.5,
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: 280,
        borderRadius: 18,
        backgroundColor: '#050204',
    },
    presetsSection: {
        width: '100%',
        marginTop: 16,
    },
    presetHeading: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FF4D4D',
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    presetScroll: {
        flexDirection: 'row',
    },
    presetPill: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 12,
        backgroundColor: 'rgba(24, 7, 11, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255, 36, 36, 0.35)',
        marginRight: 8,
    },
    presetPillActive: {
        backgroundColor: '#B91C1C',
        borderColor: '#FF4D4D',
    },
    presetText: {
        color: '#A88B8E',
        fontSize: 12,
        fontWeight: '700',
    },
    presetTextActive: {
        color: '#FFFFFF',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 36, 36, 0.25)',
        marginTop: 8,
    },
    metaItem: {
        flex: 1,
    },
    metaLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: theme.colors.textMuted,
        letterSpacing: 0.8,
    },
    metaVal: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '700',
        marginTop: 2,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginTop: 16,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: 'rgba(34, 9, 14, 0.9)',
        borderColor: 'rgba(255, 36, 36, 0.35)',
        borderWidth: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: theme.colors.textSecondary,
        fontWeight: '800',
    },
    primaryButton: {
        flex: 2,
        backgroundColor: '#991B1B',
        borderWidth: 1,
        borderColor: '#FF3333',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    sendToChatButton: {
        width: '100%',
        backgroundColor: '#DC2626',
        borderWidth: 1.5,
        borderColor: '#FF4D4D',
        paddingVertical: 15,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 14,
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
    },
    sendToChatText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 15,
    },
});

export default ImagePickerScreen;
