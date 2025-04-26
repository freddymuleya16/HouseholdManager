import { useAuth } from "@/context/authentication-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, SafeAreaView, Text, StatusBar, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View, TextInput, ActivityIndicator } from "react-native";
import { AuthStackParamList } from '@/types/navigation-types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from "expo-router";

type NavigationProp = StackNavigationProp<AuthStackParamList>;

export const ForgotPasswordScreen = () => {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigation = useNavigation<NavigationProp>()

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      // Error is already handled by AuthContext (shows generic message)
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-10"
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            className="mb-4"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-yellow-500 rounded-full items-center justify-center mb-4">
              <Ionicons name="key-outline" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-800">Reset Password</Text>
            <Text className="text-gray-500 mt-2 text-center">
              {isSubmitted
                ? "Check your email for reset instructions"
                : "Enter your email to receive a password reset link"}
            </Text>
          </View>

          {!isSubmitted ? (
            <>
              <View className="space-y-4 mb-6">
                <View>
                  <Text className="text-gray-700 mb-2 font-medium">Email</Text>
                  <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                    <Ionicons name="mail-outline" size={20} color="#6B7280" />
                    <TextInput
                      className="flex-1 ml-2 text-base text-gray-800"
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={handleResetPassword}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                className={`rounded-lg py-4 ${isLoading ? 'bg-yellow-400' : 'bg-yellow-500'}`}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">
                    Reset Password
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View className="items-center">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark" size={32} color="#22C55E" />
              </View>
              <Text className="text-lg text-gray-800 mb-6 text-center">
                A password reset link has been sent to your email if an account exists.
              </Text>
              <TouchableOpacity
                className="rounded-lg py-4 bg-blue-600 w-full"
                onPress={() => navigation.navigate('Login')}
              >
                <Text className="text-white text-center font-bold text-lg">
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
