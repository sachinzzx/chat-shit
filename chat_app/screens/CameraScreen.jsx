import React, { useState } from 'react';
import {
    Image,
    View,
    StyleSheet,
    Alert,
    Text,
    TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme';
import Icon from '../components/Icon';
import CrimsonBackground from '../components/CrimsonBackground';

export default function CameraScreen({ navigation }) {
    const [imageUri, setImageUri] = useState(null);

    const takePhotoWithCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                'Permission Denied',
                'You need to grant camera access to use this feature.'
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.9,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    return (
        <CrimsonBackground>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>CRIMSON SNAP 📸</Text>
                    </View>
                    <Text style={styles.title}>Native Camera</Text>
                    <Text style={styles.subtitle}>
                        Snap crisp photos directly into your story or squad chat
                    </Text>
                </View>

                {imageUri ? (
                    <View style={styles.previewCard}>
                        <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                        <View style={styles.btnRow}>
                            <TouchableOpacity
                                style={styles.secondaryBtn}
                                onPress={() => setImageUri(null)}
                            >
                                <Text style={styles.secondaryBtnText}>Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.primaryBtn}
                                onPress={() => {
                                    Alert.alert('Saved 🔥', 'Photo ready! Drop it in any squad chat.');
                                    navigation.navigate('Conversations');
                                }}
                            >
                                <Text style={styles.primaryBtnText}>Use Photo 👑</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.captureCard}>
                        <View style={styles.cameraCircle}>
                            <Icon name="camera" size={44} color="#FF3B3B" />
                        </View>
                        <Text style={styles.captureTitle}>Ready to Snap</Text>
                        <Text style={styles.captureDesc}>
                            Launch native camera UI to capture and crop high-res photos.
                        </Text>
                        <TouchableOpacity
                            style={styles.launchBtn}
                            onPress={takePhotoWithCamera}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.launchBtnText}>Launch Camera 📸</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </CrimsonBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingBottom: 110,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 24,
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
    captureCard: {
        backgroundColor: 'rgba(16, 5, 8, 0.88)',
        borderColor: 'rgba(255, 36, 36, 0.5)',
        borderWidth: 1.5,
        borderRadius: 24,
        padding: 34,
        alignItems: 'center',
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    cameraCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(220, 38, 38, 0.15)',
        borderWidth: 1.5,
        borderColor: '#FF3333',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    captureTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    captureDesc: {
        color: theme.colors.textMuted,
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
        paddingHorizontal: 10,
    },
    launchBtn: {
        backgroundColor: '#DC2626',
        borderWidth: 1.5,
        borderColor: '#FF4D4D',
        paddingHorizontal: 32,
        paddingVertical: 15,
        borderRadius: 18,
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.75,
        shadowRadius: 10,
    },
    launchBtnText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 15,
    },
    previewCard: {
        backgroundColor: 'rgba(16, 5, 8, 0.88)',
        borderColor: 'rgba(255, 36, 36, 0.5)',
        borderWidth: 1.5,
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: 340,
        borderRadius: 18,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginTop: 16,
    },
    secondaryBtn: {
        flex: 1,
        backgroundColor: 'rgba(34, 9, 14, 0.9)',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: theme.colors.textSecondary,
        fontWeight: '800',
    },
    primaryBtn: {
        flex: 2,
        backgroundColor: '#DC2626',
        borderWidth: 1,
        borderColor: '#FF4D4D',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
});
