import { ApiService } from "@/services/ApiService";
import { TaskService } from "@/services/TaskService";
import { createContext, useMemo, ReactNode } from "react";

 interface DependencyContextType {
  apiService: ApiService;
  taskService: TaskService;
}
 
export const DependencyContext = createContext<DependencyContextType | undefined>(undefined);
 
interface DependencyProviderProps {
  children: ReactNode;
}

export const DependencyProvider: React.FC<DependencyProviderProps> = ({ children }) => {
  const services = useMemo(() => ({
    apiService: new ApiService(),
    taskService: new TaskService()
  }), []);

  return (
    <DependencyContext.Provider value={services}>
      {children}
    </DependencyContext.Provider>
  );
};
