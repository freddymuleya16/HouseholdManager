import React, { useState } from 'react';
import { View, Text, TextInput, Button, Switch, FlatList, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Header } from '../Header';
import { Ionicons } from '@expo/vector-icons';
import { useHousehold } from '@/context/household-context';

const HouseholdSetupWizard = () => {
  const [step, setStep] = useState(1);
  const [householdName, setHouseholdName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [preferences, setPreferences] = useState({
    allowMemberTasks: true,
    notifyOverdue: true,
  });
  const [categories, setCategories] = useState<string[]>(['Chores', 'School', 'Work']);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    sound: 'default',
  });
  const { createHousehold } = useHousehold()

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const addMember = () => {
    if (newMemberName.trim()) {
      setMembers([...members, newMemberName.trim()]);
      setNewMemberName('');
    }
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, newCategoryName.trim()]);
      setNewCategoryName('');
    }
  };

  const handleFinish = async () => {
    console.log('Household setup complete:', {
      householdName,
      members,
      preferences,
      categories,
      notifications,
    });
    await createHousehold(householdName);
    // In a real app, save data to a backend here
  };

  return (
    <View className="flex-1 items-center justify-center p-6 bg-Background-50">
      <Text className="text-xl text-Text-600 font-bold mb-4 text-center">
        Household Setup Wizard - Step {step} of 2
      </Text>
      <View className="flex-1 items-center w-full justify-center">

      {step === 1 && (
          <View>
            <Text className="text-lg font-semibold mb-2">Create Household</Text>
            <Text className="mb-4 text-gray-700">
              Enter the name of your household, e.g., 'Smith Family'.
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
              <Ionicons name="home-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-base text-gray-800"
                placeholder="Household Name"
                placeholderTextColor="#9CA3AF"
                value={householdName}
                onChangeText={setHouseholdName}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>
            <TouchableOpacity
              className={`rounded-lg py-4 bg-Primary-500 mt-5`}
              onPress={nextStep}          >
              <Text className="text-white text-center font-bold text-lg">
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className="text-lg font-semibold mb-2">Add Members</Text>
            <Text className="mb-4 text-gray-700">
              Add the members of your household. You can add more later.
            </Text>
            <FlatList
              data={members}
              renderItem={({ item }) => (
                <Text className="mb-2 text-gray-800 ">{item}</Text>
              )}
              keyExtractor={(item, index) => index.toString()}
              className="mb-4 bg-Background-800 rounded-xl flex-auto"
            />

            <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
              <Ionicons name="person-add-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-base text-gray-800"
                placeholder="Member Name"
                placeholderTextColor="#9CA3AF"
                value={newMemberName}
                onChangeText={setNewMemberName}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>
            <TouchableOpacity
              className={`rounded-lg py-4 bg-Primary-500 mt-5`}
              onPress={addMember}          >
              <Text className="text-white text-center font-bold text-lg">
                Add Member
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className={`rounded-lg py-4 w-1/3 bg-Primary-500 mt-5`}
                onPress={prevStep}          >
                <Text className="text-white text-center  font-bold text-lg">
                  Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`rounded-lg py-4 w-1/3 bg-Primary-500 mt-5`}
                onPress={nextStep}          >
                <Text className="text-white text-center font-bold text-lg">
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 3 && (
          <View className='w-full '>
            <Text className="text-lg font-semibold mb-2">Set Preferences</Text>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-700">Allow members to create tasks</Text>
              <Switch
                thumbColor="#795548"
                value={preferences.allowMemberTasks}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, allowMemberTasks: value })
                }
              />
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-700">Notify about overdue tasks</Text>
              <Switch

                thumbColor="#795548"
                value={preferences.notifyOverdue}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, notifyOverdue: value })
                }
              />
            </View>
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className={`rounded-lg py-4 w-1/3 bg-Primary-500 mt-5`}
                onPress={prevStep}          >
                <Text className="text-white text-center  font-bold text-lg">
                  Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`rounded-lg py-4 w-1/3 bg-Primary-500 mt-5`}
                onPress={nextStep}          >
                <Text className="text-white text-center font-bold text-lg">
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text className="text-lg font-semibold mb-2">Configure Task Categories</Text>
            <Text className="mb-4 text-gray-700">
              Add categories for your tasks. Defaults are provided.
            </Text>
            <FlatList
              data={categories}
              renderItem={({ item }) => (
                <Text className="mb-2 text-gray-800">{item}</Text>
              )}
              keyExtractor={(item, index) => index.toString()}
              className="mb-4"
            />
            <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
              <Ionicons name="home-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-2 text-base text-gray-800"
                placeholder="New Category Name"
                placeholderTextColor="#9CA3AF"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                keyboardType="default"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>
            <TouchableOpacity
              className={`rounded-lg py-4 bg-Primary-500 mt-5`}
              onPress={addCategory}          >
              <Text className="text-white text-center font-bold text-lg">
                Add Category
              </Text>
            </TouchableOpacity>
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className={`rounded-lg py-4 bg-Primary-500 mt-5 w-5/12`}
                onPress={prevStep}          >
                <Text className="text-white text-center font-bold text-lg">
                  Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`rounded-lg py-4 bg-Primary-500 mt-5 w-5/12`}
                onPress={nextStep}          >
                <Text className="text-white text-center font-bold text-lg">
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 5 && (
          <View className='w-full'>
            <Text className="text-lg font-semibold mb-2">Set Notification Settings</Text>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-700">Enable push notifications</Text>
              <Switch
                thumbColor="#795548"
                value={notifications.pushEnabled}
                onValueChange={(value) =>
                  setNotifications({ ...notifications, pushEnabled: value })
                }
              />
            </View>
            <Text className="text-gray-700 mb-2">Notification Sound</Text>
            <Picker
              selectedValue={notifications.sound}
              onValueChange={(itemValue) =>
                setNotifications({ ...notifications, sound: itemValue })
              }
              className="mb-4 bg-white border border-gray-300 rounded"
            >
              <Picker.Item label="Default" value="default" />
              <Picker.Item label="Sound 1" value="sound1" />
              <Picker.Item label="Sound 2" value="sound2" />
            </Picker>
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className={`rounded-lg py-4 bg-Secondary-500 mt-5 w-5/12`}
                onPress={prevStep}          >
                <Text className="text-white text-center font-bold text-lg">
                  Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`rounded-lg py-4 bg-Primary-500 mt-5 w-5/12`}
                onPress={handleFinish}          >
                <Text className="text-white text-center font-bold text-lg">
                  Finish
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default HouseholdSetupWizard;