import { useAuth } from "@/context/authentication-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import { Alert, SafeAreaView, Text, StatusBar, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { AuthStackParamList } from '@/types/navigation-types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRouter } from "expo-router";

type NavigationProp = StackNavigationProp<AuthStackParamList>;

export const ResetPasswordScreen = () => {
    const { resetPassword, isLoading } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigation = useNavigation<NavigationProp>()
    const route = useRouter();

    const confirmPasswordRef = useRef<TextInput>(null);
    //const token = route.params?.token;
    const token = "dnlsndsodhnosidnilsdjnojvjmsd";

    const handleSetNewPassword = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return;
        }

        try {
            await resetPassword(token, password);
            setIsSuccess(true);
        } catch (error) {
            // Error is already handled by AuthContext
        }
    };

    if (!token) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
                <StatusBar barStyle="dark-content" />
                <View className="w-20 h-20 bg-red-500 rounded-full items-center justify-center mb-4">
                    <Ionicons name="alert-circle" size={40} color="white" />
                </View>
                <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
                    Invalid or missing reset token
                </Text>
                <Text className="text-gray-500 mb-8 text-center">
                    The password reset link is invalid or has expired.
                </Text>
                <TouchableOpacity
                    className="rounded-lg py-4 bg-blue-600 w-full"
                    onPress={() => navigation.navigate('ForgotPassword')}
                >
                    <Text className="text-white text-center font-bold text-lg">
                        Request New Reset Link
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

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
                    {!isSuccess ? (
                        <>
                            <View className="items-center mb-10">
                                <View className="w-20 h-20 bg-purple-500 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="lock-open-outline" size={40} color="white" />
                                </View>
                                <Text className="text-3xl font-bold text-gray-800">New Password</Text>
                                <Text className="text-gray-500 mt-2 text-center">
                                    Create a new password for your account
                                </Text>
                            </View>

                            <View className="space-y-4 mb-6">
                                <View>
                                    <Text className="text-gray-700 mb-2 font-medium">New Password</Text>
                                    <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                                        <TextInput
                                            className="flex-1 ml-2 text-base text-gray-800"
                                            placeholder="Enter new password"
                                            placeholderTextColor="#9CA3AF"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                            returnKeyType="next"
                                            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Ionicons
                                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                size={20}
                                                color="#6B7280"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <Text className="text-xs text-gray-500 mt-1">
                                        Password must be at least 8 characters long
                                    </Text>
                                </View>

                                <View>
                                    <Text className="text-gray-700 mb-2 font-medium">Confirm Password</Text>
                                    <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                                        <TextInput
                                            ref={confirmPasswordRef}
                                            className="flex-1 ml-2 text-base text-gray-800"
                                            placeholder="Confirm new password"
                                            placeholderTextColor="#9CA3AF"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showConfirmPassword}
                                            returnKeyType="done"
                                            onSubmitEditing={handleSetNewPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            <Ionicons
                                                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                                size={20}
                                                color="#6B7280"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                className={`rounded-lg py-4 ${isLoading ? 'bg-purple-400' : 'bg-purple-600'}`}
                                onPress={handleSetNewPassword}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-center font-bold text-lg">
                                        Set New Password
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-4">
                                <Ionicons name="checkmark" size={40} color="white" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                                Password Updated
                            </Text>
                            <Text className="text-gray-500 mb-8 text-center">
                                Your password has been successfully reset
                            </Text>
                            <TouchableOpacity
                                className="rounded-lg py-4 bg-blue-600 w-full"
                                onPress={() => navigation.navigate('Login')}
                            >
                                <Text className="text-white text-center font-bold text-lg">
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};