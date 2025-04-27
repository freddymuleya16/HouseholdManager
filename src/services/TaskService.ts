import { Task } from "@/entities/Task";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Alert } from "react-native";
import { FIRESTORE_DB } from "../../firebase.config"
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid';
import { TaskDTO } from "@/types/task-types";

export class TaskService {
    async createTask(formData: TaskDTO, creatorId: string, householdId: string) {
        try {
            const taskData: Task = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                priority: formData.priority,
                estimatedMinutes: formData.estimatedMinutes, 
                recurrencePattern: formData.recurrencePattern,
                status: 'pending',
                createdBy: creatorId,
                createdAt: serverTimestamp(),
                householdId: householdId,
                assignedTo: formData.assignedTo === 'auto' ? null : formData.assignedTo,
                requiresAutoAssignment: formData.assignedTo === 'auto',
                completedAt: null,
                taskId: uuidv4(),
                type: formData.type,
                dueDate: formData.dueDate ,
                updatedAt:serverTimestamp()
            };

            const tasksRef = collection(FIRESTORE_DB, 'tasks');
            await addDoc(tasksRef, taskData);

        } catch (error) {
            throw error;
        }
    }
}
