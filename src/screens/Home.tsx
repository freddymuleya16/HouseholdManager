import { Icon } from '@roninoss/icons';
import { Link } from 'expo-router';
import { Button, Platform, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
 
const ROOT_STYLE: ViewStyle = { flex: 1 };

export default function WelcomeConsentScreen() { 
  return (
    <SafeAreaView style={ROOT_STYLE}>
      <View className="mx-auto max-w-sm flex-1 justify-between gap-4 px-8 py-4 ">
        <View className="ios:pt-8 pt-12">
          <Text  className="ios:text-left ios:font-black text-center font-bold">
            Welcome to your
          </Text>
          <Text 
            className="ios:text-left ios:font-black text-primary text-center font-bold">
            Application
          </Text>
        </View>
        <View className="gap-8">
          {FEATURES.map((feature) => (
            <View key={feature.title} className="flex-row gap-4">
              <View className="pt-px">
                <Icon
                  name={feature.icon}
                  size={38} 
                  ios={{ renderingMode: 'hierarchical' }}
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold">{feature.title}</Text>
                <Text>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className="gap-4">
          <View className="items-center">
            <Icon
              name="account-multiple"
              size={24} 
              ios={{ renderingMode: 'hierarchical' }}
            />
            <Text  className="pt-1 text-center">
              By pressing continue, you agree to our{' '}
              <Link href="/">
                <Text  className="text-primary">
                  Terms of Service
                </Text>
              </Link>{' '}
              and that you have read our{' '}
              <Link href="/">
                <Text  className="text-primary">
                  Privacy Policy
                </Text>
              </Link>
            </Text>
          </View>
          <Link href="../" replace asChild>
            <Button title='Continue'/>
             
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const FEATURES = [
  {
    title: 'Profile Management',
    description: 'Easily update and manage your personal information, settings, and preferences',
    icon: 'account-circle-outline',
  },
  {
    title: 'Secure Messaging',
    description: 'Chat securely with friends and family in real-time.',
    icon: 'message-processing',
  },
  {
    title: 'Activity Tracking',
    description: 'Monitor your daily activities and track your progress over time.',
    icon: 'chart-timeline-variant',
  },
] as const;
