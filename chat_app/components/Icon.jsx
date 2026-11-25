import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const ICONS = {
    chat: '💬',
    chats: '💬',
    users: '👥',
    user: '👤',
    camera: '📷',
    image: '🖼️',
    search: '🔍',
    send: '➤',
    back: '‹',
    plus: '+',
    check: '✓',
    checkDouble: '✓✓',
    close: '✕',
    trash: '🗑️',
    flip: '🔄',
    attach: '📎',
    photo: '📸',
    fire: '🔥',
    heart: '❤️',
    laugh: '😂',
    thumbsup: '👍',
    poop: '💩',
    zap: '⚡',
    rocket: '🚀',
    call: '📞',
    video: '📹',
    mic: '🎙️',
    sticker: '👾',
    sparkle: '✨',
    settings: '⚙️',
    sliders: '🎛️',
    bell: '🔔',
    crown: '👑',
    door: '🚪',
    info: 'ℹ️',
    more: '⋮',
    refresh: '↻',
    dm: '👤',
    group: '👥',
    lock: '🔒',
    pin: '📌',
    wave: '👋',
};

export default function Icon({ name, size = 18, color = '#FFFFFF', style }) {
    const glyph = ICONS[name] || '•';

    return (
        <View style={[styles.iconContainer, style]}>
            <Text
                style={[
                    styles.glyph,
                    {
                        fontSize: size,
                        color: color,
                        lineHeight: size + 4,
                    },
                ]}
            >
                {glyph}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glyph: {
        textAlign: 'center',
    },
});
