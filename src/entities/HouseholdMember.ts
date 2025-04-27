import { Permissions } from "@/screens/HouseholdMembersScreen";
import { Timestamp } from "firebase/firestore";
 
export interface HouseholdMember {  
  joinDate: Timestamp;
  id: string;
  name: string;
  role: 'parent' | 'child' | 'guest';
  email?: string;
  phone?: string;  
  userId: string; 
  permissions: Permissions; 
  invitedAt?: string;
  avatar?: string;
}
