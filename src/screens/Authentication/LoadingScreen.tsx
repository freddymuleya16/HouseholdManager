import { SafeAreaView, StatusBar, View, ActivityIndicator,Text } from "react-native";

export const LoadingScreen = () => {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <StatusBar barStyle="dark-content" />
        <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
        <Text className="text-xl font-medium text-gray-800">Loading...</Text>
        <Text className="text-gray-500 mt-2">Please wait while we set things up</Text>
      </SafeAreaView>
    );
  };