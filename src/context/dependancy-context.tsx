// DependencyContext.tsx
import { ApiService } from "@/services/ApiService"; 
import authService, { AuthService } from "@/services/AuthService";
import { createContext, useMemo, ReactNode } from "react";  

// Define the shape of the context value
interface DependencyContextType {
  apiService: ApiService; 
}

// Create the context with a default undefined value
export const DependencyContext = createContext<DependencyContextType | undefined>(undefined);

// Provider component to inject services
interface DependencyProviderProps {
  children: ReactNode;
}

export const DependencyProvider: React.FC<DependencyProviderProps> = ({ children }) => {
  const services = useMemo(() => ({
    apiService: new ApiService()
  }), []);

  return (
    <DependencyContext.Provider value={services}>
      {children}
    </DependencyContext.Provider>
  );
};
