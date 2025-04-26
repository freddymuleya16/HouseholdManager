import authService from "@/services/AuthService";

export const canAccess = async (requiredRole: string | string[]): Promise<boolean> => {
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) return false;
  
    if (Array.isArray(requiredRole)) { 
      for (const role of requiredRole) {
        const hasRequiredRole = await authService.hasRole(role);
        if (hasRequiredRole) return true;
      }
      return false;
    } else { 
      return authService.hasRole(requiredRole);
    }
  };