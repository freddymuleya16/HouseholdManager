// components/BottomBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
 

interface TabItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const tabs: TabItem[] = [
  { name: 'Home', icon: 'home', route: '/main' },
  { name: 'Tasks', icon: 'list', route: '/tasks' },
  { name: 'Calendar', icon: 'calendar', route: '/calendar' },
  { name: 'Members', icon: 'bar-chart', route: '/main/household' },
  { name: 'Profile', icon: 'person', route: '/profile' },
];

export const BottomBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  return (
    <View className="flex-row h-15 bg-white border-t border-gray-200 shadow-md">
      {tabs.map((tab) => {
        const isActive = pathname === tab.route || pathname.startsWith(tab.route + '/');
        
        return (
          <TouchableOpacity
            key={tab.name}
            className="flex-1 justify-center items-center py-2"
            onPress={() => handleNavigation(tab.route)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? (tab.icon as any) : `${tab.icon}-outline` as any}
              size={24}
              color={isActive ? '#4F46E5' : '#64748B'}
            />
            <Text
              className={`text-xs mt-0.5 font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};