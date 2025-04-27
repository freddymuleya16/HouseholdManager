import React, { ReactNode, ComponentType } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/authentication-context';
import { useNavigation, useRouter, useSegments } from 'expo-router';
import { AuthStackParamList, RootStackParamList } from '@/types/navigation-types';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoadingScreen } from '@/screens/Authentication/LoadingScreen';

interface ProtectedScreenProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const PUBLIC_ROUTES = [
  'onboarding',
  'terms',
  'privacy',

];

const AUTH_ROUTES = [
  'auth',
];

const ROLE_PROTECTED_ROUTES: Record<string, string> = {
  'admin': 'admin',
  'reports': 'analyst',
};

export const ProtectedScreen: React.FC<ProtectedScreenProps> = ({
  children,
  fallback = <AuthFallback />
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const [hasRequiredRole, setHasRequiredRole] = React.useState<boolean>(true);
  const segments = useSegments();
  const router = useRouter();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const authNavigation = useNavigation<StackNavigationProp<AuthStackParamList>>("/auth");

  const activeSegment = segments[0] || '';
  const isPublicRoute = PUBLIC_ROUTES.some(route => activeSegment.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => activeSegment.startsWith(route));
  const requiredRole = ROLE_PROTECTED_ROUTES[activeSegment];

  React.useEffect(() => {
    const checkRoleRequirement = async () => {
      if (requiredRole && isAuthenticated) {
        const result = await hasRole(requiredRole);
        setHasRequiredRole(result);
      }
    };

    checkRoleRequirement();
  }, [activeSegment, isAuthenticated, requiredRole, hasRole]);

  React.useEffect(() => {
    if (isLoading) return;

    if (isAuthRoute && isAuthenticated) {
      router.replace('/');
      return;
    }

    if (!isPublicRoute && !isAuthRoute && !isAuthenticated) {
      navigation.replace('auth',{ 
        screen: "Login"  });
      return;
    }

    if (requiredRole && !hasRequiredRole) {
      router.replace('/unauthorized');
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    activeSegment,
    isPublicRoute,
    isAuthRoute,
    hasRequiredRole,
    requiredRole,
    router
  ]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // if (!isAuthenticated || (requiredRole && !hasRequiredRole)) {

  //   return <>{fallback}</>;
  // }

  return <>{children}</>;
};

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  requiredRole?: string
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedScreen>
        <Component {...props} />
      </ProtectedScreen>
    );
  };
}

const AuthFallback: React.FC = () => {
 
  const segments = useSegments();
  const activeSegment = segments[0] || '';
  const isAuthRoute = AUTH_ROUTES.some(route => activeSegment.startsWith(route));
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Please log in to access this screen {isAuthenticated?"T":"f"}</Text>
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