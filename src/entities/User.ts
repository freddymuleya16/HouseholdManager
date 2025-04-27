import { Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  email: string;
  householdId: string;
  roles:string[];
}

export interface UserWithPassword extends User {
  passwordHash:string;
  createdAt:Timestamp;
  updatedAt:Timestamp;
}