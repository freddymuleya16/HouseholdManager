import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { NavigationProp, RootStackParamList } from '@/types/navigation-types';

const EmptyHousehold = () => {
    const navigation = useNavigation<NavigationProp>();

    return (
        <View
            className="flex-1 items-center justify-center p-6 bg-Background-50"
        >
              <Text className="text-3xl font-bold text-gray-800 mb-4 text-center">
                Welcome to! 🏡
            </Text>
            
            <Image
                source={require('assets/logo.png')}
                className="w-64 h-64 mb-2"

            />

          

            <Text className="text-lg text-gray-600 mb-8 text-center">
                Get started by creating your family household or joining an existing one with an invite code.
            </Text>
           
                <TouchableOpacity
                    className="mb-4 w-full rounded-xl p-5 items-center shadow-lg bg-Text-400"
                    onPress={() => navigation.navigate('CreateHousehold')}
                >
                    <MaterialIcons name="add-home" size={28} color="white" />
                    <Text className="text-white text-lg font-semibold mt-2">
                        Create New Household
                    </Text>
                </TouchableOpacity>
           
            <Text className="text-gray-500 text-lg mb-4">or</Text>

            <TouchableOpacity
                className="w-full border-2 border-Text-400 rounded-xl p-5 items-center"
                onPress={() => navigation.navigate('main', {
                    screen: "JoinHousehold"
                })}
            >
                <MaterialIcons name="group-add" size={28} color="#81513F" />
                <Text className="text-Text-400 text-lg font-semibold mt-2">
                    Join with Invite Code
                </Text>
            </TouchableOpacity>

            <View className="mt-8 flex-row items-center">
                <MaterialIcons name="info" size={20} color="#6b7280" />
                <Text className="text-gray-500 ml-2">
                    Need help? Ask your family admin for an invite code
                </Text>
            </View>
        </View>
    );
};

export default EmptyHousehold;