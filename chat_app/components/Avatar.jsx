import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { theme } from '../theme';

const AVATAR_MAP = {
    sachin: require('../assets/avatar-sachin.jpg'),
    vaibhav: require('../assets/avatar-vaibhav.jpg'),
    ananya: require('../assets/avatar-ananya.jpg'),
};

export default function Avatar({
    name = 'Anonymous',
    size = 52,
    showOnline = false,
    isOnline = true,
    hasStory = false,
    hasCrown = false,
    imageSource = null,
    bracketInitial = false,
    style,
}) {
    const lowerName = (name || '').toLowerCase();
    let resolvedImage = imageSource;
    if (resolvedImage === null) {
        if (lowerName.includes('sachin') && !lowerName.includes('[dm]')) {
            resolvedImage = AVATAR_MAP.sachin;
        } else if (lowerName.includes('vaibhav')) {
            resolvedImage = AVATAR_MAP.vaibhav;
        } else if (lowerName.includes('ananya')) {
            resolvedImage = AVATAR_MAP.ananya;
        }
    }

    const cleanName = name.replace(/\[DM\]/gi, '').trim();
    const parts = cleanName.split(' ').filter(Boolean);
    let initials = parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : (cleanName.slice(0, 1) || '?').toUpperCase();

    if (bracketInitial) {
        initials = `[${initials[0]}]`;
    }

    const fontSize = Math.max(13, Math.floor(size * (bracketInitial ? 0.34 : 0.38)));
    const innerSize = size - 6;

    return (
        <View style={[{ width: size, height: size }, styles.container, style]}>
            {/* Outer Crimson Neon Glow Ring */}
            <View
                style={[
                    styles.glowRing,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderColor: hasStory || isOnline ? theme.colors.borderBright : theme.colors.border,
                        borderWidth: hasStory ? 2 : 1.5,
                    },
                ]}
            />

            {/* Inner Avatar Circle */}
            <View
                style={[
                    styles.innerCircle,
                    {
                        width: innerSize,
                        height: innerSize,
                        borderRadius: innerSize / 2,
                    },
                ]}
            >
                {resolvedImage ? (
                    <Image
                        source={resolvedImage}
                        style={{
                            width: innerSize,
                            height: innerSize,
                            borderRadius: innerSize / 2,
                        }}
                        resizeMode="cover"
                    />
                ) : (
                    <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
                )}
            </View>

            {/* Crown Badge on Top-Right */}
            {hasCrown && (
                <View style={styles.crownBadge}>
                    <Text style={styles.crownEmoji}>👑</Text>
                </View>
            )}

            {/* Online/Offline Status Dot */}
            {showOnline && (
                <View
                    style={[
                        styles.onlineDot,
                        {
                            backgroundColor: isOnline
                                ? theme.colors.onlineDot
                                : theme.colors.offlineDot,
                            width: Math.max(11, size * 0.24),
                            height: Math.max(11, size * 0.24),
                            borderRadius: size * 0.12,
                        },
                    ]}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    glowRing: {
        position: 'absolute',
        shadowColor: '#FF1A1A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.75,
        shadowRadius: 8,
        elevation: 6,
    },
    innerCircle: {
        backgroundColor: '#120508',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 50, 50, 0.35)',
    },
    initials: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontStyle: 'italic',
        letterSpacing: 0.5,
    },
    crownBadge: {
        position: 'absolute',
        top: -6,
        right: -2,
        transform: [{ rotate: '18deg' }],
        zIndex: 10,
    },
    crownEmoji: {
        fontSize: 15,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 1,
        borderWidth: 2,
        borderColor: '#050204',
    },
});
