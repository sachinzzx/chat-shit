import { useRef, useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '../theme';
import Icon from '../components/Icon';
import CrimsonBackground from '../components/CrimsonBackground';

export default function RawCameraScreen({ navigation }) {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [photoUri, setPhotoUri] = useState(null);
    const cameraRef = useRef(null);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <CrimsonBackground>
                <View style={styles.centered}>
                    <View style={styles.permLockCircle}>
                        <Icon name="lock" size={40} color="#FF3B3B" />
                    </View>
                    <Text style={styles.permTitle}>Camera Access Required</Text>
                    <Text style={styles.message}>
                        ChatShit needs camera permission for live Crimson HUD capture.
                    </Text>
                    <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
                        <Text style={styles.grantBtnText}>Grant Camera Access 🔥</Text>
                    </TouchableOpacity>
                </View>
            </CrimsonBackground>
        );
    }

    const takePicture = async () => {
        try {
            const camera = cameraRef.current;
            if (camera) {
                const photo = await camera.takePictureAsync({
                    quality: 0.85,
                });
                if (photo) {
                    setPhotoUri(photo.uri);
                }
            }
        } catch (err) {
            console.warn('Take picture error:', err);
        }
    };

    const toggleCameraFacing = () => {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    };

    if (photoUri) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photoUri }} style={styles.preview} />
                <View style={styles.previewOverlay}>
                    <TouchableOpacity
                        style={styles.actionBtnRetake}
                        onPress={() => setPhotoUri(null)}
                    >
                        <Text style={styles.btnText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtnUse}
                        onPress={() => {
                            navigation.navigate('Conversations');
                        }}
                    >
                        <Text style={styles.btnTextBold}>Use Photo 👑</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
                {/* Top Crimson HUD Bar */}
                <View style={styles.topBar}>
                    <View style={styles.hudBadge}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.hudBadgeText}>CRIMSON HUD • LIVE</Text>
                    </View>
                    <TouchableOpacity style={styles.toolBtn} onPress={toggleCameraFacing}>
                        <Icon name="flip" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Crimson Crosshair */}
                <View style={styles.crosshairContainer}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                    <Text style={styles.centerAimText}>+</Text>
                </View>

                {/* Bottom Shutter Dock */}
                <View style={styles.bottomDock}>
                    <TouchableOpacity style={styles.flipBtn} onPress={toggleCameraFacing}>
                        <Text style={styles.flipBtnText}>
                            {facing === 'back' ? '⚡ FRONT' : '⚡ BACK'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shutterOuter} onPress={takePicture} activeOpacity={0.7}>
                        <View style={styles.shutterInner} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.galleryShortcut}
                        onPress={() => navigation.navigate('ImagePickerScreen')}
                    >
                        <Icon name="image" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 100,
    },
    permLockCircle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: 'rgba(220, 38, 38, 0.18)',
        borderWidth: 1.5,
        borderColor: '#FF3333',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    permTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    message: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        fontSize: 14,
        paddingHorizontal: 20,
    },
    grantBtn: {
        backgroundColor: '#DC2626',
        borderWidth: 1,
        borderColor: '#FF4D4D',
        paddingHorizontal: 26,
        paddingVertical: 14,
        borderRadius: 16,
    },
    grantBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    camera: {
        flex: 1,
        justifyContent: 'space-between',
    },
    preview: {
        flex: 1,
        resizeMode: 'cover',
    },
    previewOverlay: {
        position: 'absolute',
        bottom: 110,
        left: 20,
        right: 20,
        flexDirection: 'row',
        gap: 14,
    },
    actionBtnRetake: {
        flex: 1,
        backgroundColor: 'rgba(20, 6, 9, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(255, 36, 36, 0.45)',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    actionBtnUse: {
        flex: 2,
        backgroundColor: '#DC2626',
        borderWidth: 1,
        borderColor: '#FF4D4D',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    btnText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    btnTextBold: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    hudBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(14, 4, 6, 0.78)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF2424',
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF1A1A',
    },
    hudBadgeText: {
        color: '#FF4D4D',
        fontWeight: '900',
        fontSize: 11,
        letterSpacing: 1,
    },
    toolBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(14, 4, 6, 0.78)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 36, 36, 0.55)',
    },
    crosshairContainer: {
        width: 240,
        height: 240,
        alignSelf: 'center',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerAimText: {
        color: 'rgba(255, 36, 36, 0.65)',
        fontSize: 32,
        fontWeight: '300',
    },
    corner: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: '#FF2424',
    },
    cornerTL: { top: 0, left: 0, borderTopWidth: 2.5, borderLeftWidth: 2.5 },
    cornerTR: { top: 0, right: 0, borderTopWidth: 2.5, borderRightWidth: 2.5 },
    cornerBL: { bottom: 0, left: 0, borderBottomWidth: 2.5, borderLeftWidth: 2.5 },
    cornerBR: { bottom: 0, right: 0, borderBottomWidth: 2.5, borderRightWidth: 2.5 },
    bottomDock: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 110,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(10, 3, 5, 0.75)',
        paddingTop: 20,
    },
    flipBtn: {
        width: 72,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 36, 36, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 36, 36, 0.4)',
        alignItems: 'center',
    },
    flipBtnText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
    },
    shutterOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#FF2424',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 30, 30, 0.2)',
    },
    shutterInner: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: '#FFFFFF',
    },
    galleryShortcut: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 36, 36, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 36, 36, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
