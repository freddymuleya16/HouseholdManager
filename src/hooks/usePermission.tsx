import React from 'react'; 
import { canAccess } from './canAccess';


export const usePermission = (role: string | string[]) => {
  const [hasPermission, setHasPermission] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const checkPermission = async () => {
      setLoading(true);
      const result = await canAccess(role);
      setHasPermission(result);
      setLoading(false);
    };

    checkPermission();
  }, [role]);

  return { hasPermission, loading };
};
