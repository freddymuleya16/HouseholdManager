import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { ProtectedScreen } from '@/hooks/useAuth'
import { useFocusEffect, useRouter } from 'expo-router';
import { useHousehold } from '@/context/household-context';

const Index = () => {
    const router = useRouter();
    const {households}=useHousehold();

    useFocusEffect(() => {
        if(households.length == 0){
            router.replace('/Landing');
        }else{
            router.replace('/main');
        }
       // Navigate to the /main route on initial load
    });
    return (
        <ProtectedScreen>
            <View>
                <Text>Index</Text>
            </View>
        </ProtectedScreen>
    )
}

export default Index