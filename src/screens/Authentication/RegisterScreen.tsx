import { useAuth } from "@/context/authentication-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import { Alert, SafeAreaView, Text, StatusBar, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View, TextInput, ActivityIndicator } from "react-native";
import { AuthStackParamList } from '@/types/navigation-types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from "expo-router";

type NavigationProp = StackNavigationProp<AuthStackParamList>;

export const RegisterScreen = () => {
    const { register, isLoading } = useAuth();
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigation = useNavigation<NavigationProp>()

    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);


    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            await register({ email, password, confirmPassword });
            // Navigation is handled by protected routes
        } catch (error) {
            // Error is already handled by AuthContext
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

                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-purple-500 rounded-full items-center justify-center mb-4">
                            <Ionicons name="person-add" size={40} color="white" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-800">Create Account</Text>
                        <Text className="text-gray-500 mt-2 text-center">
                            Sign up to get started with our app
                        </Text>
                    </View>

                    <View className="space-y-4 mb-6">
                        <View>
                            <Text className="text-gray-700 mb-2 font-medium">Fullname</Text>
                            <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                                <Ionicons name="person-outline" size={20} color="#6B7280" />
                                <TextInput
                                    className="flex-1 ml-2 text-base text-gray-800"
                                    placeholder="What is your name"
                                    placeholderTextColor="#9CA3AF"
                                    value={fullname}
                                    onChangeText={setFullname} 
                                    returnKeyType="next"
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
                            <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                                <TextInput
                                    ref={emailRef}
                                    className="flex-1 ml-2 text-base text-gray-800"
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
                            <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                                <TextInput
                                    ref={passwordRef}
                                    className="flex-1 ml-2 text-base text-gray-800"
                                    placeholder="Create a password"
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
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#9CA3AF"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    returnKeyType="done"
                                    onSubmitEditing={handleRegister}
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
                        className={`rounded-lg py-4 ${isLoading ? 'bg-green-400' : 'bg-green-600'}`}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">
                                Create Account
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-gray-600">Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="text-blue-600 font-semibold">Sign In</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-6">
                        <Text className="text-xs text-gray-500 text-center">
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
