import { FieldValue } from "firebase/firestore";
import { HouseholdMember } from "./HouseholdMember";

export interface Household {  
  id: string;
  name: string;
  address: string;
  members:HouseholdMember[]; 
  createdBy: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  membersCount: number;
  inviteCode?: string;
  photoURL?: string|null;
} 

 

