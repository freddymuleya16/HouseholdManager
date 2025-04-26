import React, { ReactNode, ComponentType } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/authentication-context';
import { useNavigation } from 'expo-router';
import { RootStackParamList } from '@/types/navigation-types';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoadingScreen } from '@/screens/Authentication/LoadingScreen';

interface ProtectedScreenProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRole?: string;
}

export const ProtectedScreen: React.FC<ProtectedScreenProps> = ({
  children,
  fallback = <AuthFallback />,
  requiredRole
}) => { 
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const [hasRequiredRole, setHasRequiredRole] = React.useState<boolean>(true);

  React.useEffect(() => { 
    if (requiredRole && isAuthenticated) {
      hasRole(requiredRole).then(result => {
        setHasRequiredRole(result);
      });
    }
  }, [requiredRole, isAuthenticated, hasRole]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || (requiredRole && !hasRequiredRole)) {

    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  requiredRole?: string
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedScreen requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedScreen>
    );
  };
}

const AuthFallback: React.FC = () => {

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  React.useEffect(() => {
    navigation.navigate('auth', {
      screen: 'Login',
      params: {
        screen: 'login',
      },
    });

  }, []);


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Please log in to access this screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
}); 