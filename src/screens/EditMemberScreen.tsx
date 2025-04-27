import { useState } from 'react';
import { View, Text, TextInput, Switch } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { HouseholdMember, Permissions, RootStackParamList } from './HouseholdMembersScreen';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

type EditMemberScreenProps = {
  route: RouteProp<RootStackParamList, 'EditMember'>;
};

export const EditMemberScreen: React.FC<EditMemberScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { member } = useLocalSearchParams<{ member: any }>();

  const [name, setName] = useState(member.name);
  const [permissions, setPermissions] = useState<Permissions>({
    canEditTasks: true,
    canManageMembers: false,
    canApprovePurchases: true,
  });

  const handlePermissionChange = (permission: keyof Permissions, value: boolean) => {
    setPermissions(prev => ({ ...prev, [permission]: value }));
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-semibold mb-4">Edit Profile</Text>
        <TextInput
          className="h-12 border border-gray-300 rounded-lg px-4 mb-4"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View className="bg-white rounded-lg p-4">
        <Text className="text-lg font-semibold mb-4">Permissions</Text>

        <View className="flex-row items-center justify-between mb-4">
          <Text>Can edit tasks</Text>
          <Switch
            value={permissions.canEditTasks}
            onValueChange={(value) => handlePermissionChange('canEditTasks', value)}
          />
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <Text>Can manage members</Text>
          <Switch
            value={permissions.canManageMembers}
            onValueChange={(value) => handlePermissionChange('canManageMembers', value)}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text>Can approve purchases</Text>
          <Switch
            value={permissions.canApprovePurchases}
            onValueChange={(value) => handlePermissionChange('canApprovePurchases', value)}
          />
        </View>
      </View>
    </View>
  );
};