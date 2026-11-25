import React from 'react';
import { ImageBackground, View, StyleSheet } from 'react-native';
import { theme } from '../theme';

const RED_MOON_BG = require('../assets/red-moon-bg.jpg');

export default function CrimsonBackground({ children, dimTop = true, style }) {
    return (
        <View style={[styles.root, style]}>
            <ImageBackground
                source={RED_MOON_BG}
                style={styles.bgImage}
                imageStyle={styles.bgImageInner}
                resizeMode="cover"
            >
                {/* Subtle dark vignette overlay for crystal-clear UI readability */}
                <View style={[styles.overlay, dimTop && styles.overlayStrong]}>
                    {children}
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: theme.colors.bg,
    },
    bgImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    bgImageInner: {
        opacity: 0.92,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(5, 2, 4, 0.38)',
    },
    overlayStrong: {
        backgroundColor: 'rgba(5, 2, 4, 0.45)',
    },
});
