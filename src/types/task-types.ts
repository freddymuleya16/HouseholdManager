import { FieldValue, Timestamp } from "firebase/firestore";

export interface TaskDTO { 
      type: "household" | "work" | "school";
      title: string;
      description: string;
      dueDate: Date;
      priority: "high" | "medium" | "low";  
      category: string;
      estimatedMinutes: number; 
      recurrencePattern: string;
      assignedTo: string | null; 
}