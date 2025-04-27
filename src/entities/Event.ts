import { Timestamp } from "firebase/firestore";

export interface Event {
  eventId: string;
  title: string;
  description: string;
  startTime: Timestamp;
  endTime: Timestamp;
  location: string;
  createdBy: string; // userId
  attendees: string[]; // array of userIds
}
