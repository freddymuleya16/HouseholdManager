import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { FAB } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ListRenderItem } from 'react-native';
import { useState } from 'react';
import { Header } from '@/components/Header';

 

export type Permissions = {
  canEditTasks: boolean;
  canManageMembers: boolean;
  canApprovePurchases: boolean;
  canDeleteHousehold:boolean;
};

export type RootStackParamList = {
  HouseholdMembers: undefined;
  AddMember: undefined;
  EditMember: { member: HouseholdMember };
};

export const HouseholdMembersScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [members, setMembers] = useState<HouseholdMember[]>([
    { id: '1', name: 'John Doe', role: 'parent', email: 'john@example.com' },
    { id: '2', name: 'Alice Doe', role: 'child', phone: '+123456789' },
  ]);

  const renderMemberItem: ListRenderItem<HouseholdMember> = ({ item }) => (
    <View className="bg-white p-4 mb-2 rounded-lg flex-row items-center justify-between">
      
      <View className="flex-row items-center">
        <View className={`w-10 h-10 rounded-full items-center justify-center 
        ${item.role === 'parent' ? 'bg-blue-500' :
            item.role === 'child' ? 'bg-green-500' : 'bg-purple-500'}`}>
          <Text className="text-white text-lg">
            {item.name.charAt(0)}
          </Text>
        </View>
        <View className="ml-4">
          <Text className="text-gray-800 font-semibold">{item.name}</Text>
          <Text className="text-gray-500 text-sm capitalize">{item.role}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('EditMember', { member: item })}
        className="p-2">
        <MaterialIcons name="edit" size={24} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-gradient-to-br from-Background-800 to-Background-100 ">
       <Header 
        title="Household Members" 
        showNotification 
        onNotificationPress={() => console.log('Notification pressed')}
        rightAction={{
          icon: 'settings-outline',
          onPress: () => console.log('Settings pressed'),
          accessibilityLabel: 'Settings'
        }}
      />
      <FlatList
        data={members}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id}
        className="px-4 pt-4"
      />
      <FAB
        icon="plus"
        className="absolute bottom-4 right-4 bg-blue-500"
        onPress={() => navigation.navigate('AddMember')}
      />
    </View>
  );
};