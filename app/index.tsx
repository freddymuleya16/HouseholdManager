import { View, Text } from 'react-native'
import React from 'react'
import { ProtectedScreen } from '@/hooks/useAuth'

const Index = () => {
    return (
        <ProtectedScreen>
            <View>
                <Text>Index</Text>
            </View>
        </ProtectedScreen>
    )
}

export default Index