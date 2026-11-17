import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Icons } from '../../assets/icons';
import GradientAvatar from '../GradientAvatar';
import { Typography } from '../../theme/typography';
import LinearGradient from 'react-native-linear-gradient';

interface AppAvatarProps {
    imageUrl?: string;
    name?: string;
    size?: number;
    borderWidth?: number;
    onPress?: () => void;
    containerStyle?: ViewStyle;
}

const AppAvatar: React.FC<AppAvatarProps> = ({
    imageUrl,
    name,
    size = 30,
    borderWidth = 1,
    onPress,
    containerStyle,
}) => {
    const renderFallback = (content: React.ReactNode) => {
        const outerSize = size + borderWidth * 2;

        if (borderWidth > 0) {
            return (
                <LinearGradient
                    colors={[
                        Colors.gradientBorder1,
                        Colors.gradientBorder1,
                        Colors.gradientBorder3,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.gradientBorder,
                        {
                            width: outerSize,
                            height: outerSize,
                            borderRadius: outerSize / 2,
                            padding: borderWidth,
                        },
                        containerStyle,
                    ]}
                >
                    <View style={[styles.fallbackInner, { width: size, height: size, borderRadius: size / 2 }]}>
                        {content}
                    </View>
                </LinearGradient>
            );
        }

        return (
            <View style={[styles.fallbackAvatar, { width: size, height: size, borderRadius: size / 2 }, containerStyle]}>
                {content}
            </View>
        );
    };

    const renderAvatar = () => {
        if (imageUrl) {
            return (
                <GradientAvatar
                    source={{ uri: imageUrl }}
                    size={size}
                    borderWidth={borderWidth}
                    onPress={onPress}
                    isPress={!!onPress}
                />
            );
        }

        if (name) {
            return renderFallback(
                <Text style={[styles.fallbackText, { fontSize: size / 2.5 }]}>
                    {name.charAt(0).toUpperCase()}
                </Text>
            );
        }

        return renderFallback(
            <Image
                source={Icons.placeholderIcon}
                style={{ height: size * 0.6, width: size * 0.6, objectFit: 'contain' }}
                tintColor={Colors.primary}
            />
        );
    };

    if (onPress && !imageUrl) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={containerStyle}>
                {renderAvatar()}
            </TouchableOpacity>
        );
    }

    return renderAvatar();
};

export default AppAvatar;

const styles = StyleSheet.create({
    fallbackAvatar: {
        backgroundColor: Colors.primaryExtraLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallbackInner: {
        backgroundColor: Colors.primaryExtraLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientBorder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    fallbackText: {
        ...Typography.black14Bold,
        color: Colors.primary,
    },
});
