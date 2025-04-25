import { useContext } from "react";
import { DependencyContext } from "../context/dependancy-context";

// Custom hook for easy access
export const useServices = () => {
    const context = useContext(DependencyContext);
    if (!context) {
        throw new Error("useServices must be used within a DependencyProvider");
    }
    return context;
};
