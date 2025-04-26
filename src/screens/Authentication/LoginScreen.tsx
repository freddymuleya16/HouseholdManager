import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useAuth } from '@/context/authentication-context';
import { AuthStackParamList } from '@/types/navigation-types';

import { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<AuthStackParamList>;

export const LoginScreen = () => {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const passwordRef = useRef<TextInput>(null);
    const navigation = useNavigation<NavigationProp>()

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await login({ email, password });
            // Navigation is handled by protected routes
        } catch (error) {
            // Error is already handled by AuthContext
        }
    };
    
    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1">
                <ScrollView
                    contentContainerClassName="flex-grow justify-center px-6 py-10"
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="items-center mb-10">
                        <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
                            <Ionicons name="lock-closed" size={40} color="white" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-800">Welcome Back</Text>
                        <Text className="text-gray-500 mt-2 text-center">
                            Sign in to your account to continue
                        </Text>
                    </View>

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
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="py-2"
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text className="text-blue-600 text-right">Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className={`rounded-lg py-4 ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">
                                Sign In
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-gray-600">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text className="text-blue-600 font-semibold">Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

