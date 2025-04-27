import { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './HouseholdMembersScreen';
import { useHousehold } from '@/context/household-context';
import { useRouter } from 'expo-router';

type AddMemberScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'AddMember'>;
};

export const AddMemberScreen: React.FC<AddMemberScreenProps> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<'parent' | 'child' | 'guest'>('parent');
    const [sendInvite, setSendInvite] = useState(true);
    const { members, loading, error, deleteMember, addMember } = useHousehold();
    const router = useRouter();

    const handleAddMember = async () => {
        // setLoading(true); 
        try {
            // await addMember({
            //     role
            // })

            Alert.alert(
                'Success',
                'Household member added successfully!',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error creating task:', error);
            Alert.alert('Error', 'Failed to add member. Please try again.');
        } finally {
            // setLoading(false);
        }
    };

    const RoleButton: React.FC<{
        role: 'parent' | 'child' | 'guest';
        icon: any;
        label: string;
    }> = ({ role: buttonRole, icon, label }) => (
        <TouchableOpacity
            className={`flex-1 items-center py-2 rounded-lg mx-1 ${role === buttonRole ? 'bg-blue-500' : 'bg-gray-200'
                }`}
            onPress={() => setRole(buttonRole)}
        >
            <MaterialCommunityIcons
                name={icon}
                size={24}
                color={role === buttonRole ? 'white' : 'gray'}
            />
            <Text className={`mt-1 ${role === buttonRole ? 'text-white' : 'text-gray-600'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-100 p-4">
            <View className="bg-white rounded-lg p-4">
                <Text className="text-lg font-semibold mb-4">Add New Member</Text>

                <TextInput
                    className="h-12 border border-gray-300 rounded-lg px-4 mb-4"
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                />

                <View className="flex-row mb-4">
                    <RoleButton role="parent" icon="account" label="Parent" />
                    <RoleButton role="child" icon="human-male-child" label="Child" />
                    <RoleButton role="guest" icon="account-clock" label="Guest" />
                </View>

                <TextInput
                    className="h-12 border border-gray-300 rounded-lg px-4 mb-4"
                    placeholder="Email Address"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                <Text className="text-gray-600 mb-2">Or</Text>

                <TextInput
                    className="h-12 border border-gray-300 rounded-lg px-4 mb-4"
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                />

                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-gray-600">Send Invitation</Text>
                    <Switch
                        value={sendInvite}
                        onValueChange={setSendInvite}
                        trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                    />
                </View>

                <TouchableOpacity
                    className="bg-blue-500 h-12 rounded-lg items-center justify-center"
                    onPress={handleAddMember}>
                    <Text className="text-white font-semibold">Add Member</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};