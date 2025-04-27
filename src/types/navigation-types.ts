import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = { 
    Home: { userId: string };  
    auth: { screen: keyof AuthStackParamList; params?: any };
    main: { screen: keyof HouseHoldStackParamList; params?: any };
    CreateHousehold:undefined;
  };
  
  export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword:undefined;
  };

  export type HouseHoldStackParamList = {
    CreateHousehold: undefined;
    JoinHousehold: undefined; 
  }; 

  
export type NavigationProp = StackNavigationProp<RootStackParamList>;

