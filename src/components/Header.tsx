// components/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


interface HeaderProps {
    title?: string;
    showBackButton?: boolean;
    rightAction?: {
        icon: keyof typeof Ionicons.glyphMap;
        onPress: () => void;
        accessibilityLabel: string;
    };
    showNotification?: boolean;
    onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    showBackButton = false,
    rightAction,
    showNotification = false,
    onNotificationPress,
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    // Generate title from path if not provided
    const pageTitle = title || getPathTitle(pathname);

    const handleBack = () => {
        router.back();
    };

    return (
        <View
            className="flex-row items-center justify-between bg-gradient-to-br from-Background-800 to-Background-100   shadow-sm"
            style={{ paddingTop: insets.top + 10, height: 60 + insets.top }}
        >
            <View className="flex-row">
                <Image source={require('assets/logo__no_bg.png')} className='w-10 h-10 ml-4' />
                <Text className=" text-Text-500 text-2xl ml-1 mt-2 font-bold text-pretty" numberOfLines={1}>
                    Household Manager
                </Text>
            </View>

            {/* <View className="w-10">
        {showBackButton && (
          <TouchableOpacity 
            onPress={handleBack}
            className="p-2 -ml-2"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
        )}
      </View> */}

            <View className="flex-row justify-end">
                {showNotification && (
                    <TouchableOpacity
                        onPress={onNotificationPress}
                        className="p-2"
                        accessibilityLabel="Notifications"
                    >
                        <Ionicons name="notifications-outline" size={24} color="#1F2937" />
                    </TouchableOpacity>
                )}

                {rightAction && (
                    <TouchableOpacity
                        onPress={rightAction.onPress}
                        className="p-2"
                        accessibilityLabel={rightAction.accessibilityLabel}
                    >
                        <Ionicons name={rightAction.icon} size={24} color="#1F2937" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// Helper function to generate title from path
const getPathTitle = (pathname: string): string => {
    // Remove leading slash and get the first segment
    const segment = pathname.split('/')[1] || 'Home';

    // Capitalize first letter and add spaces before capital letters
    return segment
        ? segment.charAt(0).toUpperCase() +
        segment.slice(1).replace(/([A-Z])/g, ' $1')
        : 'Home';
};