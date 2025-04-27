


export type HouseholdInvite = {
  id: string;
  householdId: string;
  code: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  usesRemaining: number;
  status: 'active' | 'expired' | 'used';
};
