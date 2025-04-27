import { Timestamp } from "firebase/firestore";
 
export interface HouseholdPerformanceReport {
  reportId: string;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  data: {
    totalTasks: number;
    completedTasks: number;
  };
}
