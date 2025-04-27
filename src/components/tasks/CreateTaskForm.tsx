// components/tasks/CreateTaskForm.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';

import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/authentication-context';
import { useServices } from '@/hooks/useServices';
import { Task } from '@/entities/Task';
import { TaskDTO } from '@/types/task-types';


const CATEGORIES = [
    { label: 'Household', value: 'household' },
    { label: 'Work', value: 'work' },
    { label: 'School', value: 'school' },
];

const PRIORITIES = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' },
];

const RECURRENCE_PATTERNS = [
    { label: 'One-time', value: 'none' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Bi-weekly', value: 'biweekly' },
    { label: 'Monthly', value: 'monthly' },
];

 
export const CreateTaskForm: React.FC = () => {
    const router = useRouter();
    const { taskService } = useServices();
    const { user, household } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [formData, setFormData] = useState<TaskDTO>({
        title: '',
        description: '',
        category: 'household',
        priority: 'medium',
        estimatedMinutes: 30,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        recurrencePattern: 'none',
        assignedTo: 'auto', 
        type:'household'
    });

    const [errors, setErrors] = useState<Partial<Record<keyof TaskDTO, string>>>({});

    const validateForm = () => {
        const newErrors: Partial<Record<keyof TaskDTO, string>> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Task title is required';
        }

        if (formData.title.length > 50) {
            newErrors.title = 'Task title must be less than 50 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        const estimatedTime = formData.estimatedMinutes;
        if (isNaN(estimatedTime) || estimatedTime <= 0) {
            newErrors.estimatedMinutes = 'Please enter a valid time';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        if (!user || !household) {
            Alert.alert('Error', 'You must be logged in and part of a household to create tasks');
            return;
        }

        setLoading(true);

        try {
            taskService.createTask(formData,user.id,"")
 
            Alert.alert(
                'Success',
                'Task created successfully!',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error creating task:', error);
            Alert.alert('Error', 'Failed to create task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFormData({ ...formData, dueDate: selectedDate });
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50 px-4 py-6">
            <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <Text className="text-xl font-bold text-gray-800 mb-6">
                    Create New Task
                </Text>

                {/* Task Name */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                        Task*
                    </Text>
                    <TextInput
                        className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                        placeholder="Enter task title"
                        maxLength={50}
                    />
                    {errors.title && (
                        <Text className="text-xs text-red-500 mt-1">{errors.title}</Text>
                    )}
                </View>

                {/* Description */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                        Description*
                    </Text>
                    <TextInput
                        className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800 h-20"
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder="Describe the task"
                        multiline
                        textAlignVertical="top"
                    />
                    {errors.description && (
                        <Text className="text-xs text-red-500 mt-1">{errors.description}</Text>
                    )}
                </View>

                {/* Category */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                        Category
                    </Text>
                    <View className="border border-gray-300 rounded-md bg-white">
                        <Picker
                            selectedValue={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            {CATEGORIES.map((category) => (
                                <Picker.Item
                                    key={category.value}
                                    label={category.label}
                                    value={category.value}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Priority */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                        Priority
                    </Text>
                    <View className="border border-gray-300 rounded-md bg-white">
                        <Picker
                            selectedValue={formData.priority}
                            onValueChange={(value) => setFormData({ ...formData, priority: value })}
                        >
                            {PRIORITIES.map((priority) => (
                                <Picker.Item
                                    key={priority.value}
                                    label={priority.label}
                                    value={priority.value}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Estimated Time */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                        Estimated Time (minutes)*
                    </Text>
                    <TextInput
                        className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
                        value={formData.estimatedMinutes.toString()}
                        onChangeText={(text) => setFormData({ ...formData, estimatedMinutes: parseInt(text) })}
                        placeholder="30"
                        keyboardType="numeric"
                    />
                    {errors.estimatedMinutes && (
                        <Text className="text-xs text-red-500 mt-1">{errors.estimatedMinutes}</Text>
                    )}
                </View>

                {/* Deadline */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                        Due Date
                    </Text>
                    <TouchableOpacity
                        className="border border-gray-300 rounded-md px-3 py-2 bg-white flex-row items-center justify-between"
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text className="text-gray-800">
                            {formData.dueDate.toLocaleDateString()}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color="#374151" />
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={formData.dueDate}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}
                </View>

                {/* Recurrence Pattern */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                        Recurrence
                    </Text>
                    <View className="border border-gray-300 rounded-md bg-white">
                        <Picker
                            selectedValue={formData.recurrencePattern}
                            onValueChange={(value) => setFormData({ ...formData, recurrencePattern: value })}
                        >
                            {RECURRENCE_PATTERNS.map((pattern) => (
                                <Picker.Item
                                    key={pattern.value}
                                    label={pattern.label}
                                    value={pattern.value}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Assignment Option */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                        Assignment
                    </Text>
                    <TouchableOpacity
                        className="border border-gray-300 rounded-md px-3 py-2 bg-indigo-50 flex-row items-center"
                        onPress={() => {
                            // Here you could navigate to a member selection screen
                            // For now, we'll just toggle between auto and manual (which would be self)
                            setFormData({
                                ...formData,
                                assignedTo: formData.assignedTo === 'auto' ? user!.id : 'auto'
                            });
                        }}
                    >
                        <Ionicons
                            name={formData.assignedTo === 'auto' ? 'shuffle' : 'person'}
                            size={20}
                            color="#4F46E5"
                            style={{ marginRight: 8 }}
                        />
                        <Text className="text-indigo-600 font-medium">
                            {formData.assignedTo === 'auto'
                                ? 'Auto-assign to household member'
                                : 'Assign to myself'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    className={`rounded-md py-3 px-4 flex-row items-center justify-center ${loading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text className="text-white font-semibold text-center">
                                Create Task
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};