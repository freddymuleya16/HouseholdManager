export type RootStackParamList = { 
    Home: { userId: string };  
    auth: { screen: keyof AuthStackParamList; params?: any };
  };
  
  export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword:undefined;
  };