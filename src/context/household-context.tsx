import { HouseholdMember } from '@/entities/HouseholdMember';
import React, { createContext, useContext, useEffect, useState } from 'react'; 
import { useAuth } from './authentication-context';
import HouseholdService from '@/services/HouseholdService';
import { Household } from '@/entities/Household';
import { HouseholdInvite } from '@/entities/HouseholdInvite';
import { Permissions } from '@/screens/HouseholdMembersScreen';

type HouseholdContextType = {
 // Existing member management
 members: HouseholdMember[];
 loading: boolean;
 error: string | null;
 addMember: (member: Omit<HouseholdMember, 'id' | 'permissions' | 'invited'>) => Promise<void>;
 updateMember: (id: string, updates: Partial<HouseholdMember>) => Promise<void>;
 deleteMember: (id: string) => Promise<void>;
 sendInvitation: (id: string, contact: { email?: string; phone?: string }) => Promise<void>;
 
 // New household management functions
 households: Household[];
 currentHousehold: Household | null;
 createHousehold: (name: string) => Promise<string|undefined>;
 joinHousehold: (code: string) => Promise<void>;
 generateInviteCode: (options?: { expiresInHours?: number; maxUses?: number }) => Promise<string|undefined>;
 leaveHousehold: () => Promise<void>;
 switchHousehold: (householdId: string) => Promise<void>;
  
 // Invitation management
 invitations: HouseholdInvite[];
 revokeInvitation: (inviteId: string) => Promise<void>;
 
 // Permissions
 verifyPermission: (permission: keyof Permissions) => Promise<boolean>;
};

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const HouseholdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [invitations, setInvitations] = useState<HouseholdInvite[]>([]); 

  useEffect(() => {
    if (!user?.id) return;

    let unsubscribeMembers: () => void;
    let unsubscribeHouseholds: () => void;
    let unsubscribeInvites: () => void;

    const initialize = async () => {
      try {
        setLoading(true);
        
        // Stream user's households
        unsubscribeHouseholds = HouseholdService.streamUserHouseholds(
          user.id,
          (newHouseholds) => {
            setHouseholds(newHouseholds);
            if (newHouseholds.length > 0 && !currentHousehold) {
              setCurrentHousehold(newHouseholds[0]);
            }
          }
        );

        // Stream current household members
        const updateMembers = (newMembers: HouseholdMember[]) => {
          setMembers(newMembers);
        };

        if (currentHousehold) {
          unsubscribeMembers = HouseholdService.streamMembers(
            currentHousehold.id,
            updateMembers
          );
        }

        // Stream invitations
        unsubscribeInvites = HouseholdService.streamHouseholdInvites(
          user.id,
          (newInvites) => setInvitations(newInvites)
        );

        setError(null);
      } catch (err) {
        setError('Failed to load household data');
      } finally {
        setLoading(false);
      }
    };

    initialize();
    return () => {
      unsubscribeMembers?.();
      unsubscribeHouseholds?.();
      unsubscribeInvites?.();
    };
  }, [user?.id, currentHousehold?.id]);

  const handleError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'An error occurred';
    setError(message);
    throw error;
  };

  const addMember = async (member: Omit<HouseholdMember, 'id' | 'permissions' | 'invited'>) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      await HouseholdService.addMember(user.id, member);
    } catch (err) {
      handleError(err);
    }
  };

  const updateMember = async (id: string, updates: Partial<HouseholdMember>) => {
    try {
      await HouseholdService.updateMember(id, updates);
    } catch (err) {
      handleError(err);
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await HouseholdService.deleteMember(id);
    } catch (err) {
      handleError(err);
    }
  };

  const sendInvitation = async (id: string, contact: { email?: string; phone?: string }) => {
    try {
      await HouseholdService.sendInvitation(id, contact);
    } catch (err) {
      handleError(err);
    }
  };

  const createHousehold = async (name: string) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      const householdId = await HouseholdService.createHousehold(user.id, name); 
      return householdId;
    } catch (err) {
      handleError(err);
    }
  };

  const joinHousehold = async (code: string) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      await HouseholdService.joinHousehold(code, user.id, {
        name: user.name,
        email: user.email
      });
    } catch (err) {
      handleError(err);
    }
  };

  const generateInviteCode = async (options = {}) => {
    try {
      if (!currentHousehold?.id || !user?.id) throw new Error('No household selected');
      return await HouseholdService.generateInviteCode(
        currentHousehold.id,
        user.id,
        options
      ) as string;
    } catch (err) {
      handleError(err);
    }
  };

  const leaveHousehold = async () => {
    try {
      if (!currentHousehold?.id || !user?.id) return;
      await HouseholdService.leaveHousehold(currentHousehold.id, user.id);
      setCurrentHousehold(null);
    } catch (err) {
      handleError(err);
    }
  };

  const switchHousehold = async (householdId: string) => {
    const household = households.find(h => h.id === householdId);
    if (household) setCurrentHousehold(household);
  };

  const getHouseholdDetails = async (householdId: string) => {
    try {
      if (!currentHousehold?.id) throw new Error('No household selected');
      return await HouseholdService.getHouseholdDetails(currentHousehold.id);
    } catch (err) {
      handleError(err);
    }
  };

  const revokeInvitation = async (inviteId: string) => {
    try {
      await HouseholdService.revokeInvitation(inviteId);
    } catch (err) {
      handleError(err);
    }
  };

  const verifyPermission = async (permission: keyof Permissions) => {
    try {
      if (!currentHousehold?.id || !user?.id) return false;
      return await HouseholdService.verifyPermission(
        user.id,
        currentHousehold.id,
        permission
      );
    } catch (err) {
      return false;
    }
  };
  return (
    <HouseholdContext.Provider
      value={{
        members,
        loading,
        error,
        addMember,
        updateMember,
        deleteMember,
        sendInvitation,
        households,
        currentHousehold,
        createHousehold,
        joinHousehold,
        generateInviteCode,
        leaveHousehold,
        switchHousehold, 
        invitations,
        revokeInvitation,
        verifyPermission
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
};

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
};