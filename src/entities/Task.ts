import { FieldValue, Timestamp } from "firebase/firestore";

export interface Task {
  id: string;
  type: "household" | "work" | "school";
  title: string;
  description: string;
  dueDate: Date;
  priority: "high" | "medium" | "low";
  status: "pending" | "in progress" | "completed"|"overdue";
  createdBy: string;
  //assignedTo: string[]; 
  householdId: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  category: string;
  estimatedMinutes: number; 
  recurrencePattern: string;
  assignedTo: string | null;
  requiresAutoAssignment: boolean;
  completedAt: Timestamp | null;

}
