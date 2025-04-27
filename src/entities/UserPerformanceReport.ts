import { Timestamp } from "firebase/firestore";
 
export interface UserPerformanceReport {
  reportId: string;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  data: {
    totalTasks: number;
    completedTasks: number;
  };
}
